#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT = "project-bundle.md";

// المجلدات المستثناة
const IGNORE_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  ".vscode",
  ".idea",
];

// الملفات المستثناة
const IGNORE_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

// الامتدادات المطلوبة فقط
const EXTS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".html",
  ".json",
  ".md",
  ".rules",
  ".txt",
];

function shouldIgnore(full) {
  const rel = path.relative(ROOT, full);
  if (rel.split(path.sep).some((p) => IGNORE_DIRS.includes(p))) return true;
  if (IGNORE_FILES.includes(path.basename(full))) return true;
  return false;
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (shouldIgnore(full)) continue;
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.includes(path.extname(e.name))) out.push(full);
  }
  return out;
}

const files = walk(ROOT).sort();

let bundle = `# Project Bundle — sbapiaryy\n\n`;
bundle += `Generated: ${new Date().toISOString()}\n`;
bundle += `Total files: ${files.length}\n\n---\n\n`;

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  try {
    const content = fs.readFileSync(file, "utf8");
    bundle += `\n## FILE: ${rel}\n\n\`\`\`\n${content}\n\`\`\`\n`;
  } catch (e) {
    bundle += `\n## FILE: ${rel}\n\n[Cannot read: ${e.message}]\n`;
  }
}

fs.writeFileSync(OUTPUT, bundle, "utf8");
console.log(`✓ ${OUTPUT} created (${files.length} files)`);
