#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — إصلاح db.ts + Auto Push to GitHub
 * Usage: node fix.cjs
 *
 * لما تشغّله:
 *   1. يصلح src/lib/db.ts
 *   2. يشغّل tsc --noEmit للتحقق
 *   3. لو كل حاجة تمام → git add + commit + push origin main --force
 *   4. لو فيه أخطاء → يعرضها ويتوقف
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const C = {
  r: "\x1b[0m",
  b: "\x1b[1m",
  d: "\x1b[2m",
  g: "\x1b[32m",
  y: "\x1b[33m",
  red: "\x1b[31m",
  c: "\x1b[36m",
  m: "\x1b[35m",
};

// ═══════════════════════════════════════════════════════════════
// 1) db.ts — النسخة الصحيحة (اللي كانت خربت من الفيكس القديم)
// ═══════════════════════════════════════════════════════════════
const DB_TS = `import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

export async function listAll<T>(collectionName: string): Promise<T[]> {
  const snap = await getDocs(collection(db, collectionName));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
}

export async function getOne<T>(collectionName: string, id: string): Promise<T | null> {
  const snap = await getDoc(doc(db, collectionName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export async function createOne<T extends { id?: string }>(
  collectionName: string,
  data: T,
): Promise<string> {
  const dataRecord = data as Record<string, unknown>;
  const explicitId = typeof dataRecord.id === 'string' ? (dataRecord.id as string) : undefined;

  // نبني نسخة بدون id عشان نتجنب تكرار الحقل
  const payload: Record<string, unknown> = {};
  for (const key of Object.keys(dataRecord)) {
    if (key === 'id') continue;
    payload[key] = dataRecord[key];
  }

  if (explicitId) {
    await setDoc(doc(db, collectionName, explicitId), payload);
    return explicitId;
  }

  const ref = await addDoc(collection(db, collectionName), payload);
  return ref.id;
}

export async function updateOne(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>,
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), data);
}

export async function removeOne(collectionName: string, id: string): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

export async function listWhere<T>(
  collectionName: string,
  field: string,
  value: unknown,
): Promise<T[]> {
  const q = query(collection(db, collectionName), where(field, '==', value));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
}

export function newId(prefix: string): string {
  return (
    prefix +
    '-' +
    Date.now().toString(36).toUpperCase() +
    '-' +
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function now(): string {
  return new Date().toISOString();
}
`;

// ═══════════════════════════════════════════════════════════════
// Helper: run command
// ═══════════════════════════════════════════════════════════════
const sh = (cmd) => {
  console.log(`${C.c}$ ${cmd}${C.r}`);
  return execSync(cmd, { cwd: ROOT, stdio: "inherit" });
};

// ═══════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════
console.log("");
console.log(
  `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
);
console.log(
  `${C.b}${C.m}║  fix.cjs — إصلاح db.ts + Auto Push                   ║${C.r}`
);
console.log(
  `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
);
console.log("");

// ═══ Step 1: نسخة احتياطية ═══
const dbPath = path.join(ROOT, "src/lib/db.ts");
if (fs.existsSync(dbPath)) {
  const backupDir = path.join(ROOT, ".fix-backups", Date.now().toString());
  fs.mkdirSync(backupDir, { recursive: true });
  fs.copyFileSync(dbPath, path.join(backupDir, "db.ts"));
  console.log(
    `${C.g}✓${C.r} نسخة احتياطية: .fix-backups/${path.basename(
      backupDir
    )}/db.ts`
  );
} else {
  console.log(`${C.red}✗ src/lib/db.ts غير موجود!${C.r}`);
  process.exit(1);
}

// ═══ Step 2: إصلاح db.ts ═══
console.log("");
console.log(`${C.b}▶ [1/4] إصلاح src/lib/db.ts${C.r}`);
fs.writeFileSync(dbPath, DB_TS, "utf8");
console.log(`${C.g}✓${C.r} تم إصلاح db.ts`);
console.log("");

// ═══ Step 3: TypeScript check ═══
console.log(`${C.b}▶ [2/4] التحقق من TypeScript${C.r}\n`);

let tscOk = false;
try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "inherit" });
  tscOk = true;
  console.log(`\n${C.g}${C.b}✓ لا أخطاء TypeScript!${C.r}`);
} catch {
  console.log(`\n${C.red}✗ فيه أخطاء TypeScript${C.r}`);
}

if (!tscOk) {
  console.log("");
  console.log(`${C.y}⚠ ما تمش الـ push لأن فيه أخطاء.${C.r}`);
  console.log(`${C.y}ابعثلي رسائل tsc اللي فاضلة وأنا أظبطها.${C.r}`);
  console.log("");
  process.exit(1);
}

// ═══ Step 4: Git add + commit ═══
console.log("");
console.log(`${C.b}▶ [3/4] Commit${C.r}\n`);

try {
  sh("git add -A");

  // نتأكد إن فيه تغييرات
  let hasChanges = false;
  try {
    execSync("git diff --staged --quiet", { cwd: ROOT, stdio: "pipe" });
    hasChanges = false;
  } catch {
    hasChanges = true;
  }

  if (!hasChanges) {
    console.log("");
    console.log(`${C.y}ℹ مفيش تغييرات جديدة للـ commit.${C.r}`);
  } else {
    const msg = "fix: repair db.ts createOne payload handling";
    sh(
      `git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "${msg}"`
    );
    console.log("");
    console.log(`${C.g}✓ تم الـ commit${C.r}`);
  }
} catch (e) {
  console.log(`\n${C.red}✗ فشل الـ git add/commit${C.r}`);
  console.log(e.message);
  process.exit(1);
}

// ═══ Step 5: Force push ═══
console.log("");
console.log(`${C.b}▶ [4/4] Push to origin/main --force${C.r}\n`);

try {
  sh("git push origin main --force");
  console.log("");
  console.log(`${C.g}${C.b}✓ تم الـ push!${C.r}`);
  console.log("");
  console.log(`${C.b}GitHub Actions هيكمل Build + Deploy تلقائيًا.${C.r}`);
  console.log(
    `${C.d}افتح: https://github.com/hazimshendy-stack/sbapiaryyy/actions${C.r}`
  );
  console.log("");
} catch (e) {
  console.log("");
  console.log(`${C.red}✗ فشل الـ push${C.r}`);
  console.log(`${C.y}احتمالات:${C.r}`);
  console.log("  • مش مصرح لك بالـ push (تأكد من SSH key أو GitHub token)");
  console.log("  • Branch protection على main — اقفله من Settings → Branches");
  console.log("  • مش متصل بالإنترنت");
  console.log("");
  console.log(`${C.y}جرّب يدويًا:${C.r}`);
  console.log(`  ${C.c}git push origin main --force${C.r}`);
  console.log("");
  process.exit(1);
}
