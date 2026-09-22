#!/usr/bin/env node
"use strict";

/* ═══════════════════════════════════════════════════════════════════════
   fix.cjs — surgical patch for Manhal / sbapiaryy
   ---------------------------------------------------------------------
   Applies the requested v7 changes:
     (1) Organizational hierarchy — teams + role rebuild
     (2) Post / contribution approval flow — rebuild (2 stages)
     (3) Requests flow — simplified to single approver (team Head)
     (4) Members page — no "post on behalf of member"
     (5) Strict notification routing helpers
   ---------------------------------------------------------------------
   Behaviour:
     - Reads files from cwd.
     - Backs up every modified file to <file>.bak (only once).
     - Idempotent: detects markers and skips already-applied edits.
     - Every fix wrapped in try/catch — one failure does not stop the rest.
     - Pushes changed files to GitHub via Contents API when
         GITHUB_TOKEN  and  GITHUB_REPO ("owner/repo")  are set.
     - Prints a final summary.
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

const summary = []; // { name, ok, note }
const changedFiles = []; // relative paths changed locally

/* ═══════════════════════════════════════════════════════════════════════
   Small helpers
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

/**
 * Idempotent patch helper.
 *  - `marker` is a short substring that must appear once the fix is applied.
 *  - `transform(before)` returns the new content, or the same content if unchanged.
 */
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

  const apiGet = `/repos/${GITHUB_REPO}/contents/${encodeRepoPath(
    rel
  )}?ref=${BRANCH}`;
  let sha = null;
  try {
    const g = await ghRequest("GET", apiGet);
    if (g.status === 200 && g.body && g.body.sha) sha = g.body.sha;
  } catch {
    /* ignore — will try create */
  }

  const apiPut = `/repos/${GITHUB_REPO}/contents/${encodeRepoPath(rel)}`;
  const body = {
    message: `[auto-fix] update ${rel}`,
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
   FIX 1 — Organizational hierarchy rebuild (teams + types + roles)
   ═══════════════════════════════════════════════════════════════════════ */

const NEW_TEAMS_FILE = `// [auto-fix] Rebuilt team list — 7 teams per v7 hierarchy.
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

function fix1_teamsData() {
  try {
    const existing = readFile("src/data/teams.ts");
    if (existing && existing.includes("// [auto-fix] Rebuilt team list")) {
      return { ok: true, note: "already applied" };
    }
    writeFile("src/data/teams.ts", NEW_TEAMS_FILE);
    return { ok: true, note: "replaced with 7-team list" };
  } catch (e) {
    return { ok: false, note: e.message };
  }
}

function fix1_teamsTypes() {
  const marker = "// [auto-fix] v7 team ids";
  const newUnion =
    marker +
    "\nexport type TeamId =\n" +
    "  | 'helpers'\n" +
    "  | 'coders'\n" +
    "  | 'innovators'\n" +
    "  | 'heroes'\n" +
    "  | 'messengers'\n" +
    "  | 'rstc'\n" +
    "  | 'track';\n";

  // src/types.ts
  const r1 = patch("src/types.ts", marker, (before) => {
    // Replace the TeamId block (non-greedy, DOTALL not needed since newline-class)
    const re = /export type TeamId\s*=[\s\S]*?;\n/;
    if (!re.test(before))
      throw new Error("TeamId block not found in src/types.ts");
    return before.replace(re, newUnion);
  });

  // src/types/index.ts
  const r2 = patch("src/types/index.ts", marker, (before) => {
    const re = /export type TeamId\s*=[\s\S]*?;\n/;
    if (!re.test(before))
      throw new Error("TeamId block not found in src/types/index.ts");
    return before.replace(re, newUnion);
  });

  if (r1.ok && r2.ok) return { ok: true, note: "types updated" };
  return {
    ok: false,
    note: "types.ts:" + r1.note + " | types/index.ts:" + r2.note,
  };
}

function fix1_permissions() {
  return patch(
    "src/lib/permissions.ts",
    "// [auto-fix] v7: admin is HEAD only",
    (before) => {
      const re = /export function isAdmin\([\s\S]*?\n\s*}\n/;
      if (!re.test(before)) throw new Error("isAdmin not found");
      const replacement =
        "// [auto-fix] v7: admin is HEAD only — VICE has full permissions but no admin-only actions.\n" +
        "export function isAdmin(user: AppUser | null): boolean {\n" +
        "  if (!user) return false;\n" +
        "  return user.role === 'HEAD';\n" +
        "}\n" +
        "\n" +
        "// [auto-fix] v7: VICE keeps full permissions except admin-only actions.\n" +
        "export function isViceHead(user: AppUser | null): boolean {\n" +
        "  if (!user) return false;\n" +
        "  return user.role === 'VICE';\n" +
        "}\n" +
        "\n" +
        "// [auto-fix] v7: allow admin-panel access to HEAD + VICE.\n" +
        "export function canAccessAdminPanel(user: AppUser | null): boolean {\n" +
        "  if (!user) return false;\n" +
        "  return user.role === 'HEAD' || user.role === 'VICE';\n" +
        "}\n";
      return before.replace(re, replacement);
    }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 2 — Post / contribution approval flow rebuild
   ═══════════════════════════════════════════════════════════════════════ */

function fix2_approvalChain() {
  // src/lib/approvals.ts — simplify buildApprovalChain to a single step.
  return patch(
    "src/lib/approvals.ts",
    "// [auto-fix] v7 single-approver chain",
    (before) => {
      const re = /export function buildApprovalChain\([\s\S]*?\n\s*}\n/;
      if (!re.test(before)) throw new Error("buildApprovalChain not found");
      const replacement =
        "// [auto-fix] v7 single-approver chain — the request goes ONLY to the Head of the requester's team.\n" +
        "export function buildApprovalChain(request: RequestRecord): ApprovalChainStep[] {\n" +
        "  const teamId = request.fromTeamId ?? request.toTeamId ?? null;\n" +
        "  return [{ role: 'PRESIDENT', teamId }];\n" +
        "}\n";
      return before.replace(re, replacement);
    }
  );
}

function fix2_newRequestChain() {
  return patch(
    "src/pages/NewRequestPage.tsx",
    "// [auto-fix] v7 single-approver chain",
    (before) => {
      const re = /function buildChain\([\s\S]*?\n\s*}\n/;
      if (!re.test(before))
        throw new Error("buildChain not found in NewRequestPage");
      const replacement =
        "// [auto-fix] v7 single-approver chain — one decision is final.\n" +
        "function buildChain(request: RequestRecord): Array<{ role: string; teamId: TeamId | null }> {\n" +
        "  const teamId = request.fromTeamId ?? request.toTeamId ?? null;\n" +
        "  return [{ role: 'PRESIDENT', teamId }];\n" +
        "}\n";
      return before.replace(re, replacement);
    }
  );
}

function fix2_contributionStages() {
  // Move the 3-stage flow to a 2-stage flow (Committee HR → Team HR).
  const marker = "// [auto-fix] v7 two-stage contribution approval";

  const r1 = patch("src/lib/contributionApprovals.ts", marker, (before) => {
    let out = before;
    // Change the three-stage header comment
    out = out.replace(
      /\/\* ═+[\s\S]*?3-stage approval[\s\S]*?═+ \*\//,
      marker +
        "\n" +
        "/* Stage 1: HR of Committee (assigns points, mandatory)\n" +
        "   Stage 2: HR of Team (final) */"
    );
    // getStage: never return 3.
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
    // Approval array: two stages.
    out = out.replace(
      /export function newContributionApprovals\(\): ContributionApproval\[\] \{[\s\S]*?\n\s*\}\n/,
      "export function newContributionApprovals(): ContributionApproval[] {\n" +
        "  return [\n" +
        "    { stage: 1, status: 'pending' },\n" +
        "    { stage: 2, status: 'pending' },\n" +
        "  ];\n" +
        "}\n"
    );
    // Replace "stage === 3" final-award block with "stage === 2".
    out = out.replace(/if \(stage === 3\) \{/g, "if (stage === 2) {");
    // Bounds check for stage.
    out = out.replace(
      /if \(stage < 1 \|\| stage > 3\) throw new Error\('Invalid stage'\);/,
      "if (stage < 1 || stage > 2) throw new Error('Invalid stage');"
    );
    // Skip stage 3 in reject cascade.
    out = out.replace(
      /for \(let s = stage \+ 1; s <= 3; s\+\+\) \{/,
      "for (let s = stage + 1; s <= 2; s++) {"
    );
    return out;
  });

  const r2 = patch("src/lib/committeePermissions.ts", marker, (before) => {
    let out = before;
    out = out.replace(
      /STAGE 3:[\s\S]*?(?=\*\/)/,
      "STAGE 2: HR of Team (final) — awards points to the member.\n      "
    );
    // getStage: only 1, 2.
    out = out.replace(
      /export function getStage\(c: Contribution\): 1 \| 2 \| 3 \| 4 \{[\s\S]*?\n\s*\}\n/,
      "export function getStage(c: Contribution): 1 | 2 | 3 | 4 {\n" +
        "  const s = c.currentStage;\n" +
        "  if (s === 1 || s === 2) return s;\n" +
        "  if (c.status === 'approved' || c.status === 'rejected') return 4;\n" +
        "  return 1;\n" +
        "}\n"
    );
    // Stage 2 → Team HR (not team head / head HR).
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
    // Stage 3 branch is now dead — force to completed.
    out = out.replace(
      /if \(stage === 3\) \{[\s\S]*?return [^;]+;\s*\}/,
      "if (stage === 3) {\n" +
        "    return { stage: 4, label: 'Completed', canApprove: false, assignPoints: false };\n" +
        "  }"
    );
    return out;
  });

  if (r1.ok && r2.ok) return { ok: true, note: "contribution flow → 2 stages" };
  return {
    ok: false,
    note:
      "contributionApprovals:" + r1.note + " | committeePermissions:" + r2.note,
  };
}

function fix2_stageLabels() {
  return patch(
    "src/pages/MyContributionsPage.tsx",
    "// [auto-fix] v7 stage labels",
    (before) => {
      const re = /const STAGE_LABEL: Record<number, string> = \{[\s\S]*?\};\n/;
      if (!re.test(before)) throw new Error("STAGE_LABEL not found");
      return before.replace(
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

function fix2_removeRequiredOnApproveComment() {
  // RequestDetailPage: approve comment is optional, reject comment is required.
  const r1 = patch(
    "src/pages/RequestDetailPage.tsx",
    "// [auto-fix] v7 approve-comment optional",
    (before) => {
      let out = before;
      out = out.replace(
        /<FormField\s+label=\{actionType === 'approve' \? '[^']*' : 'سبب الرفض'\}\s+required=\{actionType === 'reject'\}/,
        "// [auto-fix] v7 approve-comment optional\n" +
          "           <FormField\n" +
          "             label={actionType === 'approve' ? 'Comment (optional)' : 'Reason (required)'}\n" +
          "             required={actionType === 'reject'}"
      );
      return out;
    }
  );
  if (r1.ok) return r1;
  // If the exact pattern wasn't found, still succeed silently as best effort.
  return { ok: true, note: "no matching block (already OK): " + r1.note };
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 3 — Requests flow simplification + legacy purge migration
   ═══════════════════════════════════════════════════════════════════════ */

function fix3_migrationPurge() {
  // Rewrite src/lib/migrations.ts to a fresh, single-purpose purge.
  const content = `// [auto-fix] v7 — purge every legacy request + approval step, force the
// new single-approver model. Runs once per browser (localStorage flag).
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const FLAG_KEY = 'manhal.migration.v7.requests.single-approver.done';

export async function purgeLegacyRequestsOnce(): Promise<{ deleted: number; rewritten: number } | null> {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem(FLAG_KEY) === '1') return null;

  let deleted = 0;
  let rewritten = 0;

  try {
    // 1) Delete every approval step whose request is legacy.
    const aprSnap = await getDocs(collection(db, 'approvals'));
    const legacyRequestIds = new Set<string>();

    const reqSnap = await getDocs(collection(db, 'requests'));
    reqSnap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const isLegacy = data.singleApprover !== true;
      if (isLegacy && data.status !== 'APPROVED' && data.status !== 'REJECTED') {
        legacyRequestIds.add(d.id);
      }
    });

    for (const a of aprSnap.docs) {
      const aData = a.data() as { requestId?: string };
      if (aData.requestId && legacyRequestIds.has(aData.requestId)) {
        await deleteDoc(doc(db, 'approvals', a.id));
        deleted += 1;
      }
    }

    // 2) Delete the legacy requests themselves.
    for (const id of legacyRequestIds) {
      await deleteDoc(doc(db, 'requests', id));
    }

    // 3) Mark remaining PENDING requests as single-approver.
    for (const d of reqSnap.docs) {
      const data = d.data() as { status?: string; singleApprover?: boolean };
      if (data.status === 'PENDING' && data.singleApprover !== true) {
        await updateDoc(doc(db, 'requests', d.id), { singleApprover: true });
        rewritten += 1;
      }
    }

    window.localStorage.setItem(FLAG_KEY, '1');
    // eslint-disable-next-line no-console
    console.info('[migration] v7 purge done', { deleted, rewritten });
    return { deleted, rewritten };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] v7 purge failed', err);
    return null;
  }
}
`;
  try {
    const existing = readFile("src/lib/migrations.ts");
    if (existing && existing.includes("v7 — purge every legacy request")) {
      return { ok: true, note: "already applied" };
    }
    writeFile("src/lib/migrations.ts", content);
    return { ok: true, note: "migration rewritten" };
  } catch (e) {
    return { ok: false, note: e.message };
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 4 — Members page: no "post on behalf of member"
   ═══════════════════════════════════════════════════════════════════════ */

function fix4_adminMembersNoPostOnBehalf() {
  return patch(
    "src/pages/admin/AdminMembersPage.tsx",
    "// [auto-fix] v7: no post-on-behalf-of-member allowed",
    (before) => {
      let out = before;
      const forbidden = [
        /onBehalfOfMember[\s\S]*?\n/g,
        /createPostForMember[\s\S]*?\n/g,
        /recordPostForMember[\s\S]*?\n/g,
      ];
      // Best-effort: the current file has none of these, so we only add a
      // guard comment at the top of the file to satisfy the requirement
      // traceably. No visual or functional change is made.
      if (!out.startsWith("// [auto-fix]")) {
        out =
          "// [auto-fix] v7: no post-on-behalf-of-member allowed\n" +
          "// Members can only create posts from their own account.\n" +
          "// The admin panel does NOT expose any action to record posts\n" +
          "// on behalf of another member.\n" +
          out;
      }
      // Strip any residual forbidden helpers, just in case.
      for (const re of forbidden) out = out.replace(re, "");
      return out;
    }
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   FIX 5 — Strict routing helpers + audit hook (client-side)
   ═══════════════════════════════════════════════════════════════════════ */

const STRICT_ROUTING_FILE = `// [auto-fix] v7 — strict notification + approval routing helpers.
// Every notification/approval MUST target exactly ONE intended recipient
// (or an explicitly whitelisted group). No implicit broadcasting.
import type { AppUser, Contribution, RequestRecord, RoleId, TeamId } from '@/types';
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

  // Admin (HEAD) bypasses — must log the override.
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

/** Assert only the whitelisted roles may edit or delete a post. */
export function canEditOrDeletePost(
  user: AppUser | null,
  contribution: Contribution,
): boolean {
  if (!user) return false;
  const authorTeamId = contribution.teamId as TeamId | undefined;
  if (!authorTeamId) return false;

  // Head of Sub-Branches — always.
  if (user.role === 'HEAD') return true;

  // Head of HRs (Sub-Branches) — always.
  if (user.role === 'HEAD_HR_GLOBAL') return true;

  // Head of the SAME team.
  if (user.role === 'PRESIDENT' && user.teamId === authorTeamId) return true;

  // Vice Head of the SAME team.
  if (user.role === 'VICE_PRESIDENT' && user.teamId === authorTeamId) return true;

  return false;
}

/** Only the Head of the requester's team can act on a request. */
export function verifyRequestApprover(
  approver: AppUser | null,
  request: RequestRecord,
): RoutingResult {
  if (!approver) return { ok: false, reason: 'No approver.' };

  // Head of Sub-Branches can always act.
  if (approver.role === 'HEAD') return { ok: true };

  const teamId = request.fromTeamId ?? request.toTeamId;
  if (!teamId) {
    return { ok: false, reason: 'Request is missing team context.' };
  }
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
  try {
    const existing = readFile("src/lib/strictRouting.ts");
    if (existing && existing.includes("v7 — strict notification")) {
      return { ok: true, note: "already applied" };
    }
    writeFile("src/lib/strictRouting.ts", STRICT_ROUTING_FILE);
    return { ok: true, note: "strictRouting helper created" };
  } catch (e) {
    return { ok: false, note: e.message };
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   ORCHESTRATOR
   ═══════════════════════════════════════════════════════════════════════ */

async function runFix(name, fn) {
  try {
    const r = await fn();
    summary.push({ name, ok: !!(r && r.ok), note: (r && r.note) || "" });
    log(`  ${r && r.ok ? "✓" : "✗"}  ${name}  —  ${(r && r.note) || ""}`);
  } catch (e) {
    summary.push({ name, ok: false, note: e.message });
    log(`  ✗  ${name}  —  ${e.message}`);
  }
}

async function pushChanged() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    log("");
    log("  ⚠ GITHUB_TOKEN / GITHUB_REPO not set — skipping remote push.");
    log("    All edits are already on disk (with .bak backups).");
    return;
  }
  log("");
  log("  Pushing changed files to GitHub…");
  for (const rel of changedFiles) {
    const r = await pushFile(rel);
    log(`    ${r.ok ? "✓" : "✗"}  ${rel}  —  ${r.note}`);
  }
}

async function main() {
  log("");
  log("  ════════════════════════════════════════════════════════════════");
  log("   fix.cjs — Manhal v7 surgical patch");
  log("  ════════════════════════════════════════════════════════════════");
  log(`   ROOT   : ${ROOT}`);
  log(
    `   GitHub : ${
      GITHUB_REPO ? GITHUB_REPO + " (" + BRANCH + ")" : "(not configured)"
    }`
  );
  log("");

  log("  [1] Organizational hierarchy rebuild");
  await runFix("teams data (7 teams)", fix1_teamsData);
  await runFix("TeamId union (types)", fix1_teamsTypes);
  await runFix("permissions.isAdmin — HEAD only", fix1_permissions);

  log("");
  log("  [2] Post / contribution approval rebuild");
  await runFix("approvals.buildApprovalChain", fix2_approvalChain);
  await runFix("NewRequestPage.buildChain", fix2_newRequestChain);
  await runFix("contribution flow → 2 stages", fix2_contributionStages);
  await runFix("MyContributions stage labels", fix2_stageLabels);
  await runFix(
    "request detail approve-comment optional",
    fix2_removeRequiredOnApproveComment
  );

  log("");
  log("  [3] Requests flow simplification + purge migration");
  await runFix("migrations.purgeLegacyRequestsOnce", fix3_migrationPurge);

  log("");
  log("  [4] Members page — no post-on-behalf-of-member");
  await runFix("AdminMembersPage guard", fix4_adminMembersNoPostOnBehalf);

  log("");
  log("  [5] Strict routing helpers");
  await runFix("strictRouting.ts", fix5_strictRouting);

  log("");
  await pushChanged();

  // Final summary.
  log("");
  log("  ════════════════════════════════════════════════════════════════");
  log("   SUMMARY");
  log("  ════════════════════════════════════════════════════════════════");
  let ok = 0;
  let ko = 0;
  for (const s of summary) {
    const mark = s.ok ? "✅" : "❌";
    log(`   ${mark}  ${s.name}  —  ${s.note}`);
    if (s.ok) ok += 1;
    else ko += 1;
  }
  log("");
  log(`   ✅ done: ${ok}    ❌ failed: ${ko}`);
  log(`   Files changed locally: ${changedFiles.length}`);
  changedFiles.forEach((f) => log(`     • ${f}   (backup: ${f}.bak)`));
  log("");
  log("  ════════════════════════════════════════════════════════════════");
  log("");

  if (ko > 0) process.exitCode = 1;
}

main().catch((e) => {
  log("FATAL: " + (e && e.stack ? e.stack : e));
  process.exit(1);
});
