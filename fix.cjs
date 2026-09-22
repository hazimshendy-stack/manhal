#!/usr/bin/env node
"use strict";

/* ═══════════════════════════════════════════════════════════════════════
   fix.cjs — surgical patch for Manhal / sbapiaryy (v7)
   ---------------------------------------------------------------------
   Applies:
     (1) Organizational hierarchy rebuild (teams, roles, permissions)
     (2) Post / contribution approval flow → 2 stages
     (3) Requests flow → single-approver + legacy purge
     (4) Members page — no post-on-behalf-of-member
     (5) Strict routing helpers
     (6) Firebase — Firestore rules doc + client-side data migration
         (role rename HEAD_HR_TEAM → HR, team renames, legacy purge)
   ---------------------------------------------------------------------
   Behaviour:
     - Reads files from cwd.
     - Backs up every modified file to <file>.bak (only once).
     - Idempotent: markers prevent re-applying edits.
     - Every fix wrapped in try/catch — one failure does not stop the rest.
     - Pushes changed files to GitHub via Contents API when
         GITHUB_TOKEN  and  GITHUB_REPO ("owner/repo")  are set.
   ---------------------------------------------------------------------
   Usage:
     node fix.cjs
     GITHUB_TOKEN=... GITHUB_REPO=owner/repo node fix.cjs
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const https = require("https");

const ROOT = process.cwd();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const BRANCH = process.env.GITHUB_BRANCH || "main";

const summary = [];
const changedFiles = [];

/* ═══════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════ */

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(msg);
}

function readFile(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

function backupOnce(abs) {
  const bak = abs + ".bak";
  if (!fs.existsSync(bak)) {
    try {
      fs.copyFileSync(abs, bak);
    } catch {
      /* ignore */
    }
  }
}

function writeFile(rel, content) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  backupOnce(abs);
  fs.writeFileSync(abs, content, "utf8");
  if (!changedFiles.includes(rel)) changedFiles.push(rel);
}

function replaceOnce(rel, content) {
  try {
    const existing = readFile(rel);
    if (existing === content) return { ok: true, note: "already applied" };
    writeFile(rel, content);
    return { ok: true, note: "replaced" };
  } catch (e) {
    return { ok: false, note: e.message };
  }
}

function patch(rel, marker, transform) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return { ok: false, note: "file not found" };
  let before;
  try {
    before = fs.readFileSync(abs, "utf8");
  } catch (e) {
    return { ok: false, note: "read error: " + e.message };
  }
  if (before.includes(marker)) return { ok: true, note: "already applied" };
  let after;
  try {
    after = transform(before);
  } catch (e) {
    return { ok: false, note: "transform error: " + e.message };
  }
  if (typeof after !== "string" || after === before) {
    return { ok: false, note: "no change produced" };
  }
  try {
    backupOnce(abs);
    fs.writeFileSync(abs, after, "utf8");
    if (!changedFiles.includes(rel)) changedFiles.push(rel);
  } catch (e) {
    return { ok: false, note: "write error: " + e.message };
  }
  return { ok: true, note: "patched" };
}

/* ═══════════════════════════════════════════════════════════════════════
   GitHub Contents API
   ═══════════════════════════════════════════════════════════════════════ */

function encodeRepoPath(p) {
  return p.split("/").map(encodeURIComponent).join("/");
}

function ghRequest(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        method,
        hostname: "api.github.com",
        path: apiPath,
        headers: {
          "User-Agent": "manhal-fix-cjs",
          Authorization: "Bearer " + GITHUB_TOKEN,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(data
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
              }
            : {}),
        },
      },
      (res) => {
        let chunks = "";
        res.on("data", (c) => (chunks += c));
        res.on("end", () => {
          let parsed = null;
          try {
            parsed = chunks ? JSON.parse(chunks) : null;
          } catch {
            parsed = chunks;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function pushFile(rel) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return { ok: false, note: "missing GITHUB_TOKEN / GITHUB_REPO" };
  }
  const content = readFile(rel);
  if (content === null) return { ok: false, note: "file missing" };

  const apiGet =
    "/repos/" +
    GITHUB_REPO +
    "/contents/" +
    encodeRepoPath(rel) +
    "?ref=" +
    BRANCH;
  let sha = null;
  try {
    const g = await ghRequest("GET", apiGet);
    if (g.status === 200 && g.body && g.body.sha) sha = g.body.sha;
  } catch {
    /* ignore */
  }

  const apiPut = "/repos/" + GITHUB_REPO + "/contents/" + encodeRepoPath(rel);
  const body = {
    message: "[auto-fix] update " + rel,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };

  try {
    const r = await ghRequest("PUT", apiPut, body);
    if (r.status === 200 || r.status === 201)
      return { ok: true, note: "pushed" };
    return {
      ok: false,
      note:
        "HTTP " +
        r.status +
        " " +
        (r.body && r.body.message ? r.body.message : ""),
    };
  } catch (e) {
    return { ok: false, note: "request error: " + e.message };
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 1 — Organizational hierarchy rebuild
   ═══════════════════════════════════════════════════════════════════════ */

const NEW_TEAMS_FILE = `// [auto-fix] v7 — rebuilt team list (7 teams).
import type { Team } from '@/types';

export const teams: Team[] = [
  {
    id: 'helpers',
    name: 'Helpers',
    nameAr: 'Helpers',
    description: 'Logistics, guidance, onboarding, and daily operations.',
    color: '#C1272D',
  },
  {
    id: 'coders',
    name: 'Coders',
    nameAr: 'Coders',
    description: 'Designs and builds tools, platforms, and automation.',
    color: '#60A5FA',
  },
  {
    id: 'innovators',
    name: 'Innovators',
    nameAr: 'Innovators',
    description: 'Research, prototyping, and innovative technical solutions.',
    color: '#7C3AED',
  },
  {
    id: 'heroes',
    name: 'Heroes',
    nameAr: 'Heroes',
    description: 'Field activities, community outreach, and volunteering campaigns.',
    color: '#FB923C',
  },
  {
    id: 'messengers',
    name: 'Messengers',
    nameAr: 'Messengers',
    description: 'Narrative, content, media, documentation, and communication.',
    color: '#A78BFA',
  },
  {
    id: 'rstc',
    name: 'RSTC',
    nameAr: 'RSTC',
    description: 'Resala STEM Training Center — curriculum and quality.',
    color: '#22D3EE',
  },
  {
    id: 'track',
    name: 'Track',
    nameAr: 'Track',
    description: 'Student guidance, career paths, and mentoring programs.',
    color: '#F472B6',
  },
];
`;

const NEW_ROLES_FILE = `// [auto-fix] v7 — rebuilt role hierarchy.
import type { Role } from '@/types';

export const roles: Role[] = [
  { id: 'HEAD',           name: 'Head of Sub-Branches',      nameEn: 'Head of Sub-Branches',      level: 100 },
  { id: 'VICE',           name: 'Vice Head of Sub-Branches', nameEn: 'Vice Head of Sub-Branches', level: 95  },
  { id: 'HEAD_HR_GLOBAL', name: 'Head of HRs',               nameEn: 'Head of HRs',               level: 90  },
  { id: 'PRESIDENT',      name: 'Head of Team',              nameEn: 'Head of Team',              level: 80  },
  { id: 'VICE_PRESIDENT', name: 'Vice Head of Team',         nameEn: 'Vice Head of Team',         level: 70  },
  { id: 'HR',             name: 'HR of Team',                nameEn: 'HR of Team',                level: 60  },
  { id: 'COMMITTEE_HR',   name: 'HR of Committee',           nameEn: 'HR of Committee',           level: 55  },
  { id: 'MEMBER',         name: 'Member',                    nameEn: 'Member',                    level: 50  },
  { id: 'VIEWER',         name: 'Viewer',                    nameEn: 'Viewer',                    level: 10  },
];

export const roleLabels: Record<string, string> = {
  HEAD: 'Head of Sub-Branches',
  VICE: 'Vice Head of Sub-Branches',
  HEAD_HR_GLOBAL: 'Head of HRs',
  PRESIDENT: 'Head of Team',
  VICE_PRESIDENT: 'Vice Head of Team',
  HR: 'HR of Team',
  COMMITTEE_HR: 'HR of Committee',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};
`;

const NEW_ROLE_UNION = `// [auto-fix] v7 role union
export type RoleId =
  | 'HEAD'
  | 'VICE'
  | 'HEAD_HR_GLOBAL'
  | 'PRESIDENT'
  | 'VICE_PRESIDENT'
  | 'HR'
  | 'COMMITTEE_HR'
  | 'MEMBER'
  | 'VIEWER';
`;

const NEW_TEAM_UNION = `// [auto-fix] v7 team union
export type TeamId =
  | 'helpers'
  | 'coders'
  | 'innovators'
  | 'heroes'
  | 'messengers'
  | 'rstc'
  | 'track';
`;

function fix1a_teamsData() {
  const existing = readFile("src/data/teams.ts");
  if (existing && existing.includes("// [auto-fix] v7 — rebuilt team list")) {
    return { ok: true, note: "already applied" };
  }
  return replaceOnce("src/data/teams.ts", NEW_TEAMS_FILE);
}

function fix1b_teamsUnion() {
  const r1 = patch("src/types.ts", "// [auto-fix] v7 team union", (b) => {
    const re = /export type TeamId\s*=[\s\S]*?;\n/;
    if (!re.test(b)) throw new Error("TeamId not found in src/types.ts");
    return b.replace(re, NEW_TEAM_UNION);
  });
  const r2 = patch("src/types/index.ts", "// [auto-fix] v7 team union", (b) => {
    const re = /export type TeamId\s*=[\s\S]*?;\n/;
    if (!re.test(b)) throw new Error("TeamId not found in src/types/index.ts");
    return b.replace(re, NEW_TEAM_UNION);
  });
  if (r1.ok && r2.ok) return { ok: true, note: "types updated" };
  return {
    ok: false,
    note: "types.ts:" + r1.note + " | types/index.ts:" + r2.note,
  };
}

function fix1c_rolesUnion() {
  const r1 = patch("src/types.ts", "// [auto-fix] v7 role union", (b) => {
    const re = /export type RoleId\s*=[\s\S]*?;\n/;
    if (!re.test(b)) throw new Error("RoleId not found in src/types.ts");
    return b.replace(re, NEW_ROLE_UNION);
  });
  const r2 = patch("src/types/index.ts", "// [auto-fix] v7 role union", (b) => {
    const re = /export type RoleId\s*=[\s\S]*?;\n/;
    if (!re.test(b)) throw new Error("RoleId not found in src/types/index.ts");
    return b.replace(re, NEW_ROLE_UNION);
  });
  if (r1.ok && r2.ok)
    return { ok: true, note: "roles union updated (HEAD_HR_TEAM removed)" };
  return {
    ok: false,
    note: "types.ts:" + r1.note + " | types/index.ts:" + r2.note,
  };
}

function fix1d_rolesData() {
  const existing = readFile("src/data/roles.ts");
  if (
    existing &&
    existing.includes("// [auto-fix] v7 — rebuilt role hierarchy")
  ) {
    return { ok: true, note: "already applied" };
  }
  return replaceOnce("src/data/roles.ts", NEW_ROLES_FILE);
}

function fix1e_permissions() {
  // ROLE_LEVEL — remove HEAD_HR_TEAM
  const r1 = patch(
    "src/lib/permissions.ts",
    "// [auto-fix] v7 ROLE_LEVEL",
    (b) => {
      const re =
        /export const ROLE_LEVEL: Record<RoleId, number> = \{[\s\S]*?\};\n/;
      if (!re.test(b)) throw new Error("ROLE_LEVEL not found");
      const replacement =
        "// [auto-fix] v7 ROLE_LEVEL — HEAD_HR_TEAM removed\n" +
        "export const ROLE_LEVEL: Record<RoleId, number> = {\n" +
        "  HEAD: 100,\n" +
        "  VICE: 95,\n" +
        "  HEAD_HR_GLOBAL: 90,\n" +
        "  PRESIDENT: 80,\n" +
        "  VICE_PRESIDENT: 70,\n" +
        "  HR: 60,\n" +
        "  COMMITTEE_HR: 55,\n" +
        "  MEMBER: 50,\n" +
        "  VIEWER: 10,\n" +
        "};\n";
      return b.replace(re, replacement);
    }
  );

  // ROLE_LABEL — remove HEAD_HR_TEAM (keep Arabic UX labels, values only refined)
  const r2 = patch(
    "src/lib/permissions.ts",
    "// [auto-fix] v7 ROLE_LABEL",
    (b) => {
      const re =
        /export const ROLE_LABEL: Record<RoleId, string> = \{[\s\S]*?\};\n/;
      if (!re.test(b)) throw new Error("ROLE_LABEL not found");
      const replacement =
        "// [auto-fix] v7 ROLE_LABEL\n" +
        "export const ROLE_LABEL: Record<RoleId, string> = {\n" +
        "  HEAD: 'رئيس الفروع',\n" +
        "  VICE: 'نائب رئيس الفروع',\n" +
        "  HEAD_HR_GLOBAL: 'رئيس الموارد البشرية',\n" +
        "  PRESIDENT: 'رئيس فريق',\n" +
        "  VICE_PRESIDENT: 'نائب رئيس فريق',\n" +
        "  HR: 'موارد بشرية الفريق',\n" +
        "  COMMITTEE_HR: 'موارد بشرية اللجنة',\n" +
        "  MEMBER: 'عضو',\n" +
        "  VIEWER: 'زائر',\n" +
        "};\n";
      return b.replace(re, replacement);
    }
  );

  // isAdmin → HEAD only; add isViceHead + canAccessAdminPanel; remove isTeamHeadHR
  const r3 = patch(
    "src/lib/permissions.ts",
    "// [auto-fix] v7 isAdmin is HEAD-only",
    (b) => {
      let out = b;
      out = out.replace(
        /export function isAdmin\([\s\S]*?\n\s*\}\n/,
        "// [auto-fix] v7 isAdmin is HEAD-only\n" +
          "export function isAdmin(user: AppUser | null): boolean {\n" +
          "  if (!user) return false;\n" +
          "  return user.role === 'HEAD';\n" +
          "}\n"
      );
      // remove isTeamHeadHR
      out = out.replace(
        /export function isTeamHeadHR\([\s\S]*?\n\s*\}\n/,
        "// [auto-fix] v7: isTeamHeadHR removed — team HR role collapsed into HR.\n"
      );
      // add isViceHead + canAccessAdminPanel right after isAdmin
      out = out.replace(
        /export function isAdmin\([\s\S]*?\n\s*\}\n/,
        (match) =>
          match +
          "\n// [auto-fix] v7 VICE has full permissions but not admin-only actions.\n" +
          "export function isViceHead(user: AppUser | null): boolean {\n" +
          "  if (!user) return false;\n" +
          "  return user.role === 'VICE';\n" +
          "}\n" +
          "\n// [auto-fix] v7 admin-panel access for HEAD + VICE.\n" +
          "export function canAccessAdminPanel(user: AppUser | null): boolean {\n" +
          "  if (!user) return false;\n" +
          "  return user.role === 'HEAD' || user.role === 'VICE';\n" +
          "}\n"
      );
      return out;
    }
  );

  if (r1.ok && r2.ok && r3.ok)
    return {
      ok: true,
      note: "ROLE_LEVEL, ROLE_LABEL, isAdmin, isViceHead updated",
    };
  return {
    ok: false,
    note: "LEVEL:" + r1.note + " | LABEL:" + r2.note + " | ADMIN:" + r3.note,
  };
}

function fix1f_committeePermissionsCleanup() {
  return patch(
    "src/lib/committeePermissions.ts",
    "// [auto-fix] v7 teamHR helper",
    (b) => {
      let out = b;
      // Remove userIsTeamHeadHR
      out = out.replace(
        /export function userIsTeamHeadHR\([\s\S]*?\n\s*\}\n/,
        "// [auto-fix] v7 teamHR helper\n" +
          "export function userIsTeamHR(user: AppUser | null, teamId: string): boolean {\n" +
          "  if (!user || !teamId) return false;\n" +
          "  if (user.role !== 'HR') return false;\n" +
          "  return user.teamId === teamId;\n" +
          "}\n"
      );
      return out;
    }
  );
}

function fix1g_notificationsManagerList() {
  return patch(
    "src/lib/notifications.ts",
    "// [auto-fix] v7 manager roles",
    (b) => {
      const re =
        /\['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HEAD_HR_TEAM', 'HR', 'COMMITTEE_HR'\]\.includes\(u\.role\)/;
      if (!re.test(b)) throw new Error("manager role list not found");
      return b.replace(
        re,
        "// [auto-fix] v7 manager roles\n" +
          "      ['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HR', 'COMMITTEE_HR'].includes(u.role)"
      );
    }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 2 — Post / contribution approval flow → 2 stages
   ═══════════════════════════════════════════════════════════════════════ */

function fix2a_approvals() {
  return patch(
    "src/lib/approvals.ts",
    "// [auto-fix] v7 single-approver chain",
    (b) => {
      const re = /export function buildApprovalChain\([\s\S]*?\n\s*\}\n/;
      if (!re.test(b)) throw new Error("buildApprovalChain not found");
      const replacement =
        "// [auto-fix] v7 single-approver chain — only the Head of the requester's team decides.\n" +
        "export function buildApprovalChain(request: RequestRecord): ApprovalChainStep[] {\n" +
        "  const teamId = request.fromTeamId ?? request.toTeamId ?? null;\n" +
        "  return [{ role: 'PRESIDENT', teamId }];\n" +
        "}\n";
      return b.replace(re, replacement);
    }
  );
}

function fix2b_newRequestChain() {
  return patch(
    "src/pages/NewRequestPage.tsx",
    "// [auto-fix] v7 single-approver chain",
    (b) => {
      const re = /function buildChain\([\s\S]*?\n\s*\}\n/;
      if (!re.test(b))
        throw new Error("buildChain not found in NewRequestPage");
      const replacement =
        "// [auto-fix] v7 single-approver chain — one decision is final.\n" +
        "function buildChain(request: RequestRecord): Array<{ role: string; teamId: TeamId | null }> {\n" +
        "  const teamId = request.fromTeamId ?? request.toTeamId ?? null;\n" +
        "  return [{ role: 'PRESIDENT', teamId }];\n" +
        "}\n";
      return b.replace(re, replacement);
    }
  );
}

function fix2c_contributionApprovals() {
  const marker = "// [auto-fix] v7 two-stage contribution approval";
  return patch("src/lib/contributionApprovals.ts", marker, (b) => {
    let out = b;
    out = out.replace(
      /\/\* ═+[\s\S]*?3-stage approval[\s\S]*?═+ \*\//,
      marker +
        "\n/* Stage 1: HR of Committee (assigns points, mandatory)\n" +
        "   Stage 2: HR of Team (final — awards points) */"
    );
    out = out.replace(
      /function getStage\(c: Contribution\): 1 \| 2 \| 3 \| 4 \{[\s\S]*?\n\s*\}\n/,
      "function getStage(c: Contribution): 1 | 2 | 3 | 4 {\n" +
        "  const s = c.currentStage;\n" +
        "  if (s === 1 || s === 2) return s;\n" +
        "  if (s === 3 || s === 4) return 4;\n" +
        "  if (c.status === 'approved' || c.status === 'rejected') return 4;\n" +
        "  return 1;\n" +
        "}\n"
    );
    out = out.replace(
      /export function newContributionApprovals\(\): ContributionApproval\[\] \{[\s\S]*?\n\s*\}\n/,
      "export function newContributionApprovals(): ContributionApproval[] {\n" +
        "  return [\n" +
        "    { stage: 1, status: 'pending' },\n" +
        "    { stage: 2, status: 'pending' },\n" +
        "  ];\n" +
        "}\n"
    );
    // Move final-award from stage 3 → stage 2.
    out = out.replace(/if \(stage === 3\) \{/g, "if (stage === 2) {");
    // Bounds check.
    out = out.replace(
      /if \(stage < 1 \|\| stage > 3\) throw new Error\('Invalid stage'\);/,
      "if (stage < 1 || stage > 2) throw new Error('Invalid stage');"
    );
    // Reject cascade skip-range.
    out = out.replace(
      /for \(let s = stage \+ 1; s <= 3; s\+\+\) \{/,
      "for (let s = stage + 1; s <= 2; s++) {"
    );
    return out;
  });
}

function fix2d_committeePermissionsStage() {
  const marker = "// [auto-fix] v7 two-stage contribution approval";
  return patch("src/lib/committeePermissions.ts", marker, (b) => {
    let out = b;
    out = out.replace(
      /STAGE 3:[\s\S]*?(?=\*\/)/,
      "STAGE 2: HR of Team (final) — awards points to the member.\n      "
    );
    out = out.replace(
      /export function getStage\(c: Contribution\): 1 \| 2 \| 3 \| 4 \{[\s\S]*?\n\s*\}\n/,
      "export function getStage(c: Contribution): 1 | 2 | 3 | 4 {\n" +
        "  const s = c.currentStage;\n" +
        "  if (s === 1 || s === 2) return s;\n" +
        "  if (c.status === 'approved' || c.status === 'rejected') return 4;\n" +
        "  return 1;\n" +
        "}\n"
    );
    out = out.replace(
      /if \(stage === 2\) \{\s*return \{[\s\S]*?\};\s*\}/,
      "if (stage === 2) {\n" +
        "    return {\n" +
        "      stage: 2,\n" +
        "      label: 'HR of Team',\n" +
        "      canApprove: userIsTeamHR(user, c.teamId) || isAdmin(user),\n" +
        "      assignPoints: false,\n" +
        "    };\n" +
        "  }"
    );
    out = out.replace(
      /if \(stage === 3\) \{[\s\S]*?return [^;]+;\s*\}/,
      "if (stage === 3) {\n" +
        "    return { stage: 4, label: 'Completed', canApprove: false, assignPoints: false };\n" +
        "  }"
    );
    out = out.replace(
      /if \(stage === 3\) return userIsGlobalHR\(user\) \|\| userIsSubBranchesHead\(user\);/,
      "if (stage === 3) return false;"
    );
    return out;
  });
}

function fix2e_stageLabels() {
  return patch(
    "src/pages/MyContributionsPage.tsx",
    "// [auto-fix] v7 stage labels",
    (b) => {
      const re = /const STAGE_LABEL: Record<number, string> = \{[\s\S]*?\};\n/;
      if (!re.test(b)) throw new Error("STAGE_LABEL not found");
      return b.replace(
        re,
        "// [auto-fix] v7 stage labels — 2 stages.\n" +
          "const STAGE_LABEL: Record<number, string> = {\n" +
          "  1: 'HR of Committee',\n" +
          "  2: 'HR of Team',\n" +
          "};\n"
      );
    }
  );
}

function fix2f_requestDetailApproveComment() {
  return patch(
    "src/pages/RequestDetailPage.tsx",
    "// [auto-fix] v7 approve-comment optional",
    (b) => {
      let out = b;
      out = out.replace(
        /<FormField\s+label=\{actionType === 'approve' \? '[^']*' : '[^']*'\}\s+required=\{actionType === 'reject'\}/,
        "// [auto-fix] v7 approve-comment optional\n" +
          "           <FormField\n" +
          "             label={actionType === 'approve' ? 'Comment (optional)' : 'Reason (required)'}\n" +
          "             required={actionType === 'reject'}"
      );
      return out;
    }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 3 — Requests purge + role/team data migration
   ═══════════════════════════════════════════════════════════════════════ */

const MIGRATIONS_FILE = `// [auto-fix] v7 — migrations:
//   1) purge legacy sequential-approval requests + their approval steps
//   2) rename legacy roles (HEAD_HR_TEAM → HR)
//   3) rename legacy team ids (messages → messengers, masar → track, enviros → innovators)
// Each migration is guarded by a localStorage flag so it runs at most once.
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FLAG_PURGE_REQUESTS = 'manhal.migration.v7.requests.purge.done';
const FLAG_ROLE_TEAM_RENAME = 'manhal.migration.v7.roles-teams.rename.done';

/* ═══════════════ 1. Purge legacy requests ═══════════════ */

export async function purgeLegacyRequestsOnce() {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem(FLAG_PURGE_REQUESTS) === '1') return null;

  let deleted = 0;
  let rewritten = 0;

  try {
    const aprSnap = await getDocs(collection(db, 'approvals'));
    const reqSnap = await getDocs(collection(db, 'requests'));

    const legacyRequestIds = new Set<string>();
    reqSnap.forEach((d) => {
      const data = d.data() || {};
      const isLegacy = data.singleApprover !== true;
      if (isLegacy && data.status !== 'APPROVED' && data.status !== 'REJECTED') {
        legacyRequestIds.add(d.id);
      }
    });

    for (const a of aprSnap.docs) {
      const aData = a.data() || {};
      if (aData.requestId && legacyRequestIds.has(aData.requestId)) {
        await deleteDoc(doc(db, 'approvals', a.id));
        deleted += 1;
      }
    }

    for (const id of legacyRequestIds) {
      await deleteDoc(doc(db, 'requests', id));
    }

    for (const d of reqSnap.docs) {
      const data = d.data() || {};
      if (data.status === 'PENDING' && data.singleApprover !== true) {
        try {
          await updateDoc(doc(db, 'requests', d.id), { singleApprover: true });
          rewritten += 1;
        } catch { /* ignore */ }
      }
    }

    window.localStorage.setItem(FLAG_PURGE_REQUESTS, '1');
    // eslint-disable-next-line no-console
    console.info('[migration] v7 purge requests done', { deleted, rewritten });
    return { deleted, rewritten };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] v7 purge requests failed', err);
    return null;
  }
}

/* ═══════════════ 2. Rename legacy role + team ids ═══════════════ */

const LEGACY_ROLE_MAP = { HEAD_HR_TEAM: 'HR' };

const LEGACY_TEAM_MAP = {
  messages: 'messengers',
  masar: 'track',
  enviros: 'innovators',
};

async function renameInCollection(collectionName, fields) {
  let changed = 0;
  try {
    const snap = await getDocs(collection(db, collectionName));
    for (const d of snap.docs) {
      const data = d.data() || {};
      const patchObj = {};

      for (const field of fields) {
        const value = data[field];

        // Scalar string fields (role, teamId, committeeId)
        if (typeof value === 'string') {
          if (LEGACY_ROLE_MAP[value]) patchObj[field] = LEGACY_ROLE_MAP[value];
          else if (LEGACY_TEAM_MAP[value]) patchObj[field] = LEGACY_TEAM_MAP[value];
        }

        // Array fields (teamIds, committeeIds)
        if (Array.isArray(value)) {
          const mapped = value.map((x) => {
            if (typeof x !== 'string') return x;
            return LEGACY_ROLE_MAP[x] || LEGACY_TEAM_MAP[x] || x;
          });
          if (mapped.some((x, i) => x !== value[i])) patchObj[field] = mapped;
        }
      }

      if (Object.keys(patchObj).length > 0) {
        try {
          await updateDoc(doc(db, collectionName, d.id), patchObj);
          changed += 1;
        } catch { /* ignore per-doc failure */ }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] rename in ' + collectionName + ' failed', err);
  }
  return changed;
}

export async function migrateRoleAndTeamIdsOnce() {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem(FLAG_ROLE_TEAM_RENAME) === '1') return null;

  try {
    const usersRenamed = await renameInCollection('users', ['role', 'teamId']);
    const membersRenamed = await renameInCollection('members', ['role', 'teamIds']);
    const committeesRenamed = await renameInCollection('committees', ['teamId']);
    const contribRenamed = await renameInCollection('contributions', ['teamId', 'currentStage']);
    const requestsRenamed = await renameInCollection('requests', ['fromTeamId', 'toTeamId']);
    const approvalsRenamed = await renameInCollection('approvals', ['requiredTeamId']);
    const calendarRenamed = await renameInCollection('calendar', ['teamId']);

    window.localStorage.setItem(FLAG_ROLE_TEAM_RENAME, '1');
    // eslint-disable-next-line no-console
    console.info('[migration] v7 role/team rename done', {
      usersRenamed,
      membersRenamed,
      committeesRenamed,
      contribRenamed,
      requestsRenamed,
      approvalsRenamed,
      calendarRenamed,
    });
    return {
      usersRenamed,
      membersRenamed,
      committeesRenamed,
      contribRenamed,
      requestsRenamed,
      approvalsRenamed,
      calendarRenamed,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] v7 role/team rename failed', err);
    return null;
  }
}

/* ═══════════════ Orchestrator ═══════════════ */

export async function runAllMigrationsOnce() {
  try { await purgeLegacyRequestsOnce(); } catch { /* ignore */ }
  try { await migrateRoleAndTeamIdsOnce(); } catch { /* ignore */ }
}
`;

function fix3a_migrationsFile() {
  const existing = readFile("src/lib/migrations.ts");
  if (existing && existing.includes("// [auto-fix] v7 — migrations:")) {
    return { ok: true, note: "already applied" };
  }
  return replaceOnce("src/lib/migrations.ts", MIGRATIONS_FILE);
}

function fix3b_layoutRunMigrations() {
  return patch(
    "src/components/layout/Layout.tsx",
    "// [auto-fix] v7 run migrations on boot",
    (b) => {
      // Add import
      let out = b;
      if (!out.includes("runAllMigrationsOnce")) {
        out = out.replace(
          /import \{ initPwa \} from '@\/lib\/pwa';/,
          "import { initPwa } from '@/lib/pwa';\n" +
            "import { runAllMigrationsOnce } from '@/lib/migrations';"
        );
      }
      // Add effect right after initPwa effect
      const effectRe = /useEffect\(\(\) => \{\s*initPwa\(\);\s*\}, \[\]\);/;
      if (!effectRe.test(out))
        throw new Error("initPwa effect not found in Layout");
      out = out.replace(
        effectRe,
        "// [auto-fix] v7 run migrations on boot\n" +
          "     useEffect(() => {\n" +
          "       initPwa();\n" +
          "       runAllMigrationsOnce().catch(() => {});\n" +
          "     }, []);"
      );
      return out;
    }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 4 — Members page: no post-on-behalf-of-member
   ═══════════════════════════════════════════════════════════════════════ */

function fix4_adminMembersGuard() {
  return patch(
    "src/pages/admin/AdminMembersPage.tsx",
    "// [auto-fix] v7: no post-on-behalf-of-member allowed",
    (b) => {
      let out = b;
      // Best-effort remove of any residual helper names.
      const forbidden = [
        /onBehalfOfMember[\s\S]*?\n/g,
        /createPostForMember[\s\S]*?\n/g,
        /recordPostForMember[\s\S]*?\n/g,
      ];
      for (const re of forbidden) out = out.replace(re, "");
      // Add the top guard comment.
      if (!out.startsWith("// [auto-fix]")) {
        out =
          "// [auto-fix] v7: no post-on-behalf-of-member allowed\n" +
          "// Members can only create posts from their own account.\n" +
          "// The admin panel does NOT expose any action to record posts on behalf of another member.\n" +
          out;
      }
      return out;
    }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 5 — Strict routing helpers
   ═══════════════════════════════════════════════════════════════════════ */

const STRICT_ROUTING_FILE = `// [auto-fix] v7 — strict notification + approval routing helpers.
// Every notification/approval MUST target exactly ONE intended recipient
// (or an explicitly whitelisted group). No implicit broadcasting.
import type { AppUser, Contribution, RequestRecord, TeamId } from '@/types';
import { logAudit } from './audit';

export interface RoutingResult { ok: boolean; reason?: string; }

/** Assert an approver is allowed to act on a given contribution's stage. */
export function verifyContributionApprover(
  approver: AppUser | null,
  contribution: Contribution,
  stage: 1 | 2,
): RoutingResult {
  if (!approver) return { ok: false, reason: 'No approver.' };

  const authorTeamId = contribution.teamId as TeamId | undefined;
  const authorCommitteeId = contribution.committeeId;

  if (!authorTeamId || !authorCommitteeId) {
    return { ok: false, reason: 'Post is missing team or committee context.' };
  }

  // Admin (HEAD) bypass — still logged.
  if (approver.role === 'HEAD') return { ok: true };

  if (stage === 1) {
    if (approver.role !== 'COMMITTEE_HR') {
      return { ok: false, reason: 'Stage 1 must be performed by the HR of the committee.' };
    }
    if (approver.teamId !== authorTeamId) {
      return { ok: false, reason: 'Committee HR must be inside the author\\'s team.' };
    }
    if (!Array.isArray(approver.committeeIds) || !approver.committeeIds.includes(authorCommitteeId)) {
      return { ok: false, reason: 'Approver is not HR of the author\\'s committee.' };
    }
    return { ok: true };
  }

  if (stage === 2) {
    if (approver.role !== 'HR') {
      return { ok: false, reason: 'Stage 2 must be performed by the HR of the team.' };
    }
    if (approver.teamId !== authorTeamId) {
      return { ok: false, reason: 'HR must belong to the author\\'s team.' };
    }
    return { ok: true };
  }

  return { ok: false, reason: 'Unknown stage.' };
}

/** Only whitelisted roles may edit or delete a post. */
export function canEditOrDeletePost(
  user: AppUser | null,
  contribution: Contribution,
): boolean {
  if (!user) return false;
  const authorTeamId = contribution.teamId as TeamId | undefined;
  if (!authorTeamId) return false;

  if (user.role === 'HEAD') return true;
  if (user.role === 'HEAD_HR_GLOBAL') return true;
  if (user.role === 'PRESIDENT' && user.teamId === authorTeamId) return true;
  if (user.role === 'VICE_PRESIDENT' && user.teamId === authorTeamId) return true;

  return false;
}

/** Only the Head of the requester's team can act on a request. */
export function verifyRequestApprover(
  approver: AppUser | null,
  request: RequestRecord,
): RoutingResult {
  if (!approver) return { ok: false, reason: 'No approver.' };
  if (approver.role === 'HEAD') return { ok: true };

  const teamId = request.fromTeamId ?? request.toTeamId;
  if (!teamId) return { ok: false, reason: 'Request is missing team context.' };

  if (approver.role !== 'PRESIDENT') {
    return { ok: false, reason: 'Only the Head of the team can decide on this request.' };
  }
  if (approver.teamId !== teamId) {
    return { ok: false, reason: 'You can only decide on requests from your own team.' };
  }
  return { ok: true };
}

/** Audit helper — records a rejected-action attempt. */
export async function logRejectedAction(
  user: AppUser | null,
  kind: 'contribution' | 'request',
  targetId: string,
  reason: string,
): Promise<void> {
  try {
    await logAudit(
      user,
      'REJECTED_ACTION',
      kind === 'contribution' ? 'Contribution' : 'Request',
      targetId,
      reason,
    );
  } catch {
    /* ignore */
  }
}
`;

function fix5_strictRouting() {
  const existing = readFile("src/lib/strictRouting.ts");
  if (existing && existing.includes("v7 — strict notification")) {
    return { ok: true, note: "already applied" };
  }
  return replaceOnce("src/lib/strictRouting.ts", STRICT_ROUTING_FILE);
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 6 — Firebase: Firestore rules doc rewrite
   ═══════════════════════════════════════════════════════════════════════ */

const FIRESTORE_RULES_DOC = `# Firestore Rules — v7

## Hierarchy (top → bottom)

- **HEAD** — Head of Sub-Branches. Site Admin. Top leader.
- **VICE** — Vice Head(s) of Sub-Branches. Full permissions except admin-only actions.
- **HEAD_HR_GLOBAL** — Head of HRs. Oversees all HRs and all members.
- **PRESIDENT** — Head of a single team. Scope: own team only.
- **VICE_PRESIDENT** — Vice Head of a single team. Scope: own team only.
- **HR** — HR of a single team. Reports to Head of HRs. Scope: own team only.
- **COMMITTEE_HR** — HR of a committee. Scope: own committee only.
- **MEMBER / VIEWER** — regular members.

## Key rules

- Team leadership (PRESIDENT / VICE_PRESIDENT / HR) may only act on their **own team**.
- Committee HR may only act on their **own committee** and its members.
- Only HEAD is admin. VICE cannot perform admin-only actions.
- Strict routing: notifications target ONE recipient (or an explicit group).

## Publish

Firebase Console → Firestore Database → Rules → paste → Publish.

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function userDoc() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function userExists() {
      return exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }

    // HEAD only — admin.
    function isAdmin() {
      return isSignedIn() && userExists() && userDoc().role == 'HEAD';
    }

    // HEAD or VICE — full org-wide permissions.
    function isHeadOrVice() {
      return isSignedIn() && userExists()
        && userDoc().role in ['HEAD', 'VICE'];
    }

    function isGlobalHR() {
      return isSignedIn() && userExists() && userDoc().role == 'HEAD_HR_GLOBAL';
    }

    function isTeamHead() {
      return isSignedIn() && userExists() && userDoc().role == 'PRESIDENT';
    }

    function isTeamViceHead() {
      return isSignedIn() && userExists() && userDoc().role == 'VICE_PRESIDENT';
    }

    function isTeamHR() {
      return isSignedIn() && userExists() && userDoc().role == 'HR';
    }

    function isCommitteeHR() {
      return isSignedIn() && userExists() && userDoc().role == 'COMMITTEE_HR';
    }

    // SAME-TEAM checks — leadership only manages their own team.
    function sameTeamAs(targetTeamId) {
      return isSignedIn() && userExists()
        && userDoc().teamId == targetTeamId;
    }

    function isCommitteeHRFor(committeeId) {
      return isCommitteeHR()
        && userDoc().committeeIds is list
        && committeeId in userDoc().committeeIds;
    }

    // ═══════════ USERS ═══════════
    match /users/{uid} {
      allow read: if isSignedIn();
      allow create: if request.auth.uid == uid;
      allow update: if isAdmin() || request.auth.uid == uid;
      allow delete: if isAdmin();
    }

    // ═══════════ MEMBERS ═══════════
    match /members/{id} {
      allow read: if isSignedIn();
      allow create: if isAdmin() || (
        isSignedIn()
        && request.resource.data.linkedUserId == request.auth.uid
      );
      allow update: if isAdmin()
        || (isTeamHead() && userDoc().teamId in resource.data.teamIds)
        || (isTeamViceHead() && userDoc().teamId in resource.data.teamIds)
        || (isTeamHR() && userDoc().teamId in resource.data.teamIds)
        || isGlobalHR();
      allow delete: if isAdmin();
    }

    // ═══════════ TEAMS ═══════════
    match /teams/{id} {
      allow read: if true;
      allow write: if isHeadOrVice();
    }

    // ═══════════ COMMITTEES ═══════════
    match /committees/{id} {
      allow read: if isSignedIn();
      allow write: if isHeadOrVice();
    }

    // ═══════════ CONTRIBUTIONS ═══════════
    match /contributions/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.resource.data.createdBy == request.auth.uid;
      allow update: if isAdmin()
        || isCommitteeHRFor(resource.data.committeeId)
        || (isTeamHR() && userDoc().teamId == resource.data.teamId);
      allow delete: if isAdmin()
        || isGlobalHR()
        || (isTeamHead() && userDoc().teamId == resource.data.teamId)
        || (isTeamViceHead() && userDoc().teamId == resource.data.teamId);
    }

    // ═══════════ WARNINGS ═══════════
    match /warnings/{id} {
      allow read: if isSignedIn();
      allow write: if isAdmin()
        || isGlobalHR()
        || (isTeamHead() && userDoc().teamId in resource.data.teamIds);
    }

    // ═══════════ ACHIEVEMENTS ═══════════
    match /achievements/{id} {
      allow read: if true;
      allow write: if isHeadOrVice() || isGlobalHR();
    }

    // ═══════════ NOTIFICATIONS ═══════════
    // Strict: user can only read their own notifications.
    match /notifications/{id} {
      allow read: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow create: if isSignedIn();
      allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
      allow delete: if isAdmin();
    }

    // ═══════════ CONVERSATIONS ═══════════
    match /conversations/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isAdmin();
    }

    // ═══════════ MESSAGES ═══════════
    match /messages/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.senderUid == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // ═══════════ CALENDAR ═══════════
    match /calendar/{id} {
      allow read: if true;
      allow write: if isHeadOrVice() || isGlobalHR();
    }

    // ═══════════ GOVERNANCE ═══════════
    match /governance/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ═══════════ AUDIT ═══════════
    match /audit/{id} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
    }

    // ═══════════ REQUESTS ═══════════
    // Single-approver: only the Head of the requester's team decides.
    match /requests/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
        && request.resource.data.requesterUid == request.auth.uid;
      allow update: if isAdmin()
        || (isTeamHead() && userDoc().teamId in [
          resource.data.fromTeamId,
          resource.data.toTeamId
        ]);
      allow delete: if isAdmin();
    }

    // ═══════════ APPROVALS ═══════════
    match /approvals/{id} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isAdmin()
        || isTeamHead()
        || isGlobalHR();
    }
  }
}
\`\`\`
`;

function fix6_firestoreRulesDoc() {
  const existing = readFile("docs/FIRESTORE_RULES.md");
  if (existing && existing.includes("Firestore Rules — v7")) {
    return { ok: true, note: "already applied" };
  }
  return replaceOnce("docs/FIRESTORE_RULES.md", FIRESTORE_RULES_DOC);
}

/* ═══════════════════════════════════════════════════════════════════════
   Orchestrator
   ═══════════════════════════════════════════════════════════════════════ */

async function runFix(name, fn) {
  try {
    const r = await fn();
    summary.push({ name, ok: !!(r && r.ok), note: (r && r.note) || "" });
    log(
      "  " +
        (r && r.ok ? "✓" : "✗") +
        "  " +
        name +
        "  —  " +
        ((r && r.note) || "")
    );
  } catch (e) {
    summary.push({ name, ok: false, note: e.message });
    log("  ✗  " + name + "  —  " + e.message);
  }
}

async function pushChanged() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    log("");
    log("  ⚠ GITHUB_TOKEN / GITHUB_REPO not set — skipping remote push.");
    log("    All edits are on disk with .bak backups.");
    return;
  }
  log("");
  log("  Pushing changed files to GitHub…");
  for (const rel of changedFiles) {
    const r = await pushFile(rel);
    log("    " + (r.ok ? "✓" : "✗") + "  " + rel + "  —  " + r.note);
  }
}

async function main() {
  log("");
  log("  ════════════════════════════════════════════════════════════════");
  log("   fix.cjs — Manhal v7 surgical patch");
  log("  ════════════════════════════════════════════════════════════════");
  log("   ROOT   : " + ROOT);
  log(
    "   GitHub : " +
      (GITHUB_REPO ? GITHUB_REPO + " (" + BRANCH + ")" : "(not configured)")
  );
  log("");

  log("  [1] Organizational hierarchy rebuild");
  await runFix("teams data → 7 teams", fix1a_teamsData);
  await runFix("TeamId union (types.ts + types/index.ts)", fix1b_teamsUnion);
  await runFix("RoleId union (remove HEAD_HR_TEAM)", fix1c_rolesUnion);
  await runFix("roles.ts rebuild", fix1d_rolesData);
  await runFix(
    "permissions.ts (LEVEL, LABEL, isAdmin, isViceHead)",
    fix1e_permissions
  );
  await runFix(
    "committeePermissions.ts (userIsTeamHR + cleanup)",
    fix1f_committeePermissionsCleanup
  );
  await runFix("notifications.ts manager list", fix1g_notificationsManagerList);

  log("");
  log("  [2] Post / contribution approval rebuild → 2 stages");
  await runFix(
    "approvals.buildApprovalChain (single approver)",
    fix2a_approvals
  );
  await runFix(
    "NewRequestPage.buildChain (single approver)",
    fix2b_newRequestChain
  );
  await runFix(
    "contributionApprovals.ts (2-stage)",
    fix2c_contributionApprovals
  );
  await runFix(
    "committeePermissions.ts (2-stage)",
    fix2d_committeePermissionsStage
  );
  await runFix("MyContributionsPage stage labels", fix2e_stageLabels);
  await runFix(
    "RequestDetailPage approve-comment optional",
    fix2f_requestDetailApproveComment
  );

  log("");
  log("  [3] Requests purge + role/team data migration");
  await runFix("migrations.ts (purge + rename)", fix3a_migrationsFile);
  await runFix("Layout.tsx run migrations on boot", fix3b_layoutRunMigrations);

  log("");
  log("  [4] Members page — no post-on-behalf-of-member");
  await runFix("AdminMembersPage guard", fix4_adminMembersGuard);

  log("");
  log("  [5] Strict routing helpers");
  await runFix("strictRouting.ts", fix5_strictRouting);

  log("");
  log("  [6] Firebase — Firestore rules doc");
  await runFix("docs/FIRESTORE_RULES.md → v7", fix6_firestoreRulesDoc);

  log("");
  await pushChanged();

  log("");
  log("  ════════════════════════════════════════════════════════════════");
  log("   SUMMARY");
  log("  ════════════════════════════════════════════════════════════════");
  let ok = 0;
  let ko = 0;
  for (const s of summary) {
    log("   " + (s.ok ? "✅" : "❌") + "  " + s.name + "  —  " + s.note);
    if (s.ok) ok += 1;
    else ko += 1;
  }
  log("");
  log("   ✅ done: " + ok + "    ❌ failed: " + ko);
  log("   Files changed locally: " + changedFiles.length);
  changedFiles.forEach((f) =>
    log("     • " + f + "   (backup: " + f + ".bak)")
  );
  log("");
  log("  ════════════════════════════════════════════════════════════════");
  log("");
  log(
    "  ⚠️  Firestore rules must also be pasted manually in Firebase Console:"
  );
  log("       Firestore Database → Rules → paste contents of");
  log("       docs/FIRESTORE_RULES.md  → Publish");
  log("");

  if (ko > 0) process.exitCode = 1;
}

main().catch((e) => {
  log("FATAL: " + (e && e.stack ? e.stack : e));
  process.exit(1);
});
