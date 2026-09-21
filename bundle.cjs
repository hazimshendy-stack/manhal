const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const OUTPUT = "project-bundle.md";

// folders/files to ignore
const IGNORE = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "vendor",
  ".next",
  "coverage",
  ".env",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".DS_Store",
  "Thumbs.db",
];

// only include these extensions
const ALLOWED_EXT = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".json",
  ".html",
  ".css",
  ".scss",
  ".php",
  ".py",
  ".md",
  ".txt",
  ".sql",
  ".vue",
  ".svelte",
  ".env.example",
  ".yml",
  ".yaml",
];

function shouldIgnore(filePath) {
  const name = path.basename(filePath);
  const rel = path.relative(ROOT, filePath);

  if (IGNORE.some((ig) => rel.includes(ig) || name === ig)) return true;
  if (name.startsWith(".env") && name !== ".env.example") return true;

  const ext = path.extname(filePath).toLowerCase();
  if (ext && !ALLOWED_EXT.includes(ext)) return true;

  return false;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (shouldIgnore(full)) continue;

    if (entry.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

const files = walk(ROOT);
let out = `# Project Bundle\n\nGenerated: ${new Date().toISOString()}\n\n`;

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, "utf8");
  out += `## ${rel}\n\n\`\`\`\n${content}\n\`\`\`\n\n`;
}

fs.writeFileSync(OUTPUT, out, "utf8");
console.log(`Done: ${OUTPUT} (${files.length} files)`);
