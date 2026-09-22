#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   smoke-report.cjs  (v2 — يستخدم Chrome المثبت على الجهاز)
   ─────────────────────────────────────────────────────────────────────
   • يبني المشروع
   • يشغّل preview server
   • يزور كل route
   • يضغط كل زرار آمن
   • يعمل submit لكل form
   • يطلع MANHAL-REPORT.md  ← ملف واحد تبعته للمساعد
   ═══════════════════════════════════════════════════════════════════════ */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const ROOT = process.cwd();

const PORT = 4173;
const OUT_DIR = path.join(ROOT, "manhal-diagnostic");
const SHOTS_DIR = path.join(OUT_DIR, "screenshots");
const REPORT_MD = path.join(OUT_DIR, "MANHAL-REPORT.md");
const REPORT_JSON = path.join(OUT_DIR, "MANHAL-REPORT.json");

/* ═══════════════════════════════════════════════════════════════════════ */
const ROUTES = [
  "/",
  "/login",
  "/register",
  "/pending-approval",
  "/change-password",
  "/about",
  "/members",
  "/teams",
  "/committees",
  "/league",
  "/achievements",
  "/governance",
  "/search",
  "/this-does-not-exist",
  "/dashboard",
  "/profile",
  "/my-contributions",
  "/my-requests",
  "/requests/new",
  "/requests",
  "/approvals",
  "/contributions",
  "/notifications",
  "/calendar",
  "/reports",
  "/audit",
  "/admin",
  "/admin/analytics",
  "/admin/pending-users",
  "/admin/requests",
  "/admin/users",
  "/admin/members",
  "/admin/contributions",
  "/admin/committees",
  "/admin/achievements",
  "/admin/warnings",
  "/admin/calendar",
  "/admin/notifications",
  "/admin/governance",
  "/admin/audit",
];

const DANGEROUS = [
  "delete",
  "remove",
  "logout",
  "sign out",
  "signout",
  "خروج",
  "احذف",
  "حذف",
  "مسح",
  "إزالة",
  "رفض",
  "reject",
  "resign",
  "استقالة",
  "cancel",
  "reset",
];

const isDangerous = (t) => {
  const x = (t || "").toLowerCase().trim();
  return x && DANGEROUS.some((w) => x.includes(w));
};

/* ═══════════════════════════════════════════════════════════════════════
      متصفح ذكي — يجرّب chrome ثم msedge ثم default
      ═══════════════════════════════════════════════════════════════════════ */
async function launchBrowser(PW) {
  const channels = ["chrome", "msedge"];

  for (const ch of channels) {
    try {
      console.log("   🔵 trying channel: " + ch);
      const browser = await PW.chromium.launch({
        headless: true,
        channel: ch,
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      });
      console.log("   ✅ launched with " + ch);
      return browser;
    } catch (e) {
      console.log("   ⚠ " + ch + " failed: " + e.message.split("\n")[0]);
    }
  }

  /* كمل كـ fallback */
  console.log("   🔵 trying default playwright chromium");
  try {
    const browser = await PW.chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    console.log("   ✅ launched with default");
    return browser;
  } catch (e) {
    console.error("   ❌ default chromium failed: " + e.message.split("\n")[0]);
    throw new Error("No browser could be launched");
  }
}

/* ═══════════════════════════════════════════════════════════════════════
      Helpers
      ═══════════════════════════════════════════════════════════════════════ */
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function safeFile(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100);
}

async function waitForServer(url, attempts = 40) {
  const http = require("http");
  for (let i = 0; i < attempts; i += 1) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume();
          resolve();
        });
        req.on("error", reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error("t"));
        });
      });
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return false;
}

async function ensurePlaywright() {
  try {
    require.resolve("playwright");
    return;
  } catch {
    console.log("   📦 Installing playwright…");
    execSync("npm install --save-dev playwright --no-audit --no-fund", {
      stdio: "inherit",
      cwd: ROOT,
    });
  }
}

function classify(text) {
  const t = (text || "").toLowerCase();
  if (t.includes("api-key") && t.includes("firebase")) return "ignore";
  if (t.includes("firebase: error")) return "ignore";
  if (t.includes("auth/invalid-api-key")) return "ignore";
  if (t.includes("permission-denied")) return "warn";
  if (t.includes("missing or insufficient permissions")) return "warn";
  if (t.includes("failed to fetch")) return "warn";
  if (t.includes("network request failed")) return "warn";
  return "error";
}

function attachListeners(page) {
  const errors = [];
  const warnings = [];

  const onConsole = (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    const kind = classify(text);
    if (kind === "error") {
      errors.push({
        type: "console",
        text,
        location: msg.location ? msg.location() : null,
      });
    } else if (kind === "warn") {
      warnings.push({ type: "console", text });
    }
  };

  const onPageError = (err) => {
    errors.push({
      type: "pageerror",
      text: err.message,
      stack: (err.stack || "").split("\n").slice(0, 6).join("\n"),
    });
  };

  const onRequestFailed = (req) => {
    const url = req.url();
    const failure = req.failure();
    const errText = (failure && failure.errorText) || "";
    if (
      url.includes("firebase") ||
      url.includes("googleapis") ||
      url.includes("gstatic")
    )
      return;
    if (url.match(/\.(png|svg|ico|woff2?)$/)) return;
    if (errText === "net::ERR_ABORTED") return;
    errors.push({ type: "request", text: url + " — " + errText });
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);

  return {
    errors,
    warnings,
    detach: () => {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
      page.off("requestfailed", onRequestFailed);
    },
  };
}

async function getSafeClickables(page) {
  return await page.evaluate((dangerWords) => {
    const out = [];
    const all = document.querySelectorAll('button, a.btn, [role="button"]');
    all.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      )
        return;
      const rect = el.getBoundingClientRect();
      if (rect.width < 4 || rect.height < 4) return;

      const text = (el.textContent || "").trim().toLowerCase();
      const aria = (el.getAttribute("aria-label") || "").toLowerCase();
      const href = el.getAttribute("href") || "";
      const combined = text + " " + aria;

      if (dangerWords.some((w) => combined.includes(w))) return;
      if (href.startsWith("http") && !href.includes("localhost")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (el.classList.contains("is-active")) return;
      if (el.disabled || el.getAttribute("aria-disabled") === "true") return;

      let sel;
      if (el.id) sel = "#" + CSS.escape(el.id);
      else {
        const parts = [];
        let cur = el;
        while (cur && cur !== document.body && parts.length < 6) {
          const parent = cur.parentElement;
          if (!parent) break;
          const siblings = Array.from(parent.children);
          const idx = siblings.indexOf(cur) + 1;
          parts.unshift(cur.tagName.toLowerCase() + ":nth-child(" + idx + ")");
          cur = parent;
        }
        sel = parts.join(" > ");
      }

      const label = (
        el.textContent ||
        el.getAttribute("aria-label") ||
        el.tagName
      ).slice(0, 60);
      out.push({ selector: sel, label, tag: el.tagName.toLowerCase() });
    });

    const seen = new Set();
    return out
      .filter((r) => {
        if (seen.has(r.selector)) return false;
        seen.add(r.selector);
        return true;
      })
      .slice(0, 30);
  }, DANGEROUS);
}

async function fillFormsWithFakeData(page) {
  try {
    await page.evaluate(() => {
      const fake = {
        email: "smoke@example.com",
        password: "Test1234!",
        name: "Smoke Test",
        title: "Smoke Title",
        description: "Smoke description",
        reason: "Smoke reason",
        comment: "Smoke comment",
        message: "Smoke message",
      };
      document.querySelectorAll("input, textarea, select").forEach((el) => {
        if (el.disabled || el.readOnly) return;
        const type = (el.type || "").toLowerCase();
        const hint = (
          (el.name || "") +
          " " +
          (el.placeholder || "") +
          " " +
          (el.id || "")
        ).toLowerCase();
        if (type === "password") el.value = fake.password;
        else if (type === "email") el.value = fake.email;
        else if (type === "number") el.value = "10";
        else if (type === "date")
          el.value = new Date().toISOString().slice(0, 10);
        else if (type === "time") el.value = "10:00";
        else if (type === "checkbox" || type === "radio") return;
        else if (el.tagName === "TEXTAREA") el.value = fake.description;
        else if (
          el.tagName === "SELECT" &&
          el.options.length > 1 &&
          el.selectedIndex === 0
        )
          el.selectedIndex = 1;
        else if (hint.includes("email")) el.value = fake.email;
        else if (hint.includes("name")) el.value = fake.name;
        else if (hint.includes("title")) el.value = fake.title;
        else el.value = fake.name;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  } catch {}
}

async function testRoute(page, route, idx) {
  const url = `http://localhost:${PORT}/#${route}`;
  const result = {
    route,
    url,
    navigatedOk: false,
    clicksOk: 0,
    clicksFailed: 0,
    formsSubmitted: 0,
    errors: [],
    warnings: [],
    failedClicks: [],
  };

  const L = attachListeners(page);

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(1500);
    result.navigatedOk = true;
  } catch (e) {
    result.errors.push({ type: "nav", text: e.message });
  }

  try {
    await page.screenshot({
      path: path.join(
        SHOTS_DIR,
        `${String(idx).padStart(3, "0")}_${safeFile(route)}.png`
      ),
      fullPage: false,
    });
  } catch {}

  let clickables = [];
  try {
    clickables = await getSafeClickables(page);
  } catch {}

  for (const item of clickables) {
    const beforeUrl = page.url();
    try {
      const el = await page.$(item.selector);
      if (!el) continue;
      await el.scrollIntoViewIfNeeded({ timeout: 800 }).catch(() => {});
      await el.click({ timeout: 2000, force: true });
      await page.waitForTimeout(500);

      const navigated = page.url() !== beforeUrl;

      try {
        const closeBtn = await page.$(".modal__close");
        if (closeBtn && (await closeBtn.isVisible())) {
          await closeBtn.click({ timeout: 800 }).catch(() => {});
          await page.waitForTimeout(250);
        }
      } catch {}

      if (navigated) {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });
        await page.waitForTimeout(500);
        clickables = await getSafeClickables(page).catch(() => clickables);
      }
      result.clicksOk += 1;
    } catch (e) {
      result.clicksFailed += 1;
      result.failedClicks.push({
        label: item.label,
        error: e.message.slice(0, 180),
      });
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });
        await page.waitForTimeout(500);
      } catch {}
    }
  }

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(800);
    const hasForm = await page.evaluate(
      () => document.querySelectorAll("form").length > 0
    );
    if (hasForm) {
      await fillFormsWithFakeData(page);
      const submit = await page.$(
        'form button[type="submit"], form input[type="submit"]'
      );
      if (submit) {
        const label = await submit.evaluate((el) =>
          (el.textContent || "").trim().toLowerCase()
        );
        if (!isDangerous(label)) {
          await submit.click({ timeout: 1500, force: true }).catch(() => {});
          await page.waitForTimeout(1200);
          result.formsSubmitted = 1;
        }
      }
    }
  } catch {}

  L.detach();
  result.errors.push(...L.errors);
  result.warnings.push(...L.warnings);
  result.ok = result.navigatedOk && result.errors.length === 0;

  return result;
}

function getEnvInfo() {
  let nodeVer = "n/a";
  try {
    nodeVer = execSync("node -v", { encoding: "utf8" }).trim();
  } catch {}

  let pkgVer = "n/a";
  try {
    const p = JSON.parse(
      fs.readFileSync(path.join(ROOT, "package.json"), "utf8")
    );
    pkgVer = p.version || "n/a";
  } catch {}

  function countFiles(dir) {
    if (!fs.existsSync(dir)) return 0;
    let n = 0;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (!["node_modules", ".git", "dist"].includes(e.name))
          n += countFiles(path.join(dir, e.name));
      } else if (/\.(tsx?|jsx?|css)$/.test(e.name)) n += 1;
    }
    return n;
  }

  return {
    nodeVersion: nodeVer,
    packageVersion: pkgVer,
    platform: os.platform(),
    arch: os.arch(),
    timestamp: new Date().toISOString(),
    sourceFileCount: countFiles(path.join(ROOT, "src")),
  };
}

function generateMarkdown(env, results, meta) {
  const pass = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;
  const totalClicks = results.reduce(
    (s, r) => s + r.clicksOk + r.clicksFailed,
    0
  );
  const totalClicksFailed = results.reduce((s, r) => s + r.clicksFailed, 0);
  const totalForms = results.reduce((s, r) => s + r.formsSubmitted, 0);
  const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);

  const errorPatterns = new Map();
  for (const r of results) {
    for (const e of r.errors) {
      const key = (e.text || "").slice(0, 80);
      if (!errorPatterns.has(key)) errorPatterns.set(key, []);
      errorPatterns.get(key).push(r.route);
    }
  }

  const failingRoutes = results.filter((r) => !r.ok);
  const L = [];
  const hr = "─".repeat(70);

  L.push("# Manhal — Full Site Diagnostic Report");
  L.push("");
  L.push(`**Generated:** ${env.timestamp}`);
  L.push(`**Package version:** ${env.packageVersion}`);
  L.push(`**Node:** ${env.nodeVersion} on ${env.platform}/${env.arch}`);
  L.push(`**Source files scanned:** ${env.sourceFileCount}`);
  L.push("");
  L.push(hr);
  L.push("## 📊 Summary");
  L.push(hr);
  L.push("");
  L.push("| Metric | Value |");
  L.push("|--------|-------|");
  L.push(`| Total routes tested | ${results.length} |`);
  L.push(`| ✅ Passing routes | ${pass} |`);
  L.push(`| ❌ Failing routes | ${fail} |`);
  L.push(`| Total buttons clicked | ${totalClicks} |`);
  L.push(`| Failed button clicks | ${totalClicksFailed} |`);
  L.push(`| Forms submitted | ${totalForms} |`);
  L.push(`| Total console/page errors | ${totalErrors} |`);
  L.push("");
  L.push(hr);
  L.push("## 🗺️  Route Status");
  L.push(hr);
  L.push("");
  L.push("| # | Route | Status | Clicks | Forms | Errors |");
  L.push("|---|-------|--------|--------|-------|--------|");
  results.forEach((r, i) => {
    const status = r.ok ? "✅" : "❌";
    const clicks = r.clicksOk + "/" + (r.clicksOk + r.clicksFailed);
    const forms = r.formsSubmitted > 0 ? "✓" : "·";
    const errors = r.errors.length === 0 ? "·" : r.errors.length;
    L.push(
      `| ${i + 1} | \`${
        r.route
      }\` | ${status} | ${clicks} | ${forms} | ${errors} |`
    );
  });
  L.push("");

  if (failingRoutes.length === 0) {
    L.push("> ✅ **No failing routes detected. Site is healthy.**");
    L.push("");
  } else {
    L.push(hr);
    L.push("## ❌ Failing Routes — Details");
    L.push(hr);
    L.push("");

    for (const r of failingRoutes) {
      L.push(`### ❌ \`${r.route}\``);
      L.push("");
      if (!r.navigatedOk) L.push("- **Navigation failed** — page never loaded");
      if (r.errors.length) {
        L.push(`- **Errors (${r.errors.length}):**`);
        L.push("");
        r.errors.slice(0, 8).forEach((e) => {
          L.push(`  - \`[${e.type}]\` ${(e.text || "").slice(0, 300)}`);
          if (e.stack) {
            e.stack
              .split("\n")
              .slice(0, 3)
              .forEach((sl) => L.push(`    \`${sl.trim()}\``));
          }
        });
      }
      if (r.failedClicks.length) {
        L.push(`- **Failed clicks (${r.failedClicks.length}):**`);
        r.failedClicks.slice(0, 5).forEach((c) => {
          L.push(`  - "${c.label}" — ${c.error}`);
        });
      }
      L.push("");
    }
  }

  if (errorPatterns.size > 0) {
    L.push(hr);
    L.push("## 🔁 Error Patterns (most frequent first)");
    L.push(hr);
    L.push("");
    const sorted = [...errorPatterns.entries()].sort(
      (a, b) => b[1].length - a[1].length
    );
    sorted.slice(0, 15).forEach(([pattern, routes], i) => {
      const uniqueRoutes = [...new Set(routes)];
      L.push(
        `**${i + 1}. ×${routes.length} occurrences across ${
          uniqueRoutes.length
        } route(s)**`
      );
      L.push("");
      L.push("```");
      L.push(pattern);
      L.push("```");
      L.push(
        "Routes: " +
          uniqueRoutes
            .slice(0, 8)
            .map((r) => "`" + r + "`")
            .join(", ")
      );
      L.push("");
    });
  }

  const warnRoutes = results.filter((r) => r.warnings.length > 0);
  if (warnRoutes.length > 0) {
    L.push(hr);
    L.push("## ⚠️  Warnings (non-blocking)");
    L.push(hr);
    L.push("");
    warnRoutes.slice(0, 10).forEach((r) => {
      L.push(`### \`${r.route}\``);
      r.warnings.slice(0, 3).forEach((w) => {
        L.push(`- \`[${w.type}]\` ${(w.text || "").slice(0, 200)}`);
      });
      L.push("");
    });
  }

  L.push(hr);
  L.push("## 📸 Screenshots");
  L.push(hr);
  L.push("");
  L.push(`All screenshots saved in \`manhal-diagnostic/screenshots/\``);
  L.push(`Total: **${meta.screenshotCount}** images (one per route)`);
  L.push("");
  L.push(hr);
  L.push("## 🎯 What I need from you (the assistant)");
  L.push(hr);
  L.push("");
  L.push("Read this report and produce **fix.cjs** that:");
  L.push("");
  L.push('1. Fixes every error listed in "Failing Routes — Details"');
  L.push("2. Adds missing imports to files referenced in the stack traces");
  L.push('3. Handles every error pattern from the "Error Patterns" section');
  L.push("4. Fixes any broken button click issues");
  L.push("5. Builds and pushes to GitHub");
  L.push("");
  L.push("Report generated by `smoke-report.cjs`.");
  L.push("");

  return L.join("\n");
}

async function main() {
  console.log("");
  console.log(
    " ╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    " ║   smoke-report.cjs — uses system Chrome/Edge                 ║"
  );
  console.log(
    " ╚══════════════════════════════════════════════════════════════╝"
  );

  ensureDir(OUT_DIR);
  ensureDir(SHOTS_DIR);

  console.log("");
  console.log(" ═══ 1. Dependencies ═══");
  await ensurePlaywright();

  console.log("");
  console.log(" ═══ 2. Build ═══");
  if (!fs.existsSync(path.join(ROOT, "node_modules"))) {
    execSync("npm install --no-audit --no-fund", {
      stdio: "inherit",
      cwd: ROOT,
    });
  }
  try {
    execSync("npm run build", { stdio: "inherit", cwd: ROOT });
    console.log("   ✓ Build OK");
  } catch {
    console.error(" ❌ Build failed — this IS the first bug.");
    process.exit(1);
  }

  console.log("");
  console.log(" ═══ 3. Preview server ═══");
  const server = spawn(
    "npx",
    ["vite", "preview", "--port", String(PORT), "--strictPort"],
    {
      cwd: ROOT,
      stdio: "pipe",
      shell: true,
    }
  );
  server.stdout.on("data", () => {});
  server.stderr.on("data", () => {});

  if (!(await waitForServer(`http://localhost:${PORT}/`))) {
    console.error(" ❌ preview server did not start");
    server.kill();
    process.exit(1);
  }
  console.log("   ✓ http://localhost:" + PORT);

  console.log("");
  console.log(" ═══ 4. Testing routes ═══");
  const PW = require("playwright");
  const browser = await launchBrowser(PW);
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await ctx.newPage();

  const results = [];
  for (let i = 0; i < ROUTES.length; i += 1) {
    const route = ROUTES[i];
    const prefix =
      "   [" + String(i + 1).padStart(2, "0") + "/" + ROUTES.length + "] ";

    process.stdout.write(prefix + route.padEnd(36));

    const r = await testRoute(page, route, i + 1);
    results.push(r);

    if (r.ok) console.log("✓  (" + r.clicksOk + " clicks)");
    else console.log("✗  (" + r.errors.length + " errors)");
  }

  await browser.close();
  server.kill();

  console.log("");
  console.log(" ═══ 5. Generating report ═══");

  const env = getEnvInfo();
  const meta = { screenshotCount: results.length };

  fs.writeFileSync(REPORT_MD, generateMarkdown(env, results, meta), "utf8");
  fs.writeFileSync(
    REPORT_JSON,
    JSON.stringify({ env, meta, results }, null, 2),
    "utf8"
  );

  const pass = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok).length;

  console.log("");
  console.log(
    " ╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    " ║   ✅ Report ready                                            ║"
  );
  console.log(
    " ╚══════════════════════════════════════════════════════════════╝"
  );
  console.log("");
  console.log("   Passed: " + pass + " / " + results.length);
  console.log("   Failed: " + fail);
  console.log("");
  console.log("   📄 Report (SEND THIS): " + REPORT_MD);
  console.log("   📸 Screenshots:        " + SHOTS_DIR);
  console.log("");
  console.log(
    " ═══════════════════════════════════════════════════════════════"
  );
  console.log("  ⏭️  الخطوة الجاية:");
  console.log("     1. افتح manhal-diagnostic/MANHAL-REPORT.md");
  console.log("     2. انسخ محتواه كامل وابعته للمساعد");
  console.log("     3. المساعد هيطلعلك fix.cjs نهائي");
  console.log(
    " ═══════════════════════════════════════════════════════════════"
  );
  console.log("");
}

main().catch((err) => {
  console.error("");
  console.error(" ❌ crash:", err.message);
  console.error(err.stack);
  process.exit(1);
});
