#!/usr/bin/env node
"use strict";

/* ============================================================================
 * fix.cjs — Automated remediation for the Manhal bundle
 * ----------------------------------------------------------------------------
 * Requirements:
 *   - Node 18+ (global fetch)
 *   - Env: GITHUB_TOKEN   (PAT with repo scope)
 *          GITHUB_REPO    ("owner/repo")
 *          GITHUB_BRANCH  (optional, default "main")
 * Usage:
 *   GITHUB_TOKEN=xxx GITHUB_REPO=user/repo node fix.cjs
 * ==========================================================================*/

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const BRANCH = process.env.GITHUB_BRANCH || "main";
const RESULTS = [];

/* ------------------------------- Utilities ------------------------------- */

function logStep(msg) {
  console.log("\n[fix] " + msg);
}
function logInfo(msg) {
  console.log("      " + msg);
}
function logWarn(msg) {
  console.warn("  ⚠️  " + msg);
}

async function runFix(name, fn) {
  logStep("▶ " + name);
  try {
    await fn();
    RESULTS.push({ name, ok: true });
    logInfo("✅ done");
  } catch (err) {
    const msg = err && err.stack ? err.stack : String(err);
    RESULTS.push({ name, ok: false, error: msg });
    logInfo("❌ failed: " + msg);
  }
}

function exists(p) {
  return fs.existsSync(p);
}
function readSafe(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}
function ensureDir(p) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}
function backup(p) {
  if (!exists(p)) return;
  const b = p + ".bak";
  try {
    fs.copyFileSync(p, b);
  } catch (e) {
    logWarn("backup failed for " + p + ": " + e.message);
  }
}
function write(p, content) {
  ensureDir(p);
  backup(p);
  fs.writeFileSync(p, content, "utf8");
  logInfo(
    "wrote " + path.relative(ROOT, p) + " (" + content.length + " bytes)"
  );
}

function patch(p, transform, label) {
  if (!exists(p)) {
    logWarn("skip patch " + label + " — missing " + p);
    return false;
  }
  const before = readSafe(p);
  if (before == null) {
    logWarn("cannot read " + p);
    return false;
  }
  const after = transform(before);
  if (after === before) {
    logWarn("no change for " + label);
    return false;
  }
  write(p, after);
  return true;
}

/* ---------------------- GitHub Contents API push ------------------------- */

async function pushToGitHub(relPath, content, message) {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) throw new Error("GITHUB_TOKEN / GITHUB_REPO not set");
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error('GITHUB_REPO must be "owner/repo"');

  const url =
    "https://api.github.com/repos/" +
    owner +
    "/" +
    name +
    "/contents/" +
    relPath;
  const headers = {
    Authorization: "Bearer " + token,
    "User-Agent": "manhal-fix-cjs",
    Accept: "application/vnd.github+json",
  };

  let sha = null;
  const getRes = await fetch(url + "?ref=" + encodeURIComponent(BRANCH), {
    headers,
  });
  if (getRes.status === 200) {
    const data = await getRes.json();
    sha = data && data.sha ? data.sha : null;
  } else if (getRes.status !== 404) {
    const txt = await getRes.text();
    throw new Error("GitHub GET " + getRes.status + ": " + txt);
  }

  const body = {
    message: message || "chore: automated fix — " + relPath,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;

  const putRes = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!putRes.ok) {
    const txt = await putRes.text();
    throw new Error("GitHub PUT " + putRes.status + ": " + txt);
  }
}

async function pushLocalFile(relPath, message) {
  const abs = path.join(ROOT, relPath);
  if (!exists(abs)) return;
  const content = readSafe(abs);
  if (content == null) return;
  await pushToGitHub(relPath.replace(/\\/g, "/"), content, message);
}

/* ============================================================================
 * PRE-PASS — Dedupe / merge / self-import-strip on the 19 bundled files
 * ==========================================================================*/

const BUNDLE_FILES = [
  "src/types.ts",
  "src/data/teams.ts",
  "src/lib/useAuth.ts",
  "src/lib/useRealtimeCollection.ts",
  "src/lib/rankings.ts",
  "src/lib/pwa.ts",
  "src/pages/LoginPage.tsx",
  "src/pages/DashboardPage.tsx",
  "src/pages/NotificationsPage.tsx",
  "src/pages/ApprovalsPage.tsx",
  "src/pages/NewRequestPage.tsx",
  "src/pages/admin/AdminMembersPage.tsx",
  "src/pages/admin/AdminGovernancePage.tsx",
  "src/pages/admin/AdminAnalyticsPage.tsx",
  "src/pages/admin/AdminNotificationsPage.tsx",
  "src/pages/admin/AdminRequestsPage.tsx",
  "src/components/layout/Sidebar.tsx",
  "src/components/layout/Navbar.tsx",
  "src/components/layout/BottomNav.tsx",
];

function moduleAliasFor(absFile) {
  const rel = path.relative(ROOT, absFile).replace(/\\/g, "/");
  if (!rel.startsWith("src/")) return null;
  return "@/" + rel.slice(4).replace(/\.(tsx?|jsx?)$/, "");
}

function mergeAndDedupeImports(src, absFile) {
  const selfModule = moduleAliasFor(absFile);

  const lines = src.split("\n");
  const importIndices = new Set();
  const entries = []; // { module, isType, default, star, names:Set, firstIndex }
  let firstIndex = Infinity;

  lines.forEach((line, i) => {
    const t = line.trim();
    // Match `import X from 'y';` possibly with `type` keyword, single-line only
    const m = t.match(
      /^import\s+(type\s+)?(.+?)\s+from\s+['"]([^'"]+)['"];?\s*$/
    );
    if (!t.startsWith("import ") || !m) return;
    const isType = !!m[1];
    const spec = m[2].trim();
    const mod = m[3];

    // strip self-import
    if (selfModule && mod === selfModule) {
      importIndices.add(i);
      return;
    }

    // Only rewrite side-effect-less single-line imports; skip `import 'x'`
    importIndices.add(i);
    if (i < firstIndex) firstIndex = i;

    // Skip "import 'x';" side-effect imports
    if (/^import\s+['"][^'"]+['"];?\s*$/.test(t)) {
      entries.push({
        module: mod,
        isType: false,
        default: null,
        star: null,
        names: new Set(),
        firstIndex: i,
        sideEffect: true,
      });
      return;
    }

    let entry = entries.find(
      (e) => e.module === mod && e.isType === isType && !e.sideEffect
    );
    if (!entry) {
      entry = {
        module: mod,
        isType,
        default: null,
        star: null,
        names: new Set(),
        firstIndex: i,
      };
      entries.push(entry);
    }

    // Parse specifier list
    const parts = [];
    let buf = "";
    let depth = 0;
    for (let c = 0; c < spec.length; c++) {
      const ch = spec[c];
      if (ch === "{") depth++;
      if (ch === "}") depth--;
      if (ch === "," && depth === 0) {
        parts.push(buf.trim());
        buf = "";
      } else buf += ch;
    }
    if (buf.trim()) parts.push(buf.trim());

    for (const raw of parts) {
      const p = raw.trim();
      if (!p) continue;
      if (/^\*\s+as\s+/.test(p)) {
        entry.star = p.replace(/^\*\s+as\s+/, "").trim();
      } else if (p.startsWith("{")) {
        const inner = p.replace(/^\{/, "").replace(/\}$/, "");
        inner
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((n) => entry.names.add(n));
      } else if (/^[A-Za-z_$][\w$]*$/.test(p)) {
        entry.default = p;
      } else {
        // Combined like "Foo, { Bar }" already split — ignore leftovers
      }
    }
  });

  if (importIndices.size === 0) return src;

  const block = entries
    .sort((a, b) => a.firstIndex - b.firstIndex)
    .map((e) => {
      if (e.sideEffect) return "import '" + e.module + "';";
      const parts = [];
      if (e.isType) parts.push("type");
      if (e.default) parts.push(e.default);
      if (e.star) parts.push("* as " + e.star);
      if (e.names.size)
        parts.push("{ " + Array.from(e.names).join(", ") + " }");
      const spec = parts.join(", ");
      return "import " + (spec ? spec + " " : "") + "from '" + e.module + "';";
    })
    .join("\n");

  const out = [];
  let inserted = false;
  for (let i = 0; i < lines.length; i++) {
    if (i === firstIndex) {
      out.push(block);
      inserted = true;
    }
    if (importIndices.has(i)) continue;
    out.push(lines[i]);
  }
  if (!inserted) out.unshift(block);
  return out.join("\n");
}

/* ============================================================================
 * FILE CONTENTS (new files written by fixes)
 * ==========================================================================*/

const FILE_TYPES_TS = `// src/types.ts
// Reconstructed type surface referenced across the codebase.

export type RoleId =
  | 'MEMBER'
  | 'VIEWER'
  | 'HR'
  | 'COMMITTEE_HR'
  | 'HEAD_HR_TEAM'
  | 'HEAD_HR_GLOBAL'
  | 'PRESIDENT'
  | 'VICE_PRESIDENT'
  | 'HEAD'
  | 'VICE';

export type TeamId =
  | 'helpers'
  | 'heroes'
  | 'coders'
  | 'enviros'
  | 'messages'
  | 'masar'
  | 'rstc'
  | 'mb';

export type UserStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive' | 'suspended';
export type MemberStatus = 'active' | 'inactive' | 'suspended';
export type RequestStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
export type RequestType =
  | 'TRANSFER'
  | 'PROMOTION'
  | 'RESIGNATION'
  | 'COMPLAINT'
  | 'SUGGESTION'
  | 'LEAVE';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ContributionStatus = 'pending' | 'approved' | 'rejected';

export interface Team {
  id: TeamId;
  name: string;
  nameAr: string;
  description: string;
  color: string;
}

export interface Committee {
  id: string;
  name: string;
  nameAr: string;
  teamId?: TeamId;
  headId?: string;
  hrId?: string;
  description?: string;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  realName?: string;
  fullName?: string;
  role: RoleId;
  status: UserStatus;
  teamId?: TeamId | null;
  committeeId?: string | null;
  memberId?: string | null;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Member {
  id: string;
  name: string;
  role: RoleId;
  teamIds: TeamId[];
  committeeIds: string[];
  joinedSeason: number;
  hours: number;
  points: number;
  status: MemberStatus;
  bio?: string;
  email?: string;
}

export interface Contribution {
  id: string;
  memberId: string;
  committeeId?: string | null;
  teamId?: TeamId | null;
  points: number;
  hours: number;
  status: ContributionStatus;
  date?: string;
  description?: string;
}

export interface ApprovalStep {
  id: string;
  requestId: string;
  order: number;
  requiredRole: RoleId;
  requiredTeamId: TeamId | null;
  status: ApprovalStatus;
  approverUid?: string | null;
  approverName?: string | null;
  comment?: string | null;
  decidedAt?: string | null;
}

export interface RequestRecord {
  id: string;
  type: RequestType;
  requesterUid: string;
  requesterMemberId: string;
  requesterName: string;
  subjectMemberId?: string;
  title: string;
  description: string;
  status: RequestStatus;
  currentStepOrder: number;
  priority: Priority;
  submittedAt: string;
  updatedAt: string;
  seasonId: string;
  fromTeamId?: TeamId;
  toTeamId?: TeamId;
  /** Parallel single-step approval: either team head OR team HR head is sufficient. */
  parallelApproval?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  route?: string;
  priority?: 'low' | 'normal' | 'high';
  source?: string;
  senderName?: string;
}

export interface GovernanceFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  uploadedAt: string;
}

export interface GovernanceDocument {
  id: string;
  title: string;
  category: string;
  description?: string;
  content: string;
  version: string;
  updatedAt: string;
  files?: GovernanceFile[];
}

export interface AuditEntry {
  id: string;
  actorUid: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  note?: string;
  date: string;
}

export interface PostRecord {
  id: string;
  authorUid: string;
  authorMemberId: string;
  authorTeamId: TeamId;
  authorCommitteeId: string;
  title: string;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  stage: 1 | 2 | 3;
  points: number;
  createdAt: string;
}

export interface PointsLedgerEntry {
  id: string;
  memberId: string;
  postId: string;
  approverUid: string;
  points: number;
  awardedAt: string;
}
`;

const FILE_LIB_USER_TS = `// src/lib/user.ts
// Central "who is this user" helper — NEVER returns the email as a display name.
import type { AppUser } from '@/types';

export function displayNameOf(user: AppUser | null | undefined): string {
  if (!user) return '';
  const raw = user as unknown as Record<string, unknown>;
  const candidates: unknown[] = [
    raw.realName,
    raw.fullName,
    raw.name,
    raw.displayName,
    raw.username,
  ];
  for (const c of candidates) {
    if (typeof c === 'string') {
      const v = c.trim();
      if (v && !v.includes('@')) return v;
    }
  }
  // Fall back to the local part of the email, prettified — never the full email.
  const email = typeof raw.email === 'string' ? raw.email : '';
  if (email && email.includes('@')) {
    const local = email.split('@')[0];
    return local.replace(/[._-]+/g, ' ').replace(/\\b\\w/g, (m) => m.toUpperCase());
  }
  return 'Member';
}
`;

const FILE_LIB_AUTH_EXTRAS_TS = `// src/lib/authExtras.ts
// Client-side password management wired to Firebase Auth.
//
// Expected backend contract (Firebase Auth):
//   - changePassword(currentPassword, newPassword)
//       -> reauthenticate with EmailAuthProvider.credential(user.email, current)
//       -> updatePassword(user, newPassword)
//   - requestPasswordReset(email)
//       -> sendPasswordResetEmail(auth, email)
//
// If you use a custom backend instead, replace the bodies with your API calls.
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  if (!currentPassword) throw new Error('Current password is required.');
  if (!newPassword || newPassword.length < 6) throw new Error('New password must be at least 6 characters.');
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('No signed-in user.');
  const cred = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!email || !email.includes('@')) throw new Error('A valid email is required.');
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email);
}

export function translatePasswordError(err: unknown): string {
  const msg = err && typeof err === 'object' && 'code' in err
    ? String((err as { code: unknown }).code)
    : err instanceof Error ? err.message : String(err);
  if (msg.includes('wrong-password') || msg.includes('invalid-credential')) return 'Current password is incorrect.';
  if (msg.includes('weak-password')) return 'New password is too weak.';
  if (msg.includes('user-not-found')) return 'No account found for that email.';
  if (msg.includes('too-many-requests')) return 'Too many attempts. Try again later.';
  if (msg.includes('network-request-failed')) return 'Network error. Try again.';
  return msg;
}
`;

const FILE_LIB_PUSH_TS = `// src/lib/push.ts
// Browser push notifications via the Notification API + service worker.
// This is the client side of push; a server (FCM / Web Push) must deliver
// remote pushes to the service worker. Here we expose local push helpers
// used by the in-app notification layer.

export type PushPermission = 'granted' | 'denied' | 'default' | 'unsupported';

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPushPermission(): PushPermission {
  if (!pushSupported()) return 'unsupported';
  return Notification.permission as PushPermission;
}

export async function requestPushPermission(): Promise<PushPermission> {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const res = await Notification.requestPermission();
    return res as PushPermission;
  } catch {
    return 'default';
  }
}

export interface PushPayload {
  title: string;
  body: string;
  route?: string;
  tag?: string;
  priority?: 'low' | 'normal' | 'high';
}

export async function sendBrowserNotification(payload: PushPayload): Promise<boolean> {
  if (!pushSupported()) return false;
  if (Notification.permission !== 'granted') return false;
  try {
    const opts: NotificationOptions = {
      body: payload.body,
      tag: payload.tag,
      data: { route: payload.route },
    };
    // Prefer service worker showNotification so clicks can be handled by SW.
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(payload.title, opts);
        return true;
      }
    }
    // Fallback to local Notification.
    const n = new Notification(payload.title, opts);
    if (payload.route) {
      n.onclick = () => {
        try { window.focus(); window.location.href = payload.route as string; } catch { /* ignore */ }
      };
    }
    return true;
  } catch {
    return false;
  }
}
`;

const FILE_LIB_NOTIFY_TS = `// src/lib/notify.ts
// Unified notification dispatcher: in-app (Firestore) + browser push.
//
// Expected backend: @/lib/notifications exports
//   - notifyUser(uid, title, message, source?, route?, priority?, senderName?)
//   - notifyUsers(users, title, message, source?, route?, priority?, senderName?)
//
// If not present, this module falls back to writing directly to the
// 'notifications' collection via @/lib/db.

import { notifyUser as rawNotifyUser, notifyUsers as rawNotifyUsers } from '@/lib/notifications';
import { sendBrowserNotification, requestPushPermission } from '@/lib/push';
import type { AppUser, Notification } from '@/types';

export interface DispatchOptions {
  source?: string;
  route?: string;
  priority?: 'low' | 'normal' | 'high';
  senderName?: string;
  push?: boolean;
}

async function dispatchPush(title: string, message: string, opts: DispatchOptions) {
  const shouldPush = opts.push !== false;
  if (!shouldPush) return;
  const perm = await requestPushPermission();
  if (perm !== 'granted') return;
  await sendBrowserNotification({
    title,
    body: message,
    route: opts.route,
    priority: opts.priority,
    tag: opts.source || 'manhal',
  });
}

export async function notifyOne(
  uid: string,
  title: string,
  message: string,
  opts: DispatchOptions = {},
): Promise<void> {
  await rawNotifyUser(uid, title, message, opts.source, opts.route, opts.priority, opts.senderName);
  await dispatchPush(title, message, opts);
}

export async function notifyMany(
  users: AppUser[],
  title: string,
  message: string,
  opts: DispatchOptions = {},
): Promise<void> {
  await rawNotifyUsers(users, title, message, opts.source, opts.route, opts.priority, opts.senderName);
  await dispatchPush(title, message, opts);
}

export function isMine(n: Notification, uid: string | null | undefined): boolean {
  return !!uid && n.userId === uid;
}
`;

const FILE_LIB_CSV_TS = `// src/lib/csv.ts
// Minimal, dependency-free CSV parser + serializer for the bulk member import.

export interface CsvRow { [key: string]: string; }

export function parseCsv(text: string): CsvRow[] {
  const rows = parseRawRows(text);
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  const out: CsvRow[] = [];
  for (let i = 1; i < rows.length; i++) {
    const raw = rows[i];
    if (raw.every((c) => c.trim() === '')) continue;
    const row: CsvRow = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = (raw[j] ?? '').trim();
    }
    out.push(row);
  }
  return out;
}

function parseRawRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let i = 0;
  let inQuotes = false;
  const s = text.replace(/\\r\\n/g, '\\n').replace(/\\r/g, '\\n');
  while (i < s.length) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { cell += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cell += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ',') { row.push(cell); cell = ''; i++; continue; }
    if (ch === '\\n') { row.push(cell); rows.push(row); row = []; cell = ''; i++; continue; }
    cell += ch; i++;
  }
  if (cell.length > 0 || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

export function toCsv(rows: Array<Record<string, unknown>>, columns?: string[]): string {
  if (rows.length === 0) return '';
  const cols = columns && columns.length ? columns : Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /[",\\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\\n');
}

export const SAMPLE_CSV_COLUMNS = [
  'fullName',
  'email',
  'password',
  'role',
  'teamIds',
  'committeeIds',
  'status',
  'hours',
  'points',
  'joinedSeason',
  'bio',
];

export function buildSampleCsv(teamIds: string[], committeeIds: string[]): string {
  const header = SAMPLE_CSV_COLUMNS.join(',');
  const example = [
    'Ahmed Mohamed',
    'ahmed@resala-stem.org',
    'ChangeMe#123',
    'MEMBER',
    teamIds.slice(0, 1).join('|') || 'helpers',
    committeeIds.slice(0, 1).join('|') || 'committee-1',
    'active',
    '0',
    '0',
    '7',
    'New volunteer',
  ].map((v) => (/[",\\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v)).join(',');
  return header + '\\n' + example + '\\n';
}
`;

const FILE_LIB_MIGRATIONS_TS = `// src/lib/migrations.ts
// One-shot data migrations. Safe to call on app boot (idempotent).
//
// Fix #8: purges legacy sequential-chain requests and their approval steps,
// and rewrites remaining PENDING requests to the new parallel model.

import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MIGRATION_KEY = 'manhal.migration.v8.requests.parallel';
const MIGRATION_FLAG = 'manhal.migration.v8.requests.parallel.done';

export async function purgeLegacyRequestsOnce(): Promise<{ deleted: number; rewritten: number } | null> {
  if (typeof window === 'undefined') return null;
  if (window.localStorage.getItem(MIGRATION_FLAG) === '1') return null;

  let deleted = 0;
  let rewritten = 0;
  try {
    const reqSnap = await getDocs(collection(db, 'requests'));
    const legacyIds: string[] = [];
    reqSnap.forEach((d) => {
      const data = d.data() as Record<string, unknown>;
      const isLegacy = data.parallelApproval !== true;
      if (isLegacy && data.status !== 'APPROVED' && data.status !== 'REJECTED') {
        legacyIds.push(d.id);
      }
    });

    for (const id of legacyIds) {
      // Best-effort: delete related approval steps first.
      try {
        const aprSnap = await getDocs(collection(db, 'approvals'));
        for (const a of aprSnap.docs) {
          const aData = a.data() as { requestId?: string };
          if (aData.requestId === id) {
            await deleteDoc(doc(db, 'approvals', a.id));
          }
        }
      } catch { /* ignore */ }
      await deleteDoc(doc(db, 'requests', id));
      deleted++;
    }

    // Mark remaining PENDING requests as parallel.
    for (const d of reqSnap.docs) {
      const data = d.data() as { status?: string; parallelApproval?: boolean };
      if (data.status === 'PENDING' && data.parallelApproval !== true) {
        try { await updateDoc(doc(db, 'requests', d.id), { parallelApproval: true }); rewritten++; } catch { /* ignore */ }
      }
    }

    window.localStorage.setItem(MIGRATION_FLAG, '1');
    // eslint-disable-next-line no-console
    console.info('[migration] ' + MIGRATION_KEY + ' done', { deleted, rewritten });
    return { deleted, rewritten };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[migration] failed:', err);
    return null;
  }
}
`;

const FILE_LIB_POSTS_APPROVAL_TS = `// src/lib/postsApproval.ts
// Fix #9 — Posts approval rebuilt as a 3-stage flow with strict verification.
//
// Contract (client side):
//   - A post can only be approved by a user who is:
//       * same TEAM as the author
//       * same COMMITTEE as the author
//       * HR (COMMITTEE_HR / HEAD_HR_TEAM) for stage 1
//   - Stage 1 must be the committee HR of the author's committee.
//   - Stage 2 and 3 are sequential with identical "same team + same committee"
//     verification, moving up the role ladder.
//   - A single approver cannot approve the same post twice (dedup via ledger).
//   - After stage 3 APPROVED: award points, write ledger, notify everyone.
//   - Approve: comment OPTIONAL. Reject: comment REQUIRED.
//
// The actual write endpoints are expected on the backend:
//   POST /posts/{postId}/approve   { stage, approverUid, comment? }
//   POST /posts/{postId}/reject    { stage, approverUid, comment }
//   POST /posts/{postId}/award     { memberId, points }

import type { AppUser, PostRecord, PointsLedgerEntry, RoleId, TeamId } from '@/types';

const COMMITTEE_HR_ROLES: RoleId[] = ['COMMITTEE_HR', 'HEAD_HR_TEAM'];

export interface VerificationResult { ok: boolean; reason?: string; }

export function isSameTeamAndCommittee(
  approver: AppUser | null | undefined,
  author: { teamId?: TeamId | null; committeeId?: string | null } | null | undefined,
): boolean {
  if (!approver || !author) return false;
  if (!approver.teamId || !approver.committeeId) return false;
  if (!author.teamId || !author.committeeId) return false;
  return approver.teamId === author.teamId && approver.committeeId === author.committeeId;
}

export function verifyStageApprover(
  stage: 1 | 2 | 3,
  approver: AppUser | null | undefined,
  author: { teamId?: TeamId | null; committeeId?: string | null } | null | undefined,
): VerificationResult {
  if (!approver) return { ok: false, reason: 'No approver.' };
  if (!isSameTeamAndCommittee(approver, author)) {
    return { ok: false, reason: 'Approver must be in the same team and same committee as the author.' };
  }
  if (stage === 1) {
    if (!COMMITTEE_HR_ROLES.includes(approver.role)) {
      return { ok: false, reason: 'Stage 1 must be performed by the committee HR.' };
    }
  }
  return { ok: true };
}

export function hasAlreadyApproved(
  ledger: PointsLedgerEntry[],
  approverUid: string,
  postId: string,
): boolean {
  return ledger.some((e) => e.postId === postId && e.approverUid === approverUid);
}

export interface ApproveInput {
  stage: 1 | 2 | 3;
  comment?: string;   // OPTIONAL on approve
}

export interface RejectInput {
  stage: 1 | 2 | 3;
  comment: string;    // REQUIRED on reject
}

export function validateApprove(_input: ApproveInput): void {
  // Comment is intentionally optional on approve.
}

export function validateReject(input: RejectInput): void {
  if (!input.comment || !input.comment.trim()) {
    throw new Error('A comment is required when rejecting a post.');
  }
}

export function nextStage(current: 1 | 2 | 3): 1 | 2 | 3 | 'DONE' {
  if (current === 1) return 2;
  if (current === 2) return 3;
  return 'DONE';
}

export function computeAwardedPoints(post: PostRecord): number {
  // Points are computed by the backend; this is a display-side fallback.
  if (typeof post.points === 'number' && post.points > 0) return post.points;
  return 0;
}
`;

const FILE_LIB_ANALYTICS_HELPERS_TS = `// src/lib/analytics.ts
// Helpers for the expanded Admin Analytics page (Fix #7).
import type { Contribution, Member, RequestRecord } from '@/types';

export interface Bucket { key: string; value: number; }

export function countByStatus<T extends { status?: string }>(rows: T[]): Bucket[] {
  const m = new Map<string, number>();
  rows.forEach((r) => {
    const k = r.status || 'unknown';
    m.set(k, (m.get(k) || 0) + 1);
  });
  return Array.from(m, ([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value);
}

export function activeInactive(members: Member[]): { active: number; inactive: number; suspended: number } {
  let active = 0, inactive = 0, suspended = 0;
  for (const m of members) {
    if (m.status === 'active') active++;
    else if (m.status === 'inactive') inactive++;
    else if (m.status === 'suspended') suspended++;
  }
  return { active, inactive, suspended };
}

export function approvalRates(requests: RequestRecord[]): {
  approved: number; rejected: number; pending: number; approvalRate: number; rejectionRate: number;
} {
  let approved = 0, rejected = 0, pending = 0;
  for (const r of requests) {
    if (r.status === 'APPROVED') approved++;
    else if (r.status === 'REJECTED') rejected++;
    else pending++;
  }
  const decided = approved + rejected;
  return {
    approved, rejected, pending,
    approvalRate: decided === 0 ? 0 : Math.round((approved / decided) * 100),
    rejectionRate: decided === 0 ? 0 : Math.round((rejected / decided) * 100),
  };
}

export function topContributors(members: Member[], contributions: Contribution[], limit = 10): Array<{ member: Member; points: number; hours: number }> {
  const byId = new Map<string, { points: number; hours: number }>();
  for (const c of contributions) {
    if (c.status !== 'approved') continue;
    const cur = byId.get(c.memberId) || { points: 0, hours: 0 };
    cur.points += Number(c.points) || 0;
    cur.hours += Number(c.hours) || 0;
    byId.set(c.memberId, cur);
  }
  return members
    .map((m) => ({ member: m, points: byId.get(m.id)?.points || 0, hours: byId.get(m.id)?.hours || 0 }))
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

export interface DayPoint { day: string; points: number; contributions: number; }

export function activityLast30Days(contributions: Contribution[]): DayPoint[] {
  const days: DayPoint[] = [];
  const today = new Date();
  const map = new Map<string, DayPoint>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const p: DayPoint = { day: key, points: 0, contributions: 0 };
    map.set(key, p);
    days.push(p);
  }
  for (const c of contributions) {
    if (c.status !== 'approved' || !c.date) continue;
    const key = String(c.date).slice(0, 10);
    const p = map.get(key);
    if (p) {
      p.points += Number(c.points) || 0;
      p.contributions += 1;
    }
  }
  return days;
}

export interface MonthPoint { month: string; points: number; contributions: number; }

export function monthlyTotals(contributions: Contribution[], monthsBack = 6): MonthPoint[] {
  const out: MonthPoint[] = [];
  const now = new Date();
  const map = new Map<string, MonthPoint>();
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const p: MonthPoint = { month: key, points: 0, contributions: 0 };
    map.set(key, p);
    out.push(p);
  }
  for (const c of contributions) {
    if (c.status !== 'approved' || !c.date) continue;
    const key = String(c.date).slice(0, 7);
    const p = map.get(key);
    if (p) {
      p.points += Number(c.points) || 0;
      p.contributions += 1;
    }
  }
  return out;
}
`;

/* ============================================================================
 * NEW: Settings section component (Fix #2)
 * ==========================================================================*/

const FILE_CHANGE_PASSWORD_TSX = `// src/components/settings/ChangePasswordCard.tsx
import { useState, type FormEvent } from 'react';
import { changePassword, translatePasswordError } from '@/lib/authExtras';
import { toast } from '@/components/ui/Toast';

export function ChangePasswordCard() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!current || !next || !confirm) { toast.error('All fields are required'); return; }
    if (next !== confirm) { toast.error('New password and confirmation do not match'); return; }
    if (next.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setBusy(true);
    try {
      await changePassword(current, next);
      toast.success('Password changed');
      setCurrent(''); setNext(''); setConfirm('');
    } catch (err) {
      toast.error(translatePasswordError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card no-click" onSubmit={onSubmit}>
      <div className="card__title">Change Password</div>
      <div className="card__meta">Update the password for your account.</div>
      <div className="mt-4">
        <label className="login-label">Current Password</label>
        <input className="input" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" dir="ltr" />
      </div>
      <div className="mt-3">
        <label className="login-label">New Password</label>
        <input className="input" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" dir="ltr" />
      </div>
      <div className="mt-3">
        <label className="login-label">Confirm New Password</label>
        <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" dir="ltr" />
      </div>
      <button type="submit" className="btn btn--primary btn--block mt-5" disabled={busy}>
        {busy ? '...' : 'Change Password'}
      </button>
    </form>
  );
}
`;

/* ============================================================================
 * FIX PIPELINE
 * ==========================================================================*/

async function main() {
  console.log("============================================================");
  console.log(" Manhal automated fixer — " + new Date().toISOString());
  console.log(" Repo: " + (process.env.GITHUB_REPO || "(unset)"));
  console.log("============================================================");

  /* -------- PRE-PASS: dedupe imports on all bundled files -------- */
  await runFix("Pre-pass — dedupe / merge / strip self-imports", async () => {
    for (const rel of BUNDLE_FILES) {
      const abs = path.join(ROOT, rel);
      if (!exists(abs)) {
        logWarn("missing, skipping: " + rel);
        continue;
      }
      const before = readSafe(abs);
      if (before == null) continue;
      const after = mergeAndDedupeImports(before, abs);
      if (after !== before) write(abs, after);
      else logInfo("clean: " + rel);
    }
  });

  /* -------- FIX 1: Display real name -------- */
  await runFix("Fix #1 — Display real name instead of email", async () => {
    write(path.join(ROOT, "src/lib/user.ts"), FILE_LIB_USER_TS);

    // Sidebar.tsx
    patch(
      path.join(ROOT, "src/components/layout/Sidebar.tsx"),
      (src) => {
        let out = src;
        if (!out.includes("from '@/lib/user'")) {
          out = out.replace(
            /(import\s+\{[^}]*\}\s+from\s+'@\/lib\/useAuth';)/,
            "$1\nimport { displayNameOf } from '@/lib/user';"
          );
          if (!out.includes("from '@/lib/user'")) {
            out = "import { displayNameOf } from '@/lib/user';\n" + out;
          }
        }
        out = out.replace(/\{user\.displayName\}/g, "{displayNameOf(user)}");
        return out;
      },
      "Sidebar name"
    );

    // DashboardPage.tsx
    patch(
      path.join(ROOT, "src/pages/DashboardPage.tsx"),
      (src) => {
        let out = src;
        if (!out.includes("from '@/lib/user'")) {
          out = "import { displayNameOf } from '@/lib/user';\n" + out;
        }
        out = out.replace(
          /<h1>\{user\.displayName\}<\/h1>/g,
          "<h1>{displayNameOf(user)}</h1>"
        );
        out = out.replace(/\{user\.displayName\}/g, "{displayNameOf(user)}");
        out = out.replace(
          /\{myMember\.name\}/g,
          "{displayNameOf(user) || myMember.name}"
        );
        return out;
      },
      "Dashboard name"
    );

    // Navbar.tsx (in case it ever renders the name)
    patch(
      path.join(ROOT, "src/components/layout/Navbar.tsx"),
      (src) => {
        if (!src.includes("user.displayName")) return src;
        let out = src;
        if (!out.includes("from '@/lib/user'"))
          out = "import { displayNameOf } from '@/lib/user';\n" + out;
        out = out.replace(/\{user\.displayName\}/g, "{displayNameOf(user)}");
        return out;
      },
      "Navbar name"
    );
  });

  /* -------- FIX 2: Settings section + Reset Password link -------- */
  await runFix("Fix #2 — Settings section + Reset Password link", async () => {
    write(path.join(ROOT, "src/lib/authExtras.ts"), FILE_LIB_AUTH_EXTRAS_TS);
    write(
      path.join(ROOT, "src/components/settings/ChangePasswordCard.tsx"),
      FILE_CHANGE_PASSWORD_TSX
    );

    // DashboardPage: inject the Settings section before the Account section.
    patch(
      path.join(ROOT, "src/pages/DashboardPage.tsx"),
      (src) => {
        if (src.includes("ChangePasswordCard")) return src;
        let out = src;
        out = out.replace(
          /(import\s+\{[^}]*\}\s+from\s+'@\/components\/ui\/Stat';)/,
          "$1\nimport { ChangePasswordCard } from '@/components/settings/ChangePasswordCard';"
        );
        if (!out.includes("ChangePasswordCard")) {
          out =
            "import { ChangePasswordCard } from '@/components/settings/ChangePasswordCard';\n" +
            out;
        }
        const settingsBlock = [
          '        <section className="section">',
          '          <SectionHeader eyebrow="Settings" title="Account Settings" />',
          '          <div className="grid grid--2">',
          "            <ChangePasswordCard />",
          "          </div>",
          "        </section>",
        ].join("\n");
        // Insert right before the closing </> of the returned fragment.
        out = out.replace(
          /(\n\s*<\/>\s*\n\s*\);\s*\n\})/,
          "\n" + settingsBlock + "$1"
        );
        return out;
      },
      "Dashboard settings section"
    );

    // LoginPage: add Reset Password link + inline reset flow.
    patch(
      path.join(ROOT, "src/pages/LoginPage.tsx"),
      (src) => {
        let out = src;
        if (!out.includes("requestPasswordReset")) {
          if (!out.includes("from '@/lib/authExtras'")) {
            out =
              "import { requestPasswordReset, translatePasswordError } from '@/lib/authExtras';\n" +
              out;
          }
          out = out.replace(
            /const \[busy, setBusy\] = useState\(false\);/,
            "const [busy, setBusy] = useState(false);\n     const [resetMode, setResetMode] = useState(false);\n     const [resetEmail, setResetEmail] = useState('');\n     const [resetBusy, setResetBusy] = useState(false);\n     const [resetMsg, setResetMsg] = useState('');"
          );
          // Add the "Reset Password" link under the sign-in button.
          out = out.replace(
            /(<\/button>\s*<\/form>)/,
            [
              "$1",
              '           <p className="login-back" style={{ marginTop: 10 }}>',
              '             <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setResetMode((v) => !v); setResetMsg(\'\'); }}>',
              "               {resetMode ? 'Back to Login' : 'Reset Password'}",
              "             </button>",
              "           </p>",
              "           {resetMode ? (",
              "             <form onSubmit={async (e) => {",
              "               e.preventDefault();",
              "               setResetBusy(true); setResetMsg('');",
              "               try { await requestPasswordReset(resetEmail.trim()); setResetMsg('Reset link sent. Check your inbox.'); }",
              "               catch (err) { setResetMsg(translatePasswordError(err)); }",
              "               finally { setResetBusy(false); }",
              "             }}>",
              '               <div className="login-field">',
              '                 <label className="login-label">Email</label>',
              '                 <input className="login-input" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} required dir="ltr" placeholder="name@resala-stem.org" />',
              "               </div>",
              '               {resetMsg ? <div className="login-error">{resetMsg}</div> : null}',
              '               <button type="submit" className="login-submit" disabled={resetBusy || !resetEmail}>',
              "                 {resetBusy ? '...' : 'Send Reset Link'}",
              "               </button>",
              "             </form>",
              "           ) : null}",
            ].join("\n")
          );
        }
        return out;
      },
      "LoginPage reset password"
    );
  });

  /* -------- FIX 3: CSV bulk import in AdminMembersPage -------- */
  await runFix("Fix #3 — Admin Members CSV bulk import", async () => {
    write(path.join(ROOT, "src/lib/csv.ts"), FILE_LIB_CSV_TS);

    patch(
      path.join(ROOT, "src/pages/admin/AdminMembersPage.tsx"),
      (src) => {
        let out = src;
        if (out.includes("Upload CSV")) return src;

        // Add imports.
        const extraImports = [
          "import { useRef } from 'react';",
          "import { parseCsv, buildSampleCsv, SAMPLE_CSV_COLUMNS } from '@/lib/csv';",
          "import { createUserAccount } from '@/lib/auth';",
        ].join("\n");
        out = extraImports + "\n" + out;

        // Register state + handlers right after the existing search state.
        out = out.replace(
          /(const \[search, setSearch\] = useState\(''\);)/,
          [
            "$1",
            "     const csvInputRef = useRef<HTMLInputElement | null>(null);",
            "     const [csvReport, setCsvReport] = useState<Array<{ row: number; ok: boolean; message: string }>>([]);",
            "",
            "     const downloadSample = () => {",
            "       const csv = buildSampleCsv(teams.map((t) => t.id), liveCommittees.map((c) => c.id));",
            "       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });",
            "       const url = URL.createObjectURL(blob);",
            "       const a = document.createElement('a');",
            "       a.href = url;",
            "       a.download = 'members-sample.csv';",
            "       document.body.appendChild(a);",
            "       a.click();",
            "       document.body.removeChild(a);",
            "       URL.revokeObjectURL(url);",
            "     };",
            "",
            "     const handleCsvUpload = async (file: File) => {",
            "       const text = await file.text();",
            "       const rows = parseCsv(text);",
            "       const report: Array<{ row: number; ok: boolean; message: string }> = [];",
            "       for (let i = 0; i < rows.length; i += 1) {",
            "         const r = rows[i];",
            "         const rowNum = i + 2;",
            "         try {",
            "           const fullName = (r.fullName || r.name || '').trim();",
            "           const email = (r.email || '').trim().toLowerCase();",
            "           const password = (r.password || '').trim() || (Math.random().toString(36).slice(2) + 'Aa1!');",
            "           const role = (r.role || 'MEMBER').trim() as RoleId;",
            "           const teamIds = (r.teamIds || '').split('|').map((s) => s.trim()).filter(Boolean) as TeamId[];",
            "           const committeeIds = (r.committeeIds || '').split('|').map((s) => s.trim()).filter(Boolean);",
            "           const status = ((r.status || 'active').trim() as Member['status']);",
            "           const hours = Number(r.hours || 0);",
            "           const points = Number(r.points || 0);",
            "           const joinedSeason = Number(r.joinedSeason || 7);",
            "           const bio = (r.bio || '').trim();",
            "           if (!fullName) throw new Error('fullName is required');",
            "           if (!email || !email.includes('@')) throw new Error('email is required');",
            "           if (teamIds.length === 0) throw new Error('at least one teamId is required');",
            "           if (committeeIds.length === 0) throw new Error('at least one committeeId is required');",
            "           const memberId = 'M-' + Date.now().toString(36).toUpperCase() + '-' + rowNum;",
            "           const { uid } = await createUserAccount({ email, password, displayName: fullName, role, teamId: teamIds[0], memberId, status: 'approved' });",
            "           await createOne('members', { id: memberId, name: fullName, role, teamIds, committeeIds, joinedSeason, hours, points, status, bio, email });",
            "           report.push({ row: rowNum, ok: true, message: fullName + ' <' + email + '> (' + uid + ')' });",
            "         } catch (err) {",
            "           report.push({ row: rowNum, ok: false, message: err instanceof Error ? err.message : String(err) });",
            "         }",
            "       }",
            "       setCsvReport(report);",
            "       const ok = report.filter((x) => x.ok).length;",
            "       const ko = report.length - ok;",
            "       toast.success('Import done: ' + ok + ' ok, ' + ko + ' failed');",
            "     };",
          ].join("\n")
        );

        // Add the toolbar buttons next to the existing search input.
        out = out.replace(
          /(<div className="toolbar">[\s\S]*?<\/div>)/,
          [
            "$1",
            "         <div className=\"toolbar\" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>",
            '           <input ref={csvInputRef} type="file" accept=".csv,text/csv" style={{ display: \'none\' }} onChange={(e) => {',
            "             const f = e.target.files && e.target.files[0];",
            "             if (f) handleCsvUpload(f);",
            "             e.target.value = '';",
            "           }} />",
            '           <button type="button" className="btn btn--primary btn--sm" onClick={() => csvInputRef.current && csvInputRef.current.click()}>Upload CSV</button>',
            '           <button type="button" className="btn btn--ghost btn--sm" onClick={downloadSample}>Download Sample CSV</button>',
            "         </div>",
          ].join("\n")
        );

        // Render the report after the table.
        out = out.replace(
          /(\{loading \? <SkeletonList count=\{6\} \/>[\s\S]*?<\/table><\/div>\s*\)\})/,
          [
            "$1",
            "         {csvReport.length > 0 ? (",
            '           <div className="card no-click mt-4">',
            '             <div className="card__title">CSV Import Report</div>',
            '             <ul className="small" style={{ marginTop: 8 }}>',
            "               {csvReport.map((r) => (",
            "                 <li key={r.row} style={{ color: r.ok ? '#16A34A' : '#C1272D' }}>",
            "                   Row {r.row}: {r.ok ? '✅' : '❌'} {r.message}",
            "                 </li>",
            "               ))}",
            "             </ul>",
            "             <div className=\"tiny muted mt-2\">Accepted columns: {SAMPLE_CSV_COLUMNS.join(', ')}</div>",
            "           </div>",
            "         ) : null}",
          ].join("\n")
        );

        return out;
      },
      "AdminMembers CSV import"
    );
  });

  /* -------- FIX 4: Add 8th team "MB" -------- */
  await runFix("Fix #4 — Add MB team", async () => {
    patch(
      path.join(ROOT, "src/data/teams.ts"),
      (src) => {
        if (src.includes("id: 'mb'")) return src;
        return src.replace(
          /(\{\s*id:\s*'rstc',[\s\S]*?\},)/,
          "$1\n   { id: 'mb', name: 'MB', nameAr: 'MB', description: 'Sub-Branches — Head and Vice Head of Sub-Branches, plus Head of HR (Global).', color: '#0EA5E9' },"
        );
      },
      "teams MB"
    );

    // Also update types.ts (created in a later fix, so make sure the union is right).
    if (exists(path.join(ROOT, "src/types.ts"))) {
      patch(
        path.join(ROOT, "src/types.ts"),
        (src) => {
          if (src.includes("| 'mb'")) return src;
          return src.replace(/(\|\s*'rstc')/, "$1\n  | 'mb'");
        },
        "types MB"
      );
    }
  });

  /* -------- FIX 5: Remove "Block Seed Data" -------- */
  await runFix('Fix #5 — Remove "Block Seed Data"', async () => {
    const candidates = [
      "src/pages/admin/AdminDashboardPage.tsx",
      "src/pages/admin/AdminMembersPage.tsx",
      "src/pages/AdminDashboardPage.tsx",
    ];
    let touched = false;
    for (const rel of candidates) {
      const abs = path.join(ROOT, rel);
      if (!exists(abs)) continue;
      const changed = patch(
        abs,
        (src) => {
          let out = src;
          // Remove any line containing "Block Seed Data" or "blockSeed".
          out = out
            .split("\n")
            .filter((l) => {
              const t = l.toLowerCase();
              if (t.includes("block seed data")) return false;
              if (t.includes("blockseeddata")) return false;
              if (t.includes("block-seed-data")) return false;
              if (t.includes("blockseed")) return false;
              return true;
            })
            .join("\n");
          // Remove route entries referencing the seed page.
          out = out.replace(/\s*<Route[^>]*seed[^>]*\/>/gi, "");
          return out;
        },
        "block seed data @ " + rel
      );
      if (changed) touched = true;
    }
    if (!touched)
      logWarn(
        'No "Block Seed Data" references found in expected files — nothing to remove.'
      );
  });

  /* -------- FIX 6: Governance real file upload -------- */
  await runFix("Fix #6 — Governance real file upload + download", async () => {
    patch(
      path.join(ROOT, "src/pages/admin/AdminGovernancePage.tsx"),
      (src) => {
        if (src.includes("handleFileUpload")) return src;

        // Imports.
        out_outer: {
          var out = src;
          if (!out.includes("GovernanceFile")) {
            out = out.replace(
              /import type \{ GovernanceDocument \} from '@\/types';/,
              "import type { GovernanceDocument, GovernanceFile } from '@/types';"
            );
          }
          out = "import { useRef } from 'react';\n" + out;

          // Extend EMPTY with files.
          out = out.replace(
            /const EMPTY: Omit<GovernanceDocument, 'id'> = \{[^}]*\};/,
            "const EMPTY: Omit<GovernanceDocument, 'id'> = { title: '', category: 'Policies', description: '', content: '', version: '1.0', updatedAt: new Date().toISOString().slice(0, 10), files: [] };"
          );

          // Add refs + file handler after existing state declarations.
          out = out.replace(
            /(const \[busy, setBusy\] = useState\(false\);)/,
            [
              "$1",
              "     const fileInputRef = useRef<HTMLInputElement | null>(null);",
              "",
              "     const readFileAsDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {",
              "       const fr = new FileReader();",
              "       fr.onerror = () => reject(fr.error || new Error('Read failed'));",
              "       fr.onload = () => resolve(String(fr.result || ''));",
              "       fr.readAsDataURL(file);",
              "     });",
              "",
              "     const handleFileUpload = async (files: FileList | null) => {",
              "       if (!files || files.length === 0) return;",
              "       const incoming: GovernanceFile[] = [];",
              "       for (const f of Array.from(files)) {",
              "         const dataUrl = await readFileAsDataUrl(f);",
              "         incoming.push({ name: f.name, size: f.size, type: f.type || 'application/octet-stream', dataUrl, uploadedAt: new Date().toISOString() });",
              "       }",
              "       setForm((prev) => ({ ...prev, files: [...(prev.files || []), ...incoming] }));",
              "       toast.success('Attached ' + incoming.length + ' file(s)');",
              "     };",
              "",
              "     const removeFileAt = (idx: number) => {",
              "       setForm((prev) => ({ ...prev, files: (prev.files || []).filter((_, i) => i !== idx) }));",
              "     };",
              "",
              "     const downloadFile = (f: GovernanceFile) => {",
              "       const a = document.createElement('a');",
              "       a.href = f.dataUrl;",
              "       a.download = f.name;",
              "       document.body.appendChild(a);",
              "       a.click();",
              "       document.body.removeChild(a);",
              "     };",
            ].join("\n")
          );

          // Persist files in openEdit and payload.
          out = out.replace(
            /setForm\(\{ title: d\.title, category: d\.category, description: d\.description \|\| '', content: d\.content, version: d\.version \|\| '1\.0', updatedAt: d\.updatedAt \}\);/,
            "setForm({ title: d.title, category: d.category, description: d.description || '', content: d.content, version: d.version || '1.0', updatedAt: d.updatedAt, files: d.files || [] });"
          );

          // UI: add upload block + list of files inside the modal.
          out = out.replace(
            /(<FormField label="Version" required>[\s\S]*?<\/FormField>)/,
            [
              "$1",
              '           <FormField label="Attachments">',
              "             <input ref={fileInputRef} type=\"file\" multiple style={{ display: 'none' }} onChange={(e) => { handleFileUpload(e.target.files); e.target.value = ''; }} />",
              '             <button type="button" className="btn btn--ghost btn--sm" onClick={() => fileInputRef.current && fileInputRef.current.click()}>Upload Files</button>',
              '             <ul className="small mt-2">',
              "               {(form.files || []).map((f, i) => (",
              "                 <li key={f.name + i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>",
              '                   <span>{f.name} <span className="muted tiny">({Math.round(f.size / 1024)} KB)</span></span>',
              '                   <button type="button" className="btn btn--ghost btn--xs" onClick={() => downloadFile(f)}>Download</button>',
              '                   <button type="button" className="btn btn--danger btn--xs" onClick={() => removeFileAt(i)}>Remove</button>',
              "                 </li>",
              "               ))}",
              "             </ul>",
              "           </FormField>",
            ].join("\n")
          );

          // UI: show download buttons in the list card.
          out = out.replace(
            /(\{d\.description \? <p className="small soft mt-2">\{d\.description\}<\/p> : null\})/,
            [
              "$1",
              "               {(d.files && d.files.length > 0) ? (",
              '                 <ul className="small mt-3">',
              "                   {d.files.map((f, i) => (",
              "                     <li key={f.name + i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>",
              "                       <span>{f.name}</span>",
              '                       <button type="button" className="btn btn--ghost btn--xs" onClick={() => downloadFile(f)}>Download</button>',
              "                     </li>",
              "                   ))}",
              "                 </ul>",
              "               ) : null}",
            ].join("\n")
          );
        }
        return out;
      },
      "Governance upload"
    );
  });

  /* -------- FIX 7: Analytics expansion -------- */
  await runFix("Fix #7 — Admin Analytics expansion + charts", async () => {
    write(
      path.join(ROOT, "src/lib/analytics.ts"),
      FILE_LIB_ANALYTICS_HELPERS_TS
    );
    write(
      path.join(ROOT, "src/pages/admin/AdminAnalyticsPage.tsx"),
      buildAnalyticsPage()
    );
  });

  /* -------- FIX 8: Requests — remove sequential chain -------- */
  await runFix(
    "Fix #8 — Requests: parallel Team Head + Team HR Head",
    async () => {
      write(path.join(ROOT, "src/lib/migrations.ts"), FILE_LIB_MIGRATIONS_TS);

      patch(
        path.join(ROOT, "src/pages/NewRequestPage.tsx"),
        (src) => {
          let out = src;
          // Replace buildChain body.
          out = out.replace(
            /function buildChain\(request: RequestRecord\): Array<\{ role: string; teamId: TeamId \| null \}> \{[\s\S]*?\n   \}/,
            [
              "function buildChain(request: RequestRecord): Array<{ role: string; teamId: TeamId | null }> {",
              "     // Parallel approval: either the Team Head or the Team HR Head is enough.",
              "     // No sequence, no global chain.",
              "     const t = request.fromTeamId ?? request.toTeamId ?? null;",
              "     if (!t) return [{ role: 'HEAD', teamId: null }];",
              "     return [",
              "       { role: 'HEAD', teamId: t },",
              "       { role: 'HEAD_HR_TEAM', teamId: t },",
              "     ];",
              "   }",
            ].join("\n")
          );

          // Mark new requests as parallel.
          out = out.replace(
            /seasonId: 'S7',/,
            "seasonId: 'S7',\n           parallelApproval: true,"
          );

          // Kick off the one-shot migration when the page mounts.
          if (!out.includes("purgeLegacyRequestsOnce")) {
            out =
              "import { purgeLegacyRequestsOnce } from '@/lib/migrations';\n" +
              out;
            out = out.replace(
              /(const \{ user \} = useAuth\(\);)/,
              "$1\n     useEffect(() => { purgeLegacyRequestsOnce().catch(() => {}); }, []);"
            );
            if (
              !/\buseEffect\b/.test(out.split("\n").slice(0, 20).join("\n"))
            ) {
              out = out.replace(
                /import \{ useState, type FormEvent \} from 'react';/,
                "import { useEffect, useState, type FormEvent } from 'react';"
              );
            }
          }
          return out;
        },
        "NewRequest parallel chain"
      );
    }
  );

  /* -------- FIX 9: Posts approvals helper -------- */
  await runFix(
    "Fix #9 — Posts approvals (3 stages, strict verification)",
    async () => {
      write(
        path.join(ROOT, "src/lib/postsApproval.ts"),
        FILE_LIB_POSTS_APPROVAL_TS
      );

      // Remove any "Chats" / "Conversations" entries from admin navigation.
      const navCandidates = [
        "src/pages/admin/AdminDashboardPage.tsx",
        "src/components/layout/Sidebar.tsx",
      ];
      for (const rel of navCandidates) {
        const abs = path.join(ROOT, rel);
        if (!exists(abs)) continue;
        patch(
          abs,
          (src) => {
            const lines = src.split("\n");
            const filtered = lines.filter((l) => {
              const t = l.toLowerCase();
              if (t.includes("conversation")) return false;
              if (t.includes("chats")) return false;
              if (t.includes("messages") && t.includes("to:")) return false; // nav entries only
              return true;
            });
            return filtered.join("\n");
          },
          "remove chats @ " + rel
        );
      }
    }
  );

  /* -------- FIX 10: Notifications rebuild -------- */
  await runFix("Fix #10 — Notifications rebuild (targets + push)", async () => {
    write(path.join(ROOT, "src/lib/push.ts"), FILE_LIB_PUSH_TS);
    write(path.join(ROOT, "src/lib/notify.ts"), FILE_LIB_NOTIFY_TS);

    patch(
      path.join(ROOT, "src/lib/pwa.ts"),
      (src) => {
        if (src.includes("manhal:push-ready")) return src;
        return src.replace(
          /(\n\s*navigator\.serviceWorker\.register\('\.\/sw\.js'\)\.catch\(\(\) => \{\}\);)/,
          [
            "$1",
            "        navigator.serviceWorker.addEventListener('message', (event) => {",
            "          const data = (event && event.data) || {};",
            "          if (data && data.type === 'notification-click' && data.route) {",
            "            try { window.location.href = data.route; } catch { /* ignore */ }",
            "          }",
            "        });",
            "        window.dispatchEvent(new CustomEvent('manhal:push-ready'));",
          ].join("\n")
        );
      },
      "pwa push hook"
    );

    patch(
      path.join(ROOT, "src/pages/admin/AdminNotificationsPage.tsx"),
      (src) => {
        let out = src;
        if (
          out.includes("Target a team") ||
          out.includes("teams and committees")
        )
          return src;

        // Add imports for teams/committees collections + notify helpers.
        if (!out.includes("@/lib/notify")) {
          out = "import { notifyOne, notifyMany } from '@/lib/notify';\n" + out;
        }
        if (!out.includes("from '@/data/teams'")) {
          out = "import { teams } from '@/data/teams';\n" + out;
        }
        if (!out.includes("useCollection<Committee>")) {
          out = "import type { Committee } from '@/types';\n" + out;
        }

        // Change target state to allow team:/committee: prefixed values.
        out = out.replace(
          /const \[target, setTarget\] = useState<string>\('all'\);/,
          "const [target, setTarget] = useState<string>('all');\n     const { data: committees } = useCollection<Committee>('committees');"
        );

        // Extend the recipient Select.
        out = out.replace(
          /(<Select value=\{target\} onChange=\{setTarget\} options=\{\[[\s\S]*?\]\} \/>)/,
          [
            "<Select value={target} onChange={setTarget} options={[",
            "               { value: 'all', label: 'Everyone (' + users.length + ')' },",
            "               { value: 'managers', label: 'Managers only' },",
            "               { value: '__sep_teams', label: '— Teams —' },",
            "               ...teams.map((t) => ({ value: 'team:' + t.id, label: 'Team: ' + t.name })),",
            "               { value: '__sep_committees', label: '— Committees —' },",
            "               ...committees.map((c) => ({ value: 'committee:' + c.id, label: 'Committee: ' + (c.nameAr || c.name) })),",
            "               { value: '__sep_users', label: '— Users —' },",
            "               ...users.map((u) => ({ value: u.uid, label: u.displayName + ' (' + u.email + ')' })),",
            "             ]} />",
          ].join("\n")
        );

        // Replace the send handler.
        out = out.replace(
          /const send = async \(\) => \{[\s\S]*?\n     \};/,
          [
            "const send = async () => {",
            "       if (!title.trim() || !message.trim()) { toast.error('Title & message required'); return; }",
            "       if (target.startsWith('__sep_')) { toast.error('Choose a valid recipient.'); return; }",
            "       setBusy(true);",
            "       try {",
            "         const opts = { source: 'system', priority, senderName: me?.displayName, push: true };",
            "         if (target === 'all') {",
            "           await notifyMany(users, title.trim(), message.trim(), opts);",
            "         } else if (target === 'managers') {",
            "           const managers = users.filter((u) => ['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HEAD_HR_TEAM', 'HR', 'COMMITTEE_HR'].includes(u.role));",
            "           await notifyMany(managers, title.trim(), message.trim(), opts);",
            "         } else if (target.startsWith('team:')) {",
            "           const teamId = target.slice('team:'.length);",
            "           const recipients = users.filter((u) => u.teamId === teamId);",
            "           if (recipients.length === 0) { toast.error('No users in that team.'); setBusy(false); return; }",
            "           await notifyMany(recipients, title.trim(), message.trim(), opts);",
            "         } else if (target.startsWith('committee:')) {",
            "           const committeeId = target.slice('committee:'.length);",
            "           const recipients = users.filter((u) => (u as unknown as { committeeId?: string }).committeeId === committeeId);",
            "           if (recipients.length === 0) { toast.error('No users in that committee.'); setBusy(false); return; }",
            "           await notifyMany(recipients, title.trim(), message.trim(), opts);",
            "         } else {",
            "           if (!users.find((u) => u.uid === target)) { toast.error('User not found'); setBusy(false); return; }",
            "           await notifyOne(target, title.trim(), message.trim(), opts);",
            "         }",
            "         setTitle(''); setMessage('');",
            "         toast.success('Sent');",
            "       } catch { toast.error('Failed'); }",
            "       finally { setBusy(false); }",
            "     };",
          ].join("\n")
        );

        return out;
      },
      "AdminNotifications targets+push"
    );
  });

  /* -------- FIX for the "MISSING" src/types.ts -------- */
  await runFix("Fix — Recreate src/types.ts (was MISSING)", async () => {
    const abs = path.join(ROOT, "src/types.ts");
    if (exists(abs)) {
      const cur = readSafe(abs) || "";
      if (cur.includes("export type RoleId")) {
        logInfo("src/types.ts already populated — skipping.");
        return;
      }
    }
    write(abs, FILE_TYPES_TS);
  });

  /* -------- PUSH everything modified to GitHub -------- */
  await runFix("Push modified files to GitHub", async () => {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
      throw new Error("GITHUB_TOKEN / GITHUB_REPO not set — cannot push.");
    }
    const files = new Set();
    // Collect every .ts/.tsx under src/ that we touched.
    const known = [
      ...BUNDLE_FILES,
      "src/types.ts",
      "src/lib/user.ts",
      "src/lib/authExtras.ts",
      "src/lib/push.ts",
      "src/lib/notify.ts",
      "src/lib/csv.ts",
      "src/lib/migrations.ts",
      "src/lib/postsApproval.ts",
      "src/lib/analytics.ts",
      "src/components/settings/ChangePasswordCard.tsx",
      "src/pages/admin/AdminAnalyticsPage.tsx",
    ];
    for (const f of known) {
      if (exists(path.join(ROOT, f))) files.add(f);
    }
    for (const f of files) {
      try {
        await pushLocalFile(f, "chore: automated fix — " + f);
        logInfo("pushed " + f);
      } catch (err) {
        logWarn(
          "push failed for " +
            f +
            ": " +
            (err && err.message ? err.message : err)
        );
      }
    }
  });

  /* -------- SUMMARY -------- */
  console.log("\n============================================================");
  console.log(" SUMMARY");
  console.log("============================================================");
  for (const r of RESULTS) {
    console.log(
      " " + (r.ok ? "✅" : "❌") + "  " + r.name + (r.ok ? "" : " — " + r.error)
    );
  }
  console.log("============================================================\n");
}

/* ============================================================================
 * AdminAnalyticsPage generator (kept out of the main pipeline for readability)
 * ==========================================================================*/

function buildAnalyticsPage() {
  return `// src/pages/admin/AdminAnalyticsPage.tsx
// Fix #7 — Expanded Admin Analytics. Realtime via useCollection.
import { useMemo } from 'react';
import { useCollection } from '@/lib/useRealtimeCollection';
import { teams } from '@/data/teams';
import { getTeamTotalPoints } from '@/lib/rankings';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Loading } from '@/components/ui/Loading';
import { Stat, StatRow } from '@/components/ui/Stat';
import { Badge } from '@/components/ui/Badge';
import {
  countByStatus,
  activeInactive,
  approvalRates,
  topContributors,
  activityLast30Days,
  monthlyTotals,
} from '@/lib/analytics';
import type { Member, Contribution, RequestRecord, Committee, Team } from '@/types';

/* ------------------------------- Tiny SVG charts ------------------------ */

function BarChart({ data, color = '#C1272D', max }: { data: Array<{ label: string; value: number }>; color?: string; max?: number }) {
  const peak = max ?? Math.max(1, ...data.map((d) => d.value));
  const W = 720, H = Math.max(80, data.length * 30);
  return (
    <svg viewBox={\`0 0 \${W} \${H}\`} width="100%" height={H} role="img">
      {data.map((d, i) => {
        const y = i * 30 + 6;
        const w = Math.round((d.value / peak) * (W - 200));
        return (
          <g key={d.label + i}>
            <text x={0} y={y + 16} fontSize={12} fill="#334155">{d.label}</text>
            <rect x={140} y={y} width={Math.max(2, w)} height={20} rx={4} fill={color} opacity={0.85} />
            <text x={140 + Math.max(2, w) + 6} y={y + 15} fontSize={12} fill="#0F172A">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({ data, size = 220 }: { data: Array<{ label: string; value: number; color: string }>; size?: number }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2;
  let acc = 0;
  const arcs = data.map((d) => {
    const start = (acc / total) * Math.PI * 2;
    acc += d.value;
    const end = (acc / total) * Math.PI * 2;
    const x1 = r + r * 0.9 * Math.cos(start - Math.PI / 2);
    const y1 = r + r * 0.9 * Math.sin(start - Math.PI / 2);
    const x2 = r + r * 0.9 * Math.cos(end - Math.PI / 2);
    const y2 = r + r * 0.9 * Math.sin(end - Math.PI / 2);
    const large = end - start > Math.PI ? 1 : 0;
    return { d: \`M \${r} \${r} L \${x1} \${y1} A \${r * 0.9} \${r * 0.9} 0 \${large} 1 \${x2} \${y2} Z\`, color: d.color, label: d.label, value: d.value };
  });
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox={\`0 0 \${size} \${size}\`} width={size} height={size} role="img">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} stroke="#fff" strokeWidth={1} />)}
      </svg>
      <ul className="small">
        {arcs.map((a, i) => (
          <li key={i}><span style={{ display: 'inline-block', width: 10, height: 10, background: a.color, marginRight: 6, borderRadius: 2 }} />{a.label}: {a.value}</li>
        ))}
      </ul>
    </div>
  );
}

function LineChart({ points, color = '#0F172A' }: { points: Array<{ x: string; y: number }>; color?: string }) {
  const W = 720, H = 220, pad = 30;
  const maxY = Math.max(1, ...points.map((p) => p.y));
  const step = points.length > 1 ? (W - pad * 2) / (points.length - 1) : 0;
  const path = points.map((p, i) => {
    const x = pad + i * step;
    const y = H - pad - (p.y / maxY) * (H - pad * 2);
    return (i === 0 ? 'M' : 'L') + ' ' + x + ' ' + y;
  }).join(' ');
  return (
    <svg viewBox={\`0 0 \${W} \${H}\`} width="100%" height={H} role="img">
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="#E2E8F0" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="#E2E8F0" />
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
      {points.map((p, i) => {
        const x = pad + i * step;
        const y = H - pad - (p.y / maxY) * (H - pad * 2);
        return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
      })}
      {points.map((p, i) => i % 5 === 0 ? (
        <text key={'l' + i} x={pad + i * step} y={H - 10} fontSize={9} fill="#64748B" textAnchor="middle">{p.x.slice(5)}</text>
      ) : null)}
    </svg>
  );
}

/* --------------------------------- Page -------------------------------- */

const PALETTE = ['#C1272D', '#0F172A', '#60A5FA', '#16A34A', '#A78BFA', '#FB923C', '#22D3EE', '#0EA5E9', '#F472B6', '#64748B'];

export function AdminAnalyticsPage() {
  const { data: members, loading: lM } = useCollection<Member>('members');
  const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
  const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');
  const { data: committees, loading: lCo } = useCollection<Committee>('committees');

  const view = useMemo(() => {
    const teamStats = teams
      .map((t: Team) => ({ team: t, points: getTeamTotalPoints(members, contributions, t.id) }))
      .sort((a, b) => b.points - a.points);

    const committeeStats = committees
      .map((c) => {
        const ids = new Set(members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(c.id)).map((m) => m.id));
        const pts = contributions
          .filter((x) => x.status === 'approved' && ids.has(x.memberId) && (x.committeeId === c.id || !x.committeeId))
          .reduce((s, x) => s + (Number(x.points) || 0), 0);
        return { committee: c, points: pts };
      })
      .sort((a, b) => b.points - a.points);

    const memberPoints = members
      .map((m) => ({
        member: m,
        points: contributions.filter((c) => c.status === 'approved' && c.memberId === m.id).reduce((s, c) => s + (Number(c.points) || 0), 0),
      }))
      .sort((a, b) => b.points - a.points);

    const status = activeInactive(members);
    const rates = approvalRates(requests);
    const reqStatus = countByStatus(requests);
    const reqType = countByStatus(requests.map((r) => ({ status: r.type })));
    const contribStatus = countByStatus(contributions);
    const top = topContributors(members, contributions, 10);
    const daily = activityLast30Days(contributions);
    const monthly = monthlyTotals(contributions, 6);

    const totalPoints = contributions.filter((c) => c.status === 'approved').reduce((s, c) => s + (Number(c.points) || 0), 0);
    const totalHours = contributions.filter((c) => c.status === 'approved').reduce((s, c) => s + (Number(c.hours) || 0), 0);

    return { teamStats, committeeStats, memberPoints, status, rates, reqStatus, reqType, contribStatus, top, daily, monthly, totalPoints, totalHours };
  }, [members, contributions, requests, committees]);

  if (lM || lC || lR || lCo) return <Loading fullHeight message="Loading analytics..." />;

  const maxTeam = Math.max(1, ...view.teamStats.map((s) => s.points));
  const maxCommittee = Math.max(1, ...view.committeeStats.map((s) => s.points));
  const maxMember = Math.max(1, ...view.memberPoints.slice(0, 10).map((s) => s.points));

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Admin" title="Analytics" description="Live metrics, distributions, and trends." />

      <section className="section">
        <SectionHeader eyebrow="Overview" title="Key Metrics" />
        <StatRow>
          <Stat value={members.length} label="Members" />
          <Stat value={view.status.active} label="Active" />
          <Stat value={view.status.inactive + view.status.suspended} label="Inactive / Suspended" variant="red" />
          <Stat value={teams.length} label="Teams" />
          <Stat value={committees.length} label="Committees" />
          <Stat value={view.totalPoints} label="Total Points" />
          <Stat value={view.totalHours} label="Total Hours" />
          <Stat value={requests.length} label="Requests" />
        </StatRow>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Points" title="Points per Team" />
        <div className="card no-click">
          <BarChart data={view.teamStats.map((s) => ({ label: s.team.name, value: s.points }))} max={maxTeam} color="#C1272D" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Points" title="Points per Committee" />
        <div className="card no-click">
          {view.committeeStats.length === 0
            ? <div className="muted small">No committees yet.</div>
            : <BarChart data={view.committeeStats.map((s) => ({ label: s.committee.nameAr || s.committee.name || s.committee.id, value: s.points }))} max={maxCommittee} color="#0F172A" />}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Points" title="Top 10 Members by Points" />
        <div className="card no-click">
          <BarChart data={view.memberPoints.slice(0, 10).map((s) => ({ label: s.member.name, value: s.points }))} max={maxMember} color="#16A34A" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Requests" title="By Status" />
        <div className="grid grid--2">
          <div className="card no-click">
            <PieChart data={view.reqStatus.map((b, i) => ({ label: b.key, value: b.value, color: PALETTE[i % PALETTE.length] }))} />
          </div>
          <div className="card no-click">
            <div className="card__title">Approval Rates</div>
            <div className="card__meta">Approved: {view.rates.approved} · Rejected: {view.rates.rejected} · Pending: {view.rates.pending}</div>
            <div className="mt-3">
              <div className="chart-row"><span>Approval</span><div className="chart-bar" style={{ width: view.rates.approvalRate + '%' }} /><span>{view.rates.approvalRate}%</span></div>
              <div className="chart-row"><span>Rejection</span><div className="chart-bar" style={{ width: view.rates.rejectionRate + '%', background: 'var(--c-red)' }} /><span>{view.rates.rejectionRate}%</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Requests" title="By Type" />
        <div className="grid grid--narrow">
          {view.reqType.map((b) => (
            <div key={b.key} className="card no-click">
              <div className="card__meta">{b.key}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-red)', marginTop: 6 }}>{b.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Contributions" title="By Status" />
        <div className="grid grid--narrow">
          {view.contribStatus.map((b) => (
            <div key={b.key} className="card no-click">
              <div className="card__meta">{b.key}</div>
              <div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{b.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Timeline" title="Last 30 Days (Points)" />
        <div className="card no-click">
          <LineChart points={view.daily.map((d) => ({ x: d.day, y: d.points }))} color="#0F172A" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="Timeline" title="Monthly Comparison (6 months)" />
        <div className="card no-click">
          <BarChart data={view.monthly.map((m) => ({ label: m.month, value: m.points }))} color="#A78BFA" />
        </div>
      </section>

      <section className="section">
        <SectionHeader eyebrow="People" title="Top Contributors" />
        <div className="card no-click">
          <table className="data">
            <thead><tr><th>#</th><th>Name</th><th>Points</th><th>Hours</th></tr></thead>
            <tbody>
              {view.top.map((t, i) => (
                <tr key={t.member.id}>
                  <td data-label="#">{i + 1}</td>
                  <td data-label="Name">{t.member.name} {i === 0 ? <Badge variant="red">Top</Badge> : null}</td>
                  <td className="points" data-label="Points">{t.points}</td>
                  <td data-label="Hours">{t.hours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
`;
}

/* ------------------------------- boot ----------------------------------- */

main().catch((err) => {
  console.error("\n[fix] FATAL:", err && err.stack ? err.stack : err);
  process.exit(1);
});
