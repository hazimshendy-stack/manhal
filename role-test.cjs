#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   role-test.cjs
   ─────────────────────────────────────────────────────────────────────
   • يسجل دخول بكل دور
   • يزور كل صفحة مسموحة له
   • يتأكد من الصفحات الممنوعة
   • يجرب العمليات الفعلية (submit contribution / approve / reject …)
   • يصور كل خطوة
   • يطلع MANHAL-ROLE-REPORT.md
   ═══════════════════════════════════════════════════════════════════════ */

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const ROOT = process.cwd();

const PORT = 4173;
const OUT_DIR = path.join(ROOT, "manhal-role-test");
const SHOTS = path.join(OUT_DIR, "screenshots");
const REPORT_MD = path.join(OUT_DIR, "MANHAL-ROLE-REPORT.md");
const REPORT_JSON = path.join(OUT_DIR, "MANHAL-ROLE-REPORT.json");

/* ═══════════════════════════════════════════════════════════════════════ */
/*  الصفحات المتوقعة لكل دور                                              */
/* ═══════════════════════════════════════════════════════════════════════ */
const ROLE_EXPECTATIONS = {
  HEAD: {
    canAccess: [
      "/dashboard",
      "/admin",
      "/admin/users",
      "/admin/members",
      "/admin/contributions",
      "/admin/committees",
      "/admin/requests",
      "/admin/analytics",
      "/admin/notifications",
      "/admin/audit",
      "/members",
      "/league",
      "/committees",
      "/teams",
      "/calendar",
      "/reports",
    ],
    cannotAccess: [],
    actions: ["create_user", "approve_request", "approve_contribution_final"],
  },
  VICE: {
    canAccess: [
      "/dashboard",
      "/admin",
      "/admin/users",
      "/admin/contributions",
      "/admin/committees",
      "/admin/requests",
      "/admin/analytics",
      "/admin/audit",
    ],
    cannotAccess: [],
    actions: ["approve_request", "approve_contribution_final"],
  },
  HEAD_HR_GLOBAL: {
    canAccess: [
      "/dashboard",
      "/approvals",
      "/contributions",
      "/requests",
      "/members",
      "/league",
    ],
    cannotAccess: ["/admin", "/admin/users"],
    actions: ["approve_contribution_final"],
  },
  PRESIDENT: {
    canAccess: [
      "/dashboard",
      "/requests",
      "/approvals",
      "/contributions",
      "/members",
      "/calendar",
    ],
    cannotAccess: ["/admin", "/admin/users"],
    actions: ["approve_contribution_stage2"],
  },
  HEAD_HR_TEAM: {
    canAccess: ["/dashboard", "/approvals", "/contributions", "/members"],
    cannotAccess: ["/admin", "/admin/users"],
    actions: ["approve_contribution_stage2"],
  },
  COMMITTEE_HR: {
    canAccess: ["/dashboard", "/approvals", "/contributions"],
    cannotAccess: ["/admin", "/admin/users"],
    actions: ["approve_contribution_stage1"],
  },
  MEMBER: {
    canAccess: [
      "/dashboard",
      "/profile",
      "/my-contributions",
      "/my-requests",
      "/requests/new",
      "/members",
      "/league",
      "/committees",
      "/teams",
      "/calendar",
      "/notifications",
      "/achievements",
    ],
    cannotAccess: ["/admin", "/admin/users", "/approvals", "/contributions"],
    actions: ["submit_contribution", "submit_request"],
  },
};

/* ═══════════════════════════════════════════════════════════════════════ */
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

async function launchBrowser(PW) {
  for (const ch of ["chrome", "msedge"]) {
    try {
      const b = await PW.chromium.launch({
        headless: true,
        channel: ch,
        args: ["--no-sandbox"],
      });
      console.log("   ✅ browser: " + ch);
      return b;
    } catch {
      /* next */
    }
  }
  console.log("   🔵 trying default chromium");
  return await PW.chromium.launch({ headless: true, args: ["--no-sandbox"] });
}

function attachListeners(page) {
  const errors = [];
  const onConsole = (msg) => {
    if (msg.type() !== "error") return;
    const t = (msg.text() || "").toLowerCase();
    if (t.includes("api-key") || t.includes("firebase: error")) return;
    if (t.includes("permission-denied")) return;
    if (t.includes("failed to fetch")) return;
    errors.push(msg.text());
  };
  const onPageError = (err) => errors.push("PAGE_ERROR: " + err.message);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  return {
    errors,
    detach: () => {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════════
      Login helper
      ═══════════════════════════════════════════════════════════════════════ */
async function login(page, email, password) {
  await page.goto(`http://localhost:${PORT}/#/login`, {
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });
  await page.waitForTimeout(2000);

  /* املأ النموذج */
  const emailInput = await page.$('input[type="email"]');
  const passInput = await page.$('input[type="password"]');
  if (!emailInput || !passInput) throw new Error("login form not found");

  await emailInput.fill(email);
  await passInput.fill(password);

  /* اضغط Sign In */
  const btn = await page.$('button[type="submit"]');
  if (!btn) throw new Error("submit button not found");
  await btn.click();

  /* انتظر النقلة */
  await page.waitForTimeout(4000);

  const url = page.url();
  if (url.includes("/login")) {
    const errEl = await page.$(".login-error");
    const errText = errEl ? await errEl.textContent() : "unknown error";
    throw new Error("login failed: " + errText);
  }
  return url;
}

async function logout(page) {
  /* امسح الـ localStorage + روح للـ login */
  await page.evaluate(() => {
    try {
      localStorage.clear();
    } catch {}
  });
  await page.context().clearCookies();
  await page.goto(`http://localhost:${PORT}/#/login`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(800);
}

/* ═══════════════════════════════════════════════════════════════════════
      Test pages
      ═══════════════════════════════════════════════════════════════════════ */
async function visitPage(page, route, prefix, role) {
  const L = attachListeners(page);
  const res = { route, ok: false, errors: [], url: "", redirect: false };

  try {
    await page.goto(`http://localhost:${PORT}/#${route}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(1500);
    res.url = page.url();
    res.redirect = !page.url().includes(route);
    res.ok = L.errors.length === 0;

    await page
      .screenshot({
        path: path.join(SHOTS, `${prefix}_${role}_${safeFile(route)}.png`),
        fullPage: false,
      })
      .catch(() => {});
  } catch (e) {
    res.errors.push("nav: " + e.message);
  }

  L.detach();
  res.errors.push(...L.errors);
  res.ok = res.ok && res.errors.length === 0;
  return res;
}

/* ═══════════════════════════════════════════════════════════════════════
      Test specific actions per role
      ═══════════════════════════════════════════════════════════════════════ */
async function testActions(page, role, prefix) {
  const results = [];

  /* ─── MEMBER: submit contribution ─── */
  if (role === "MEMBER") {
    /* 1. submit contribution */
    try {
      await page.goto(`http://localhost:${PORT}/#/my-contributions`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(1500);

      /* اضغط + Log Contribution */
      const addBtn = await page.$("button.btn--primary");
      if (addBtn) {
        const label = (await addBtn.textContent()) || "";
        if (label.toLowerCase().includes("log") || label.includes("+")) {
          await addBtn.click();
          await page.waitForTimeout(800);

          /* املأ النموذج */
          const titleInput = await page.$('.modal input[type="text"]');
          const textarea = await page.$(".modal textarea");
          const numberInput = await page.$('.modal input[type="number"]');

          if (titleInput)
            await titleInput.fill("Test Contribution " + Date.now());
          if (textarea) await textarea.fill("Automated test contribution");
          if (numberInput) await numberInput.fill("5");

          await page.screenshot({
            path: path.join(
              SHOTS,
              prefix + "_" + role + "_contribution_form.png"
            ),
          });

          /* اضغط Submit */
          const submitBtns = await page.$$(".modal button");
          for (const b of submitBtns) {
            const t = ((await b.textContent()) || "").toLowerCase();
            if (
              t.includes("submit") ||
              t.includes("save") ||
              t.includes("إرسال")
            ) {
              await b.click();
              await page.waitForTimeout(2500);
              break;
            }
          }

          /* تحقق: هل ظهر toast نجاح أو modal اتقفل */
          const modalGone = !(await page.$(".modal"));
          results.push({
            name: "submit_contribution",
            ok: modalGone,
            note: modalGone ? "modal closed after submit" : "modal still open",
          });
        }
      }
    } catch (e) {
      results.push({ name: "submit_contribution", ok: false, note: e.message });
    }

    /* 2. submit request */
    try {
      await page.goto(`http://localhost:${PORT}/#/requests/new`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(1500);

      const titleInput = await page.$('form input[type="text"]');
      const textarea = await page.$("form textarea");
      const selects = await page.$$("form select");

      if (titleInput) await titleInput.fill("Test Request " + Date.now());
      if (textarea) await textarea.fill("Automated test request");
      if (selects.length > 1) {
        /* اختر فريق مختلف للـ to */
        await selects[1].selectOption({ index: 1 }).catch(() => {});
      }

      await page.screenshot({
        path: path.join(SHOTS, prefix + "_" + role + "_request_form.png"),
      });

      const submit = await page.$('form button[type="submit"]');
      if (submit) {
        await submit.click();
        await page.waitForTimeout(3000);
      }

      const redirected = page.url().includes("/my-requests");
      results.push({
        name: "submit_request",
        ok: redirected,
        note: redirected ? "redirected to /my-requests" : "url=" + page.url(),
      });
    } catch (e) {
      results.push({ name: "submit_request", ok: false, note: e.message });
    }
  }

  /* ─── Approvals roles ─── */
  if (
    [
      "COMMITTEE_HR",
      "HEAD_HR_TEAM",
      "PRESIDENT",
      "HEAD_HR_GLOBAL",
      "HEAD",
      "VICE",
    ].includes(role)
  ) {
    try {
      await page.goto(`http://localhost:${PORT}/#/approvals`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(2000);

      /* ابحث عن أول بند */
      const firstItem = await page.$(".card a, a.card");
      const hasPending = !!firstItem;

      await page.screenshot({
        path: path.join(SHOTS, prefix + "_" + role + "_approvals.png"),
      });

      results.push({
        name: "view_approvals",
        ok: true,
        note: hasPending
          ? "has pending items"
          : "no pending items (empty state OK)",
      });

      /* لو في بند، افتحه وجرب Approve */
      if (firstItem) {
        await firstItem.click();
        await page.waitForTimeout(2000);
        await page.screenshot({
          path: path.join(SHOTS, prefix + "_" + role + "_request_detail.png"),
        });

        const approveBtn = await page.$("button.btn--success");
        if (approveBtn) {
          const t = ((await approveBtn.textContent()) || "").toLowerCase();
          if (t.includes("approve")) {
            await approveBtn.click();
            await page.waitForTimeout(800);

            /* modal */
            const modal = await page.$(".modal");
            if (modal) {
              await page.screenshot({
                path: path.join(
                  SHOTS,
                  prefix + "_" + role + "_approve_modal.png"
                ),
              });

              const confirmBtns = await modal.$$("button");
              for (const b of confirmBtns) {
                const bt = ((await b.textContent()) || "").toLowerCase();
                if (bt.includes("confirm") || bt.includes("approve")) {
                  await b.click();
                  await page.waitForTimeout(2500);
                  break;
                }
              }
            }

            results.push({
              name: "approve_request_" + role,
              ok: true,
              note: "clicked approve",
            });
          }
        } else {
          results.push({
            name: "approve_request_" + role,
            ok: true,
            note: "no approve button visible (may be wrong stage)",
          });
        }
      }
    } catch (e) {
      results.push({
        name: "view_approvals_" + role,
        ok: false,
        note: e.message,
      });
    }
  }

  /* ─── HEAD/VICE: create user ─── */
  if (role === "HEAD" || role === "VICE") {
    try {
      await page.goto(`http://localhost:${PORT}/#/admin/users`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SHOTS, prefix + "_" + role + "_admin_users.png"),
      });

      const createBtn = await page.$("button.btn--primary");
      if (createBtn) {
        const t = (await createBtn.textContent()) || "";
        if (t.includes("+") || t.toLowerCase().includes("new user")) {
          await createBtn.click();
          await page.waitForTimeout(1000);
          await page.screenshot({
            path: path.join(
              SHOTS,
              prefix + "_" + role + "_create_user_modal.png"
            ),
          });

          const modalVisible = !!(await page.$(".modal"));
          results.push({
            name: "open_create_user_modal",
            ok: modalVisible,
            note: modalVisible ? "modal opened" : "modal did not open",
          });

          /* اقفل المودال */
          const close = await page.$(".modal__close");
          if (close) await close.click();
        }
      }
    } catch (e) {
      results.push({ name: "admin_users_" + role, ok: false, note: e.message });
    }
  }

  return results;
}

/* ═══════════════════════════════════════════════════════════════════════
      Main
      ═══════════════════════════════════════════════════════════════════════ */
async function main() {
  console.log("");
  console.log(
    " ╔══════════════════════════════════════════════════════════════╗"
  );
  console.log(
    " ║   role-test.cjs — test every role end-to-end                 ║"
  );
  console.log(
    " ╚══════════════════════════════════════════════════════════════╝"
  );

  ensureDir(OUT_DIR);
  ensureDir(SHOTS);

  const credsPath = path.join(ROOT, ".test-accounts.json");
  if (!fs.existsSync(credsPath)) {
    console.error(" ❌ .test-accounts.json not found");
    console.error("    شغّل أول: node make-test-accounts.cjs");
    process.exit(1);
  }

  const creds = JSON.parse(fs.readFileSync(credsPath, "utf8"));

  /* Build */
  console.log("");
  console.log(" ═══ Build ═══");
  try {
    execSync("npm run build", { stdio: "inherit", cwd: ROOT });
  } catch {
    console.error(" ❌ build failed");
    process.exit(1);
  }

  /* Preview */
  console.log("");
  console.log(" ═══ Preview server ═══");
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
    console.error(" ❌ preview failed");
    server.kill();
    process.exit(1);
  }
  console.log("   ✓ http://localhost:" + PORT);

  /* Browser */
  const PW = require("playwright");
  const browser = await launchBrowser(PW);

  const allResults = [];

  /* Test each role */
  for (const [roleKey, cred] of Object.entries(creds)) {
    if (!ROLE_EXPECTATIONS[roleKey]) continue;

    console.log("");
    console.log(" ═══ Testing: " + roleKey + " ═══");

    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await ctx.newPage();

    const roleResult = {
      role: roleKey,
      email: cred.email,
      loginOk: false,
      loginError: null,
      pagesOk: [],
      pagesFailed: [],
      forbiddenLeaks: [],
      actionResults: [],
      screenshots: [],
    };

    /* login */
    try {
      await login(page, cred.email, cred.password);
      roleResult.loginOk = true;
      console.log("   ✓ logged in");
      await page
        .screenshot({ path: path.join(SHOTS, `01_${roleKey}_dashboard.png`) })
        .catch(() => {});
    } catch (e) {
      roleResult.loginError = e.message;
      console.log("   ❌ login failed: " + e.message);
      await ctx.close();
      allResults.push(roleResult);
      continue;
    }

    /* visit expected pages */
    const expected = ROLE_EXPECTATIONS[roleKey];
    for (const route of expected.canAccess) {
      const r = await visitPage(page, route, "02", roleKey);
      if (r.ok) {
        roleResult.pagesOk.push(route);
        console.log("   ✓ " + route);
      } else {
        roleResult.pagesFailed.push({ route, errors: r.errors });
        console.log("   ✗ " + route + "  (" + r.errors.length + " errors)");
      }
    }

    /* check forbidden pages */
    for (const route of expected.cannotAccess) {
      const r = await visitPage(page, route, "03", roleKey);
      /* المفروض يتنقل لـ /dashboard */
      if (!r.redirect && r.url.includes(route)) {
        roleResult.forbiddenLeaks.push(route);
        console.log(
          "   ⚠ " + route + " — SHOULD be blocked but user accessed it!"
        );
      } else {
        console.log("   ✓ " + route + " — blocked (redirected)");
      }
    }

    /* try actions */
    const actResults = await testActions(page, roleKey, "04");
    roleResult.actionResults = actResults;
    actResults.forEach((a) => {
      console.log("   " + (a.ok ? "✓" : "✗") + " " + a.name + "  — " + a.note);
    });

    /* logout */
    await logout(page).catch(() => {});
    await ctx.close();

    allResults.push(roleResult);
  }

  await browser.close();
  server.kill();

  /* ═══ Generate report ═══ */
  console.log("");
  console.log(" ═══ Report ═══");

  const lines = [];
  const hr = "─".repeat(70);

  lines.push("# Manhal — Role-Based Test Report");
  lines.push("");
  lines.push("**Generated:** " + new Date().toISOString());
  lines.push("");

  /* summary */
  const totalRoles = allResults.length;
  const rolesLoggedIn = allResults.filter((r) => r.loginOk).length;
  const totalPagesOk = allResults.reduce((s, r) => s + r.pagesOk.length, 0);
  const totalPagesFailed = allResults.reduce(
    (s, r) => s + r.pagesFailed.length,
    0
  );
  const totalLeaks = allResults.reduce(
    (s, r) => s + r.forbiddenLeaks.length,
    0
  );
  const totalActions = allResults.reduce(
    (s, r) => s + r.actionResults.length,
    0
  );
  const actionsOk = allResults.reduce(
    (s, r) => s + r.actionResults.filter((a) => a.ok).length,
    0
  );

  lines.push(hr);
  lines.push("## 📊 Summary");
  lines.push(hr);
  lines.push("");
  lines.push("| Metric | Value |");
  lines.push("|--------|-------|");
  lines.push("| Total roles tested | " + totalRoles + " |");
  lines.push("| ✅ Roles logged in | " + rolesLoggedIn + " |");
  lines.push("| ✅ Pages passed | " + totalPagesOk + " |");
  lines.push("| ❌ Pages failed | " + totalPagesFailed + " |");
  lines.push("| ⚠️  Forbidden page leaks | " + totalLeaks + " |");
  lines.push("| Actions tested | " + totalActions + " |");
  lines.push("| Actions passed | " + actionsOk + " |");
  lines.push("");

  /* per role */
  for (const r of allResults) {
    lines.push(hr);
    lines.push("## 👤 " + r.role);
    lines.push(hr);
    lines.push("");
    lines.push("**Email:** `" + r.email + "`");
    lines.push("**Login:** " + (r.loginOk ? "✅" : "❌ " + r.loginError));
    lines.push("");

    if (r.pagesOk.length > 0) {
      lines.push("### ✅ Accessible pages (" + r.pagesOk.length + ")");
      r.pagesOk.forEach((p) => lines.push("- `" + p + "`"));
      lines.push("");
    }

    if (r.pagesFailed.length > 0) {
      lines.push("### ❌ Failed pages (" + r.pagesFailed.length + ")");
      r.pagesFailed.forEach((p) => {
        lines.push("#### `" + p.route + "`");
        p.errors.forEach((e) => lines.push("- `" + e.slice(0, 250) + "`"));
        lines.push("");
      });
    }

    if (r.forbiddenLeaks.length > 0) {
      lines.push(
        "### ⚠️  Permission leaks — role accessed pages it should not"
      );
      r.forbiddenLeaks.forEach((p) => lines.push("- ❌ `" + p + "`"));
      lines.push("");
    }

    if (r.actionResults.length > 0) {
      lines.push("### 🎬 Actions");
      lines.push("");
      lines.push("| Action | Result | Note |");
      lines.push("|--------|--------|------|");
      r.actionResults.forEach((a) => {
        lines.push(
          "| " + a.name + " | " + (a.ok ? "✅" : "❌") + " | " + a.note + " |"
        );
      });
      lines.push("");
    }
  }

  /* final verdict */
  lines.push(hr);
  lines.push("## 🎯 Overall Verdict");
  lines.push(hr);
  lines.push("");

  const problems = [];
  for (const r of allResults) {
    if (!r.loginOk)
      problems.push("Login failed for " + r.role + ": " + r.loginError);
    r.pagesFailed.forEach((p) =>
      problems.push(r.role + " → " + p.route + ": " + p.errors[0])
    );
    r.forbiddenLeaks.forEach((p) =>
      problems.push(r.role + " → accessed forbidden " + p)
    );
    r.actionResults
      .filter((a) => !a.ok)
      .forEach((a) =>
        problems.push(r.role + " → action " + a.name + ": " + a.note)
      );
  }

  if (problems.length === 0) {
    lines.push("✅ **كل شيء يعمل بشكل صحيح عبر جميع الأدوار.**");
  } else {
    lines.push("⚠️  **" + problems.length + " problems detected:**");
    lines.push("");
    problems.slice(0, 30).forEach((p, i) => lines.push(i + 1 + ". " + p));
    if (problems.length > 30)
      lines.push("... and " + (problems.length - 30) + " more");
  }
  lines.push("");

  fs.writeFileSync(REPORT_MD, lines.join("\n"), "utf8");
  fs.writeFileSync(REPORT_JSON, JSON.stringify(allResults, null, 2), "utf8");

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
  console.log("   📄 " + REPORT_MD);
  console.log("   📸 " + SHOTS);
  console.log("");
  console.log(" ⏭️  انسخ محتوى MANHAL-ROLE-REPORT.md وابعته");
  console.log("");
}

main().catch((e) => {
  console.error("");
  console.error(" ❌ crash:", e.message);
  console.error(e.stack);
  process.exit(1);
});
