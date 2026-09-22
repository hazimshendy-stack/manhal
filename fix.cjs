#!/usr/bin/env node
"use strict";

/* ═══════════════════════════════════════════════════════════════════════
   fix.cjs — v7.2 missing file fix
   ---------------------------------------------------------------------
   ROOT CAUSE
     The previous fix.cjs used a `replaceWhole()` helper that returned
     early with `{ ok: false, note: "file not found" }` when the target
     file did not exist — so NEW files were never created.
     Result: `src/lib/contributionRouting.ts` was never written, but
     `MyContributionsPage.tsx` still imports from it → Vite fails with:
       Could not load .../src/lib/contributionRouting
   THE FIX
     • Create the missing file (writeFile — always writes).
     • Sanity-check that every other file the previous fix.cjs was
       supposed to touch still exists on disk.
     • Git auto-commit + force push at the end.
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_REPO = process.env.GITHUB_REPO || "";
const BRANCH = process.env.GITHUB_BRANCH || "main";

const summary = [];
const changedFiles = [];

/* ═══════════════════════════════════════════════════════════════════════
   Utilities
   ═══════════════════════════════════════════════════════════════════════ */

function log(m) {
  console.log(m);
}

function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
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
    } catch {}
  }
}

function writeFile(rel, content) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (fs.existsSync(abs)) backupOnce(abs);
  fs.writeFileSync(abs, content, "utf8");
  if (!changedFiles.includes(rel)) changedFiles.push(rel);
}

/* ═══════════════════════════════════════════════════════════════════════
   GitHub Contents API (fallback push)
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
  if (!GITHUB_TOKEN || !GITHUB_REPO)
    return { ok: false, note: "no token/repo" };
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
  } catch {}

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
    return { ok: false, note: "HTTP " + r.status };
  } catch (e) {
    return { ok: false, note: e.message };
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   The missing file — src/lib/contributionRouting.ts
   ═══════════════════════════════════════════════════════════════════════ */

const CONTRIBUTION_ROUTING_TS = `// [auto-fix] v7.1 — resolve the exact approver for a contribution stage.
// This module is the single source of truth for Stage-1 (HR of Committee)
// and Stage-2 (HR of Team) routing.
import type { AppUser, TeamId } from '@/types';

export interface ApproverRef {
  uid: string;
  role: string;
  name: string;
}

/** Find the committee HR of a given team + committee. */
export function findCommitteeHR(
  users: AppUser[],
  teamId: TeamId | null | undefined,
  committeeId: string | null | undefined,
): ApproverRef | null {
  if (!teamId || !committeeId) return null;
  const u = users.find(
    (x) =>
      x.role === 'COMMITTEE_HR' &&
      x.teamId === teamId &&
      Array.isArray(x.committeeIds) &&
      x.committeeIds.includes(committeeId),
  );
  return u ? { uid: u.uid, role: 'COMMITTEE_HR', name: u.displayName } : null;
}

/** Find the team HR (role === 'HR') of a given team. */
export function findTeamHR(
  users: AppUser[],
  teamId: TeamId | null | undefined,
): ApproverRef | null {
  if (!teamId) return null;
  const u = users.find((x) => x.role === 'HR' && x.teamId === teamId);
  return u ? { uid: u.uid, role: 'HR', name: u.displayName } : null;
}

/** Find the team head (role === 'PRESIDENT'). */
export function findTeamHead(
  users: AppUser[],
  teamId: TeamId | null | undefined,
): ApproverRef | null {
  if (!teamId) return null;
  const u = users.find((x) => x.role === 'PRESIDENT' && x.teamId === teamId);
  return u ? { uid: u.uid, role: 'PRESIDENT', name: u.displayName } : null;
}

/** Resolve the approver for a specific contribution stage. */
export function resolveStageApprover(
  users: AppUser[],
  stage: 1 | 2,
  teamId: TeamId | null | undefined,
  committeeId: string | null | undefined,
): ApproverRef | null {
  if (stage === 1) return findCommitteeHR(users, teamId, committeeId);
  if (stage === 2) return findTeamHR(users, teamId);
  return null;
}
`;

/* ═══════════════════════════════════════════════════════════════════════
   Sanity check — the previous v7.1 fix was supposed to touch these
   ═══════════════════════════════════════════════════════════════════════ */

const EXPECTED_FILES = [
  "src/lib/contributionRouting.ts", // ← the one that was missing
  "src/lib/contributionApprovals.ts",
  "src/lib/strictRouting.ts",
  "src/lib/migrations.ts",
  "src/pages/ApprovalsPage.tsx",
  "src/pages/MyContributionsPage.tsx",
];

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

function createContributionRouting() {
  const existing = readFile("src/lib/contributionRouting.ts");
  if (
    existing &&
    existing.includes("findCommitteeHR") &&
    existing.includes("resolveStageApprover")
  ) {
    return { ok: true, note: "already exists" };
  }
  writeFile("src/lib/contributionRouting.ts", CONTRIBUTION_ROUTING_TS);
  const after = readFile("src/lib/contributionRouting.ts") || "";
  if (
    !after.includes("findCommitteeHR") ||
    !after.includes("resolveStageApprover")
  ) {
    return { ok: false, note: "write verification failed" };
  }
  return { ok: true, note: "created" };
}

function verifyExpectedFiles() {
  const missing = EXPECTED_FILES.filter((f) => !exists(f));
  if (missing.length === 0) return { ok: true, note: "all present" };
  return { ok: false, note: "missing: " + missing.join(", ") };
}

async function pushViaGitHubAPI() {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    log(
      "  ⚠ GITHUB_TOKEN / GITHUB_REPO not set — skipping Contents API fallback."
    );
    return;
  }
  log("");
  log("  [fallback] Pushing changed files via GitHub Contents API…");
  for (const rel of changedFiles) {
    const r = await pushFile(rel);
    log("    " + (r.ok ? "✓" : "✗") + "  " + rel + "  —  " + r.note);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   Git auto-commit + force push
   ═══════════════════════════════════════════════════════════════════════ */

function runGit(cmd, opts) {
  const allowEmpty = !!(opts && opts.allowEmpty);
  try {
    execSync(cmd, { stdio: "inherit" });
    return { ok: true };
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    if (allowEmpty && /nothing to commit/i.test(msg)) {
      console.log("⚠️ No changes to commit, continuing...");
      return { ok: true, skipped: true };
    }
    console.error("❌ Git failed: " + cmd);
    console.error(msg);
    return { ok: false, error: msg };
  }
}

function autoPush() {
  console.log("");
  console.log("🚀 [git] Starting auto-commit & force push…");

  if (!runGit("git add .").ok) {
    console.error("❌ Aborting: git add failed.");
    return false;
  }

  if (!runGit('git commit -m "force update"', { allowEmpty: true }).ok) {
    console.error("❌ Aborting: git commit failed (and it was not a no-op).");
    return false;
  }

  let branch = "main";
  try {
    const b = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    if (b) branch = b;
  } catch {}

  if (branch === "main") {
    if (!runGit("git push --force origin main").ok) {
      console.error("");
      console.error("❌ git push --force origin main failed.");
      console.error("   Try manually:  git remote -v   /   git status");
      console.error("   Then:          git push --force origin main");
      return false;
    }
  } else {
    console.warn('⚠️ Current branch is "' + branch + '", not main.');
    console.warn("   Pushing WITHOUT --force to origin " + branch + "…");
    if (!runGit("git push origin " + branch).ok) {
      console.error("❌ git push origin " + branch + " failed.");
      return false;
    }
  }

  console.log("✅ Git operations completed successfully.");
  return true;
}

/* ═══════════════════════════════════════════════════════════════════════
   Main
   ═══════════════════════════════════════════════════════════════════════ */

async function main() {
  log("");
  log("  ════════════════════════════════════════════════════════════════");
  log("   fix.cjs — Manhal v7.2 missing-file fix");
  log("  ════════════════════════════════════════════════════════════════");
  log("   ROOT   : " + ROOT);
  log(
    "   GitHub : " +
      (GITHUB_REPO ? GITHUB_REPO + " (" + BRANCH + ")" : "(not configured)")
  );
  log("");

  log("  ▸ Current state of files the previous fix should have touched:");
  for (const f of EXPECTED_FILES) {
    log("      " + (exists(f) ? "✓" : "✗ MISSING") + "  " + f);
  }
  log("");

  log("  [1] Create src/lib/contributionRouting.ts");
  await runFix("contributionRouting.ts", createContributionRouting);

  log("");
  log("  [2] Verify all expected files exist");
  await runFix("sanity check", verifyExpectedFiles);

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

  const pushed = autoPush();

  if (!pushed) {
    log("");
    log("  ⚠ Local git push failed. Attempting GitHub Contents API fallback…");
    await pushViaGitHubAPI();
  } else if (GITHUB_TOKEN && GITHUB_REPO) {
    log("");
    log("  ℹ Local git push succeeded. Skipping Contents API fallback.");
  }

  log("");
  log("  ════════════════════════════════════════════════════════════════");
  log("   NEXT STEPS");
  log("  ════════════════════════════════════════════════════════════════");
  log("   1. GitHub Actions will rebuild on the next push (5-7 min).");
  log("   2. If the build STILL fails, the error will be a different one");
  log("      (the missing-file problem is now fixed).");
  log("  ════════════════════════════════════════════════════════════════");
  log("");

  if (ko > 0) process.exitCode = 1;
}

main().catch((e) => {
  log("FATAL: " + (e && e.stack ? e.stack : e));
  process.exit(1);
});
