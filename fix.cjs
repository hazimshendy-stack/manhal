#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * fix.cjs — يعرض أخطاء tsc كاملة + push اختياري
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const ROOT = process.cwd();
const C = {
  r: "\x1b[0m",
  b: "\x1b[1m",
  g: "\x1b[32m",
  y: "\x1b[33m",
  red: "\x1b[31m",
  c: "\x1b[36m",
  m: "\x1b[35m",
  d: "\x1b[2m",
};

const sh = (cmd, opts = {}) =>
  execSync(cmd, { cwd: ROOT, stdio: "inherit", ...opts });

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim().toLowerCase());
    })
  );
}

async function main() {
  console.log("");
  console.log(
    `${C.b}${C.m}╔══════════════════════════════════════════════════════╗${C.r}`
  );
  console.log(
    `${C.b}${C.m}║  fix.cjs — Diagnose TypeScript Errors + Push          ║${C.r}`
  );
  console.log(
    `${C.b}${C.m}╚══════════════════════════════════════════════════════╝${C.r}`
  );
  console.log("");

  /* ═══════════════════════════════════════════════════════════
     Step 1: تشغيل tsc + جمع الأخطاء
     ═══════════════════════════════════════════════════════════ */
  console.log(`${C.b}▶ Running TypeScript check...${C.r}\n`);

  let tscOutput = "";
  let tscOk = false;

  try {
    tscOutput = execSync("npx tsc --noEmit 2>&1", {
      cwd: ROOT,
      encoding: "utf8",
    });
    tscOk = true;
  } catch (err) {
    tscOutput = err.stdout || err.stderr || err.message || "";
    tscOk = false;
  }

  // احفظ المخرجات في ملف
  const errFile = path.join(ROOT, "tsc-errors.txt");
  fs.writeFileSync(errFile, tscOutput, "utf8");

  if (tscOk) {
    console.log(`${C.g}${C.b}✓ No TypeScript errors!${C.r}\n`);
  } else {
    console.log(`${C.red}${C.b}✗ TypeScript errors found:${C.r}\n`);
    console.log(tscOutput);
    console.log("");
    console.log(`${C.d}Full output saved to: tsc-errors.txt${C.r}\n`);
  }

  /* ═══════════════════════════════════════════════════════════
     Step 2: عرض ملخص الأخطاء
     ═══════════════════════════════════════════════════════════ */
  if (!tscOk) {
    const lines = tscOutput.split("\n");
    const errorLines = lines.filter((l) => l.includes("error TS"));
    const filesWithErrors = new Set();

    errorLines.forEach((line) => {
      const match = line.match(/^([^(]+)\(/);
      if (match) filesWithErrors.add(match[1]);
    });

    console.log(`${C.b}▶ Summary:${C.r}`);
    console.log(`  ${C.y}Total errors: ${errorLines.length}${C.r}`);
    console.log(`  ${C.y}Files affected: ${filesWithErrors.size}${C.r}`);
    console.log("");
    console.log(`${C.b}Files with errors:${C.r}`);
    filesWithErrors.forEach((f) => console.log(`  ${C.c}•${C.r} ${f}`));
    console.log("");
  }

  /* ═══════════════════════════════════════════════════════════
     Step 3: Git status
     ═══════════════════════════════════════════════════════════ */
  console.log(`${C.b}▶ Git status:${C.r}\n`);
  try {
    const status = execSync("git status --short", {
      cwd: ROOT,
      encoding: "utf8",
    });
    if (status.trim()) {
      console.log(status);
    } else {
      console.log(`${C.d}(no changes)${C.r}\n`);
    }
  } catch {
    console.log(`${C.d}(could not get git status)${C.r}\n`);
  }

  /* ═══════════════════════════════════════════════════════════
     Step 4: سؤال المستخدم
     ═══════════════════════════════════════════════════════════ */
  if (!tscOk) {
    console.log(
      `${C.b}═══════════════════════════════════════════════════════${C.r}`
    );
    console.log(`${C.y}TS errors exist. Do you want to push anyway?${C.r}`);
    console.log(
      `${C.d}GitHub Actions will attempt to build, but might fail.${C.r}`
    );
    console.log(
      `${C.b}═══════════════════════════════════════════════════════${C.r}`
    );
    console.log("");
    console.log(`  ${C.g}y${C.r} = Push anyway`);
    console.log(
      `  ${C.y}f${C.r} = Fix automatically (remove unused vars/imports)`
    );
    console.log(`  ${C.red}n${C.r} = Stop here`);
    console.log("");

    const answer = await ask("Your choice (y/f/n): ");

    if (answer === "n" || answer === "") {
      console.log(
        `\n${C.y}Stopped. Run "node fix.cjs" again after fixing errors.${C.r}\n`
      );
      process.exit(0);
    }

    if (answer === "f") {
      console.log(`\n${C.b}▶ Auto-fixing...${C.r}\n`);
      autoFix();
    }
  }

  /* ═══════════════════════════════════════════════════════════
     Step 5: Commit + Push
     ═══════════════════════════════════════════════════════════ */
  console.log("");
  console.log(`${C.b}▶ Commit + Push${C.r}\n`);

  try {
    sh("git add -A");

    let hasChanges = true;
    try {
      execSync("git diff --staged --quiet", { cwd: ROOT, stdio: "pipe" });
      hasChanges = false;
    } catch {
      /* hasChanges = true */
    }

    if (!hasChanges) {
      console.log(`${C.y}ℹ No changes to commit${C.r}\n`);
      process.exit(0);
    }

    sh(
      'git -c user.name="fix-bot" -c user.email="fix-bot@local" commit -m "feat: home pages in English"'
    );
    console.log(`\n${C.g}✓ commit${C.r}`);

    sh("git push origin main --force");
    console.log(`\n${C.g}${C.b}✓ Pushed${C.r}`);
    console.log(`${C.y}⏱️  Wait 4-7 min → Ctrl+Shift+R${C.r}\n`);
  } catch (e) {
    console.log(`\n${C.red}✗ Push failed${C.r}`);
    console.log(`  ${C.c}git push origin main --force${C.r}\n`);
    process.exit(1);
  }
}

/* ═══════════════════════════════════════════════════════════════
   Auto-Fix: يشيل unused imports و vars
   ═══════════════════════════════════════════════════════════════ */
function autoFix() {
  const srcDir = path.join(ROOT, "src");
  if (!fs.existsSync(srcDir)) return;

  const files = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(tsx?|jsx?)$/.test(e.name)) files.push(full);
    }
  };
  walk(srcDir);

  let fixed = 0;

  for (const file of files) {
    let content = fs.readFileSync(file, "utf8");
    const original = content;

    // شيل unused imports
    const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g;
    content = content.replace(importRegex, (match, imports, source) => {
      const names = imports
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      const body = content.replace(importRegex, "");
      const used = names.filter((name) => {
        let clean = name;
        if (clean.startsWith("type ")) clean = clean.slice(5).trim();
        if (clean.includes(" as ")) clean = clean.split(" as ")[1].trim();
        const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\b${escaped}\\b`).test(body);
      });
      if (used.length === 0) return "";
      if (used.length === names.length) return match;
      return `import { ${used.join(", ")} } from '${source}';`;
    });

    // شيل السطور الفاضية الزايدة
    content = content.replace(/\n{3,}/g, "\n\n");

    if (content !== original) {
      fs.writeFileSync(file, content, "utf8");
      const rel = path.relative(ROOT, file).replace(/\\/g, "/");
      console.log(`${C.g}✓${C.r} ${rel}`);
      fixed++;
    }
  }

  console.log(`\n${C.g}Fixed ${fixed} file(s)${C.r}\n`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
