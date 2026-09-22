#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   fix-workflows.cjs
   ─────────────────────────────────────────────────────────────────────
   • يمسح كل ملفات .github/workflows/ (القديمة المكسورة)
   • يكتب deploy.yml نظيف
   • يعمل commit + push --force
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();

const WORKFLOWS_DIR = path.join(ROOT, ".github", "workflows");

console.log("");
console.log(
  " ╔══════════════════════════════════════════════════════════════╗"
);
console.log(
  " ║   fix-workflows.cjs                                          ║"
);
console.log(
  " ║   kill broken YAML · write clean deploy.yml · push           ║"
);
console.log(
  " ╚══════════════════════════════════════════════════════════════╝"
);
console.log("");

/* ─────────────────────────────────────────────────────────────────────
      STEP 1 — امسح كل ملفات الـ workflows القديمة
      ───────────────────────────────────────────────────────────────────── */
console.log(" 🧹 STEP 1 · Removing old workflow files…");

if (fs.existsSync(WORKFLOWS_DIR)) {
  const files = fs.readdirSync(WORKFLOWS_DIR);
  for (const f of files) {
    const abs = path.join(WORKFLOWS_DIR, f);
    try {
      fs.rmSync(abs, { recursive: true, force: true });
      console.log("   ✗ removed: .github/workflows/" + f);
    } catch (e) {
      console.log("   ⚠ could not remove " + f + ": " + e.message);
    }
  }
  if (files.length === 0) {
    console.log("   (folder was empty)");
  }
} else {
  console.log("   (no workflows folder yet — will create)");
}

/* ─────────────────────────────────────────────────────────────────────
      STEP 2 — اكتب deploy.yml نظيف
      ───────────────────────────────────────────────────────────────────── */
console.log("");
console.log(" 🚀 STEP 2 · Writing clean deploy.yml…");

fs.mkdirSync(WORKFLOWS_DIR, { recursive: true });

const deployYaml = `name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: pages
     cancel-in-progress: true

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: '20'

         - name: Setup Pages
           uses: actions/configure-pages@v5

         - name: Create .env file
           run: |
             cat > .env << 'EOF'
             VITE_FIREBASE_API_KEY=\${{ secrets.VITE_FIREBASE_API_KEY }}
             VITE_FIREBASE_AUTH_DOMAIN=\${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
             VITE_FIREBASE_PROJECT_ID=\${{ secrets.VITE_FIREBASE_PROJECT_ID }}
             VITE_FIREBASE_STORAGE_BUCKET=\${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
             VITE_FIREBASE_MESSAGING_SENDER_ID=\${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
             VITE_FIREBASE_APP_ID=\${{ secrets.VITE_FIREBASE_APP_ID }}
             EOF

         - name: Install dependencies
           run: npm install --no-audit --no-fund --no-package-lock

         - name: Build
           run: npm run build

         - name: Verify dist
           run: |
             if [ ! -d "dist" ]; then
               echo "ERROR: dist folder was not created"
               exit 1
             fi
             ls -la dist/

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: \${{ steps.deployment.outputs.page_url }}
       steps:
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   `;

fs.writeFileSync(path.join(WORKFLOWS_DIR, "deploy.yml"), deployYaml, "utf8");

console.log("   ✓ wrote: .github/workflows/deploy.yml");

/* ─────────────────────────────────────────────────────────────────────
      STEP 3 — تأكد من public/.nojekyll
      ───────────────────────────────────────────────────────────────────── */
console.log("");
console.log(" 📄 STEP 3 · Ensuring public/.nojekyll…");

const nojekyll = path.join(ROOT, "public", ".nojekyll");
fs.mkdirSync(path.dirname(nojekyll), { recursive: true });
fs.writeFileSync(nojekyll, "", "utf8");
console.log("   ✓ public/.nojekyll");

/* ─────────────────────────────────────────────────────────────────────
      STEP 4 — Commit
      ───────────────────────────────────────────────────────────────────── */
console.log("");
console.log(" 📝 STEP 4 · Committing…");

function run(cmd, silent = false) {
  try {
    if (!silent) console.log(" $ " + cmd);
    execSync(cmd, { stdio: silent ? "pipe" : "inherit", cwd: ROOT });
    return true;
  } catch (e) {
    if (!silent) console.log("   (command returned non-zero)");
    return false;
  }
}

/* لو مفيش git repo، نعمل واحد */
if (!fs.existsSync(path.join(ROOT, ".git"))) {
  console.log("   no git repo — initializing…");
  run("git init");
  run("git branch -M main");
}

/* تأكد من وجود remote */
try {
  execSync("git remote get-url origin", { cwd: ROOT, stdio: "pipe" });
} catch {
  console.log("   adding remote origin…");
  run(
    "git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git"
  );
}

run("git add -A");
run(
  'git commit -m "fix(ci): remove all broken workflows, add clean deploy.yml"',
  true
);

/* ─────────────────────────────────────────────────────────────────────
      STEP 5 — Push --force
      ───────────────────────────────────────────────────────────────────── */
console.log("");
console.log(" 📤 STEP 5 · Pushing to GitHub…");

const pushed = run("git push origin main --force");

/* ─────────────────────────────────────────────────────────────────────
      Summary
      ───────────────────────────────────────────────────────────────────── */
console.log("");
console.log(
  " ╔══════════════════════════════════════════════════════════════╗"
);
if (pushed) {
  console.log(
    " ║   ✅ DONE — pushed to GitHub                                ║"
  );
} else {
  console.log(
    " ║   ⚠️  Push failed — see errors above                        ║"
  );
}
console.log(
  " ╚══════════════════════════════════════════════════════════════╝"
);
console.log("");
console.log(" ⚠️  تأكد من الإعدادات دي على GitHub:");
console.log("");
console.log("   1. Settings → Pages → Source = GitHub Actions");
console.log('      (لو فيه "Deploy from a branch" → غيّرها)');
console.log("");
console.log("   2. Settings → Actions → General → Workflow permissions");
console.log("      اختار: Read and write permissions");
console.log("");
console.log('   3. Actions tab → لو شفت ملف قديم مكسور، اعمل "Disable" له');
console.log("      (بس مع الـ push الجديد المفروض ما يبقى فيه غيره)");
console.log("");
console.log(" ⏭️  بعد دقيقتين:");
console.log("   • افتح Actions tab");
console.log('   • هتلاقي run جديد اسمه "Deploy to GitHub Pages"');
console.log("   • المفروض ينتهي بنجاح ✅");
console.log("");
