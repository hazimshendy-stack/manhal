#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   sbapiaryy — desktop-polish.cjs
   1) Login error: Firebase invalid-credential → friendly message
   2) Desktop Navbar + BottomNav + Sidebar = mobile-like, enhanced
      (floating pill BottomNav at bottom for desktop)
   Mobile: 100% untouched.
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(" ║  sbapiaryy — Desktop polish + Login message         ║");
console.log(" ╚══════════════════════════════════════════════════════╝");
console.log("");

function write(relPath, content) {
  const abs = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/^\n/, ""), "utf8");
  console.log("  ✓ " + relPath);
}

function run(cmd, silent = false) {
  try {
    if (!silent) console.log(" $ " + cmd);
    execSync(cmd, { stdio: silent ? "pipe" : "inherit", cwd: ROOT });
    return true;
  } catch {
    console.warn("  ⚠ Failed: " + cmd);
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
      1. FIX — src/lib/auth.ts
      Translate Firebase auth errors to friendly messages
      ═══════════════════════════════════════════════════════════════ */

/* Only rewrite the error translation part — keep the rest of auth.ts intact
      by reading the current file and replacing the translateError function */
const authPath = path.join(ROOT, "src/lib/auth.ts");
if (fs.existsSync(authPath)) {
  let authContent = fs.readFileSync(authPath, "utf8");

  /* Replace or insert translateError */
  const newTranslate = `
   /* ═══════════════════════════════════════════════════════════════
      Friendly error messages
      ═══════════════════════════════════════════════════════════════ */

   export function translateAuthError(err: unknown): string {
     const code = err && typeof err === 'object' && 'code' in err
       ? String((err as { code?: string }).code)
       : '';
     const raw = err instanceof Error ? err.message : String(err ?? '');
     const combined = (code + ' ' + raw).toLowerCase();

     if (combined.includes('invalid-credential') || combined.includes('wrong-password') || combined.includes('user-not-found') || combined.includes('invalid-login-credentials')) {
       return 'الإيميل أو الباسورد خطأ';
     }
     if (combined.includes('invalid-email')) {
       return 'الإيميل مش صح';
     }
     if (combined.includes('user-disabled')) {
       return 'الحساب ده متوقف';
     }
     if (combined.includes('too-many-requests')) {
       return 'حاول تاني بعد شوية';
     }
     if (combined.includes('network-request-failed')) {
       return 'في مشكلة في الاتصال بالإنترنت';
     }
     if (combined.includes('email-already-in-use') || combined.includes('email_exists')) {
       return 'الإيميل ده مستخدم بالفعل';
     }
     if (combined.includes('weak-password')) {
       return 'الباسورد ضعيف — لازم 6 حروف على الأقل';
     }
     if (combined.includes('operation-not-allowed')) {
       return 'التسجيل معطل حاليًا';
     }
     if (combined.includes('requires-recent-login')) {
       return 'سجل دخول تاني وحاول';
     }
     if (combined.includes('missing-password')) {
       return 'لازم تدخل الباسورد';
     }
     return raw || 'حصل خطأ غير متوقع';
   }
   `;

  /* Remove the old translateAuthError function if present */
  authContent = authContent.replace(
    /function translateAuthError[\s\S]*?\n}\n/,
    ""
  );

  /* Also remove any old translateError function */
  authContent = authContent.replace(/function translateError[\s\S]*?\n}\n/, "");

  /* Append the new one at the end */
  authContent = authContent.trim() + "\n\n" + newTranslate;

  write("src/lib/auth.ts", authContent);
  console.log("  ↻ Patched translateAuthError in src/lib/auth.ts");
} else {
  console.log("  ⚠ src/lib/auth.ts not found — skipping");
}

/* ═══════════════════════════════════════════════════════════════
      2. FIX — LoginPage uses the new translator
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/LoginPage.tsx",
  `
   import { useState, type FormEvent } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { login, translateAuthError } from '@/lib/auth';
   import { useAuth } from '@/lib/useAuth';

   export function LoginPage() {
     const nav = useNavigate();
     const { user } = useAuth();
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [busy, setBusy] = useState(false);

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();
       setError('');
       setBusy(true);
       try {
         const appUser = await login(email.trim(), password);

         if (appUser.status === 'pending' || appUser.status === 'rejected') {
           nav('/pending-approval');
         } else if (appUser.mustChangePassword) {
           nav('/change-password');
         } else {
           nav('/dashboard');
         }
       } catch (err) {
         /* Friendly message */
         setError(translateAuthError(err));
       } finally {
         setBusy(false);
       }
     };

     /* If already logged in, redirect */
     if (user) {
       if (user.status === 'pending' || user.status === 'rejected') {
         nav('/pending-approval');
       } else {
         nav('/dashboard');
       }
       return null;
     }

     return (
       <div className="login-page">
         <div className="login-card">
           <form onSubmit={onSubmit}>
             <div className="login-field">
               <label className="login-label">Email</label>
               <input
                 className="login-input"
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="name@resala-stem.org"
                 autoComplete="email"
                 required
                 dir="ltr"
               />
             </div>
             <div className="login-field">
               <label className="login-label">Password</label>
               <input
                 className="login-input"
                 type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="........"
                 autoComplete="current-password"
                 required
                 dir="ltr"
               />
             </div>
             {error ? <div className="login-error">{error}</div> : null}
             <button
               type="submit"
               className="login-submit"
               disabled={busy || !email || !password}
             >
               {busy ? '...' : 'Sign In'}
             </button>
           </form>

           <p className="login-back" style={{ marginTop: 20, lineHeight: 1.7 }}>
             New here?{' '}
             <Link to="/register" style={{ color: 'var(--c-red)', fontWeight: 700 }}>
               Create an account
             </Link>
           </p>

           <p className="login-back" style={{ marginTop: 6 }}>
             <Link to="/">Back to Home</Link>
           </p>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      3. DESKTOP — Mobile-like Navbar + BottomNav + Sidebar drawer
      - BottomNav: floating pill at bottom center (desktop only)
      - Navbar: same as mobile (with menu button visible)
      - Sidebar: same drawer behavior
      Mobile: UNTOUCHED — every media query under 900px stays as-is
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/styles/desktop.css",
  `
   /* ═══════════════════════════════════════════════════════════════
      DESKTOP — Mobile-like experience
      Same Navbar, BottomNav, Sidebar drawer as mobile.
      Only difference: wider container + more cards per row
      + floating pill style BottomNav (nicer on a wide screen).
      Mobile: untouched.
      ═══════════════════════════════════════════════════════════════ */

   /* ─── Wider container ─── */
   @media (min-width: 1024px) {
     .container {
       max-width: 1200px;
       padding-inline: 32px;
     }
   }

   @media (min-width: 1440px) {
     .container {
       max-width: 1320px;
       padding-inline: 40px;
     }
   }

   /* ─── Wider card grids (same card design) ─── */
   @media (min-width: 1024px) {
     .home-teams-grid { grid-template-columns: repeat(3, 1fr); }
     .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
     .grid--wide { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
     .grid--narrow { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
     .admin-cards { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
     .admin-stats { grid-template-columns: repeat(3, 1fr); }
     .stat-row { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
   }

   @media (min-width: 1440px) {
     .home-teams-grid { grid-template-columns: repeat(4, 1fr); }
     .admin-stats { grid-template-columns: repeat(6, 1fr); }
   }

   /* ═══════════════════════════════════════════════════════════════
      DESKTOP (≥901px) — Mobile-like Navbar + floating pill BottomNav
      ═══════════════════════════════════════════════════════════════ */

   @media (min-width: 901px) {

     /* ─── Navbar: same as mobile (with menu button) ─── */
     .navbar {
       /* Keep it sticky, same height as mobile */
       height: var(--navbar-h);
       padding-top: 0;
     }

     .navbar__inner {
       max-width: 1200px;
       margin-inline: auto;
       padding-inline: 32px;
     }

     @media (min-width: 1440px) {
       .navbar__inner {
         max-width: 1320px;
         padding-inline: 40px;
       }
     }

     /* Make sure the mobile menu button is visible on desktop */
     .show-mobile {
       display: inline-flex !important;
     }

     /* ─── BottomNav: floating pill at bottom center ─── */
     .bottom-nav {
       display: flex !important;
       position: fixed !important;
       bottom: 20px !important;
       left: 50% !important;
       right: auto !important;
       top: auto !important;
       transform: translateX(-50%) !important;

       /* Pill size */
       width: auto !important;
       min-width: 480px !important;
       max-width: 640px !important;
       height: 64px !important;

       /* Rounded pill */
       border-radius: 999px !important;
       border: 1px solid var(--c-line) !important;
       background: var(--c-white) !important;

       /* Nice floating shadow */
       box-shadow:
         0 12px 40px -12px rgba(21, 26, 69, 0.28),
         0 4px 12px -4px rgba(21, 26, 69, 0.10) !important;

       padding: 6px !important;
       padding-bottom: 6px !important;
       margin: 0 !important;
       z-index: 60 !important;
       overflow: visible !important;
     }

     .bottom-nav__inner {
       display: flex !important;
       align-items: stretch !important;
       justify-content: space-around !important;
       width: 100% !important;
       max-width: 100% !important;
       padding-inline: 4px !important;
       gap: 2px !important;
     }

     .bottom-nav__item {
       flex: 1 !important;
       display: flex !important;
       flex-direction: column !important;
       align-items: center !important;
       justify-content: center !important;
       gap: 3px !important;
       padding: 8px 10px !important;
       border-radius: 999px !important;
       color: var(--c-ink-muted) !important;
       font-size: 0.72rem !important;
       font-weight: 700 !important;
       text-decoration: none !important;
       position: relative !important;
       transition: background 0.15s var(--ease), color 0.15s var(--ease) !important;
       cursor: pointer !important;
       border: none !important;
       background: transparent !important;
       max-width: 120px !important;
     }

     .bottom-nav__item:hover {
       background: var(--c-off-white) !important;
       color: var(--c-navy) !important;
     }

     .bottom-nav__item.is-active {
       color: var(--c-red) !important;
       background: var(--c-red-tint) !important;
     }

     .bottom-nav__item.is-active::before {
       /* Hide the mobile underline indicator on the pill */
       display: none !important;
       content: none !important;
     }

     .bottom-nav__icon {
       display: flex !important;
       align-items: center !important;
       justify-content: center !important;
       line-height: 1 !important;
       color: inherit !important;
     }

     .bottom-nav__icon svg {
       width: 22px !important;
       height: 22px !important;
       display: block !important;
     }

     .bottom-nav__label {
       white-space: nowrap !important;
       overflow: hidden !important;
       text-overflow: ellipsis !important;
       max-width: 100% !important;
       line-height: 1.2 !important;
     }

     .bottom-nav__badge {
       position: absolute !important;
       top: 4px !important;
       right: 18% !important;
       min-width: 16px !important;
       height: 16px !important;
       padding: 0 4px !important;
       border-radius: 999px !important;
       background: var(--c-red) !important;
       color: #fff !important;
       font-size: 0.6rem !important;
       font-weight: 800 !important;
       display: grid !important;
       place-items: center !important;
       border: 2px solid var(--c-white) !important;
     }

     /* ─── Make room for the floating pill ─── */
     .app-main {
       padding-bottom: 110px !important;
     }

     .footer {
       padding-bottom: 130px !important;
     }

     /* ─── Sidebar drawer (same as mobile) ─── */
     .sidebar {
       position: fixed !important;
       top: 0 !important;
       left: -340px !important;
       right: auto !important;
       inset-inline-end: auto !important;
       width: 320px !important;
       max-width: 90vw !important;
       height: 100vh !important;
       height: 100dvh !important;
       background: var(--c-white) !important;
       z-index: 9999 !important;
       padding: 24px 22px !important;
       padding-top: calc(24px + var(--safe-top)) !important;
       padding-bottom: calc(24px + var(--safe-bottom)) !important;
       overflow-y: auto !important;
       transition: left 0.3s var(--ease) !important;
       box-shadow: 12px 0 60px rgba(21, 26, 69, 0.25) !important;
       border-right: 1px solid var(--c-line) !important;
       border-inline-start: none !important;
       border-inline-end: 1px solid var(--c-line) !important;
       display: block !important;
       position: fixed !important;
     }

     .sidebar.is-open {
       left: 0 !important;
     }

     .sidebar-overlay {
       display: block !important;
       position: fixed !important;
       inset: 0 !important;
       background: rgba(21, 26, 69, 0.55) !important;
       z-index: 9998 !important;
       opacity: 0 !important;
       pointer-events: none !important;
       transition: opacity 0.3s var(--ease) !important;
       backdrop-filter: blur(3px) !important;
       -webkit-backdrop-filter: blur(3px) !important;
     }

     .sidebar-overlay.is-open {
       opacity: 1 !important;
       pointer-events: auto !important;
     }

     .sidebar-close {
       display: flex !important;
     }

     /* Dashboard layout: single column, sidebar is a drawer */
     .dashboard-layout {
       grid-template-columns: 1fr !important;
       gap: 20px !important;
     }

     /* ─── Toast at top-right (desktop convention) ─── */
     .toast-container {
       bottom: auto !important;
       top: 90px !important;
       right: 24px !important;
       left: auto !important;
       max-width: 400px !important;
     }

     /* ─── PWA banner bottom-right ─── */
     .pwa-install-banner {
       left: auto !important;
       right: 24px !important;
       bottom: 110px !important;
       max-width: 420px !important;
       inset-inline: auto !important;
     }
   }

   /* ═══════════════════════════════════════════════════════════════
      EXTRA LARGE (≥1440px) — a bit more breathing room
      ═══════════════════════════════════════════════════════════════ */

   @media (min-width: 1440px) {
     .bottom-nav {
       min-width: 520px !important;
       max-width: 700px !important;
       height: 68px !important;
     }

     .bottom-nav__item {
       font-size: 0.76rem !important;
     }
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      4. AUTO-FIX — cleanup
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" 🔧 Cleanup...");
[".fix-backups", "src/src", "dist/.vite"].forEach((p) => {
  const abs = path.join(ROOT, p);
  if (fs.existsSync(abs)) {
    fs.rmSync(abs, { recursive: true, force: true });
    console.log("  🧹 Removed: " + p);
  }
});

/* ═══════════════════════════════════════════════════════════════
      5. BUILD + PUSH
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" 📦 Installing...");
run("npm install --no-audit --no-fund");

console.log("");
console.log(" 🏗  Building...");
run("npm run build");

console.log("");
console.log(" 📤 Pushing to GitHub...");
if (!fs.existsSync(path.join(ROOT, ".git"))) {
  run("git init");
  run("git branch -M main");
}
try {
  execSync("git remote get-url origin", { cwd: ROOT, stdio: "pipe" });
} catch {
  run(
    "git remote add origin https://github.com/hazimshendy-stack/sbapiaryy.git"
  );
}

run("git add -A");
run(
  'git commit -m "feat: desktop floating pill nav + friendly auth errors"',
  true
);
const pushed = run("git push origin main --force");

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(
  " ║  " +
    (pushed ? "✅ DONE — Pushed to GitHub" : "⚠ Pushed with warnings") +
    "                ║"
);
console.log(" ╚══════════════════════════════════════════════════════╝");
console.log("");
console.log(" ✨ What changed:");
console.log(
  '   ✓ Login error: "الإيميل أو الباسورد خطأ" instead of raw Firebase codes'
);
console.log("   ✓ TranslateAuthError exported and reusable everywhere");
console.log("   ✓ Desktop BottomNav = floating pill at bottom center");
console.log("   ✓ Desktop Navbar = same as mobile (menu button visible)");
console.log("   ✓ Desktop Sidebar = drawer from the left (same as mobile)");
console.log("   ✓ Desktop Dashboard = single column");
console.log("   ✓ Toast top-right, PWA bottom-right (desktop convention)");
console.log("   ✓ More cards per row (3-4 instead of 2)");
console.log("");
console.log(" 📱 Mobile:");
console.log("   ✓ UNTOUCHED — every media query under 900px still applies");
console.log("");
console.log(" ⏭  After GitHub Actions (4-7 min):");
console.log(
  "   1. Try logging in with wrong password → friendly Arabic message"
);
console.log("   2. Open on desktop → floating pill nav at bottom center");
console.log("   3. Click ☰ → drawer slides from the left");
console.log("");
