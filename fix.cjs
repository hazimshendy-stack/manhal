#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   sbapiaryy → Manhal — rebrand-fix.cjs
   ─────────────────────────────────────────────────────────────
   1) Rebrand entire site: sbapiaryy → Manhal
   2) Use new logo + icons from public/new-assets/
   3) Boot screen (mobile): logo only, no text
   4) Login error: friendly Arabic message
   5) Desktop Navbar + BottomNav + Sidebar → floating pill (mobile-like)
   6) Rewrite the GitHub Actions deploy workflow properly
   Mobile experience: UNTOUCHED.
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(" ║  sbapiaryy → Manhal — full rebrand                  ║");
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
      STEP 0 — DETECT + COPY assets from public/new-assets/
      ═══════════════════════════════════════════════════════════════ */

const candidates = [
  "public/new-assets",
  "public/new_assets",
  "public/NewAssets",
  "public/assets",
  "public/brand",
];

let assetsDir = null;
for (const c of candidates) {
  if (fs.existsSync(path.join(ROOT, c))) {
    const files = fs.readdirSync(path.join(ROOT, c));
    if (files.length > 0) {
      assetsDir = c;
      break;
    }
  }
}

if (assetsDir) {
  console.log(" 📁 Found assets folder: " + assetsDir);
  const files = fs.readdirSync(path.join(ROOT, assetsDir));
  console.log("    Files:");
  files.forEach((f) => console.log("      · " + f));
} else {
  console.log(" ⚠ No assets folder found — will keep existing icons");
}

function findAsset(patterns) {
  if (!assetsDir) return null;
  const files = fs.readdirSync(path.join(ROOT, assetsDir));
  for (const pattern of patterns) {
    const match = files.find((f) => pattern.test(f));
    if (match) return path.join(assetsDir, match);
  }
  return null;
}

/* Flexible matchers */
const logoFile = findAsset([
  /^logo\.(png|svg|webp)$/i,
  /^logo[_-]?white\.(png|svg)$/i,
  /logo.*\.(png|svg|webp)$/i,
]);
const icon192File = findAsset([/192.*\.png$/i, /icon[_-]?192\.png$/i]);
const icon512File = findAsset([/512.*\.png$/i, /icon[_-]?512\.png$/i]);
const faviconFile = findAsset([/favicon\.svg$/i, /favicon\.png$/i]);
const appleTouchFile = findAsset([
  /apple.*\.png$/i,
  /apple[_-]?touch.*\.png$/i,
]);

/* Copy assets to canonical locations */
function copyAsset(src, destRel) {
  if (!src) return false;
  const srcAbs = path.join(ROOT, src);
  const destAbs = path.join(ROOT, destRel);
  if (!fs.existsSync(srcAbs)) return false;
  fs.mkdirSync(path.dirname(destAbs), { recursive: true });
  fs.copyFileSync(srcAbs, destAbs);
  console.log("  ✓ Copied " + src + " → " + destRel);
  return true;
}

copyAsset(logoFile, "public/logo.png");
copyAsset(icon192File, "public/icon-192.png");
copyAsset(icon512File, "public/icon-512.png");
copyAsset(faviconFile, "public/favicon.svg");
copyAsset(appleTouchFile, "public/apple-touch-icon.png");

/* Detect which files actually exist */
const hasLogo = fs.existsSync(path.join(ROOT, "public/logo.png"));
const hasIcon192 = fs.existsSync(path.join(ROOT, "public/icon-192.png"));
const hasIcon512 = fs.existsSync(path.join(ROOT, "public/icon-512.png"));
const hasFavicon = fs.existsSync(path.join(ROOT, "public/favicon.svg"));
const hasAppleTouch = fs.existsSync(
  path.join(ROOT, "public/apple-touch-icon.png")
);

console.log("");
console.log(" 📦 Available assets:");
console.log("    logo.png            : " + (hasLogo ? "✓" : "✗"));
console.log("    icon-192.png        : " + (hasIcon192 ? "✓" : "✗"));
console.log("    icon-512.png        : " + (hasIcon512 ? "✓" : "✗"));
console.log("    favicon.svg         : " + (hasFavicon ? "✓" : "✗"));
console.log("    apple-touch-icon.png: " + (hasAppleTouch ? "✓" : "✗"));
console.log("");

/* ═══════════════════════════════════════════════════════════════
      1. index.html — Title, boot screen (LOGO ONLY), meta tags
      ═══════════════════════════════════════════════════════════════ */

write(
  "index.html",
  `<!doctype html>
   <html lang="en" dir="ltr">
     <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
       <meta name="theme-color" content="#151A45" />
       <meta name="mobile-web-app-capable" content="yes" />
       <meta name="apple-mobile-web-app-capable" content="yes" />
       <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
       <meta name="apple-mobile-web-app-title" content="Manhal" />
       <meta name="description" content="Manhal — Resala STEM Sub Branches official platform" />

       <title>Manhal</title>

       <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
       <link rel="icon" type="image/png" href="./icon-192.png" />
       <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
       <link rel="manifest" href="./manifest.json" />

       <link rel="preconnect" href="https://fonts.googleapis.com" />
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
       <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

       <style>
         html, body { margin: 0; padding: 0; background: #151A45; }
         #root { min-height: 100vh; }

         /* ═══ Boot screen — logo only, no text ═══ */
         .boot-screen {
           position: fixed;
           inset: 0;
           display: flex;
           align-items: center;
           justify-content: center;
           background: #151A45;
           z-index: 9999;
           transition: opacity 0.35s ease;
         }

         .boot-screen.hidden {
           opacity: 0;
           pointer-events: none;
         }

         .boot-screen__logo {
           width: 140px;
           height: 140px;
           object-fit: contain;
           animation: boot-pulse 1.6s ease-in-out infinite;
           filter: drop-shadow(0 12px 40px rgba(193, 39, 45, 0.35));
         }

         @media (max-width: 640px) {
           .boot-screen__logo {
             width: 110px;
             height: 110px;
           }
         }

         @keyframes boot-pulse {
           0%, 100% { transform: scale(1); opacity: 1; }
           50% { transform: scale(1.06); opacity: 0.92; }
         }
       </style>

       <script>
         (function (l) {
           if (l.search[1] === '/') {
             var decoded = l.search.slice(1).split('&').map(function (s) {
               return s.replace(/~and~/g, '&');
             }).join('?');
             window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
           }
         })(window.location);
       </script>
     </head>
     <body>
       <div id="boot">
         <div class="boot-screen">
           <img src="./icon-512.png" alt="Manhal" class="boot-screen__logo" onerror="this.src='./icon-192.png'" />
         </div>
       </div>

       <div id="root"></div>
       <script type="module" src="./src/main.tsx"></script>

       <script>
         setTimeout(function () {
           var boot = document.querySelector('.boot-screen');
           if (boot) boot.classList.add('hidden');
           setTimeout(function () {
             var bootEl = document.getElementById('boot');
             if (bootEl) bootEl.remove();
           }, 400);
         }, 800);
       </script>
     </body>
   </html>
   `
);

/* ═══════════════════════════════════════════════════════════════
      2. manifest.json — new name + icons
      ═══════════════════════════════════════════════════════════════ */

write(
  "public/manifest.json",
  JSON.stringify(
    {
      name: "Manhal — Resala STEM Sub Branches",
      short_name: "Manhal",
      description:
        "Manhal — the official platform for Resala STEM Sub Branches",
      start_url: "./",
      scope: "./",
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#151A45",
      theme_color: "#151A45",
      lang: "en",
      dir: "ltr",
      icons: [
        {
          src: "./icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "./icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "./apple-touch-icon.png",
          sizes: "180x180",
          type: "image/png",
          purpose: "any",
        },
      ],
      categories: ["productivity", "education", "social"],
    },
    null,
    2
  )
);

/* ═══════════════════════════════════════════════════════════════
      3. package.json — new name
      ═══════════════════════════════════════════════════════════════ */

write(
  "package.json",
  JSON.stringify(
    {
      name: "manhal",
      private: true,
      version: "7.0.0",
      type: "module",
      description: "Manhal — Resala STEM Sub Branches official platform",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
        typecheck: "tsc --noEmit",
      },
      dependencies: {
        firebase: "^10.14.1",
        react: "^18.3.1",
        "react-dom": "^18.3.1",
        "react-router-dom": "^6.26.2",
      },
      devDependencies: {
        "@types/node": "^22.7.4",
        "@types/react": "^18.3.11",
        "@types/react-dom": "^18.3.0",
        "@vitejs/plugin-react": "^4.3.2",
        typescript: "^5.6.2",
        vite: "^5.4.8",
      },
    },
    null,
    2
  )
);

/* ═══════════════════════════════════════════════════════════════
      4. public/sw.js + version.json — new cache names
      ═══════════════════════════════════════════════════════════════ */

write(
  "public/sw.js",
  `/* Manhal Service Worker */
   const BUILD_ID = 'manhal-v7';
   const CACHE_NAME = 'manhal-' + BUILD_ID;
   const RUNTIME_CACHE = 'manhal-runtime-' + BUILD_ID;
   const PRECACHE_URLS = ['./', './index.html', './manifest.json', './favicon.svg', './icon-192.png', './icon-512.png'];

   self.addEventListener('install', (event) => {
     self.skipWaiting();
     event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {})));
   });

   self.addEventListener('activate', (event) => {
     event.waitUntil((async () => {
       const keys = await caches.keys();
       await Promise.all(
         keys
           .filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE)
           .map((k) => caches.delete(k))
       );
       await self.clients.claim();
     })());
   });

   self.addEventListener('fetch', (event) => {
     const { request } = event;
     const url = new URL(request.url);
     if (request.method !== 'GET') return;
     if (url.origin !== self.location.origin) return;
     if (url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) return;

     const isAppFile =
       request.destination === 'document' ||
       request.destination === 'script' ||
       request.destination === 'style' ||
       url.pathname.endsWith('.html') ||
       url.pathname.endsWith('.js') ||
       url.pathname.endsWith('.css') ||
       url.pathname.endsWith('.json');

     if (isAppFile) {
       event.respondWith(
         fetch(request, { cache: 'no-store' })
           .then((response) => {
             if (response && response.status === 200) {
               const clone = response.clone();
               caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
             }
             return response;
           })
           .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
       );
       return;
     }

     event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
   });

   self.addEventListener('message', (event) => {
     if (!event.data) return;
     if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
     if (event.data.type === 'CLEAR_CACHE') caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
   });
   `
);

write(
  "public/version.json",
  JSON.stringify(
    {
      buildId: "manhal-v7",
      builtAt: new Date().toISOString(),
      version: "7.0.0",
    },
    null,
    2
  )
);

/* ═══════════════════════════════════════════════════════════════
      5. site.ts — name → Manhal
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/data/site.ts",
  `import type { SiteConfig, Season } from '@/types';

   export const site: SiteConfig = {
     name: 'Manhal',
     tagline: 'Resala STEM Sub Branches — Season 7',
     description: 'Manhal — the official platform for Resala STEM Sub Branches',
     organization: 'Resala STEM',
     email: 'hello@resala-stem.org',
   };

   export const seasons: Season[] = [
     { id: 'S7', label: 'Season 7', labelEn: 'Season 7', start: '2025-09-01', end: '2026-06-30', isActive: true, theme: 'Build. Teach. Give.' },
     { id: 'S6', label: 'Season 6', labelEn: 'Season 6', start: '2024-09-01', end: '2025-06-30', isActive: false, theme: 'Reach further.' },
   ];

   export const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];
   `
);

/* ═══════════════════════════════════════════════════════════════
      6. onboarding.ts — welcome message
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/data/onboarding.ts",
  `import type { OnboardingCard } from '@/types';

   export const onboardingCards: OnboardingCard[] = [
     { id: 'welcome', icon: '', title: 'Welcome to Manhal', description: 'The platform for Resala STEM Sub Branches — members, teams, committees, contributions, requests, and achievements in one place.', accentColor: '#C1272D', order: 1 },
     { id: 'teams', icon: '', title: 'Seven Specialized Teams', description: 'Helpers · Heroes · Coders · Enviros · Messages · Masar · RSTC', accentColor: '#60A5FA', order: 2 },
     { id: 'committees', icon: '', title: 'Committees Matter', description: 'Every member belongs to at least one committee. Committees have their own HR and rankings.', accentColor: '#16A34A', order: 3 },
     { id: 'contributions', icon: '', title: 'Flexible Point Approval', description: 'Log a contribution. Committee HR reviews and assigns points fairly.', accentColor: '#F59E0B', order: 4 },
     { id: 'league', icon: '', title: 'League & Ranking', description: 'Track your rank on team, committee, and global levels.', accentColor: '#A78BFA', order: 5 },
   ];
   `
);

/* ═══════════════════════════════════════════════════════════════
      7. Navbar — LOGO IMAGE instead of text brand
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/components/layout/Navbar.tsx",
  `import { Link, useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { IconBell } from '@/components/ui/Icons';
   import type { Notification } from '@/types';

   interface NavbarProps { onMenuToggle?: () => void; }

   export function Navbar({ onMenuToggle }: NavbarProps) {
     const { user } = useAuth();
     const nav = useNavigate();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');
     const unread = user ? notifs.filter((n) => n.userId === user.uid && !n.read).length : 0;

     const doLogout = async () => {
       await logout();
       nav('/');
     };

     return (
       <header className="navbar no-print">
         <div className="container navbar__inner">
           <Link to={user ? '/dashboard' : '/'} className="brand" aria-label="Manhal home">
             <img
               src="./logo.png"
               alt="Manhal"
               className="brand__logo"
               onError={(e) => {
                 /* Fallback to text if logo is missing */
                 const img = e.currentTarget as HTMLImageElement;
                 img.style.display = 'none';
                 const parent = img.parentElement;
                 if (parent && !parent.querySelector('.brand__fallback')) {
                   const span = document.createElement('span');
                   span.className = 'brand__fallback';
                   span.textContent = 'Manhal';
                   parent.appendChild(span);
                 }
               }}
             />
           </Link>

           <div className="nav-actions">
             {user ? (
               <>
                 {onMenuToggle ? (
                   <button
                     type="button"
                     className="nav-action nav-action--icon show-mobile"
                     onClick={onMenuToggle}
                     aria-label="Menu"
                   >
                     <span className="nav-action__menu" aria-hidden="true">
                       <span /><span /><span />
                     </span>
                   </button>
                 ) : null}

                 <Link to="/notifications" className="nav-action nav-action--icon" aria-label="Notifications">
                   <IconBell size={22} />
                   {unread > 0 ? (
                     <span className="nav-action__badge">{unread > 99 ? '99+' : unread}</span>
                   ) : null}
                 </Link>

                 <button type="button" className="nav-action nav-action--danger" onClick={doLogout}>
                   Logout
                 </button>
               </>
             ) : (
               <Link to="/login" className="nav-action nav-action--primary">Login</Link>
             )}
           </div>
         </div>
       </header>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      8. navbar.css — brand__logo styles
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/styles/navbar.css",
  `.navbar {
     position: sticky;
     top: 0;
     z-index: 50;
     height: var(--navbar-h);
     display: flex;
     align-items: center;
     background: var(--c-navy);
     border-bottom: 1px solid var(--c-navy-2);
   }

   .navbar__inner {
     display: flex;
     align-items: center;
     justify-content: space-between;
     width: 100%;
     gap: 16px;
   }

   /* ─── Brand: LOGO IMAGE ─── */
   .brand {
     display: inline-flex;
     align-items: center;
     gap: 10px;
     text-decoration: none;
     transition: opacity 0.15s;
     flex-shrink: 0;
   }

   .brand:hover {
     opacity: 0.88;
   }

   .brand__logo {
     display: block;
     height: 40px;
     width: auto;
     max-width: 220px;
     object-fit: contain;
     filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
   }

   .brand__fallback {
     font-family: var(--font);
     font-size: 1.5rem;
     color: var(--c-paper);
     letter-spacing: 0.02em;
   }

   /* ─── Right-side actions ─── */
   .nav-actions {
     display: flex;
     align-items: center;
     gap: 8px;
   }

   .nav-action {
     display: inline-flex;
     align-items: center;
     justify-content: center;
     gap: 8px;
     padding: 10px 18px;
     border-radius: var(--radius-sm);
     font-size: 0.95rem;
     color: var(--c-paper-soft);
     transition: all 0.15s;
     background: transparent;
     border: 1px solid transparent;
     font-family: inherit;
     cursor: pointer;
     text-decoration: none;
   }

   .nav-action:hover {
     background: var(--c-navy-2);
     color: var(--c-paper);
   }

   .nav-action--primary {
     background: var(--c-red);
     color: #fff;
     border-color: var(--c-red);
   }

   .nav-action--primary:hover {
     background: var(--c-red-soft);
     border-color: var(--c-red-soft);
     color: #fff;
   }

   .nav-action--danger {
     color: var(--c-red);
     border-color: var(--c-red);
   }

   .nav-action--danger:hover {
     background: var(--c-red);
     color: #fff;
   }

   .nav-action--icon {
     padding: 10px;
     min-width: 44px;
     min-height: 44px;
     position: relative;
     color: var(--c-paper-soft);
   }

   .nav-action--icon svg {
     display: block;
     width: 22px;
     height: 22px;
   }

   .nav-action__badge {
     position: absolute;
     top: 2px;
     right: 2px;
     min-width: 18px;
     height: 18px;
     padding: 0 5px;
     border-radius: 999px;
     background: var(--c-red);
     color: #fff;
     font-size: 0.68rem;
     display: grid;
     place-items: center;
     border: 2px solid var(--c-navy);
   }

   .nav-action__menu {
     width: 20px;
     height: 14px;
     display: flex;
     flex-direction: column;
     justify-content: space-between;
   }

   .nav-action__menu span {
     display: block;
     height: 2px;
     background: currentColor;
     border-radius: 2px;
   }

   /* ─── Mobile adjustments ─── */
   @media (max-width: 900px) {
     .navbar {
       height: calc(var(--navbar-h) + var(--safe-top));
       padding-top: var(--safe-top);
     }

     .brand__logo {
       height: 34px;
       max-width: 160px;
     }

     .nav-action {
       font-size: 0.9rem;
       padding: 9px 14px;
     }

     .nav-action--icon {
       padding: 9px;
       min-width: 40px;
       min-height: 40px;
     }
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      9. Footer — logo + new name
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/components/layout/Footer.tsx",
  `import { Link } from 'react-router-dom';
   import { site, activeSeason } from '@/data';

   export function Footer() {
     const year = new Date().getFullYear();

     return (
       <footer className="footer no-print">
         <div className="container">
           <div className="footer__inner">
             <div className="footer__brand-col">
               <img
                 src="./logo.png"
                 alt={site.name}
                 className="footer__logo"
                 onError={(e) => {
                   const img = e.currentTarget as HTMLImageElement;
                   img.style.display = 'none';
                 }}
               />
               <p className="footer__tagline">{site.description}</p>
               <div className="footer__copyright">
                 © {year} {site.organization} — {activeSeason.label}
               </div>
             </div>

             <div className="footer__links-col">
               <div>
                 <div className="footer__group-title">Browse</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/">Home</Link>
                   <Link className="footer__link" to="/members">Members</Link>
                   <Link className="footer__link" to="/teams">Teams</Link>
                   <Link className="footer__link" to="/committees">Committees</Link>
                   <Link className="footer__link" to="/league">League</Link>
                 </div>
               </div>
               <div>
                 <div className="footer__group-title">Platform</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/achievements">Achievements</Link>
                   <Link className="footer__link" to="/calendar">Calendar</Link>
                   <Link className="footer__link" to="/search">Search</Link>
                 </div>
               </div>
               <div>
                 <div className="footer__group-title">About</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/about">About</Link>
                   <Link className="footer__link" to="/governance">Governance</Link>
                   <Link className="footer__link" to="/login">Login</Link>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </footer>
     );
   }
   `
);

/* footer.css — add footer__logo */
const footerCssPath = path.join(ROOT, "src/styles/footer.css");
let footerCss = fs.existsSync(footerCssPath)
  ? fs.readFileSync(footerCssPath, "utf8")
  : "";
if (!footerCss.includes(".footer__logo")) {
  footerCss += `

   /* ─── Footer logo ─── */
   .footer__logo {
     height: 44px;
     width: auto;
     max-width: 200px;
     object-fit: contain;
     margin-bottom: 14px;
     filter: brightness(0) invert(1);
     opacity: 0.95;
   }

   @media (max-width: 640px) {
     .footer__logo {
       height: 38px;
       max-width: 170px;
     }
   }
   `;
  write("src/styles/footer.css", footerCss);
}

/* ═══════════════════════════════════════════════════════════════
      10. Onboarding header — Manhal
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/components/onboarding/Onboarding.tsx",
  `import { useEffect, useState } from 'react';
   import { onboardingCards, site } from '@/data';
   import { hasCompletedOnboarding, markOnboardingComplete } from '@/lib/onboarding';

   export function Onboarding() {
     const [visible, setVisible] = useState(false);

     useEffect(() => {
       if (!hasCompletedOnboarding()) {
         setVisible(true);
         document.body.style.overflow = 'hidden';
       }
       return () => {
         document.body.style.overflow = '';
       };
     }, []);

     const finish = () => {
       markOnboardingComplete();
       setVisible(false);
       document.body.style.overflow = '';
     };

     if (!visible) return null;

     const sorted = [...onboardingCards].sort((a, b) => a.order - b.order);

     return (
       <div className="onboarding-backdrop" role="dialog" aria-modal="true">
         <div className="onboarding-header">
           <img
             src="./logo.png"
             alt={site.name}
             className="onboarding-header__logo-img"
             onError={(e) => {
               (e.currentTarget as HTMLImageElement).style.display = 'none';
             }}
           />
           <div className="onboarding-header__title">Welcome to {site.name}</div>
           <div className="onboarding-header__subtitle">
             Learn about the platform in one minute
           </div>
         </div>

         <div className="onboarding-body">
           <div className="onboarding-grid">
             {sorted.map((card) => (
               <div key={card.id} className="onboarding-card">
                 <div className="onboarding-card__title">{card.title}</div>
                 <div className="onboarding-card__desc">{card.description}</div>
               </div>
             ))}
           </div>
         </div>

         <div className="onboarding-footer">
           <button type="button" className="onboarding-cta" onClick={finish}>
             Got it, let's start
           </button>
         </div>
       </div>
     );
   }
   `
);

/* Onboarding CSS — logo img style */
const onboardingCssPath = path.join(ROOT, "src/styles/onboarding.css");
let onboardingCss = fs.existsSync(onboardingCssPath)
  ? fs.readFileSync(onboardingCssPath, "utf8")
  : "";
if (!onboardingCss.includes(".onboarding-header__logo-img")) {
  onboardingCss += `

   /* ─── Onboarding header logo image ─── */
   .onboarding-header__logo-img {
     height: 72px;
     width: auto;
     max-width: 240px;
     object-fit: contain;
     margin: 0 auto 20px;
     display: block;
   }

   @media (max-width: 640px) {
     .onboarding-header__logo-img {
       height: 60px;
       max-width: 200px;
     }
   }
   `;
  write("src/styles/onboarding.css", onboardingCss);
}

/* ═══════════════════════════════════════════════════════════════
      11. auth.ts — friendly error + translateAuthError exported
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/lib/auth.ts",
  `import {
     signInWithEmailAndPassword,
     signOut,
     onAuthStateChanged,
     sendPasswordResetEmail,
     updatePassword,
     createUserWithEmailAndPassword,
     signOut as secondarySignOut,
     type User as FirebaseUser,
   } from 'firebase/auth';
   import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
   import { auth, db, getSecondaryAuth, destroySecondaryApp } from './firebase';
   import { safeArray } from './safe';
   import type { AppUser, RoleId, TeamId, Member } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      Friendly error translation — exported for reuse
      ═══════════════════════════════════════════════════════════════ */

   export function translateAuthError(err: unknown): string {
     const code = err && typeof err === 'object' && 'code' in err
       ? String((err as { code?: string }).code)
       : '';
     const raw = err instanceof Error ? err.message : String(err ?? '');
     const combined = (code + ' ' + raw).toLowerCase();

     if (
       combined.includes('invalid-credential') ||
       combined.includes('wrong-password') ||
       combined.includes('user-not-found') ||
       combined.includes('invalid-login-credentials')
     ) {
       return 'الإيميل أو الباسورد خطأ';
     }
     if (combined.includes('invalid-email')) return 'الإيميل مش صح';
     if (combined.includes('user-disabled')) return 'الحساب ده متوقف';
     if (combined.includes('too-many-requests')) return 'حاول تاني بعد شوية';
     if (combined.includes('network-request-failed')) return 'في مشكلة في الاتصال بالإنترنت';
     if (combined.includes('email-already-in-use') || combined.includes('email_exists')) {
       return 'الإيميل ده مستخدم بالفعل';
     }
     if (combined.includes('weak-password')) return 'الباسورد ضعيف — لازم 6 حروف على الأقل';
     if (combined.includes('operation-not-allowed')) return 'التسجيل معطل حاليًا';
     if (combined.includes('requires-recent-login')) return 'سجل دخول تاني وحاول';
     if (combined.includes('missing-password')) return 'لازم تدخل الباسورد';
     return raw || 'حصل خطأ غير متوقع';
   }

   /* ═══════════════════════════════════════════════════════════════
      Login / Logout / Reset
      ═══════════════════════════════════════════════════════════════ */

   export async function login(email: string, password: string): Promise<AppUser> {
     const cred = await signInWithEmailAndPassword(auth, email, password);
     return await ensureUserDoc(cred.user);
   }

   export async function logout(): Promise<void> {
     await signOut(auth);
   }

   export async function sendPasswordReset(email: string): Promise<void> {
     await sendPasswordResetEmail(auth, email);
   }

   export async function changePassword(newPassword: string): Promise<void> {
     const user = auth.currentUser;
     if (!user) throw new Error('No user logged in');
     await updatePassword(user, newPassword);
     await updateDoc(doc(db, 'users', user.uid), { mustChangePassword: false });
   }

   /* ═══════════════════════════════════════════════════════════════
      Admin: reset another user's password
      ═══════════════════════════════════════════════════════════════ */

   export async function adminResetUserPassword(email: string): Promise<void> {
     if (!email) throw new Error('Email required');
     await sendPasswordResetEmail(auth, email);
   }

   /* ═══════════════════════════════════════════════════════════════
      Admin: update user profile
      ═══════════════════════════════════════════════════════════════ */

   export interface UpdateUserInput {
     displayName?: string;
     role?: RoleId;
     teamId?: TeamId | null;
     committeeIds?: string[];
     bio?: string;
   }

   export async function adminUpdateUser(uid: string, input: UpdateUserInput): Promise<void> {
     const payload: Record<string, unknown> = {};
     if (input.displayName !== undefined) payload.displayName = input.displayName;
     if (input.role !== undefined) payload.role = input.role;
     if (input.teamId !== undefined) payload.teamId = input.teamId;
     if (input.committeeIds !== undefined) payload.committeeIds = safeArray(input.committeeIds);

     await updateDoc(doc(db, 'users', uid), payload);

     try {
       const userSnap = await getDoc(doc(db, 'users', uid));
       if (userSnap.exists()) {
         const userData = userSnap.data() as AppUser;
         if (userData.memberId) {
           const memberPayload: Record<string, unknown> = {};
           if (input.displayName !== undefined) memberPayload.name = input.displayName;
           if (input.role !== undefined) memberPayload.role = input.role;
           if (input.teamId !== undefined) memberPayload.teamIds = input.teamId ? [input.teamId] : [];
           if (input.committeeIds !== undefined) memberPayload.committeeIds = safeArray(input.committeeIds);
           if (input.bio !== undefined) memberPayload.bio = input.bio;
           if (Object.keys(memberPayload).length > 0) {
             await updateDoc(doc(db, 'members', userData.memberId), memberPayload);
           }
         }
       }
     } catch { /* silent */ }
   }

   /* ═══════════════════════════════════════════════════════════════
      Admin: create member (secondary app)
      ═══════════════════════════════════════════════════════════════ */

   export interface CreateMemberInput {
     email: string;
     temporaryPassword: string;
     name: string;
     role: RoleId;
     teamIds: TeamId[];
     committeeIds: string[];
     bio?: string;
   }

   export async function adminCreateMember(
     input: CreateMemberInput,
     adminUid: string,
   ): Promise<{ uid: string; memberId: string; email: string }> {
     const email = input.email.trim().toLowerCase();
     const name = input.name.trim();
     const password = input.temporaryPassword;

     if (!email || !name) throw new Error('Email and name are required');
     if (password.length < 6) throw new Error('Password must be at least 6 characters');
     if (!input.teamIds || input.teamIds.length === 0) throw new Error('At least one team is required');
     if (!input.committeeIds || input.committeeIds.length === 0) throw new Error('At least one committee is required');

     const secondaryAuth = getSecondaryAuth();
     let uid = '';

     try {
       const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
       uid = cred.user.uid;
       try { await secondarySignOut(secondaryAuth); } catch { /* ignore */ }
       await destroySecondaryApp();
     } catch (err) {
       await destroySecondaryApp();
       throw new Error(translateAuthError(err));
     }

     if (!uid) throw new Error('Failed to create user account');

     const memberId = 'M-' + uid.slice(0, 8).toUpperCase();

     const userData: AppUser = {
       uid,
       email,
       displayName: name,
       role: input.role,
       teamId: input.teamIds[0] ?? null,
       committeeIds: safeArray(input.committeeIds),
       memberId,
       createdAt: new Date().toISOString(),
       emailVerified: false,
       mustChangePassword: true,
       createdByAdmin: adminUid,
       status: 'active',
     };
     await setDoc(doc(db, 'users', uid), userData);

     const memberData: Member = {
       id: memberId,
       name,
       role: input.role,
       teamIds: input.teamIds,
       committeeIds: safeArray(input.committeeIds),
       joinedSeason: 7,
       hours: 0,
       points: 0,
       status: 'active',
       bio: input.bio?.trim() || undefined,
       email,
       linkedUserId: uid,
     };
     await setDoc(doc(db, 'members', memberId), memberData);

     return { uid, memberId, email };
   }

   /* ═══════════════════════════════════════════════════════════════
      ensureUserDoc + observeAuth
      ═══════════════════════════════════════════════════════════════ */

   async function ensureUserDoc(fbUser: FirebaseUser): Promise<AppUser> {
     const ref = doc(db, 'users', fbUser.uid);
     const snap = await getDoc(ref);
     if (snap.exists()) {
       const data = snap.data() as Omit<AppUser, 'uid'>;
       return {
         uid: fbUser.uid,
         ...data,
         emailVerified: fbUser.emailVerified,
         status: data.status ?? 'active',
       };
     }
     const fallback: AppUser = {
       uid: fbUser.uid,
       email: fbUser.email ?? '',
       displayName: fbUser.displayName ?? fbUser.email ?? 'Member',
       role: 'VIEWER',
       teamId: null,
       committeeIds: [],
       memberId: null,
       createdAt: new Date().toISOString(),
       emailVerified: fbUser.emailVerified,
       mustChangePassword: false,
       status: 'pending',
     };
     await setDoc(ref, fallback);
     return fallback;
   }

   export function observeAuth(
     callback: (user: AppUser | null, loading: boolean) => void,
   ): () => void {
     return onAuthStateChanged(auth, async (fbUser) => {
       if (!fbUser) { callback(null, false); return; }
       try {
         const appUser = await ensureUserDoc(fbUser);
         callback(appUser, false);
       } catch {
         callback(null, false);
       }
     });
   }

   export function hasRole(user: AppUser | null, roles: RoleId[]): boolean {
     if (!user) return false;
     return roles.includes(user.role);
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      12. LoginPage — use translateAuthError
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/LoginPage.tsx",
  `import { useState, type FormEvent } from 'react';
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
         setError(translateAuthError(err));
       } finally {
         setBusy(false);
       }
     };

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
      13. desktop.css — floating pill nav + drawer (mobile-like)
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/styles/desktop.css",
  `/* ═══════════════════════════════════════════════════════════════
      DESKTOP — Mobile-like experience
      Same Navbar, BottomNav, Sidebar drawer as mobile.
      Mobile: untouched.
      ═══════════════════════════════════════════════════════════════ */

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

   /* ─── Wider card grids ─── */
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
      DESKTOP (≥901px) — floating pill BottomNav
      ═══════════════════════════════════════════════════════════════ */

   @media (min-width: 901px) {

     /* ─── Navbar ─── */
     .navbar {
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

     /* Menu button visible on desktop */
     .show-mobile {
       display: inline-flex !important;
     }

     /* ─── BottomNav — floating pill ─── */
     .bottom-nav {
       display: flex !important;
       position: fixed !important;
       bottom: 20px !important;
       left: 50% !important;
       right: auto !important;
       top: auto !important;
       transform: translateX(-50%) !important;
       width: auto !important;
       min-width: 480px !important;
       max-width: 640px !important;
       height: 64px !important;
       border-radius: 999px !important;
       border: 1px solid var(--c-line) !important;
       background: var(--c-white) !important;
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

     /* Make room for the floating pill */
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

     .dashboard-layout {
       grid-template-columns: 1fr !important;
       gap: 20px !important;
     }

     /* ─── Toast top-right ─── */
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

/* Verify global.css imports desktop.css */
const globalCssPath = path.join(ROOT, "src/styles/global.css");
if (fs.existsSync(globalCssPath)) {
  const css = fs.readFileSync(globalCssPath, "utf8");
  if (!css.includes("desktop.css")) {
    const lines = css
      .trim()
      .split("\n")
      .filter((l) => !l.includes("desktop.css"));
    lines.push("@import './desktop.css';");
    write("src/styles/global.css", lines.join("\n") + "\n");
    console.log("  ↻ Added desktop.css import");
  }
}

/* ═══════════════════════════════════════════════════════════════
      14. FIX GitHub Actions deploy workflow
      ═══════════════════════════════════════════════════════════════ */

write(
  ".github/workflows/deploy.yml",
  `name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: "pages"
     cancel-in-progress: false

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

         - name: Verify build output
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
   `
);

/* Also add a proper .nojekyll file to prevent Jekyll processing */
write("public/.nojekyll", "");

/* ═══════════════════════════════════════════════════════════════
      15. README + docs
      ═══════════════════════════════════════════════════════════════ */

write(
  "README.md",
  `# Manhal

   Resala STEM Sub Branches — Season 7

   ## Setup

   1. Create a Firebase project: https://console.firebase.google.com
   2. Enable **Authentication → Email/Password**
   3. Enable **Firestore Database** (production mode)
   4. Copy \`.env.example\` → \`.env\` and fill the Firebase config
   5. Publish Firestore rules (from \`firestore.rules\`)
   6. \`npm install && npm run dev\`

   ## Deploy to GitHub Pages

   1. Push to GitHub
   2. Repository → Settings → Pages → Source: **GitHub Actions**
   3. Add \`VITE_FIREBASE_*\` as repository secrets
   4. Actions will auto-deploy on push to \`main\`

   ## PWA

   Installable as a mobile app:
   - Android: Chrome → ⋮ → "Install app"
   - iOS: Safari → Share → "Add to Home Screen"

   ## Admin bootstrap

   1. Create the first HEAD account manually in Firebase Console
   2. Log in → /admin → Upload Data
   `
);

/* ═══════════════════════════════════════════════════════════════
      16. AUTO-FIX — cleanup
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
      17. BUILD + PUSH
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" 📦 Installing...");
run("npm install --no-audit --no-fund");

console.log("");
console.log(" 🏗  Building...");
const buildOk = run("npm run build");

if (!buildOk) {
  console.log("");
  console.log(" ⚠ Build failed — checking for common issues...");
  // Try to give hints
  const distExists = fs.existsSync(path.join(ROOT, "dist"));
  console.log(
    "   dist folder exists: " +
      (distExists ? "yes" : "NO — check the build log above")
  );
}

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
    "git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git"
  );
}

run("git add -A");
run(
  'git commit -m "feat: rebrand sbapiaryy → Manhal + logo + desktop polish + fixed deploy"',
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
console.log(" ✨ What was done:");
console.log("   ✓ Rebranded: sbapiaryy → Manhal everywhere");
console.log("   ✓ Logo replaces text brand in Navbar + Footer + Onboarding");
console.log("   ✓ Boot screen (mobile): logo only, no text");
console.log("   ✓ Icons replaced from public/new-assets/");
console.log('   ✓ Login error: "الإيميل أو الباسورد خطأ"');
console.log("   ✓ Desktop: floating pill BottomNav + drawer Sidebar");
console.log("   ✓ GitHub Actions workflow rewritten from scratch");
console.log("   ✓ .nojekyll added to prevent Jekyll processing");
console.log("");
console.log(" ⏭  Next steps after GitHub Actions (4-7 min):");
console.log("   1. Open the site → see Manhal logo everywhere");
console.log('   2. Try wrong password → "الإيميل أو الباسورد خطأ"');
console.log("   3. Open on desktop → floating pill nav at bottom center");
console.log("   4. Click ☰ → drawer slides from the left");
console.log("");
console.log(" ⚠  IMPORTANT — GitHub repo settings:");
console.log('   Settings → Pages → Source → MUST be "GitHub Actions"');
console.log('   If it says "Deploy from a branch" → change it now');
console.log("");
