#!/usr/bin/env node
"use strict";

/* ═══════════════════════════════════════════════════════════════════════
   fix.cjs — build fix for Manhal v7
   ---------------------------------------------------------------------
   Problem
     Running two sequential versions of the earlier fix.cjs produced
     duplicate top-level declarations in `src/lib/permissions.ts`:
         - isViceHead        (declared twice)
         - canAccessAdminPanel (declared twice)
     which esbuild rejects as "Multiple exports with the same name".

   What this fix does
     1) Replaces `src/lib/permissions.ts` with a clean, single-source-of-
        truth version that matches the v7 hierarchy.
     2) Scans every `.ts/.tsx` file under `src/` and reports any remaining
        duplicate top-level `export function NAME` declarations.
     3) Backs up every modified file to `<file>.bak` (once).
     4) Pushes changed files to GitHub via the Contents API when
        GITHUB_TOKEN + GITHUB_REPO are set.
     5) Prints a final summary.

   Usage
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
   FIX — Replace permissions.ts with a clean, deduplicated version
   ═══════════════════════════════════════════════════════════════════════ */

const CLEAN_PERMISSIONS_TS = `// [auto-fix] v7 — clean, deduplicated permissions module.
import type { AppUser, RoleId, TeamId } from '@/types';

/* ═══════════════════════════════════════════════════════════════
   Role levels (top → bottom)
   ═══════════════════════════════════════════════════════════════ */

export const ROLE_LEVEL: Record<RoleId, number> = {
  HEAD: 100,
  VICE: 95,
  HEAD_HR_GLOBAL: 90,
  PRESIDENT: 80,
  VICE_PRESIDENT: 70,
  HR: 60,
  COMMITTEE_HR: 55,
  MEMBER: 50,
  VIEWER: 10,
};

/* ═══════════════════════════════════════════════════════════════
   Core role predicates
   ═══════════════════════════════════════════════════════════════ */

// [auto-fix] v7 isAdmin is HEAD-only.
export function isAdmin(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD';
}

// [auto-fix] v7 VICE has full permissions but not admin-only actions.
export function isViceHead(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'VICE';
}

// [auto-fix] v7 admin-panel access for HEAD + VICE.
export function canAccessAdminPanel(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD' || user.role === 'VICE';
}

// [auto-fix] v7 HEAD or VICE — Sub-Branches leadership.
export function isSubBranchesHead(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'HEAD' || user.role === 'VICE';
}

// [auto-fix] v7 HEAD_HR_GLOBAL.
export function isGlobalHR(user: AppUser | null): boolean {
  return user?.role === 'HEAD_HR_GLOBAL';
}

// [auto-fix] v7 PRESIDENT.
export function isTeamHead(user: AppUser | null): boolean {
  return user?.role === 'PRESIDENT';
}

// [auto-fix] v7 VICE_PRESIDENT.
export function isTeamViceHead(user: AppUser | null): boolean {
  return user?.role === 'VICE_PRESIDENT';
}

// [auto-fix] v7 HR — team HR.
export function isTeamHR(user: AppUser | null): boolean {
  return user?.role === 'HR';
}

// [auto-fix] v7 COMMITTEE_HR.
export function isCommitteeHR(user: AppUser | null): boolean {
  return user?.role === 'COMMITTEE_HR';
}

// [auto-fix] v7 manager — any elevated role.
export function isManager(user: AppUser | null): boolean {
  if (!user) return false;
  return [
    'HEAD',
    'VICE',
    'HEAD_HR_GLOBAL',
    'PRESIDENT',
    'VICE_PRESIDENT',
    'HR',
    'COMMITTEE_HR',
  ].includes(user.role);
}

// [auto-fix] v7 sees-all-teams: HEAD, VICE, HEAD_HR_GLOBAL.
export function seesAllTeams(user: AppUser | null): boolean {
  if (!user) return false;
  return ['HEAD', 'VICE', 'HEAD_HR_GLOBAL'].includes(user.role);
}

// [auto-fix] v7 managed-team — null means "all teams".
export function managedTeam(user: AppUser | null): TeamId | null {
  if (!user) return null;
  if (seesAllTeams(user)) return null;
  return user.teamId ?? null;
}

// [auto-fix] v7 can-approve-step.
export function canApproveStep(
  user: AppUser | null,
  step: { status: string; requiredRole: string; requiredTeamId?: TeamId | null },
): boolean {
  if (!user) return false;
  if (step.status !== 'PENDING') return false;
  if (isAdmin(user)) return true;
  if (user.role !== step.requiredRole) return false;
  if (step.requiredTeamId) return user.teamId === step.requiredTeamId;
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   Arabic role labels for the UI
   ═══════════════════════════════════════════════════════════════ */

// [auto-fix] v7 ROLE_LABEL.
export const ROLE_LABEL: Record<RoleId, string> = {
  HEAD: 'رئيس الفروع',
  VICE: 'نائب رئيس الفروع',
  HEAD_HR_GLOBAL: 'رئيس الموارد البشرية',
  PRESIDENT: 'رئيس فريق',
  VICE_PRESIDENT: 'نائب رئيس فريق',
  HR: 'موارد بشرية الفريق',
  COMMITTEE_HR: 'موارد بشرية اللجنة',
  MEMBER: 'عضو',
  VIEWER: 'زائر',
};
`;

function fixPermissionsDuplicates() {
  try {
    const existing = readFile("src/lib/permissions.ts");
    if (existing === CLEAN_PERMISSIONS_TS) {
      return { ok: true, note: "already clean" };
    }
    writeFile("src/lib/permissions.ts", CLEAN_PERMISSIONS_TS);

    // Verify.
    const after = readFile("src/lib/permissions.ts") || "";
    const cVice = (after.match(/export function isViceHead\b/g) || []).length;
    const cAdmin = (after.match(/export function canAccessAdminPanel\b/g) || [])
      .length;
    const cIsAdmin = (after.match(/export function isAdmin\b/g) || []).length;
    const cLabel = (after.match(/export const ROLE_LABEL\b/g) || []).length;
    const cLevel = (after.match(/export const ROLE_LEVEL\b/g) || []).length;

    if (
      cVice !== 1 ||
      cAdmin !== 1 ||
      cIsAdmin !== 1 ||
      cLabel !== 1 ||
      cLevel !== 1
    ) {
      return {
        ok: false,
        note:
          "verification failed: vice=" +
          cVice +
          " canAccessAdminPanel=" +
          cAdmin +
          " isAdmin=" +
          cIsAdmin +
          " ROLE_LABEL=" +
          cLabel +
          " ROLE_LEVEL=" +
          cLevel,
      };
    }
    return { ok: true, note: "permissions.ts rewritten cleanly" };
  } catch (e) {
    return { ok: false, note: e.message };
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   Diagnostic — scan src/ for remaining duplicate top-level exports
   ═══════════════════════════════════════════════════════════════════════ */

function scanForDuplicateExports() {
  const findings = [];
  const srcDir = path.join(ROOT, "src");
  if (!fs.existsSync(srcDir)) return findings;

  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;
      let content;
      try {
        content = fs.readFileSync(full, "utf8");
      } catch {
        continue;
      }
      const counts = {};
      const re = /export\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g;
      let m;
      while ((m = re.exec(content)) !== null) {
        counts[m[1]] = (counts[m[1]] || 0) + 1;
      }
      const dupes = Object.entries(counts).filter(([, c]) => c > 1);
      if (dupes.length > 0) {
        findings.push({
          file: path.relative(ROOT, full),
          dupes: dupes.map(([n, c]) => n + " (" + c + ")"),
        });
      }
    }
  };

  walk(srcDir);
  return findings;
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
  log("   fix.cjs — Manhal v7 build fix (duplicate declarations)");
  log("  ════════════════════════════════════════════════════════════════");
  log("   ROOT   : " + ROOT);
  log(
    "   GitHub : " +
      (GITHUB_REPO ? GITHUB_REPO + " (" + BRANCH + ")" : "(not configured)")
  );
  log("");

  log("  [1] Rewrite src/lib/permissions.ts");
  await runFix(
    "dedupe isViceHead + canAccessAdminPanel",
    fixPermissionsDuplicates
  );

  log("");
  log("  [2] Scan src/ for remaining duplicate top-level exports");
  const findings = scanForDuplicateExports();
  if (findings.length === 0) {
    log("  ✓  no duplicate exports found");
    summary.push({ name: "scan duplicate exports", ok: true, note: "clean" });
  } else {
    log("  ✗  found duplicate exports in:");
    for (const f of findings) {
      log("       • " + f.file + " → " + f.dupes.join(", "));
    }
    summary.push({
      name: "scan duplicate exports",
      ok: false,
      note: findings.length + " file(s) with duplicates",
    });
  }

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
  log("   Next: GitHub Actions will rebuild on the next push.");
  log("   If the build still fails, paste the new error.");
  log("  ════════════════════════════════════════════════════════════════");
  log("");

  if (ko > 0) process.exitCode = 1;
}

main().catch((e) => {
  log("FATAL: " + (e && e.stack ? e.stack : e));
  process.exit(1);
});
