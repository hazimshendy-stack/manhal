#!/usr/bin/env node
"use strict";

/* ═══════════════════════════════════════════════════════════════════════
   fix.cjs — v7.1 REAL BUG FIX (contribution routing + strict approvals)
   ---------------------------------------------------------------------
   ROOT CAUSE
     • MyContributionsPage.submit() creates a contribution with no
       pendingApproverId and never notifies the committee HR.
     • ApprovalsPage only subscribes to `approvals` (request steps),
       not to `contributions` → HR users see nothing.
     • The only Approve/Reject UI for contributions is /admin/contributions,
       which is RequireAuth(['HEAD','VICE']) — hidden from HR users.
   THE FIX
     • Extend Contribution type with pendingApproverId/Role/blockedReason.
     • New src/lib/contributionRouting.ts → resolves the exact approver
       (Stage 1: COMMITTEE_HR of team+committee, Stage 2: HR of team).
     • Rewrite contributionApprovals.ts: strict 2-stage, no admin bypass,
       audit every action, notify only the intended recipient.
     • Patch MyContributionsPage: resolve Stage-1 approver at submit time
       and send a single-recipient notification.
     • Patch ApprovalsPage: also surface contributions the current user
       is allowed to approve, in realtime.
     • Extend strictRouting.ts with contribution guards.
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
  backupOnce(abs);
  fs.writeFileSync(abs, content, "utf8");
  if (!changedFiles.includes(rel)) changedFiles.push(rel);
}

function replaceWhole(rel, content, marker) {
  try {
    const before = readFile(rel);
    if (before === null) return { ok: false, note: "file not found" };
    if (marker && before.includes(marker))
      return { ok: true, note: "already applied" };
    writeFile(rel, content);
    return { ok: true, note: "rewritten" };
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
   Diagnostic
   ═══════════════════════════════════════════════════════════════════════ */

function walkSrc(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSrc(full, out);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
}

function grep(rel, pattern) {
  const content = readFile(rel);
  if (!content) return [];
  const out = [];
  content.split("\n").forEach((line, i) => {
    if (pattern.test(line)) out.push({ line: i + 1, text: line.trim() });
  });
  return out;
}

function printDiagnostic() {
  log("");
  log("  ════════════════════════════════════════════════════════════════");
  log("   DIAGNOSTIC REPORT (before applying fixes)");
  log("  ════════════════════════════════════════════════════════════════");

  log("");
  log("  ▸ Contribution writes:");
  grep(
    "src/pages/MyContributionsPage.tsx",
    /createOne\('contributions'/
  ).forEach((x) => log("      src/pages/MyContributionsPage.tsx:" + x.line));
  grep(
    "src/pages/admin/AdminContributionsPage.tsx",
    /createOne\('contributions'/
  ).forEach((x) =>
    log("      src/pages/admin/AdminContributionsPage.tsx:" + x.line)
  );

  log("");
  log("  ▸ Contribution reads (realtime):");
  const srcDir = path.join(ROOT, "src");
  const all = [];
  walkSrc(srcDir, all);
  all.forEach((abs) => {
    const rel = path.relative(ROOT, abs);
    grep(rel, /use(Realtime)?Collection<Contribution>/).forEach((h) =>
      log("      " + rel + ":" + h.line)
    );
  });

  log("");
  log("  ▸ Approve/Reject UI for contributions:");
  all.forEach((abs) => {
    const rel = path.relative(ROOT, abs);
    grep(rel, /approveContributionStage|rejectContributionStage/).forEach((h) =>
      log("      " + rel + ":" + h.line)
    );
  });

  log("");
  log("  ▸ pendingApproverId usage:");
  let hits = 0;
  all.forEach((abs) => {
    const rel = path.relative(ROOT, abs);
    grep(rel, /pendingApproverId/).forEach((h) => {
      log("      " + rel + ":" + h.line);
      hits += 1;
    });
  });
  if (hits === 0)
    log("      (none — this is why routing never reaches the correct user)");

  log("");
  log("  ▸ BREAK POINTS:");
  log("      1. submit() creates a contribution without pendingApproverId and");
  log("         never notifies the committee HR.");
  log(
    "      2. ApprovalsPage only subscribes to `approvals`, not `contributions`."
  );
  log(
    "      3. Approve/Reject UI is hidden behind RequireAuth(['HEAD','VICE'])."
  );
  log("  ════════════════════════════════════════════════════════════════");
  log("");
}

/* ═══════════════════════════════════════════════════════════════════════
   GitHub Contents API (fallback)
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
   PATCH 1 — extend Contribution types
   ═══════════════════════════════════════════════════════════════════════ */

function patchTypes() {
  const marker = "// [auto-fix] v7.1 routing fields";

  // ── src/types.ts ──
  const r1 = patch("src/types.ts", marker, (before) => {
    let out = before;

    // Extend the ContributionStatus union.
    out = out.replace(
      /export type ContributionStatus\s*=\s*[^;]+;/,
      "export type ContributionStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'blocked_no_approver';"
    );

    // Ensure ContributionApproval exists.
    if (!/export interface ContributionApproval\b/.test(out)) {
      out =
        "export interface ContributionApproval {\n" +
        "  stage: 1 | 2 | 3;\n" +
        "  status: 'pending' | 'approved' | 'rejected' | 'skipped';\n" +
        "  approvedBy?: string;\n" +
        "  approvedByName?: string;\n" +
        "  approvedByRole?: string;\n" +
        "  approvedAt?: string;\n" +
        "  comment?: string;\n" +
        "  points?: number;\n" +
        "}\n\n" +
        out;
    }

    // Replace the entire Contribution interface.
    const re = /export interface Contribution \{[\s\S]*?\n\}/;
    if (!re.test(out))
      throw new Error("Contribution interface not found in src/types.ts");
    const replacement =
      "export interface Contribution {\n" +
      "  id: string;\n" +
      "  memberId: string;\n" +
      "  memberName?: string;\n" +
      "  teamId: TeamId | null;\n" +
      "  committeeId?: string | null;\n" +
      "  category?: string;\n" +
      "  title: string;\n" +
      "  description?: string;\n" +
      "  date: string;\n" +
      "  hours: number;\n" +
      "  points: number;\n" +
      "  status: ContributionStatus;\n" +
      "  seasonId?: string;\n" +
      "  createdBy?: string;\n" +
      "  currentStage?: 1 | 2 | 3 | 4;\n" +
      "  approvals?: ContributionApproval[];\n" +
      "  " +
      marker +
      "\n" +
      "  pendingApproverId?: string | null;\n" +
      "  pendingApproverRole?: string | null;\n" +
      "  blockedReason?: string | null;\n" +
      "}";
    out = out.replace(re, replacement);
    return out;
  });

  // ── src/types/index.ts ──
  const r2 = patch("src/types/index.ts", marker, (before) => {
    let out = before;
    out = out.replace(
      /export type ContributionStatus\s*=\s*[^;]+;/,
      "export type ContributionStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'blocked_no_approver';"
    );
    const re = /(export interface Contribution \{[\s\S]*?)(\n\s*\})/;
    if (!re.test(out))
      throw new Error("Contribution not found in src/types/index.ts");
    out = out.replace(
      re,
      "$1\n  " +
        marker +
        "\n" +
        "  pendingApproverId?: string | null;\n" +
        "  pendingApproverRole?: string | null;\n" +
        "  blockedReason?: string | null;\n" +
        "$2"
    );
    return out;
  });

  if (r1.ok && r2.ok) return { ok: true, note: "types extended" };
  return {
    ok: false,
    note: "types.ts:" + r1.note + " | types/index.ts:" + r2.note,
  };
}

/* ═══════════════════════════════════════════════════════════════════════
   PATCH 2 — src/lib/contributionRouting.ts
   ═══════════════════════════════════════════════════════════════════════ */

const CONTRIBUTION_ROUTING_TS = `// [auto-fix] v7.1 — resolve the exact approver for a contribution stage.
import type { AppUser, TeamId } from '@/types';

export interface ApproverRef {
  uid: string;
  role: string;
  name: string;
}

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

export function findTeamHR(
  users: AppUser[],
  teamId: TeamId | null | undefined,
): ApproverRef | null {
  if (!teamId) return null;
  const u = users.find((x) => x.role === 'HR' && x.teamId === teamId);
  return u ? { uid: u.uid, role: 'HR', name: u.displayName } : null;
}

export function findTeamHead(
  users: AppUser[],
  teamId: TeamId | null | undefined,
): ApproverRef | null {
  if (!teamId) return null;
  const u = users.find((x) => x.role === 'PRESIDENT' && x.teamId === teamId);
  return u ? { uid: u.uid, role: 'PRESIDENT', name: u.displayName } : null;
}

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

function patchContributionRouting() {
  return replaceWhole(
    "src/lib/contributionRouting.ts",
    CONTRIBUTION_ROUTING_TS,
    "v7.1 — resolve the exact approver"
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PATCH 3 — src/lib/contributionApprovals.ts (full rewrite)
   ═══════════════════════════════════════════════════════════════════════ */

const CONTRIBUTION_APPROVALS_TS = `// [auto-fix] v7.1 — strict 2-stage routing. No admin bypass.
//   Stage 1 → HR of Committee (assigns points, cannot double-approve)
//   Stage 2 → HR of Team (final: awards points, notifies everyone)
// Every transition updates pendingApproverId + pendingApproverRole.
// Every action / failed attempt writes an audit entry.
import { updateOne, getOne, now, listAll } from './db';
import { notifyUser } from './notifications';
import { logAudit } from './audit';
import { safeNumber } from './safe';
import { resolveStageApprover } from './contributionRouting';
import type { Contribution, ContributionApproval, AppUser } from '@/types';

function getStage(c: Contribution): 1 | 2 | 3 | 4 {
  const s = c.currentStage;
  if (s === 1 || s === 2) return s;
  if (s === 3 || s === 4) return 4;
  if (c.status === 'approved' || c.status === 'rejected') return 4;
  return 1;
}

function getApprovals(c: Contribution): ContributionApproval[] {
  if (Array.isArray(c.approvals) && c.approvals.length > 0) return [...c.approvals];
  return [
    { stage: 1, status: 'pending' },
    { stage: 2, status: 'pending' },
  ];
}

export function newContributionApprovals(): ContributionApproval[] {
  return [
    { stage: 1, status: 'pending' },
    { stage: 2, status: 'pending' },
  ];
}

function verifyApprover(
  approver: AppUser,
  c: Contribution,
  stage: 1 | 2,
): { ok: boolean; reason?: string } {
  const teamId = c.teamId ?? null;
  const committeeId = c.committeeId ?? null;

  if (!teamId) return { ok: false, reason: 'Contribution is missing team context.' };

  if (stage === 1) {
    if (approver.role !== 'COMMITTEE_HR') {
      return { ok: false, reason: 'Stage 1 must be performed by the HR of the committee.' };
    }
    if (approver.teamId !== teamId) {
      return { ok: false, reason: "You must be inside the author's team." };
    }
    if (
      !committeeId ||
      !Array.isArray(approver.committeeIds) ||
      !approver.committeeIds.includes(committeeId)
    ) {
      return { ok: false, reason: "You are not the HR of the author's committee." };
    }
    return { ok: true };
  }

  if (stage === 2) {
    if (approver.role !== 'HR') {
      return { ok: false, reason: 'Stage 2 must be performed by the HR of the team.' };
    }
    if (approver.teamId !== teamId) {
      return { ok: false, reason: "You must belong to the author's team." };
    }
    return { ok: true };
  }

  return { ok: false, reason: 'Unknown stage.' };
}

async function auditReject(
  user: AppUser,
  c: Contribution,
  stage: 1 | 2,
  reason: string,
): Promise<void> {
  try {
    await logAudit(
      user,
      'REJECTED_APPROVAL_ATTEMPT',
      'Contribution',
      c.id,
      'stage=' + stage + ' reason=' + reason,
    );
  } catch { /* ignore */ }
}

export async function approveContributionStage(
  contribution: Contribution,
  user: AppUser,
  points?: number,
  comment?: string,
): Promise<void> {
  const stage = getStage(contribution);
  if (stage < 1 || stage > 2) throw new Error('This contribution is already finalised.');

  const v = verifyApprover(user, contribution, stage);
  if (!v.ok) {
    await auditReject(user, contribution, stage, v.reason || 'unknown');
    throw new Error(v.reason || 'You are not authorised to approve this stage.');
  }

  const approvals = getApprovals(contribution);

  const stageEntry = approvals.find((a) => a.stage === stage);
  if (stageEntry && stageEntry.status === 'approved') {
    await auditReject(user, contribution, stage, 'already-approved-by-this-stage');
    throw new Error('This stage has already been approved.');
  }

  if (stage === 1) {
    if (typeof points !== 'number' || Number.isNaN(points) || points < 0) {
      throw new Error('Points must be assigned at stage 1.');
    }
  }

  const idx = approvals.findIndex((a) => a.stage === stage);
  const newApproval: ContributionApproval = {
    stage: stage as 1 | 2,
    status: 'approved',
    approvedBy: user.uid,
    approvedByName: user.displayName,
    approvedByRole: user.role,
    approvedAt: now(),
    comment: comment && comment.trim() ? comment.trim() : undefined,
    points: stage === 1 ? points : undefined,
  };
  if (idx >= 0) approvals[idx] = newApproval;
  else approvals.push(newApproval);

  let updatedPoints = safeNumber(contribution.points);
  if (stage === 1 && typeof points === 'number') updatedPoints = points;

  const allUsers = await listAll<AppUser>('users');

  /* ─── STAGE 2 → FINAL ─── */
  if (stage === 2) {
    await updateOne('contributions', contribution.id, {
      approvals,
      points: updatedPoints,
      status: 'approved',
      currentStage: 4,
      pendingApproverId: null,
      pendingApproverRole: null,
    });

    if (updatedPoints > 0) {
      try {
        const member = await getOne<{ points?: number; hours?: number }>(
          'members',
          contribution.memberId,
        );
        if (member) {
          await updateOne('members', contribution.memberId, {
            points: safeNumber(member.points) + updatedPoints,
            hours: safeNumber(member.hours) + safeNumber(contribution.hours),
          });
        }
      } catch (e) {
        console.warn('Member update failed:', e);
      }
    }

    try {
      await notifyUser(
        contribution.createdBy || '',
        'Contribution approved',
        '"' + (contribution.title || '') + '" — +' + updatedPoints + ' points',
        'participation',
        '/my-contributions',
        'high',
        user.displayName,
      );
    } catch { /* ignore */ }

    const notified = new Set<string>();
    notified.add(contribution.createdBy || '');
    notified.add(user.uid);
    approvals.forEach((a) => {
      if (a.approvedBy) notified.add(a.approvedBy);
    });
    for (const uid of notified) {
      if (!uid || uid === user.uid) continue;
      try {
        await notifyUser(
          uid,
          'Contribution finalised',
          '"' + (contribution.title || '') + '" awarded ' + updatedPoints + ' points.',
          'approval',
          '/my-contributions',
          'normal',
          user.displayName,
        );
      } catch { /* ignore */ }
    }

    try {
      await logAudit(
        user,
        'APPROVE_CONTRIBUTION_FINAL',
        'Contribution',
        contribution.id,
        'stage=2 points=' + updatedPoints,
      );
    } catch { /* ignore */ }

    return;
  }

  /* ─── STAGE 1 → 2 ─── */
  const nextApprover = resolveStageApprover(
    allUsers,
    2,
    contribution.teamId ?? null,
    contribution.committeeId ?? null,
  );

  const patchObj = {
    approvals,
    points: updatedPoints,
    status: nextApprover ? 'in_review' : 'blocked_no_approver',
    currentStage: 2,
    pendingApproverId: nextApprover ? nextApprover.uid : null,
    pendingApproverRole: nextApprover ? nextApprover.role : null,
    blockedReason: nextApprover
      ? null
      : 'No HR of Team found for team ' + (contribution.teamId || ''),
  };

  await updateOne('contributions', contribution.id, patchObj);

  if (nextApprover) {
    try {
      await notifyUser(
        nextApprover.uid,
        'Contribution awaiting your approval',
        '"' + (contribution.title || '') + '" — Stage 2 (HR of Team).',
        'approval',
        '/approvals',
        'high',
        user.displayName,
      );
    } catch { /* ignore */ }
  }

  try {
    await logAudit(
      user,
      'APPROVE_CONTRIBUTION_STAGE',
      'Contribution',
      contribution.id,
      'stage=1 points=' + updatedPoints + ' next=' + (nextApprover ? nextApprover.uid : 'none'),
    );
  } catch { /* ignore */ }
}

export async function rejectContributionStage(
  contribution: Contribution,
  user: AppUser,
  comment: string,
): Promise<void> {
  if (!comment || !comment.trim()) {
    throw new Error('A comment is required when rejecting.');
  }

  const stage = getStage(contribution);
  if (stage < 1 || stage > 2) throw new Error('This contribution is already finalised.');

  const v = verifyApprover(user, contribution, stage);
  if (!v.ok) {
    await auditReject(user, contribution, stage, v.reason || 'unknown');
    throw new Error(v.reason || 'You are not authorised to reject this stage.');
  }

  const approvals = getApprovals(contribution);
  const idx = approvals.findIndex((a) => a.stage === stage);

  const newApproval: ContributionApproval = {
    stage: stage as 1 | 2,
    status: 'rejected',
    approvedBy: user.uid,
    approvedByName: user.displayName,
    approvedByRole: user.role,
    approvedAt: now(),
    comment: comment.trim(),
  };
  if (idx >= 0) approvals[idx] = newApproval;
  else approvals.push(newApproval);

  for (let s = stage + 1; s <= 2; s++) {
    if (!approvals.some((a) => a.stage === s)) {
      approvals.push({ stage: s as 1 | 2, status: 'skipped' });
    }
  }

  await updateOne('contributions', contribution.id, {
    approvals,
    status: 'rejected',
    pendingApproverId: null,
    pendingApproverRole: null,
  });

  try {
    await notifyUser(
      contribution.createdBy || '',
      'Contribution rejected',
      '"' + (contribution.title || '') + '" — ' + comment,
      'participation',
      '/my-contributions',
      'high',
      user.displayName,
    );
  } catch { /* ignore */ }

  try {
    await logAudit(
      user,
      'REJECT_CONTRIBUTION',
      'Contribution',
      contribution.id,
      'stage=' + stage + ' ' + comment,
    );
  } catch { /* ignore */ }
}
`;

function patchContributionApprovals() {
  return replaceWhole(
    "src/lib/contributionApprovals.ts",
    CONTRIBUTION_APPROVALS_TS,
    "// [auto-fix] v7.1 — strict 2-stage routing. No admin bypass."
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PATCH 4 — MyContributionsPage: resolve Stage-1 approver at submit time
   ═══════════════════════════════════════════════════════════════════════ */

function patchMyContributions() {
  const marker = "// [auto-fix] v7.1 route to Stage-1 approver";

  return patch("src/pages/MyContributionsPage.tsx", marker, (before) => {
    let out = before;

    // 1) Types import — add AppUser.
    out = out.replace(
      "import type { Contribution, TeamId, Committee } from '@/types';",
      "import type { Contribution, TeamId, Committee, AppUser } from '@/types';"
    );

    // 2) Imports — add findCommitteeHR + notifyUser.
    out = out.replace(
      "import { newContributionApprovals } from '@/lib/contributionApprovals';",
      "import { newContributionApprovals } from '@/lib/contributionApprovals';\n" +
        "import { findCommitteeHR } from '@/lib/contributionRouting';\n" +
        "import { notifyUser } from '@/lib/notifications';"
    );

    // 3) Add the users hook after the committees hook.
    out = out.replace(
      "const { data: liveCommittees } = useCollection<Committee>('committees');",
      "const { data: liveCommittees } = useCollection<Committee>('committees');\n" +
        "     const { data: users } = useCollection<AppUser>('users');"
    );

    // 4) Restrict the stage progress display to 2 stages.
    out = out.replace(/\[1, 2, 3\]\.map\(\(s\) =>/, "[1, 2].map((s) =>");

    // 5) Replace the contribution-creation block inside submit().
    const re =
      /const contrib: Contribution = \{[\s\S]*?currentStage: 1,\s*\};\s*await createOne\('contributions', contrib\);\s*try \{[\s\S]*?\} catch \{ \/\* ignore \*\/ \}/;

    if (!re.test(out)) {
      throw new Error("submit() contribution block not found");
    }

    const replacement =
      marker +
      "\n" +
      "         const stage1 = findCommitteeHR(users, userTeamId, committeeId || '');\n" +
      "         const stage1Uid = stage1 ? stage1.uid : null;\n" +
      "         const stage1Role = stage1 ? stage1.role : null;\n" +
      "         const blocked = !stage1Uid;\n" +
      "\n" +
      "         const contrib: Contribution = {\n" +
      "           id: newId('C'),\n" +
      "           memberId: user.memberId!,\n" +
      "           memberName: myMember?.name ?? user.displayName,\n" +
      "           teamId: userTeamId,\n" +
      "           committeeId: committeeId || undefined,\n" +
      "           category,\n" +
      "           title: title.trim(),\n" +
      "           description: desc.trim(),\n" +
      "           date: today(),\n" +
      "           hours,\n" +
      "           points: 0,\n" +
      "           status: blocked ? 'blocked_no_approver' : 'pending',\n" +
      "           seasonId: 'S7',\n" +
      "           createdBy: user.uid,\n" +
      "           currentStage: 1,\n" +
      "           approvals: newContributionApprovals(),\n" +
      "           pendingApproverId: stage1Uid,\n" +
      "           pendingApproverRole: stage1Role,\n" +
      "           blockedReason: blocked\n" +
      "             ? 'No HR of Committee found for team=' + userTeamId + ' committee=' + (committeeId || '')\n" +
      "             : null,\n" +
      "         } as Contribution;\n" +
      "\n" +
      "         await createOne('contributions', contrib);\n" +
      "         try {\n" +
      "           await logAudit(\n" +
      "             user,\n" +
      "             'CREATE_CONTRIBUTION',\n" +
      "             'Contribution',\n" +
      "             contrib.id,\n" +
      "             'Log contribution',\n" +
      "           );\n" +
      "         } catch { /* ignore */ }\n" +
      "\n" +
      "         if (stage1Uid) {\n" +
      "           try {\n" +
      "             await notifyUser(\n" +
      "               stage1Uid,\n" +
      "               'Contribution awaiting your approval',\n" +
      "               (myMember?.name ?? user.displayName) + ' submitted \"' + contrib.title + '\".',\n" +
      "               'approval',\n" +
      "               '/approvals',\n" +
      "               'high',\n" +
      "               myMember?.name ?? user.displayName,\n" +
      "             );\n" +
      "           } catch { /* ignore */ }\n" +
      "         } else {\n" +
      "           try {\n" +
      "             await logAudit(\n" +
      "               user,\n" +
      "               'CONTRIBUTION_BLOCKED_NO_APPROVER',\n" +
      "               'Contribution',\n" +
      "               contrib.id,\n" +
      "               'No HR of Committee for team=' + userTeamId + ' committee=' + (committeeId || ''),\n" +
      "             );\n" +
      "           } catch { /* ignore */ }\n" +
      "         }\n";

    return out.replace(re, replacement);
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   PATCH 5 — ApprovalsPage: surface contributions for HR users
   ═══════════════════════════════════════════════════════════════════════ */

const APPROVALS_PAGE_TS = `// [auto-fix] v7.1 — Approvals page also surfaces CONTRIBUTIONS awaiting
// the current user (Stage 1: committee HR; Stage 2: team HR).
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { useAuth } from '@/lib/useAuth';
import { canApproveStep, ROLE_LABEL } from '@/lib/permissions';
import {
  approveContributionStage,
  rejectContributionStage,
} from '@/lib/contributionApprovals';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { FormField, TextArea, NumberInput } from '@/components/ui/FormField';
import { toast } from '@/components/ui/Toast';
import type { ApprovalStep, RequestRecord, Contribution, AppUser } from '@/types';

function getStageOf(c: Contribution): 1 | 2 | 3 | 4 {
  const s = c.currentStage;
  if (s === 1 || s === 2) return s;
  if (s === 3 || s === 4) return 4;
  if (c.status === 'approved' || c.status === 'rejected') return 4;
  return 1;
}

function userCanReviewContribution(user: AppUser | null, c: Contribution): boolean {
  if (!user) return false;
  if (c.status !== 'pending' && c.status !== 'in_review') return false;

  const pendingId = c.pendingApproverId;
  if (pendingId && pendingId !== user.uid) return false;

  const stage = getStageOf(c);
  const teamId = c.teamId;
  const committeeId = c.committeeId || '';

  if (!teamId) return false;

  if (stage === 1) {
    return (
      user.role === 'COMMITTEE_HR' &&
      user.teamId === teamId &&
      Array.isArray(user.committeeIds) &&
      user.committeeIds.includes(committeeId)
    );
  }
  if (stage === 2) {
    return user.role === 'HR' && user.teamId === teamId;
  }
  return false;
}

export function ApprovalsPage() {
  const { user } = useAuth();
  const { data: approvals, loading: loadingA } = useCollection<ApprovalStep>('approvals');
  const { data: requests } = useCollection<RequestRecord>('requests');
  const { data: contributions, loading: loadingC } = useCollection<Contribution>('contributions');

  const [actionContrib, setActionContrib] = useState<Contribution | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [pointsInput, setPointsInput] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const myPendingRequests = approvals.filter(
    (a) => a.status === 'PENDING' && canApproveStep(user, a),
  );

  const myPendingContribs = contributions.filter((c) => userCanReviewContribution(user, c));

  const openAction = (c: Contribution, type: 'approve' | 'reject') => {
    setActionContrib(c);
    setActionType(type);
    setComment('');
    setPointsInput(c.points || 0);
  };

  const closeAction = () => {
    setActionContrib(null);
    setActionType(null);
    setComment('');
    setPointsInput(0);
  };

  const doApprove = async () => {
    if (!user || !actionContrib) return;
    const stage = getStageOf(actionContrib);
    setBusy(true);
    try {
      await approveContributionStage(
        actionContrib,
        user,
        stage === 1 ? pointsInput : undefined,
        comment,
      );
      toast.success('Approved');
      closeAction();
    } catch (e) {
      toast.error('Failed', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  const doReject = async () => {
    if (!user || !actionContrib) return;
    if (!comment.trim()) {
      toast.error('Reason required');
      return;
    }
    setBusy(true);
    try {
      await rejectContributionStage(actionContrib, user, comment);
      toast.success('Rejected');
      closeAction();
    } catch (e) {
      toast.error('Failed', e instanceof Error ? e.message : '');
    } finally {
      setBusy(false);
    }
  };

  const stageOf = actionContrib ? getStageOf(actionContrib) : 1;

  return (
    <div className="container">
      <PageHeader
        eyebrow="Workflow"
        title="Approvals"
        description="Items awaiting your decision."
      />

      <section className="section">
        <SectionHeader
          eyebrow="Contributions"
          title={'Contributions Awaiting You (' + myPendingContribs.length + ')'}
        />
        {loadingC ? (
          <SkeletonList count={3} />
        ) : myPendingContribs.length === 0 ? (
          <EmptyState
            icon="✅"
            title="All clear"
            message="No contributions waiting for you."
          />
        ) : (
          <div className="stack">
            {myPendingContribs.map((c) => {
              const team = teams.find((t) => t.id === c.teamId);
              const committee = c.committeeId
                ? committees.find((x) => x.id === c.committeeId)
                : null;
              const stage = getStageOf(c);
              const stageLabel =
                stage === 1 ? 'HR of Committee' : stage === 2 ? 'HR of Team' : '—';
              return (
                <div key={c.id} className="card no-click">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{c.title}</div>
                      <div className="card__meta">
                        {c.memberName || c.memberId} · {team?.name || c.teamId} ·{' '}
                        {committee?.nameAr || c.committeeId} · {formatDate(c.date)}
                      </div>
                    </div>
                    <Badge variant="warning">
                      Stage {stage} — {stageLabel}
                    </Badge>
                  </div>

                  {c.description ? (
                    <p className="small soft mt-2">{c.description}</p>
                  ) : null}

                  <div
                    className="row mt-3"
                    style={{ gap: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}
                  >
                    <div className="row" style={{ gap: 12 }}>
                      <span className="small muted">
                        {c.hours} <span className="muted">hours</span>
                      </span>
                      {stage === 2 ? (
                        <span className="points">
                          {c.points || 0} <span className="muted">points assigned</span>
                        </span>
                      ) : (
                        <span className="muted small">Points pending (assign at stage 1)</span>
                      )}
                    </div>
                    <div className="row" style={{ gap: 6 }}>
                      <button
                        type="button"
                        className="btn btn--success btn--sm"
                        onClick={() => openAction(c, 'approve')}
                      >
                        {stage === 1 ? 'Approve & Assign Points' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline-danger btn--sm"
                        onClick={() => openAction(c, 'reject')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="section">
        <SectionHeader
          eyebrow="Requests"
          title={'Requests Awaiting You (' + myPendingRequests.length + ')'}
        />
        {loadingA ? (
          <SkeletonList count={3} />
        ) : myPendingRequests.length === 0 ? (
          <EmptyState
            icon="✅"
            title="All clear"
            message="No requests waiting for you."
          />
        ) : (
          <div className="stack">
            {myPendingRequests.map((a) => {
              const req = requests.find((r) => r.id === a.requestId);
              return (
                <Link key={a.id} to={'/requests/' + a.requestId} className="card">
                  <div className="row row--between">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="card__title">{req?.title ?? a.requestId}</div>
                      <div className="card__meta">
                        {ROLE_LABEL[a.requiredRole]} · Stage {a.order}
                      </div>
                    </div>
                    <Badge variant="warning" dot>
                      Awaiting
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Modal
        open={actionType === 'approve' && actionContrib !== null}
        title={stageOf === 1 ? 'Approve & Assign Points' : 'Approve Contribution'}
        onClose={closeAction}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={closeAction}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--success"
              onClick={doApprove}
              disabled={busy}
            >
              {busy ? '...' : 'Approve'}
            </button>
          </>
        }
      >
        {stageOf === 1 ? (
          <>
            <p className="small muted mb-3">
              Assign points fairly — quality matters, not only hours.
            </p>
            <FormField label="Points" required>
              <NumberInput
                value={pointsInput}
                onChange={setPointsInput}
                min={0}
                max={1000}
              />
            </FormField>
          </>
        ) : (
          <p className="small muted mb-3">Confirm your approval.</p>
        )}
        <FormField label="Comment (optional)">
          <TextArea value={comment} onChange={setComment} rows={2} />
        </FormField>
      </Modal>

      <Modal
        open={actionType === 'reject' && actionContrib !== null}
        title="Reject Contribution"
        onClose={closeAction}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={closeAction}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={doReject}
              disabled={busy}
            >
              {busy ? '...' : 'Confirm Reject'}
            </button>
          </>
        }
      >
        <FormField label="Reason" required>
          <TextArea value={comment} onChange={setComment} rows={3} />
        </FormField>
      </Modal>
    </div>
  );
}
`;

function patchApprovalsPage() {
  return replaceWhole(
    "src/pages/ApprovalsPage.tsx",
    APPROVALS_PAGE_TS,
    "// [auto-fix] v7.1 — Approvals page also surfaces CONTRIBUTIONS"
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   PATCH 6 — strictRouting.ts — contribution guards
   ═══════════════════════════════════════════════════════════════════════ */

function patchStrictRouting() {
  const marker = "// [auto-fix] v7.1 strict contribution routing";

  return patch("src/lib/strictRouting.ts", marker, (before) => {
    let out = before;

    if (
      !/import type \{[^}]*\bContribution\b[^}]*\} from '@\/types'/.test(out)
    ) {
      out = out.replace(
        /import type \{([^}]*)\} from '@\/types';/,
        (match, inner) => {
          const names = inner
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (!names.includes("Contribution")) names.push("Contribution");
          return "import type { " + names.join(", ") + " } from '@/types';";
        }
      );
    }

    const addition =
      "\n\n" +
      marker +
      "\n" +
      "export function verifyContributionStageApprover(\n" +
      "  approver: AppUser | null,\n" +
      "  contribution: Contribution,\n" +
      "  stage: 1 | 2,\n" +
      "): RoutingResult {\n" +
      "  if (!approver) return { ok: false, reason: 'No approver.' };\n" +
      "  const teamId = contribution.teamId ?? null;\n" +
      "  if (!teamId) return { ok: false, reason: 'Contribution is missing team context.' };\n" +
      "\n" +
      "  if (stage === 1) {\n" +
      "    if (approver.role !== 'COMMITTEE_HR') {\n" +
      "      return { ok: false, reason: 'Stage 1 must be performed by the HR of the committee.' };\n" +
      "    }\n" +
      "    if (approver.teamId !== teamId) {\n" +
      '      return { ok: false, reason: "You must be inside the author\'s team." };\n' +
      "    }\n" +
      "    if (!contribution.committeeId) {\n" +
      "      return { ok: false, reason: 'Contribution is missing committee context.' };\n" +
      "    }\n" +
      "    if (!Array.isArray(approver.committeeIds) || !approver.committeeIds.includes(contribution.committeeId)) {\n" +
      "      return { ok: false, reason: 'You are not the HR of this committee.' };\n" +
      "    }\n" +
      "    return { ok: true };\n" +
      "  }\n" +
      "\n" +
      "  if (stage === 2) {\n" +
      "    if (approver.role !== 'HR') {\n" +
      "      return { ok: false, reason: 'Stage 2 must be performed by the HR of the team.' };\n" +
      "    }\n" +
      "    if (approver.teamId !== teamId) {\n" +
      '      return { ok: false, reason: "You must belong to the author\'s team." };\n' +
      "    }\n" +
      "    return { ok: true };\n" +
      "  }\n" +
      "\n" +
      "  return { ok: false, reason: 'Unknown stage.' };\n" +
      "}\n";

    return out + addition;
  });
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
  log("   fix.cjs — Manhal v7.1 REAL BUG FIX (contribution routing)");
  log("  ════════════════════════════════════════════════════════════════");
  log("   ROOT   : " + ROOT);
  log(
    "   GitHub : " +
      (GITHUB_REPO ? GITHUB_REPO + " (" + BRANCH + ")" : "(not configured)")
  );
  log("");

  try {
    printDiagnostic();
  } catch (e) {
    log("  (diagnostic failed: " + e.message + ")");
  }

  log("  [1] Types — extend Contribution");
  await runFix("patchTypes", patchTypes);

  log("");
  log("  [2] src/lib/contributionRouting.ts");
  await runFix("contributionRouting", patchContributionRouting);

  log("");
  log("  [3] contributionApprovals.ts — strict 2-stage rewrite");
  await runFix("contributionApprovals", patchContributionApprovals);

  log("");
  log("  [4] MyContributionsPage — route + notify Stage-1 approver");
  await runFix("MyContributionsPage", patchMyContributions);

  log("");
  log("  [5] ApprovalsPage — surface contribution approvals for HR");
  await runFix("ApprovalsPage", patchApprovalsPage);

  log("");
  log("  [6] strictRouting.ts — contribution guards");
  await runFix("strictRouting", patchStrictRouting);

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
  log("   NEXT STEPS (manual)");
  log("  ════════════════════════════════════════════════════════════════");
  log("   1. GitHub Actions will rebuild on the next push (5-7 min).");
  log("   2. Test the flow:");
  log("        a. Log in as a MEMBER → submit a contribution.");
  log("        b. Log in as the COMMITTEE HR → /approvals shows it live.");
  log("           Approve with points (Stage 1).");
  log("        c. Log in as the TEAM HR → /approvals shows it at Stage 2.");
  log("           Approve → points awarded, author notified.");
  log("   3. Ensure docs/FIRESTORE_RULES.md rules are published.");
  log("  ════════════════════════════════════════════════════════════════");
  log("");

  if (ko > 0) process.exitCode = 1;
}

main().catch((e) => {
  log("FATAL: " + (e && e.stack ? e.stack : e));
  process.exit(1);
});
