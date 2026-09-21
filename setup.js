#!/usr/bin/env node
/**
 * sbapiaryy — setup.js v5.1
 * Complete rebuild from scratch with mobile-first design + PWA
 * 10 parts, ~15,000 lines total
 */

const fs = require("fs");
const path = require("path");
const ROOT = process.cwd();
const files = {};
const file = (p, c) => {
  files[p] = c;
};

/* ═══════════════════════════════════════════════════════════════
   ROOT CONFIG
   ═══════════════════════════════════════════════════════════════ */

file(
  "package.json",
  `{
  "name": "sbapiaryy",
  "private": true,
  "version": "5.1.0",
  "type": "module",
  "description": "Resala STEM Sub Branches — Season 7",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "firebase": "^10.14.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2"
  },
  "devDependencies": {
    "@types/node": "^22.7.4",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "typescript": "^5.6.2",
    "vite": "^5.4.8"
  }
}`
);

file(
  "tsconfig.json",
  `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}`
);

file(
  "vite.config.ts",
  `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});`
);

file(
  ".gitignore",
  `node_modules
dist
dist-ssr
*.local
.DS_Store
.env
.env.*
!.env.example
*.tsbuildinfo
.vercel
`
);

file(
  ".env.example",
  `VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def`
);

file(
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
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Create .env
        run: |
          echo "VITE_FIREBASE_API_KEY=\${{ secrets.VITE_FIREBASE_API_KEY }}" >> .env
          echo "VITE_FIREBASE_AUTH_DOMAIN=\${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}" >> .env
          echo "VITE_FIREBASE_PROJECT_ID=\${{ secrets.VITE_FIREBASE_PROJECT_ID }}" >> .env
          echo "VITE_FIREBASE_STORAGE_BUCKET=\${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}" >> .env
          echo "VITE_FIREBASE_MESSAGING_SENDER_ID=\${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}" >> .env
          echo "VITE_FIREBASE_APP_ID=\${{ secrets.VITE_FIREBASE_APP_ID }}" >> .env

      - run: npm install --no-audit --no-fund
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
`
);

/* ═══════════════════════════════════════════════════════════════
   HTML + PWA
   ═══════════════════════════════════════════════════════════════ */

file(
  "index.html",
  `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
    <meta name="theme-color" content="#151A45" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="sbapiaryy" />
    <meta name="description" content="المنصة الرسمية لمتابعة Resala STEM Sub Branches" />

    <title>sbapiaryy</title>

    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <link rel="manifest" href="./manifest.json" />
    <link rel="apple-touch-icon" href="./icon-192.png" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <style>
      /* Critical CSS — يظهر فورًا قبل تحميل باقي الأنماط */
      html, body { margin: 0; padding: 0; background: #151A45; }
      #root { min-height: 100vh; }

      .boot-screen {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #151A45;
        color: #fff;
        font-family: 'Tajawal', system-ui, sans-serif;
        flex-direction: column;
        gap: 20px;
        z-index: 9999;
        transition: opacity 0.3s ease;
      }

      .boot-screen.hidden { opacity: 0; pointer-events: none; }

      .boot-screen__logo {
        width: 72px;
        height: 72px;
        border-radius: 20px;
        background: linear-gradient(150deg, #C1272D, #A01F24);
        display: grid;
        place-items: center;
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 800;
        font-size: 1.8rem;
        color: #fff;
        box-shadow: 0 12px 40px -10px rgba(193, 39, 45, 0.55);
        animation: boot-pulse 1.4s ease-in-out infinite;
      }

      .boot-screen__name {
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: 0.02em;
      }

      .boot-screen__hint {
        font-size: 0.85rem;
        color: #D5DAF0;
        opacity: 0.7;
      }

      @keyframes boot-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
    </style>

    <script>
      // GitHub Pages SPA redirect
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
        <div class="boot-screen__logo">S</div>
        <div class="boot-screen__name">sbapiaryy</div>
        <div class="boot-screen__hint">جارٍ التحميل...</div>
      </div>
    </div>

    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>

    <script>
      // إخفاء شاشة البداية بعد تحميل التطبيق
      setTimeout(function () {
        var boot = document.querySelector('.boot-screen');
        if (boot) boot.classList.add('hidden');
        setTimeout(function () {
          var bootEl = document.getElementById('boot');
          if (bootEl) bootEl.remove();
        }, 350);
      }, 800);
    </script>
  </body>
</html>
`
);

file(
  "public/favicon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#151A45"/>
  <text x="32" y="44" font-family="Space Grotesk, sans-serif" font-size="38" font-weight="800" fill="#C1272D" text-anchor="middle">S</text>
</svg>
`
);

file(
  "public/manifest.json",
  `{
  "name": "sbapiaryy — Resala STEM Sub Branches",
  "short_name": "sbapiaryy",
  "description": "المنصة الرسمية لمتابعة Resala STEM Sub Branches",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#151A45",
  "theme_color": "#151A45",
  "lang": "ar",
  "dir": "rtl",
  "icons": [
    {
      "src": "./icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "./icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "education", "social"],
  "shortcuts": [
    {
      "name": "لوحة التحكم",
      "short_name": "Dashboard",
      "url": "./#/dashboard",
      "icons": [{ "src": "./icon-192.png", "sizes": "192x192" }]
    },
    {
      "name": "الإشعارات",
      "short_name": "Notifications",
      "url": "./#/notifications",
      "icons": [{ "src": "./icon-192.png", "sizes": "192x192" }]
    },
    {
      "name": "المحادثات",
      "short_name": "Chats",
      "url": "./#/conversations",
      "icons": [{ "src": "./icon-192.png", "sizes": "192x192" }]
    }
  ]
}
`
);

/* PWA Icons (SVG-in-PNG العملية — سيتم توليدها عند التشغيل) */
file("public/icon-192.png", `PLACEHOLDER_192`);
file("public/icon-512.png", `PLACEHOLDER_512`);

file(
  "public/sw.js",
  `// sbapiaryy Service Worker v5.1
const CACHE_NAME = 'sbapiaryy-v5.1';
const RUNTIME_CACHE = 'sbapiaryy-runtime-v5.1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('firebase') || url.hostname.includes('firebase')) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
`
);

file(
  "public/404.html",
  `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>sbapiaryy</title>
  <script>
    sessionStorage.redirect = location.href;
  </script>
  <meta http-equiv="refresh" content="0; url=./">
</head>
<body></body>
</html>
`
);

file(
  "public/robots.txt",
  `User-agent: *
Allow: /
`
);

/* ═══════════════════════════════════════════════════════════════
   README
   ═══════════════════════════════════════════════════════════════ */

file(
  "README.md",
  `# sbapiaryy v5.1

Resala STEM Sub Branches — Season 7

## Setup

1. Firebase project: https://console.firebase.google.com
2. Enable **Authentication → Email/Password**
3. Enable **Firestore Database** (production mode)
4. Copy \`.env.example\` → \`.env\` and fill Firebase config
5. Publish Firestore rules (docs/FIRESTORE_RULES.md)
6. \`npm install && npm run dev\`

## Deploy to GitHub Pages

1. Push to GitHub
2. Settings → Pages → Source: **GitHub Actions**
3. Add VITE_FIREBASE_* as repository secrets
4. Actions will auto-deploy

## PWA

الموقع قابل للتثبيت كتطبيق على الجوال:
- Android: Chrome → ⋮ → "Install app"
- iOS: Safari → Share → "Add to Home Screen"

## Admin Bootstrap

1. Sign up on /login
2. Firebase Console → Firestore → \`users\` → set your \`role\` = \`HEAD\`
3. Reload → Admin → "Load Demo Data"
`
);

/* ═══════════════════════════════════════════════════════════════
   DOCS
   ═══════════════════════════════════════════════════════════════ */

file(
  "docs/FIRESTORE_RULES.md",
  `# Firestore Rules v5.1

**سيتم إرسالها كاملة في الجزء 10 — بعد أن نبني الكود الجديد.**

القواعد الجديدة تراعي:
- تطابق الدور + الفريق قبل الموافقة
- HR الفريق يوافق على فريقه فقط
- Head HR يوافق على كل الفرق
- Admin (HEAD/VICE) يتخطى الكل
- Conversations مقيدة بالمشاركين
- Communities مفتوحة لأعضاء الفريق
`
);

file(
  "docs/MOBILE_GUIDE.md",
  `# PWA Installation Guide

## Android (Chrome / Edge)
1. افتح الموقع في Chrome
2. اضغط ⋮ (قائمة المتصفح)
3. اختر **"Install app"** أو **"Add to Home screen"**
4. اسم التطبيق: **sbapiaryy**
5. افتحه من الشاشة الرئيسية كتطبيق أصلي

## iOS (Safari)
1. افتح الموقع في **Safari** (ليس Chrome)
2. اضغط زر **Share** (المربع مع السهم)
3. مرر لأسفل → **"Add to Home Screen"**
4. اضغط **"Add"**
5. يظهر أيقونة sbapiaryy على الشاشة

## الفوائد
- يعمل بدون شريط المتصفح
- يحفظ الجلسة
- يدعم الإشعارات
- يعمل offline (جزئيًا)
- أسرع من المتصفح

## ملاحظة
التثبيت متاح فقط على:
- HTTPS (GitHub Pages يوفرها)
- بعد زيارة واحدة للموقع
- إذا لم تظهر خيار التثبيت، استخدم الخيار اليدوي
`
);

/* ═══════════════════════════════════════════════════════════════
   ICON GENERATOR (SVG → PNG Data URLs)
   ═══════════════════════════════════════════════════════════════ */

file(
  "scripts/generate-icons.cjs",
  `// يستخدم هذا السكربت لتوليد أيقونات PNG من SVG
// يمكن تجاهله إذا كانت الأيقونات موجودة
const fs = require('fs');
const path = require('path');

const svg = \`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#151A45"/>
  <text x="256" y="360" font-family="Space Grotesk, sans-serif" font-size="300" font-weight="800" fill="#C1272D" text-anchor="middle">S</text>
</svg>\`;

console.log('');
console.log('  ℹ️  لتوليد أيقونات PWA حقيقية:');
console.log('');
console.log('  1. اذهب إلى: https://realfavicongenerator.net');
console.log('  2. ارفع favicon.svg');
console.log('  3. حمّل الحزمة');
console.log('  4. انسخ icon-192.png و icon-512.png إلى مجلد public/');
console.log('');
console.log('  أو استخدم أي أداة تحويل SVG → PNG.');
console.log('');
console.log('  SVG المستخدم:');
console.log(svg);
`
);

file(
  "scripts/replace-on-github.md",
  `# استبدال الملفات على GitHub بضغطة واحدة

## طريقة 1: GitHub Web UI (يدويًا — 5 دقائق)

لكل ملف:
1. افتح \`https://github.com/hazimshendy-stack/sbapiaryyy/blob/main/<path>\`
2. اضغط أيقونة **القلم** (Edit)
3. **Ctrl + A** ثم **Delete**
4. الصق المحتوى الجديد
5. **Commit changes**

للملفات الجديدة:
1. افتح \`https://github.com/hazimshendy-stack/sbapiaryyy/new/main/<folder>\`
2. اكتب اسم الملف
3. الصق المحتوى
4. **Commit changes**

## طريقة 2: Git Push (10 دقائق)

على جهازك:
\`\`\`bash
cd C:\\Users\\Shendyy\\sssb
# انسخ الملفات الجديدة من setup.js إليها
git add .
git commit -m "feat: v5.1 complete rebuild"
git push origin main --force
\`\`\`

## طريقة 3: GitHub Desktop (5 دقائق)

1. افتح GitHub Desktop
2. اختر Repository: sbapiaryyy
3. انسخ الملفات إلى مجلد المشروع
4. سيظهر كل ملف معدّل
5. اكتب رسالة: \`v5.1 rebuild\`
6. **Commit to main**
7. **Push origin**

## طريقة 4: السكربت التلقائي

شغّل:
\`\`\`bash
node setup.js
git add .
git commit -m "v5.1"
git push origin main --force
\`\`\`

## ملاحظة مهمة
- بعد كل push، GitHub Actions يبني تلقائيًا
- انتظر 4-7 دقائق
- افتح Actions للمراقبة
`
);

/* ═══════════════════════════════════════════════════════════════
   WRITE (مؤقت — سيُستبدل في الجزء 10)
   ═══════════════════════════════════════════════════════════════ */

// ملاحظة: هذا الجزء فقط ينشئ ملفات الجذر.
// الأجزاء 2-10 تضيف باقي الملفات (src/).
// write() النهائي في الجزء 10.

console.log("  ✓ Part 1 loaded: Root config + PWA");
/* ═══════════════════════════════════════════════════════════════
   TYPES — v5.1
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/types/index.ts",
  `export type RoleId =
   | 'HEAD'
   | 'VICE'
   | 'HEAD_HR'
   | 'PRESIDENT'
   | 'VICE_PRESIDENT'
   | 'HR'
   | 'MEMBER'
   | 'VIEWER';

 export type TeamId =
   | 'helpers'
   | 'heroes'
   | 'coders'
   | 'enviros'
   | 'messages'
   | 'masar'
   | 'rstc';

 export type RequestType =
   | 'TRANSFER'
   | 'PROMOTION'
   | 'RESIGNATION'
   | 'COMPLAINT'
   | 'SUGGESTION'
   | 'LEAVE';

 export type RequestStatus =
   | 'PENDING'
   | 'IN_REVIEW'
   | 'APPROVED'
   | 'REJECTED'
   | 'CANCELLED'
   | 'COMPLETED';

 export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';

 export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

 export type ContributionStatus = 'pending' | 'approved' | 'rejected';

 export type ConversationType = 'private' | 'team' | 'general';

 export type NotificationType =
   | 'approval'
   | 'request'
   | 'participation'
   | 'achievement'
   | 'system'
   | 'warning'
   | 'message';

 /* ═══════════ المستخدم ═══════════ */

 export interface AppUser {
   uid: string;
   email: string;
   displayName: string;
   role: RoleId;
   teamId: TeamId | null;
   committeeIds: string[];
   memberId: string | null;
   createdAt: string;
   emailVerified?: boolean;
   mustChangePassword?: boolean;
   createdByAdmin?: string;
 }

 /* ═══════════ الأدوار ═══════════ */

 export interface Role {
   id: RoleId;
   name: string;
   nameEn: string;
   level: number;
 }

 /* ═══════════ الفرق ═══════════ */

 export interface Team {
   id: TeamId;
   name: string;
   nameAr: string;
   description: string;
   color: string;
 }

 /* ═══════════ اللجان ═══════════ */

 export interface Committee {
   id: string;
   name: string;
   nameAr: string;
   description: string;
   color: string;
   icon: string;
 }

 /* ═══════════ الأعضاء ═══════════ */

 export interface Member {
   id: string;
   name: string;
   role: RoleId;
   teamIds: TeamId[];
   committeeIds: string[];
   joinedSeason: number;
   hours: number;
   status: 'active' | 'inactive' | 'suspended';
   bio?: string;
   email?: string;
   linkedUserId?: string;
 }

 /* ═══════════ المشاركات (سابقًا مساهمات) ═══════════ */

 export interface Contribution {
   id: string;
   memberId: string;
   memberName: string;
   teamId: TeamId;
   committeeId?: string;
   category: string;
   title: string;
   description: string;
   date: string;
   hours: number;
   status: ContributionStatus;
   seasonId: string;
   createdBy: string;
 }

 /* ═══════════ الطلبات ═══════════ */

 export interface ApprovalStep {
   id: string;
   requestId: string;
   order: number;
   requiredRole: RoleId;
   requiredTeamId: TeamId | null;
   approverUid?: string;
   approverName?: string;
   status: ApprovalStatus;
   comment?: string;
   actionDate?: string;
 }

 export interface RequestRecord {
   id: string;
   type: RequestType;
   requesterUid: string;
   requesterMemberId: string;
   requesterName: string;
   subjectMemberId?: string;
   fromTeamId?: TeamId;
   toTeamId?: TeamId;
   title: string;
   description: string;
   status: RequestStatus;
   currentStepOrder: number;
   priority: Priority;
   submittedAt: string;
   updatedAt: string;
   seasonId: string;
 }

 /* ═══════════ التحذيرات ═══════════ */

 export interface WarningRecord {
   id: string;
   memberId: string;
   memberName: string;
   type: 'VERBAL' | 'WRITTEN' | 'FINAL';
   reason: string;
   severity: 'LOW' | 'MEDIUM' | 'HIGH';
   issuedByMemberId: string;
   issuedByName: string;
   issuedAt: string;
   status: 'active' | 'resolved';
   notes?: string;
 }

 /* ═══════════ الإنجازات ═══════════ */

 export interface Achievement {
   id: string;
   title: string;
   description: string;
   date: string;
   level: 'branch' | 'national' | 'international';
   teamIds: TeamId[];
   memberIds: string[];
   memberNames: string[];
   seasonId: string;
 }

 /* ═══════════ الإشعارات ═══════════ */

 export interface Notification {
   id: string;
   userId: string;
   title: string;
   message: string;
   type: NotificationType;
   date: string;
   read: boolean;
   route?: string;
   priority?: 'low' | 'normal' | 'high';
   fromName?: string;
 }

 /* ═══════════ المحادثات (Messenger-style) ═══════════ */

 export interface Conversation {
   id: string;
   type: ConversationType;
   title: string;
   participantUids: string[];
   teamId?: TeamId;
   lastMessageAt: string;
   lastMessageText?: string;
   lastMessageSender?: string;
   unreadCounts?: Record<string, number>;
   createdBy?: string;
 }

 export interface Message {
   id: string;
   conversationId: string;
   senderUid: string;
   senderName: string;
   text: string;
   sentAt: string;
   readBy?: string[];
 }

 /* ═══════════ التقويم ═══════════ */

 export interface CalendarEvent {
   id: string;
   title: string;
   description?: string;
   date: string;
   time?: string;
   endTime?: string;
   teamId?: TeamId | null;
   isPublic: boolean;
   type: 'meeting' | 'event' | 'deadline' | 'workshop';
   location?: string;
   participantUids?: string[];
   seasonId: string;
   createdBy: string;
   createdByName: string;
 }

 /* ═══════════ الخط الزمني ═══════════ */

 export interface TimelineEvent {
   id: string;
   memberId?: string;
   memberName?: string;
   teamId?: TeamId;
   type:
     | 'join'
     | 'contribution'
     | 'promotion'
     | 'transfer'
     | 'achievement'
     | 'warning'
     | 'request'
     | 'approval';
   title: string;
   description?: string;
   date: string;
   relatedId?: string;
 }

 /* ═══════════ سجل التغييرات ═══════════ */

 export interface AuditRecord {
   id: string;
   actorUid: string;
   actorName: string;
   action: string;
   entity: string;
   entityId: string;
   date: string;
   description: string;
 }

 /* ═══════════ الحوكمة ═══════════ */

 export interface GovernanceDocument {
   id: string;
   title: string;
   category: string;
   description: string;
   content: string;
   version: string;
   updatedAt: string;
 }

 /* ═══════════ الإعدادات ═══════════ */

 export interface SiteConfig {
   name: string;
   tagline: string;
   description: string;
   organization: string;
   email: string;
 }

 /* ═══════════ Onboarding ═══════════ */

 export interface OnboardingCard {
   id: string;
   icon: string;
   title: string;
   description: string;
   accentColor: string;
   order: number;
 }

 /* ═══════════ Season ═══════════ */

 export interface Season {
   id: string;
   label: string;
   labelEn: string;
   start: string;
   end: string;
   isActive: boolean;
   theme: string;
 }
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Site Config
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/site.ts",
  `import type { SiteConfig, Season } from '@/types';

 export const site: SiteConfig = {
   name: 'sbapiaryy',
   tagline: 'Resala STEM Sub Branches — الموسم السابع',
   description: 'المنصة الرسمية لمتابعة Resala STEM Sub Branches',
   organization: 'Resala STEM',
   email: 'hello@resala-stem.org',
 };

 export const seasons: Season[] = [
   {
     id: 'S7',
     label: 'الموسم السابع',
     labelEn: 'Season 7',
     start: '2025-09-01',
     end: '2026-06-30',
     isActive: true,
     theme: 'نبني. نُعلّم. نعطي.',
   },
   {
     id: 'S6',
     label: 'الموسم السادس',
     labelEn: 'Season 6',
     start: '2024-09-01',
     end: '2025-06-30',
     isActive: false,
     theme: 'نصل أبعد.',
   },
 ];

 export const activeSeason = seasons.find((s) => s.isActive) ?? seasons[0];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Roles
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/roles.ts",
  `import type { Role } from '@/types';

 export const roles: Role[] = [
   { id: 'HEAD',           name: 'رئيس الفروع',         nameEn: 'Head',                 level: 100 },
   { id: 'VICE',           name: 'نائب رئيس الفروع',     nameEn: 'Vice',                 level: 95  },
   { id: 'HEAD_HR',        name: 'رئيس الموارد البشرية', nameEn: 'Head of HR',           level: 90  },
   { id: 'PRESIDENT',      name: 'رئيس فريق',            nameEn: 'Team President',       level: 80  },
   { id: 'VICE_PRESIDENT', name: 'نائب رئيس فريق',       nameEn: 'Team Vice President',  level: 70  },
   { id: 'HR',             name: 'موارد بشرية',          nameEn: 'HR',                   level: 60  },
   { id: 'MEMBER',         name: 'عضو',                  nameEn: 'Member',               level: 50  },
   { id: 'VIEWER',         name: 'زائر',                 nameEn: 'Viewer',               level: 10  },
 ];

 export const roleLabels: Record<string, string> = {
   HEAD: 'رئيس الفروع',
   VICE: 'نائب رئيس الفروع',
   HEAD_HR: 'رئيس الموارد البشرية',
   PRESIDENT: 'رئيس فريق',
   VICE_PRESIDENT: 'نائب رئيس فريق',
   HR: 'موارد بشرية',
   MEMBER: 'عضو',
   VIEWER: 'زائر',
 };
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Teams
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/teams.ts",
  `import type { Team } from '@/types';

 export const teams: Team[] = [
   {
     id: 'helpers',
     name: 'Helpers',
     nameAr: 'المساعدون',
     description: 'العمود الفقري لكل فريق. المساعدون يتولون اللوجستيات والإرشاد والتأهيل والعمليات اليومية.',
     color: '#C1272D',
   },
   {
     id: 'heroes',
     name: 'Heroes',
     nameAr: 'الأبطال',
     description: 'يقود الأبطال الأنشطة الميدانية والتوعية المجتمعية وحملات التطوع الكبرى.',
     color: '#FB923C',
   },
   {
     id: 'coders',
     name: 'Coders',
     nameAr: 'المبرمجون',
     description: 'يصمم المبرمجون ويبنون الأدوات والمنصات والأتمتة التي تستخدمها المنظمة.',
     color: '#60A5FA',
   },
   {
     id: 'enviros',
     name: 'Enviros',
     nameAr: 'فريق البيئة',
     description: 'ينفذ فريق البيئة برامج الاستدامة: إعادة التدوير، زراعة الأشجار، والتوعية البيئية.',
     color: '#16A34A',
   },
   {
     id: 'messages',
     name: 'Messages',
     nameAr: 'الرسائل',
     description: 'يصوغ فريق الرسائل السرد — المحتوى والإعلام والتوثيق والاتصال.',
     color: '#A78BFA',
   },
   {
     id: 'masar',
     name: 'Masar',
     nameAr: 'مسار',
     description: 'يدعم مسار الطلاب بالتوجيه والمسارات المهنية وبرامج الإرشاد.',
     color: '#F472B6',
   },
   {
     id: 'rstc',
     name: 'RSTC',
     nameAr: 'مركز التدريب',
     description: 'يضع مركز تدريب Resala STEM المناهج ويدرب المدربين ويضمن جودة كل برنامج.',
     color: '#22D3EE',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Committees
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/committees.ts",
  `import type { Committee } from '@/types';

 export const committees: Committee[] = [
   {
     id: 'governance',
     name: 'Governance',
     nameAr: 'لجنة الحوكمة',
     description: 'السياسات واللوائح الرسمية',
     color: '#151A45',
     icon: '⚖️',
   },
   {
     id: 'events',
     name: 'Events',
     nameAr: 'لجنة الفعاليات',
     description: 'تنظيم الفعاليات الكبرى',
     color: '#C1272D',
     icon: '🎯',
   },
   {
     id: 'media',
     name: 'Media',
     nameAr: 'لجنة الإعلام',
     description: 'المحتوى البصري والمحتوى الرقمي',
     color: '#A78BFA',
     icon: '📸',
   },
   {
     id: 'quality',
     name: 'Quality',
     nameAr: 'لجنة الجودة',
     description: 'ضمان جودة البرامج والأنشطة',
     color: '#16A34A',
     icon: '✅',
   },
   {
     id: 'planning',
     name: 'Planning',
     nameAr: 'لجنة التخطيط',
     description: 'التخطيط الاستراتيجي والموازنات',
     color: '#60A5FA',
     icon: '📊',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Members (أسماء حقيقية فقط، بلا IDs في الواجهة)
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/members.ts",
  `import type { Member } from '@/types';

 export const members: Member[] = [
   {
     id: 'M001',
     name: 'ياسين عبد الرحمن',
     role: 'HEAD',
     teamIds: ['helpers', 'rstc'],
     committeeIds: ['governance', 'planning'],
     joinedSeason: 5,
     hours: 84,
     status: 'active',
     bio: 'يقود المنظومة في جميع الفروع.',
     email: 'yassin@resala-stem.org',
   },
   {
     id: 'M002',
     name: 'ملك هشام',
     role: 'VICE',
     teamIds: ['coders'],
     committeeIds: ['governance', 'planning'],
     joinedSeason: 5,
     hours: 78,
     status: 'active',
     bio: 'نائبة الرئيس وقائدة فريق المبرمجين.',
     email: 'malak@resala-stem.org',
   },
   {
     id: 'M003',
     name: 'سلمى عادل',
     role: 'HEAD_HR',
     teamIds: ['rstc'],
     committeeIds: ['governance', 'quality'],
     joinedSeason: 5,
     hours: 62,
     status: 'active',
     bio: 'رئيسة الموارد البشرية على مستوى الفروع.',
     email: 'salma@resala-stem.org',
   },
   {
     id: 'M004',
     name: 'عمر خالد',
     role: 'PRESIDENT',
     teamIds: ['heroes'],
     committeeIds: ['events'],
     joinedSeason: 6,
     hours: 72,
     status: 'active',
     bio: 'رئيس فريق الأبطال.',
     email: 'omar@resala-stem.org',
   },
   {
     id: 'M005',
     name: 'نور السيد',
     role: 'PRESIDENT',
     teamIds: ['enviros'],
     committeeIds: ['events', 'quality'],
     joinedSeason: 6,
     hours: 70,
     status: 'active',
     bio: 'رئيسة فريق البيئة.',
     email: 'nour@resala-stem.org',
   },
   {
     id: 'M006',
     name: 'هنا مصطفى',
     role: 'PRESIDENT',
     teamIds: ['messages'],
     committeeIds: ['media'],
     joinedSeason: 6,
     hours: 68,
     status: 'active',
     bio: 'رئيسة فريق الرسائل.',
     email: 'hana@resala-stem.org',
   },
   {
     id: 'M007',
     name: 'علي جمال',
     role: 'PRESIDENT',
     teamIds: ['masar'],
     committeeIds: ['planning'],
     joinedSeason: 7,
     hours: 65,
     status: 'active',
     bio: 'رئيس فريق مسار.',
     email: 'ali@resala-stem.org',
   },
   {
     id: 'M008',
     name: 'أحمد فؤاد',
     role: 'HR',
     teamIds: ['helpers'],
     committeeIds: ['quality'],
     joinedSeason: 7,
     hours: 42,
     status: 'active',
     bio: 'موارد بشرية فريق المساعدين.',
   },
   {
     id: 'M009',
     name: 'فريدة نبيل',
     role: 'HR',
     teamIds: ['coders'],
     committeeIds: ['quality'],
     joinedSeason: 7,
     hours: 58,
     status: 'active',
     bio: 'موارد بشرية فريق المبرمجين.',
   },
   {
     id: 'M010',
     name: 'يوسف أشرف',
     role: 'HR',
     teamIds: ['heroes'],
     committeeIds: ['events'],
     joinedSeason: 7,
     hours: 50,
     status: 'active',
     bio: 'موارد بشرية فريق الأبطال.',
   },
   {
     id: 'M011',
     name: 'جنى محمود',
     role: 'HR',
     teamIds: ['enviros'],
     committeeIds: ['quality'],
     joinedSeason: 7,
     hours: 48,
     status: 'active',
     bio: 'موارد بشرية فريق البيئة.',
   },
   {
     id: 'M012',
     name: 'كريم سمير',
     role: 'VICE_PRESIDENT',
     teamIds: ['masar'],
     committeeIds: ['planning'],
     joinedSeason: 7,
     hours: 46,
     status: 'active',
     bio: 'نائب رئيس فريق مسار.',
   },
   {
     id: 'M013',
     name: 'ليلى إبراهيم',
     role: 'VICE_PRESIDENT',
     teamIds: ['messages'],
     committeeIds: ['media'],
     joinedSeason: 7,
     hours: 44,
     status: 'active',
     bio: 'نائبة رئيس فريق الرسائل.',
   },
   {
     id: 'M014',
     name: 'زياد طارق',
     role: 'MEMBER',
     teamIds: ['helpers'],
     committeeIds: [],
     joinedSeason: 7,
     hours: 55,
     status: 'active',
     bio: 'عضو في فريق المساعدين.',
   },
   {
     id: 'M015',
     name: 'منة الله سامي',
     role: 'MEMBER',
     teamIds: ['messages'],
     committeeIds: [],
     joinedSeason: 7,
     hours: 38,
     status: 'active',
     bio: 'عضو في فريق الرسائل.',
   },
   {
     id: 'M016',
     name: 'حمزة إبراهيم',
     role: 'MEMBER',
     teamIds: ['coders'],
     committeeIds: [],
     joinedSeason: 6,
     hours: 52,
     status: 'active',
     bio: 'عضو في فريق المبرمجين.',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Contributions (المشاركات — بلا certificates)
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/contributions.ts",
  `import type { Contribution } from '@/types';

 export const contributions: Contribution[] = [
   {
     id: 'C001', memberId: 'M001', memberName: 'ياسين عبد الرحمن',
     teamId: 'helpers', committeeId: 'governance',
     category: 'قيادة', title: 'هيكل الموسم السابع',
     description: 'تعريف البنية والمسؤوليات لكل الفرق.',
     date: '2025-09-20', hours: 12, status: 'approved', seasonId: 'S7',
     createdBy: 'M001',
   },
   {
     id: 'C002', memberId: 'M002', memberName: 'ملك هشام',
     teamId: 'coders', committeeId: 'planning',
     category: 'تطوير', title: 'منصة sbapiaryy',
     description: 'بناء المنصة الرقمية الكاملة للمنظمة.',
     date: '2026-02-14', hours: 20, status: 'approved', seasonId: 'S7',
     createdBy: 'M002',
   },
   {
     id: 'C003', memberId: 'M004', memberName: 'عمر خالد',
     teamId: 'heroes', committeeId: 'events',
     category: 'ميداني', title: 'حملة رمضان',
     description: '9 أيام ميدانية في 4 فروع.',
     date: '2026-03-05', hours: 18, status: 'approved', seasonId: 'S7',
     createdBy: 'M004',
   },
   {
     id: 'C004', memberId: 'M005', memberName: 'نور السيد',
     teamId: 'enviros', committeeId: 'quality',
     category: 'استدامة', title: 'برنامج إعادة التدوير',
     description: '24 محطة فرز في الجامعات.',
     date: '2026-01-09', hours: 16, status: 'approved', seasonId: 'S7',
     createdBy: 'M005',
   },
   {
     id: 'C005', memberId: 'M006', memberName: 'هنا مصطفى',
     teamId: 'messages', committeeId: 'media',
     category: 'علامة', title: 'هوية الموسم السابع',
     description: 'هوية بصرية موحدة لكل الفرق.',
     date: '2025-10-12', hours: 14, status: 'approved', seasonId: 'S7',
     createdBy: 'M006',
   },
   {
     id: 'C006', memberId: 'M007', memberName: 'علي جمال',
     teamId: 'masar', committeeId: 'planning',
     category: 'إرشاد', title: 'مسار الإرشاد',
     description: 'برنامج 12 أسبوعًا لـ45 طالبًا.',
     date: '2025-12-01', hours: 22, status: 'approved', seasonId: 'S7',
     createdBy: 'M007',
   },
   {
     id: 'C007', memberId: 'M003', memberName: 'سلمى عادل',
     teamId: 'rstc', committeeId: 'quality',
     category: 'تدريب', title: 'منهج تدريب المدربين',
     description: '8 وحدات معتمدة رسميًا.',
     date: '2025-10-30', hours: 24, status: 'approved', seasonId: 'S7',
     createdBy: 'M003',
   },
   {
     id: 'C008', memberId: 'M014', memberName: 'زياد طارق',
     teamId: 'helpers', category: 'عمليات', title: 'مسار التأهيل',
     description: 'تقليص التأهيل من 3 أسابيع إلى 5 أيام.',
     date: '2025-11-05', hours: 16, status: 'approved', seasonId: 'S7',
     createdBy: 'M014',
   },
   {
     id: 'C009', memberId: 'M009', memberName: 'فريدة نبيل',
     teamId: 'coders', committeeId: 'quality',
     category: 'تصميم', title: 'مكتبة المكونات',
     description: '18 مكوّنًا قابلة لإعادة الاستخدام.',
     date: '2026-01-22', hours: 20, status: 'approved', seasonId: 'S7',
     createdBy: 'M009',
   },
   {
     id: 'C010', memberId: 'M010', memberName: 'يوسف أشرف',
     teamId: 'heroes', committeeId: 'events',
     category: 'ميداني', title: 'حملة المنصورة',
     description: 'تدريب 60 متطوعًا في أسبوع.',
     date: '2025-11-18', hours: 14, status: 'approved', seasonId: 'S7',
     createdBy: 'M010',
   },
   {
     id: 'C011', memberId: 'M011', memberName: 'جنى محمود',
     teamId: 'enviros', committeeId: 'quality',
     category: 'بيانات', title: 'مؤشرات الأثر',
     description: 'تعريف مقاييس الأثر البيئي.',
     date: '2026-02-02', hours: 12, status: 'approved', seasonId: 'S7',
     createdBy: 'M011',
   },
   {
     id: 'C012', memberId: 'M012', memberName: 'كريم سمير',
     teamId: 'masar', committeeId: 'planning',
     category: 'ورش', title: 'ورش المسارات',
     description: '6 ورش لتوجيه الطلاب.',
     date: '2026-02-19', hours: 10, status: 'approved', seasonId: 'S7',
     createdBy: 'M012',
   },
   {
     id: 'C013', memberId: 'M013', memberName: 'ليلى إبراهيم',
     teamId: 'messages', committeeId: 'media',
     category: 'توثيق', title: 'أرشيف الموسم',
     description: 'تصوير وتوثيق 32 حدثًا.',
     date: '2026-03-20', hours: 12, status: 'approved', seasonId: 'S7',
     createdBy: 'M013',
   },
   {
     id: 'C014', memberId: 'M008', memberName: 'أحمد فؤاد',
     teamId: 'helpers', committeeId: 'quality',
     category: 'تنسيق', title: 'نظام التنسيق بين الفروع',
     description: 'تقليل تعارضات الجدولة بنسبة 70%.',
     date: '2026-01-15', hours: 14, status: 'approved', seasonId: 'S7',
     createdBy: 'M008',
   },
   {
     id: 'C015', memberId: 'M015', memberName: 'منة الله سامي',
     teamId: 'messages', category: 'محتوى', title: 'محتوى الموسم السابع',
     description: 'سلسلة محتوى يومية.',
     date: '2026-02-10', hours: 18, status: 'approved', seasonId: 'S7',
     createdBy: 'M015',
   },
   {
     id: 'C016', memberId: 'M016', memberName: 'حمزة إبراهيم',
     teamId: 'coders', category: 'تطوير', title: 'واجهة التقارير',
     description: 'صفحة تقارير تفاعلية.',
     date: '2026-01-30', hours: 22, status: 'pending', seasonId: 'S7',
     createdBy: 'M016',
   },
   {
     id: 'C017', memberId: 'M014', memberName: 'زياد طارق',
     teamId: 'helpers', category: 'عمليات', title: 'دعم الفرق الجديدة',
     description: 'تأهيل 3 فروع جديدة.',
     date: '2026-02-25', hours: 18, status: 'pending', seasonId: 'S7',
     createdBy: 'M014',
   },
   {
     id: 'C018', memberId: 'M010', memberName: 'يوسف أشرف',
     teamId: 'enviros', committeeId: 'events',
     category: 'زراعة', title: 'يوم التشجير',
     description: 'زراعة 300 شجرة.',
     date: '2025-12-14', hours: 12, status: 'approved', seasonId: 'S7',
     createdBy: 'M010',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Requests
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/requests.ts",
  `import type { RequestRecord } from '@/types';

 export const requests: RequestRecord[] = [
   {
     id: 'REQ001',
     type: 'TRANSFER',
     requesterUid: 'seed-u-014',
     requesterMemberId: 'M014',
     requesterName: 'زياد طارق',
     subjectMemberId: 'M014',
     fromTeamId: 'helpers',
     toTeamId: 'heroes',
     title: 'طلب نقل إلى فريق الأبطال',
     description: 'أرغب في الانتقال للعمل الميداني مع فريق الأبطال.',
     status: 'PENDING',
     currentStepOrder: 1,
     priority: 'NORMAL',
     submittedAt: '2026-05-01',
     updatedAt: '2026-05-01',
     seasonId: 'S7',
   },
   {
     id: 'REQ002',
     type: 'PROMOTION',
     requesterUid: 'seed-u-009',
     requesterMemberId: 'M009',
     requesterName: 'فريدة نبيل',
     subjectMemberId: 'M009',
     title: 'طلب ترقية إلى رئيس موارد بشرية',
     description: 'أرى أنني قادرة على تولي مسؤوليات أوسع في الموارد البشرية.',
     status: 'IN_REVIEW',
     currentStepOrder: 2,
     priority: 'HIGH',
     submittedAt: '2026-04-20',
     updatedAt: '2026-04-28',
     seasonId: 'S7',
   },
   {
     id: 'REQ003',
     type: 'RESIGNATION',
     requesterUid: 'seed-u-015',
     requesterMemberId: 'M015',
     requesterName: 'منة الله سامي',
     subjectMemberId: 'M015',
     title: 'طلب استقالة',
     description: 'ظروف شخصية تمنعني من الاستمرار هذا الموسم.',
     status: 'APPROVED',
     currentStepOrder: 3,
     priority: 'NORMAL',
     submittedAt: '2026-03-10',
     updatedAt: '2026-03-18',
     seasonId: 'S7',
   },
   {
     id: 'REQ004',
     type: 'COMPLAINT',
     requesterUid: 'seed-u-011',
     requesterMemberId: 'M011',
     requesterName: 'جنى محمود',
     subjectMemberId: 'M010',
     title: 'شكوى بخصوص التنسيق',
     description: 'تعارض في مواعيد الفعاليات بين فريقين.',
     status: 'IN_REVIEW',
     currentStepOrder: 1,
     priority: 'URGENT',
     submittedAt: '2026-04-15',
     updatedAt: '2026-04-22',
     seasonId: 'S7',
   },
   {
     id: 'REQ005',
     type: 'SUGGESTION',
     requesterUid: 'seed-u-013',
     requesterMemberId: 'M013',
     requesterName: 'ليلى إبراهيم',
     title: 'إضافة بودكاست شهري',
     description: 'أقترح إطلاق بودكاست شهري للمنظمة.',
     status: 'APPROVED',
     currentStepOrder: 2,
     priority: 'LOW',
     submittedAt: '2026-02-05',
     updatedAt: '2026-02-15',
     seasonId: 'S7',
   },
   {
     id: 'REQ006',
     type: 'TRANSFER',
     requesterUid: 'seed-u-016',
     requesterMemberId: 'M016',
     requesterName: 'حمزة إبراهيم',
     subjectMemberId: 'M016',
     fromTeamId: 'coders',
     toTeamId: 'masar',
     title: 'طلب نقل إلى فريق مسار',
     description: 'أرغب في الانتقال للإرشاد الطلابي.',
     status: 'REJECTED',
     currentStepOrder: 2,
     priority: 'NORMAL',
     submittedAt: '2026-01-10',
     updatedAt: '2026-01-20',
     seasonId: 'S7',
   },
   {
     id: 'REQ007',
     type: 'LEAVE',
     requesterUid: 'seed-u-012',
     requesterMemberId: 'M012',
     requesterName: 'كريم سمير',
     subjectMemberId: 'M012',
     title: 'طلب إجازة أسبوعين',
     description: 'ظروف دراسة تتطلب التغيب.',
     status: 'APPROVED',
     currentStepOrder: 2,
     priority: 'NORMAL',
     submittedAt: '2026-04-01',
     updatedAt: '2026-04-03',
     seasonId: 'S7',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Approvals (التسلسل الصحيح: رئيس الفريق → HR الفريق → Head HR → HEAD)
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/approvals.ts",
  `import type { ApprovalStep } from '@/types';

 export const approvals: ApprovalStep[] = [
   /* REQ001 — نقل إلى Heroes (Helpers → Heroes) */
   {
     id: 'APR001', requestId: 'REQ001', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'helpers',
     status: 'PENDING',
   },
   {
     id: 'APR002', requestId: 'REQ001', order: 2,
     requiredRole: 'PRESIDENT', requiredTeamId: 'heroes',
     status: 'PENDING',
   },
   {
     id: 'APR003', requestId: 'REQ001', order: 3,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     status: 'PENDING',
   },
   {
     id: 'APR004', requestId: 'REQ001', order: 4,
     requiredRole: 'HEAD', requiredTeamId: null,
     status: 'PENDING',
   },

   /* REQ002 — ترقية فريدة */
   {
     id: 'APR005', requestId: 'REQ002', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'coders',
     approverUid: 'seed-u-002', approverName: 'ملك هشام',
     status: 'APPROVED', comment: 'أداء ممتاز هذا الموسم.', actionDate: '2026-04-22',
   },
   {
     id: 'APR006', requestId: 'REQ002', order: 2,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     status: 'PENDING',
   },
   {
     id: 'APR007', requestId: 'REQ002', order: 3,
     requiredRole: 'HEAD', requiredTeamId: null,
     status: 'PENDING',
   },

   /* REQ003 — استقالة منة (Approved) */
   {
     id: 'APR008', requestId: 'REQ003', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'messages',
     approverUid: 'seed-u-006', approverName: 'هنا مصطفى',
     status: 'APPROVED', comment: 'نأسف لرحيلك.', actionDate: '2026-03-12',
   },
   {
     id: 'APR009', requestId: 'REQ003', order: 2,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     approverUid: 'seed-u-003', approverName: 'سلمى عادل',
     status: 'APPROVED', comment: 'تم تسوية المستحقات.', actionDate: '2026-03-15',
   },
   {
     id: 'APR010', requestId: 'REQ003', order: 3,
     requiredRole: 'HEAD', requiredTeamId: null,
     approverUid: 'seed-u-001', approverName: 'ياسين عبد الرحمن',
     status: 'APPROVED', comment: 'بالتوفيق.', actionDate: '2026-03-18',
   },

   /* REQ004 — شكوى */
   {
     id: 'APR011', requestId: 'REQ004', order: 1,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     status: 'PENDING',
   },
   {
     id: 'APR012', requestId: 'REQ004', order: 2,
     requiredRole: 'VICE', requiredTeamId: null,
     status: 'PENDING',
   },

   /* REQ005 — اقتراح */
   {
     id: 'APR013', requestId: 'REQ005', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'messages',
     approverUid: 'seed-u-006', approverName: 'هنا مصطفى',
     status: 'APPROVED', comment: 'فكرة رائعة.', actionDate: '2026-02-10',
   },
   {
     id: 'APR014', requestId: 'REQ005', order: 2,
     requiredRole: 'HEAD', requiredTeamId: null,
     approverUid: 'seed-u-001', approverName: 'ياسين عبد الرحمن',
     status: 'APPROVED', comment: 'معتمد.', actionDate: '2026-02-15',
   },

   /* REQ006 — نقل مرفوض */
   {
     id: 'APR015', requestId: 'REQ006', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'coders',
     approverUid: 'seed-u-002', approverName: 'ملك هشام',
     status: 'REJECTED', comment: 'نحتاجك في الفريق هذا الموسم.', actionDate: '2026-01-15',
   },
   {
     id: 'APR016', requestId: 'REQ006', order: 2,
     requiredRole: 'HEAD', requiredTeamId: null,
     status: 'SKIPPED',
   },

   /* REQ007 — إجازة */
   {
     id: 'APR017', requestId: 'REQ007', order: 1,
     requiredRole: 'PRESIDENT', requiredTeamId: 'masar',
     approverUid: 'seed-u-007', approverName: 'علي جمال',
     status: 'APPROVED', comment: 'بالتوفيق في دراستك.', actionDate: '2026-04-02',
   },
   {
     id: 'APR018', requestId: 'REQ007', order: 2,
     requiredRole: 'HEAD_HR', requiredTeamId: null,
     approverUid: 'seed-u-003', approverName: 'سلمى عادل',
     status: 'APPROVED', comment: 'مسجّل.', actionDate: '2026-04-03',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Warnings
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/warnings.ts",
  `import type { WarningRecord } from '@/types';

 export const warnings: WarningRecord[] = [
   {
     id: 'WARN001',
     memberId: 'M015',
     memberName: 'منة الله سامي',
     type: 'VERBAL',
     reason: 'غياب متكرر عن الاجتماعات الأسبوعية',
     severity: 'LOW',
     issuedByMemberId: 'M006',
     issuedByName: 'هنا مصطفى',
     issuedAt: '2026-02-01',
     status: 'resolved',
     notes: 'تم التحسن بعد الملاحظة الشفهية.',
   },
   {
     id: 'WARN002',
     memberId: 'M010',
     memberName: 'يوسف أشرف',
     type: 'WRITTEN',
     reason: 'تأخر عن تسليم تقرير ميداني',
     severity: 'MEDIUM',
     issuedByMemberId: 'M004',
     issuedByName: 'عمر خالد',
     issuedAt: '2026-03-20',
     status: 'active',
     notes: 'تم التنبيه كتابيًا، بانتظار التحسن.',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Achievements
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/achievements.ts",
  `import type { Achievement } from '@/types';

 export const achievements: Achievement[] = [
   {
     id: 'A001',
     title: 'أفضل فرع — الموسم السادس',
     description: 'جائزة الأداء العام المتميز على مستوى الفروع.',
     date: '2025-07-10',
     level: 'national',
     teamIds: ['helpers', 'rstc'],
     memberIds: ['M001'],
     memberNames: ['ياسين عبد الرحمن'],
     seasonId: 'S6',
   },
   {
     id: 'A002',
     title: 'جائزة التطوع الوطنية',
     description: 'تكريم على حملة رمضان وأثرها المجتمعي.',
     date: '2026-03-28',
     level: 'national',
     teamIds: ['heroes'],
     memberIds: ['M004', 'M010'],
     memberNames: ['عمر خالد', 'يوسف أشرف'],
     seasonId: 'S7',
   },
   {
     id: 'A003',
     title: 'شهادة الفريق الأخضر',
     description: 'اعتماد ثلاثة فروع وفق معايير الاستدامة.',
     date: '2026-02-11',
     level: 'branch',
     teamIds: ['enviros'],
     memberIds: ['M005', 'M011'],
     memberNames: ['نور السيد', 'جنى محمود'],
     seasonId: 'S7',
   },
   {
     id: 'A004',
     title: 'أفضل برنامج تعليمي',
     description: 'جائزة إقليمية لمسار الإرشاد الطلابي.',
     date: '2026-01-30',
     level: 'national',
     teamIds: ['masar'],
     memberIds: ['M007', 'M012'],
     memberNames: ['علي جمال', 'كريم سمير'],
     seasonId: 'S7',
   },
   {
     id: 'A005',
     title: 'اعتماد 40 مدربًا',
     description: 'شهادة معتمدة من مركز التدريب لـ40 مدربًا في موسم واحد.',
     date: '2025-12-20',
     level: 'branch',
     teamIds: ['rstc'],
     memberIds: ['M003'],
     memberNames: ['سلمى عادل'],
     seasonId: 'S7',
   },
   {
     id: 'A006',
     title: 'تكريم مفتوح المصدر',
     description: 'منصة sbapiaryy تحصل على تكريم دولي كمشروع مفتوح المصدر.',
     date: '2026-02-25',
     level: 'international',
     teamIds: ['coders'],
     memberIds: ['M002', 'M009'],
     memberNames: ['ملك هشام', 'فريدة نبيل'],
     seasonId: 'S7',
   },
   {
     id: 'A007',
     title: 'جائزة الإعلام المتميز',
     description: 'تكريم على هوية الموسم السابع والأرشيف البصري.',
     date: '2026-03-15',
     level: 'branch',
     teamIds: ['messages'],
     memberIds: ['M006', 'M013'],
     memberNames: ['هنا مصطفى', 'ليلى إبراهيم'],
     seasonId: 'S7',
   },
   {
     id: 'A008',
     title: 'التميّز العام — الموسم السابع',
     description: 'تجاوز المنظمة كل الأهداف المقررة للموسم.',
     date: '2026-04-02',
     level: 'national',
     teamIds: ['helpers', 'heroes', 'coders', 'enviros', 'messages', 'masar', 'rstc'],
     memberIds: ['M001'],
     memberNames: ['ياسين عبد الرحمن'],
     seasonId: 'S7',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Notifications
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/notifications.ts",
  `import type { Notification } from '@/types';

 export const notifications: Notification[] = [
   {
     id: 'N001',
     userId: 'seed-u-001',
     title: 'طلب نقل جديد بانتظارك',
     message: 'زياد طارق طلب النقل من فريق المساعدين إلى فريق الأبطال.',
     type: 'request',
     date: '2026-05-01T10:00:00.000Z',
     read: false,
     route: '/requests/REQ001',
     priority: 'high',
     fromName: 'زياد طارق',
   },
   {
     id: 'N002',
     userId: 'seed-u-003',
     title: 'طلب ترقية في المرحلة الثانية',
     message: 'فريدة نبيل في المرحلة الثانية من طلب الترقية.',
     type: 'approval',
     date: '2026-04-28T14:00:00.000Z',
     read: false,
     route: '/requests/REQ002',
     priority: 'normal',
     fromName: 'فريدة نبيل',
   },
   {
     id: 'N003',
     userId: 'seed-u-009',
     title: 'تم قبول مشاركتك',
     message: 'تمت الموافقة على مشاركتك "مكتبة المكونات" (+100 نقطة).',
     type: 'participation',
     date: '2026-01-23T09:00:00.000Z',
     read: true,
     route: '/my-contributions',
   },
   {
     id: 'N004',
     userId: 'seed-u-002',
     title: 'رسالة جديدة',
     message: 'ليلى إبراهيم أرسلت لك رسالة في محادثة فريق الرسائل.',
     type: 'message',
     date: '2026-05-02T11:00:00.000Z',
     read: false,
     route: '/conversations',
     priority: 'high',
     fromName: 'ليلى إبراهيم',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Conversations (Messenger-style)
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/conversations.ts",
  `import type { Conversation, Message } from '@/types';

 export const conversations: Conversation[] = [
   {
     id: 'CONV-GENERAL',
     type: 'general',
     title: 'المحادثة العامة',
     participantUids: [],
     lastMessageAt: '2026-05-02T20:00:00.000Z',
     lastMessageText: 'أهلاً بالجميع في المنصة الجديدة!',
     lastMessageSender: 'ياسين عبد الرحمن',
     createdBy: 'seed-u-001',
   },
   {
     id: 'CONV-TEAM-helpers',
     type: 'team',
     title: 'فريق المساعدون',
     teamId: 'helpers',
     participantUids: [],
     lastMessageAt: '2026-05-01T18:30:00.000Z',
     lastMessageText: 'جدول الأسبوع جاهز.',
     lastMessageSender: 'أحمد فؤاد',
   },
   {
     id: 'CONV-TEAM-coders',
     type: 'team',
     title: 'فريق المبرمجون',
     teamId: 'coders',
     participantUids: [],
     lastMessageAt: '2026-05-02T15:00:00.000Z',
     lastMessageText: 'المكتبة جاهزة للنشر.',
     lastMessageSender: 'ملك هشام',
   },
   {
     id: 'CONV-PRIVATE-001',
     type: 'private',
     title: '',
     participantUids: ['seed-u-001', 'seed-u-003'],
     lastMessageAt: '2026-05-02T12:00:00.000Z',
     lastMessageText: 'سأراجع الطلب حالًا.',
     lastMessageSender: 'ياسين عبد الرحمن',
   },
 ];

 export const messages: Message[] = [
   {
     id: 'MSG001',
     conversationId: 'CONV-GENERAL',
     senderUid: 'seed-u-001',
     senderName: 'ياسين عبد الرحمن',
     text: 'أهلاً بالجميع في المنصة الجديدة!',
     sentAt: '2026-05-02T20:00:00.000Z',
   },
   {
     id: 'MSG002',
     conversationId: 'CONV-TEAM-helpers',
     senderUid: 'seed-u-008',
     senderName: 'أحمد فؤاد',
     text: 'جدول الأسبوع جاهز.',
     sentAt: '2026-05-01T18:30:00.000Z',
   },
   {
     id: 'MSG003',
     conversationId: 'CONV-TEAM-coders',
     senderUid: 'seed-u-002',
     senderName: 'ملك هشام',
     text: 'المكتبة جاهزة للنشر.',
     sentAt: '2026-05-02T15:00:00.000Z',
   },
   {
     id: 'MSG004',
     conversationId: 'CONV-PRIVATE-001',
     senderUid: 'seed-u-003',
     senderName: 'سلمى عادل',
     text: 'هل راجعت طلب الترقية؟',
     sentAt: '2026-05-02T11:30:00.000Z',
   },
   {
     id: 'MSG005',
     conversationId: 'CONV-PRIVATE-001',
     senderUid: 'seed-u-001',
     senderName: 'ياسين عبد الرحمن',
     text: 'سأراجع الطلب حالًا.',
     sentAt: '2026-05-02T12:00:00.000Z',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Calendar (events موحدة للفريق أو عامة للكل)
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/calendar.ts",
  `import type { CalendarEvent } from '@/types';

 export const calendarEvents: CalendarEvent[] = [
   {
     id: 'EVT001',
     title: 'اجتماع رؤساء الفرق الشهري',
     description: 'اجتماع جميع رؤساء الفرق لمناقشة تقدم الموسم.',
     date: '2026-05-10',
     time: '19:00',
     endTime: '20:30',
     teamId: null,
     isPublic: true,
     type: 'meeting',
     location: 'أونلاين — Zoom',
     seasonId: 'S7',
     createdBy: 'seed-u-001',
     createdByName: 'ياسين عبد الرحمن',
   },
   {
     id: 'EVT002',
     title: 'ورشة تطوير الواجهات',
     description: 'ورشة داخلية لفريق المبرمجين.',
     date: '2026-05-15',
     time: '18:00',
     endTime: '20:00',
     teamId: 'coders',
     isPublic: false,
     type: 'workshop',
     location: 'المقر الرئيسي',
     seasonId: 'S7',
     createdBy: 'seed-u-002',
     createdByName: 'ملك هشام',
   },
   {
     id: 'EVT003',
     title: 'الموعد النهائي لتقارير الموارد البشرية',
     description: 'آخر موعد لتسليم تقارير الموارد البشرية للموسم.',
     date: '2026-05-20',
     teamId: null,
     isPublic: true,
     type: 'deadline',
     seasonId: 'S7',
     createdBy: 'seed-u-003',
     createdByName: 'سلمى عادل',
   },
   {
     id: 'EVT004',
     title: 'يوم التشجير الكبير',
     description: 'فعالية بيئية كبرى بالتعاون مع فريق البيئة.',
     date: '2026-06-01',
     time: '08:00',
     endTime: '14:00',
     teamId: 'enviros',
     isPublic: false,
     type: 'event',
     location: 'حديقة الأزهر',
     seasonId: 'S7',
     createdBy: 'seed-u-005',
     createdByName: 'نور السيد',
   },
   {
     id: 'EVT005',
     title: 'حفل نهاية الموسم',
     description: 'حفل تكريم الأعضاء المتميزين.',
     date: '2026-06-30',
     time: '20:00',
     endTime: '23:00',
     teamId: null,
     isPublic: true,
     type: 'event',
     location: 'قاعة الاحتفالات الكبرى',
     seasonId: 'S7',
     createdBy: 'seed-u-001',
     createdByName: 'ياسين عبد الرحمن',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Timeline
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/timeline.ts",
  `import type { TimelineEvent } from '@/types';

 export const timeline: TimelineEvent[] = [
   { id: 'T001', memberId: 'M001', memberName: 'ياسين عبد الرحمن', type: 'join', title: 'انضم إلى المنظمة', date: '2021-09-01' },
   { id: 'T002', memberId: 'M001', memberName: 'ياسين عبد الرحمن', type: 'promotion', title: 'ترقية إلى رئيس الفروع', date: '2025-09-01' },
   { id: 'T003', memberId: 'M002', memberName: 'ملك هشام', type: 'join', title: 'انضم إلى فريق المبرمجين', date: '2021-09-01' },
   { id: 'T004', memberId: 'M009', memberName: 'فريدة نبيل', type: 'join', title: 'انضم إلى فريق المبرمجين', date: '2025-09-01' },
   { id: 'T005', memberId: 'M009', memberName: 'فريدة نبيل', type: 'contribution', title: 'مكتبة المكونات', date: '2026-01-22', relatedId: 'C009' },
   { id: 'T006', memberId: 'M010', memberName: 'يوسف أشرف', type: 'warning', title: 'تحذير كتابي', date: '2026-03-20', relatedId: 'WARN002' },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Audit
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/audit.ts",
  `import type { AuditRecord } from '@/types';

 export const audit: AuditRecord[] = [
   {
     id: 'AUD001',
     actorUid: 'seed-u-001',
     actorName: 'ياسين عبد الرحمن',
     action: 'CREATE_REQUEST',
     entity: 'Request',
     entityId: 'REQ001',
     date: '2026-05-01T09:00:00.000Z',
     description: 'إنشاء طلب نقل',
   },
   {
     id: 'AUD002',
     actorUid: 'seed-u-003',
     actorName: 'سلمى عادل',
     action: 'APPROVE_STEP',
     entity: 'Approval',
     entityId: 'APR009',
     date: '2026-03-15T10:00:00.000Z',
     description: 'موافقة على طلب استقالة',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Governance
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/governance.ts",
  `import type { GovernanceDocument } from '@/types';

 export const governanceDocuments: GovernanceDocument[] = [
   {
     id: 'GOV001',
     title: 'لائحة العضوية',
     category: 'السياسات',
     description: 'قواعد قبول الأعضاء واستمرارهم داخل المنظمة.',
     version: '2.1',
     updatedAt: '2025-09-01',
     content: 'تنظم هذه اللائحة شروط قبول الأعضاء وحقوقهم وواجباتهم داخل المنظمة. تشمل معايير القبول وفترة التجربة والاستمرارية والاستقالة.',
   },
   {
     id: 'GOV002',
     title: 'قواعد المشاركات',
     category: 'الإجراءات',
     description: 'كيفية احتساب المشاركات والساعات.',
     version: '1.5',
     updatedAt: '2025-10-15',
     content: 'كل ساعة عمل موثقة ومعتمدة تحتسب بـ 5 نقاط. تُحتسب المشاركات فقط بعد موافقة رئيس الفريق وموارد البشرية.',
   },
   {
     id: 'GOV003',
     title: 'سلسلة الموافقات',
     category: 'الحوكمة',
     description: 'مراحل الموافقة على الطلبات.',
     version: '2.0',
     updatedAt: '2025-11-01',
     content: 'يمر كل طلب بسلسلة موافقات: رئيس الفريق → موارد بشرية الفريق → رئيس الموارد البشرية → رئيس الفروع.',
   },
   {
     id: 'GOV004',
     title: 'سياسة الانضباط',
     category: 'السياسات',
     description: 'أنواع التحذيرات والإجراءات.',
     version: '1.0',
     updatedAt: '2025-12-01',
     content: 'يوجد ثلاثة مستويات للتحذير: شفهي، كتابي، ونهائي. كل تحذير يُوثَّق ويُبلَّغ للعضو المعني.',
   },
   {
     id: 'GOV005',
     title: 'قواعد النقل',
     category: 'الإجراءات',
     description: 'إجراءات النقل بين الفرق.',
     version: '1.2',
     updatedAt: '2025-12-10',
     content: 'يجب موافقة رئيس الفريق الحالي، رئيس الفريق الجديد، ثم الموارد البشرية ورئيس الفروع.',
   },
   {
     id: 'GOV006',
     title: 'لائحة اللجان',
     category: 'الحوكمة',
     description: 'تنظيم اللجان ومهامها.',
     version: '1.0',
     updatedAt: '2026-01-15',
     content: 'تضم المنظمة خمس لجان: الحوكمة، الفعاليات، الإعلام، الجودة، والتخطيط. لكل لجنة مهام محددة وتقارير دورية.',
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Onboarding Cards
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/onboarding.ts",
  `import type { OnboardingCard } from '@/types';

 export const onboardingCards: OnboardingCard[] = [
   {
     id: 'welcome',
     icon: '👋',
     title: 'أهلاً بك في sbapiaryy',
     description: 'منصة فروع Resala STEM لمتابعة كل شيء في مكان واحد — الأعضاء، الفرق، المشاركات، الطلبات، والإنجازات.',
     accentColor: '#C1272D',
     order: 1,
   },
   {
     id: 'teams',
     icon: '🏆',
     title: 'سبع فرق متخصصة',
     description: 'كل فريق له مجال واحد واضح: المساعدون، الأبطال، المبرمجون، البيئة، الرسائل، مسار، ومركز التدريب.',
     accentColor: '#60A5FA',
     order: 2,
   },
   {
     id: 'contributions',
     icon: '📊',
     title: 'شارك وسجّل ساعاتك',
     description: 'كل ساعة عمل موثقة = 5 نقاط. سجّل مشاركاتك واحصل على موافقة رئيس فريقك وموارد البشرية.',
     accentColor: '#16A34A',
     order: 3,
   },
   {
     id: 'league',
     icon: '🥇',
     title: 'الليج والتنافس',
     description: 'ترتيبك على مستوى الفريق، اللجنة، والمنظمة كلها. تابع تقدمك وتنافس مع الأعضاء.',
     accentColor: '#F59E0B',
     order: 4,
   },
   {
     id: 'requests',
     icon: '📋',
     title: 'الطلبات والموافقات',
     description: 'اطلب نقلًا، ترقية، إجازة، أو ارفع شكوى. يمر الطلب بسلسلة موافقات واضحة وتتابعه لحظيًا.',
     accentColor: '#A78BFA',
     order: 5,
   },
   {
     id: 'messages',
     icon: '💬',
     title: 'محادثات لحظية',
     description: 'تواصل مع فريقك، مع الإدارة، أو في المحادثة العامة — كل شيء داخل المنصة.',
     accentColor: '#EC4899',
     order: 6,
   },
   {
     id: 'calendar',
     icon: '📅',
     title: 'تقويم مشترك',
     description: 'كل الأحداث والاجتماعات والمواعيد النهائية في مكان واحد. زامنها مع Google Calendar.',
     accentColor: '#22D3EE',
     order: 7,
   },
   {
     id: 'pwa',
     icon: '📱',
     title: 'ثبّت التطبيق',
     description: 'أضف sbapiaryy إلى شاشة هاتفك الرئيسية واستخدمه كتطبيق أصلي — بدون شريط المتصفح.',
     accentColor: '#C1272D',
     order: 8,
   },
 ];
 `
);

/* ═══════════════════════════════════════════════════════════════
    DATA — Index (Barrel)
    ═══════════════════════════════════════════════════════════════ */

file(
  "src/data/index.ts",
  `export { site, seasons, activeSeason } from './site';
 export { roles, roleLabels } from './roles';
 export { teams } from './teams';
 export { committees } from './committees';
 export { members } from './members';
 export { contributions } from './contributions';
 export { requests } from './requests';
 export { approvals } from './approvals';
 export { warnings } from './warnings';
 export { achievements } from './achievements';
 export { notifications } from './notifications';
 export { conversations, messages } from './conversations';
 export { calendarEvents } from './calendar';
 export { timeline } from './timeline';
 export { audit } from './audit';
 export { governanceDocuments } from './governance';
 export { onboardingCards } from './onboarding';
 `
);

console.log("  ✓ Part 2 loaded: Types + Data (بدون شهادات/توصيات)");
/* ═══════════════════════════════════════════════════════════════
   LIB — Firebase Core
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/firebase.ts",
  `import { initializeApp } from 'firebase/app';
   import { getAuth } from 'firebase/auth';
   import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
   };

   export const app = initializeApp(firebaseConfig);
   export const auth = getAuth(app);
   export const db = getFirestore(app);

   // تفعيل التخزين المحلي ليعمل الموقع بدون إنترنت جزئيًا
   if (typeof window !== 'undefined') {
     enableIndexedDbPersistence(db).catch(() => {
       // يفشل إذا كان هناك تاب آخر مفتوح — طبيعي
     });
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — DB Helpers
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/db.ts",
  `import {
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
     const { id, ...rest } = data;
     if (id) {
       await setDoc(doc(db, collectionName, id), rest);
       return id;
     }
     const ref = await addDoc(collection(db, collectionName), rest);
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
     return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
   }

   export function today(): string {
     return new Date().toISOString().slice(0, 10);
   }

   export function now(): string {
     return new Date().toISOString();
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — Auth (Admin creates accounts + Forgot password + Change password)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/auth.ts",
  `import {
     signInWithEmailAndPassword,
     signOut,
     onAuthStateChanged,
     sendPasswordResetEmail,
     updatePassword,
     type User as FirebaseUser,
   } from 'firebase/auth';
   import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
   import { auth, db } from './firebase';
   import type { AppUser, RoleId, TeamId, Member } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      تسجيل الدخول
      ═══════════════════════════════════════════════════════════════ */

   export async function login(email: string, password: string): Promise<AppUser> {
     const cred = await signInWithEmailAndPassword(auth, email, password);
     return await ensureUserDoc(cred.user);
   }

   export async function logout(): Promise<void> {
     await signOut(auth);
   }

   /* ═══════════════════════════════════════════════════════════════
      إعادة تعيين كلمة المرور (Forgot password)
      ═══════════════════════════════════════════════════════════════ */

   export async function sendPasswordReset(email: string): Promise<void> {
     await sendPasswordResetEmail(auth, email);
   }

   /* ═══════════════════════════════════════════════════════════════
      تغيير كلمة المرور (بعد first-login)
      ═══════════════════════════════════════════════════════════════ */

   export async function changePassword(newPassword: string): Promise<void> {
     const user = auth.currentUser;
     if (!user) throw new Error('لا يوجد مستخدم مسجل');
     await updatePassword(user, newPassword);
     await updateDoc(doc(db, 'users', user.uid), {
       mustChangePassword: false,
     });
   }

   /* ═══════════════════════════════════════════════════════════════
      إنشاء حساب من الأدمن (بريد + باسورد مؤقت)
      — يتم إنشاء العضو مباشرة بالاسم والدور والفريق واللجنة
      — العضو يُلزَم بتغيير كلمة المرور عند أول دخول
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

   export async function adminCreateMember(input: CreateMemberInput, adminUid: string): Promise<string> {
     const response = await fetch(
       \`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=\${import.meta.env.VITE_FIREBASE_API_KEY}\`,
       {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           email: input.email.trim(),
           password: input.temporaryPassword,
           returnSecureToken: true,
         }),
       },
     );

     const data = await response.json();
     if (!response.ok) {
       const code = data?.error?.message ?? '';
       if (code.includes('EMAIL_EXISTS')) throw new Error('البريد مستخدم بالفعل');
       if (code.includes('WEAK_PASSWORD')) throw new Error('كلمة المرور ضعيفة');
       if (code.includes('INVALID_EMAIL')) throw new Error('البريد الإلكتروني غير صالح');
       throw new Error('فشل إنشاء الحساب');
     }

     const uid: string = data.localId;
     const memberId = 'M-' + uid.slice(0, 8).toUpperCase();

     const userData: AppUser = {
       uid,
       email: input.email.trim(),
       displayName: input.name.trim(),
       role: input.role,
       teamId: input.teamIds[0] ?? null,
       committeeIds: input.committeeIds,
       memberId,
       createdAt: new Date().toISOString(),
       emailVerified: false,
       mustChangePassword: true,
       createdByAdmin: adminUid,
     };

     await setDoc(doc(db, 'users', uid), userData);

     const memberData: Member = {
       id: memberId,
       name: input.name.trim(),
       role: input.role,
       teamIds: input.teamIds,
       committeeIds: input.committeeIds,
       joinedSeason: 7,
       hours: 0,
       status: 'active',
       bio: input.bio?.trim() || undefined,
       email: input.email.trim(),
       linkedUserId: uid,
     };

     await setDoc(doc(db, 'members', memberId), memberData);

     return uid;
   }

   /* ═══════════════════════════════════════════════════════════════
      مزامنة user doc
      ═══════════════════════════════════════════════════════════════ */

   async function ensureUserDoc(fbUser: FirebaseUser): Promise<AppUser> {
     const ref = doc(db, 'users', fbUser.uid);
     const snap = await getDoc(ref);

     if (snap.exists()) {
       const data = snap.data() as Omit<AppUser, 'uid'>;
       return { uid: fbUser.uid, ...data, emailVerified: fbUser.emailVerified };
     }

     const fallback: AppUser = {
       uid: fbUser.uid,
       email: fbUser.email ?? '',
       displayName: fbUser.displayName ?? fbUser.email ?? 'عضو',
       role: 'VIEWER',
       teamId: null,
       committeeIds: [],
       memberId: null,
       createdAt: new Date().toISOString(),
       emailVerified: fbUser.emailVerified,
       mustChangePassword: false,
     };

     await setDoc(ref, fallback);
     return fallback;
   }

   /* ═══════════════════════════════════════════════════════════════
      Observer
      ═══════════════════════════════════════════════════════════════ */

   export function observeAuth(
     callback: (user: AppUser | null, loading: boolean) => void,
   ): () => void {
     return onAuthStateChanged(auth, async (fbUser) => {
       if (!fbUser) {
         callback(null, false);
         return;
       }
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
      LIB — Permissions (Team-based + Hierarchy)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/permissions.ts",
  `import type { AppUser, RoleId, TeamId, RequestRecord, ApprovalStep } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      مستويات الأدوار
      ═══════════════════════════════════════════════════════════════ */

   export const ROLE_LEVEL: Record<RoleId, number> = {
     HEAD: 100,
     VICE: 95,
     HEAD_HR: 90,
     PRESIDENT: 80,
     VICE_PRESIDENT: 70,
     HR: 60,
     MEMBER: 50,
     VIEWER: 10,
   };

   /* ═══════════════════════════════════════════════════════════════
      Admin (كل الصلاحيات)
      ═══════════════════════════════════════════════════════════════ */

   export function isAdmin(user: AppUser | null): boolean {
     if (!user) return false;
     return user.role === 'HEAD' || user.role === 'VICE';
   }

   /* ═══════════════════════════════════════════════════════════════
      Manager (له لوحة إدارة)
      ═══════════════════════════════════════════════════════════════ */

   export function isManager(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(user.role);
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يرى كل الفرق؟
      ═══════════════════════════════════════════════════════════════ */

   export function seesAllTeams(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR'].includes(user.role);
   }

   /* ═══════════════════════════════════════════════════════════════
      الفريق الذي يدير المستخدم
      ═══════════════════════════════════════════════════════════════ */

   export function managedTeam(user: AppUser | null): TeamId | null {
     if (!user) return null;
     if (seesAllTeams(user)) return null;
     return user.teamId;
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يستطيع الموافقة على هذه المرحلة؟
      — شرط: الدور يطابق requiredRole + الفريق يطابق requiredTeamId
      ═══════════════════════════════════════════════════════════════ */

   export function canApproveStep(user: AppUser | null, step: ApprovalStep): boolean {
     if (!user) return false;
     if (step.status !== 'PENDING') return false;

     // Admin يتخطى الكل
     if (isAdmin(user)) return true;

     // يطابق الدور؟
     if (user.role !== step.requiredRole) return false;

     // إذا كانت المرحلة مقيّدة بفريق:
     if (step.requiredTeamId !== null) {
       return user.teamId === step.requiredTeamId;
     }

     // مرحلة Head HR أو HEAD — أي شخص بالدور المطابق
     return true;
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يستطيع الموافقة على هذه المرحلة من خلال الطلب؟
      ═══════════════════════════════════════════════════════════════ */

   export function canApproveRequest(
     user: AppUser | null,
     request: RequestRecord,
     steps: ApprovalStep[],
   ): boolean {
     if (!user) return false;

     const currentStep = steps.find(
       (s) => s.status === 'PENDING' && s.order === request.currentStepOrder,
     );

     if (!currentStep) return false;
     return canApproveStep(user, currentStep);
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يمكنه إرسال إشعار جماعي؟
      ═══════════════════════════════════════════════════════════════ */

   export function canSendNotifications(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(user.role);
   }

   /* ═══════════════════════════════════════════════════════════════
      هل يمكنه إدارة الأعضاء والطلبات؟
      ═══════════════════════════════════════════════════════════════ */

   export function canManageMembers(user: AppUser | null): boolean {
     return isAdmin(user);
   }

   export function canManageConversations(user: AppUser | null): boolean {
     return isAdmin(user);
   }

   /* ═══════════════════════════════════════════════════════════════
      تصنيف الأعضاء المرئيين للمستخدم
      ═══════════════════════════════════════════════════════════════ */

   export function canSeeMember(user: AppUser | null, member: { teamIds: TeamId[] }): boolean {
     if (!user) return false;
     if (seesAllTeams(user)) return true;
     if (user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT' || user.role === 'HR') {
       return user.teamId !== null && member.teamIds.includes(user.teamId);
     }
     // الأعضاء العاديون يرون الجميع
     return true;
   }

   /* ═══════════════════════════════════════════════════════════════
      التسميات العربية
      ═══════════════════════════════════════════════════════════════ */

   export const ROLE_LABEL: Record<RoleId, string> = {
     HEAD: 'رئيس الفروع',
     VICE: 'نائب رئيس الفروع',
     HEAD_HR: 'رئيس الموارد البشرية',
     PRESIDENT: 'رئيس فريق',
     VICE_PRESIDENT: 'نائب رئيس فريق',
     HR: 'موارد بشرية',
     MEMBER: 'عضو',
     VIEWER: 'زائر',
   };
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — useAuth Hook
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/useAuth.ts",
  `import { useEffect, useState } from 'react';
   import { observeAuth } from './auth';
   import { isAdmin, isManager, seesAllTeams } from './permissions';
   import type { AppUser } from '@/types';

   export interface AuthState {
     user: AppUser | null;
     loading: boolean;
     admin: boolean;
     manager: boolean;
     allTeams: boolean;
     mustChangePassword: boolean;
   }

   export function useAuth(): AuthState {
     const [user, setUser] = useState<AppUser | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const unsub = observeAuth((u, l) => {
         setUser(u);
         setLoading(l);
       });
       return unsub;
     }, []);

     return {
       user,
       loading,
       admin: isAdmin(user),
       manager: isManager(user),
       allTeams: seesAllTeams(user),
       mustChangePassword: user?.mustChangePassword === true,
     };
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — useRealtimeCollection (Firestore Live)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/useRealtimeCollection.ts",
  `import { useEffect, useState } from 'react';
   import { collection, onSnapshot, query } from 'firebase/firestore';
   import { db } from './firebase';

   export function useRealtimeCollection<T>(
     collectionName: string,
   ): { data: T[]; loading: boolean } {
     const [data, setData] = useState<T[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       const q = query(collection(db, collectionName));
       const unsub = onSnapshot(
         q,
         (snap) => {
           const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
           setData(items);
           setLoading(false);
         },
         () => {
           setData([]);
           setLoading(false);
         },
       );
       return () => unsub();
     }, [collectionName]);

     return { data, loading };
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — Notifications
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/notifications.ts",
  `import { createOne, newId, now } from './db';
   import type { Notification, NotificationType, AppUser } from '@/types';

   export async function notifyUser(
     userId: string,
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     if (!userId) return;

     const notif: Notification = {
       id: newId('N'),
       userId,
       title,
       message,
       type,
       date: now(),
       read: false,
       route,
       priority,
       fromName,
     };

     try {
       await createOne('notifications', notif);
     } catch {
       // silent
     }
   }

   export async function notifyUsers(
     users: AppUser[],
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     for (const u of users) {
       await notifyUser(u.uid, title, message, type, route, priority, fromName);
     }
   }

   /* ═══════════════════════════════════════════════════════════════
      إشعارات الأحداث الإدارية — تُرسل لذوي المناصب فقط
      ═══════════════════════════════════════════════════════════════ */

   export async function notifyManagers(
     allUsers: AppUser[],
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     const managers = allUsers.filter((u) =>
       ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(u.role),
     );
     await notifyUsers(managers, title, message, type, route, priority, fromName);
   }

   export async function notifyTeamManagers(
     allUsers: AppUser[],
     teamId: string,
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     const targets = allUsers.filter(
       (u) =>
         (u.role === 'PRESIDENT' || u.role === 'VICE_PRESIDENT' || u.role === 'HR') &&
         u.teamId === teamId,
     );
     await notifyUsers(targets, title, message, type, route, priority, fromName);
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — Approvals (Chain: Team President → Team HR → Head HR → HEAD)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/approvals.ts",
  `import { updateOne, createOne, newId, today, listWhere } from './db';
   import { notifyUser } from './notifications';
   import { logAudit } from './audit';
   import type { ApprovalStep, RequestRecord, AppUser, RoleId, TeamId } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      سلسلة الموافقات الصحيحة
      ═══════════════════════════════════════════════════════════════ */

   export interface ApprovalChainStep {
     role: RoleId;
     teamId: TeamId | null;
   }

   export function buildApprovalChain(request: RequestRecord): ApprovalChainStep[] {
     const chain: ApprovalChainStep[] = [];

     if (request.type === 'TRANSFER' && request.fromTeamId && request.toTeamId) {
       // نقل: رئيس الفريق الحالي → رئيس الفريق الجديد → Head HR → HEAD
       chain.push({ role: 'PRESIDENT', teamId: request.fromTeamId });
       chain.push({ role: 'PRESIDENT', teamId: request.toTeamId });
       chain.push({ role: 'HEAD_HR', teamId: null });
       chain.push({ role: 'HEAD', teamId: null });
     } else if (request.type === 'PROMOTION') {
       // ترقية: رئيس الفريق → HR الفريق → Head HR → HEAD
       const teamId = request.fromTeamId ?? request.toTeamId ?? null;
       if (teamId) {
         chain.push({ role: 'PRESIDENT', teamId });
         chain.push({ role: 'HR', teamId });
       }
       chain.push({ role: 'HEAD_HR', teamId: null });
       chain.push({ role: 'HEAD', teamId: null });
     } else if (request.type === 'RESIGNATION') {
       // استقالة: رئيس الفريق → HR الفريق → HEAD
       const teamId = request.fromTeamId ?? request.toTeamId ?? null;
       if (teamId) {
         chain.push({ role: 'PRESIDENT', teamId });
         chain.push({ role: 'HR', teamId });
       }
       chain.push({ role: 'HEAD', teamId: null });
     } else if (request.type === 'COMPLAINT') {
       // شكوى: Head HR → VICE
       chain.push({ role: 'HEAD_HR', teamId: null });
       chain.push({ role: 'VICE', teamId: null });
     } else if (request.type === 'SUGGESTION') {
       // اقتراح: رئيس الفريق → HEAD
       const teamId = request.fromTeamId ?? request.toTeamId ?? null;
       if (teamId) chain.push({ role: 'PRESIDENT', teamId });
       chain.push({ role: 'HEAD', teamId: null });
     } else if (request.type === 'LEAVE') {
       // إجازة: رئيس الفريق → HR الفريق
       const teamId = request.fromTeamId ?? request.toTeamId ?? null;
       if (teamId) {
         chain.push({ role: 'PRESIDENT', teamId });
         chain.push({ role: 'HR', teamId });
       }
     } else {
       // default
       chain.push({ role: 'HEAD', teamId: null });
     }

     return chain;
   }

   /* ═══════════════════════════════════════════════════════════════
      إنشاء طلب مع سلسلة الموافقات
      ═══════════════════════════════════════════════════════════════ */

   export async function createRequestWithChain(request: RequestRecord): Promise<void> {
     await createOne('requests', request);

     const chain = buildApprovalChain(request);
     for (let i = 0; i < chain.length; i += 1) {
       const step: ApprovalStep = {
         id: newId('APR'),
         requestId: request.id,
         order: i + 1,
         requiredRole: chain[i].role,
         requiredTeamId: chain[i].teamId,
         status: 'PENDING',
       };
       await createOne('approvals', step);
     }
   }

   /* ═══════════════════════════════════════════════════════════════
      الموافقة على المرحلة الحالية
      ═══════════════════════════════════════════════════════════════ */

   export async function approveStep(
     request: RequestRecord,
     step: ApprovalStep,
     user: AppUser,
   ): Promise<void> {
     await updateOne('approvals', step.id, {
       status: 'APPROVED',
       approverUid: user.uid,
       approverName: user.displayName,
       actionDate: today(),
     });

     const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
     const sorted = allSteps.sort((a, b) => a.order - b.order);
     const remaining = sorted.filter((s) => s.status === 'PENDING' && s.id !== step.id);

     if (remaining.length === 0) {
       await updateOne('requests', request.id, {
         status: 'APPROVED',
         currentStepOrder: sorted.length,
         updatedAt: today(),
       });
       await notifyUser(
         request.requesterUid,
         'تمت الموافقة على طلبك',
         'طلبك "' + request.title + '" تمت الموافقة النهائية عليه.',
         'request',
         '/requests/' + request.id,
         'high',
       );
       await logAudit(user, 'APPROVE_REQUEST', 'Request', request.id, 'موافقة نهائية على الطلب');
     } else {
       const nextOrder = Math.min(...remaining.map((s) => s.order));
       await updateOne('requests', request.id, {
         status: 'IN_REVIEW',
         currentStepOrder: nextOrder,
         updatedAt: today(),
       });
       await notifyUser(
         request.requesterUid,
         'تقدّم طلبك',
         'طلبك "' + request.title + '" في المرحلة ' + nextOrder + '.',
         'approval',
         '/requests/' + request.id,
         'normal',
       );
       await logAudit(user, 'APPROVE_STEP', 'Approval', step.id, 'موافقة على المرحلة ' + step.order);
     }
   }

   /* ═══════════════════════════════════════════════════════════════
      الرفض
      ═══════════════════════════════════════════════════════════════ */

   export async function rejectStep(
     request: RequestRecord,
     step: ApprovalStep,
     user: AppUser,
     comment: string,
   ): Promise<void> {
     await updateOne('approvals', step.id, {
       status: 'REJECTED',
       approverUid: user.uid,
       approverName: user.displayName,
       comment: comment.trim() || undefined,
       actionDate: today(),
     });

     await updateOne('requests', request.id, {
       status: 'REJECTED',
       updatedAt: today(),
     });

     const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
     for (const s of allSteps) {
       if (s.order > step.order && s.status === 'PENDING') {
         await updateOne('approvals', s.id, { status: 'SKIPPED' });
       }
     }

     const reasonText = comment.trim() ? ' السبب: ' + comment : '';
     await notifyUser(
       request.requesterUid,
       'تم رفض طلبك',
       'طلبك "' + request.title + '" رُفض.' + reasonText,
       'request',
       '/requests/' + request.id,
       'high',
     );
     await logAudit(user, 'REJECT_REQUEST', 'Request', request.id, 'رفض الطلب');
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — Audit Log
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/audit.ts",
  `import { createOne, newId, now } from './db';
   import type { AuditRecord, AppUser } from '@/types';

   export async function logAudit(
     user: AppUser | null,
     action: string,
     entity: string,
     entityId: string,
     description: string,
   ): Promise<void> {
     const record: AuditRecord = {
       id: newId('AUD'),
       actorUid: user?.uid ?? 'system',
       actorName: user?.displayName ?? 'النظام',
       action,
       entity,
       entityId,
       date: now(),
       description,
     };
     try {
       await createOne('audit', record);
     } catch {
       // silent
     }
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — Format
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/format.ts",
  `export function cx(...parts: Array<string | false | null | undefined>): string {
     return parts.filter(Boolean).join(' ');
   }

   export function formatDate(iso: string): string {
     if (!iso) return '—';
     const d = new Date(iso);
     if (Number.isNaN(d.getTime())) return iso;
     return d.toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' });
   }

   export function formatShortDate(iso: string): string {
     if (!iso) return '—';
     const d = new Date(iso);
     if (Number.isNaN(d.getTime())) return iso;
     return d.toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' });
   }

   export function formatDateTime(iso: string): string {
     if (!iso) return '—';
     const d = new Date(iso);
     if (Number.isNaN(d.getTime())) return iso;
     return d.toLocaleString('ar-EG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
   }

   export function formatTime(iso: string): string {
     if (!iso) return '';
     const d = new Date(iso);
     if (Number.isNaN(d.getTime())) return '';
     return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
   }

   export function relativeTime(iso: string): string {
     if (!iso) return '';
     const d = new Date(iso).getTime();
     const diff = Date.now() - d;
     const mins = Math.floor(diff / 60000);
     const hrs = Math.floor(diff / 3600000);
     const days = Math.floor(diff / 86400000);
     if (mins < 1) return 'الآن';
     if (mins < 60) return 'قبل ' + mins + ' دقيقة';
     if (hrs < 24) return 'قبل ' + hrs + ' ساعة';
     if (days < 30) return 'قبل ' + days + ' يوم';
     return formatDate(iso);
   }

   export function initials(name: string): string {
     const parts = name.trim().split(' ').filter(Boolean);
     if (parts.length === 0) return '?';
     if (parts.length === 1) return parts[0].slice(0, 2);
     return (parts[0][0] + parts[parts.length - 1][0]).trim();
   }

   export function hoursToPoints(hours: number): number {
     return Math.round(hours * 5);
   }

   export function truncate(text: string, len = 90): string {
     return text.length <= len ? text : text.slice(0, len) + '...';
   }

   export function today(): string {
     return new Date().toISOString().slice(0, 10);
   }

   /* ═══════════════════════════════════════════════════════════════
      التقويم — أدوات الشهور
      ═══════════════════════════════════════════════════════════════ */

   const AR_MONTHS = [
     'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
     'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
   ];

   export function getArabicMonth(month: number): string {
     return AR_MONTHS[month];
   }

   export function getDaysInMonth(year: number, month: number): number {
     return new Date(year, month + 1, 0).getDate();
   }

   export function getFirstWeekdayOfMonth(year: number, month: number): number {
     return new Date(year, month, 1).getDay();
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — PWA (Install Prompt)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/pwa.ts",
  `export interface BeforeInstallPromptEvent extends Event {
     prompt: () => Promise<void>;
     userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
   }

   let deferredPrompt: BeforeInstallPromptEvent | null = null;

   export function initPwa(): void {
     if (typeof window === 'undefined') return;

     window.addEventListener('beforeinstallprompt', (e) => {
       e.preventDefault();
       deferredPrompt = e as BeforeInstallPromptEvent;
       window.dispatchEvent(new CustomEvent('pwa-install-available'));
     });

     window.addEventListener('appinstalled', () => {
       deferredPrompt = null;
       window.dispatchEvent(new CustomEvent('pwa-installed'));
     });

     if ('serviceWorker' in navigator && import.meta.env.PROD) {
       window.addEventListener('load', () => {
         navigator.serviceWorker.register('./sw.js').catch(() => {
           // ignore
         });
       });
     }
   }

   export function canInstallPwa(): boolean {
     return deferredPrompt !== null;
   }

   export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
     if (!deferredPrompt) return 'unavailable';
     try {
       await deferredPrompt.prompt();
       const choice = await deferredPrompt.userChoice;
       if (choice.outcome === 'accepted') {
         deferredPrompt = null;
       }
       return choice.outcome;
     } catch {
       return 'unavailable';
     }
   }

   export function isStandalone(): boolean {
     if (typeof window === 'undefined') return false;
     return (
       window.matchMedia('(display-mode: standalone)').matches ||
       (window.navigator as Navigator & { standalone?: boolean }).standalone === true
     );
   }

   export function isIos(): boolean {
     if (typeof window === 'undefined') return false;
     return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
   }

   export function isAndroid(): boolean {
     if (typeof window === 'undefined') return false;
     return /Android/.test(navigator.userAgent);
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — Onboarding (localStorage flag)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/onboarding.ts",
  `const ONBOARDING_KEY = 'sbapiaryy-onboarding-v5.1';
   const FIRST_CONTRIBUTION_KEY = 'sbapiaryy-first-contribution-shown';

   export function hasCompletedOnboarding(): boolean {
     if (typeof window === 'undefined') return true;
     return localStorage.getItem(ONBOARDING_KEY) === 'done';
   }

   export function markOnboardingComplete(): void {
     if (typeof window === 'undefined') return;
     localStorage.setItem(ONBOARDING_KEY, 'done');
   }

   export function resetOnboarding(): void {
     if (typeof window === 'undefined') return;
     localStorage.removeItem(ONBOARDING_KEY);
   }

   /* ═══════════════════════════════════════════════════════════════
      رحلة البداية — تختفي بعد أول مشاركة
      ═══════════════════════════════════════════════════════════════ */

   export function hasSeenFirstContribution(): boolean {
     if (typeof window === 'undefined') return true;
     return localStorage.getItem(FIRST_CONTRIBUTION_KEY) === 'yes';
   }

   export function markFirstContributionSeen(): void {
     if (typeof window === 'undefined') return;
     localStorage.setItem(FIRST_CONTRIBUTION_KEY, 'yes');
   }
   `
);

console.log(
  "  ✓ Part 3 loaded: Firebase + Auth + DB + Permissions + Notifications + Approvals + PWA"
);
/* ═══════════════════════════════════════════════════════════════
   STYLES — Design Tokens
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/tokens.css",
  `:root {
    /* ═══════════ الألوان الأساسية ═══════════ */
    --c-navy:        #151A45;
    --c-navy-soft:   #1B2156;
    --c-navy-2:      #232A66;
    --c-navy-3:      #2E3680;
    --c-navy-4:      #3A42A0;

    --c-red:         #C1272D;
    --c-red-soft:    #A01F24;
    --c-red-light:   #DC2626;
    --c-red-tint:    #FEE2E2;

    --c-white:       #FFFFFF;
    --c-off-white:   #FAFBFD;
    --c-line:        #E3E6F0;
    --c-line-mid:    #C9CFE1;
    --c-line-strong: #A8B0C9;

    --c-ink:         #151A45;
    --c-ink-soft:    #3A4176;
    --c-ink-muted:   #6B7299;

    --c-paper:       #FFFFFF;
    --c-paper-soft:  #D5DAF0;
    --c-paper-muted: #8891BE;

    /* ═══════════ ألوان دلالية ═══════════ */
    --c-green:       #16A34A;
    --c-green-soft:  #DCFCE7;
    --c-green-text:  #166534;

    --c-amber:       #D97706;
    --c-amber-soft:  #FEF3C7;
    --c-amber-text:  #92400E;

    --c-blue:        #2563EB;
    --c-blue-soft:   #DBEAFE;
    --c-blue-text:   #1E40AF;

    --c-purple:      #7C3AED;
    --c-purple-soft: #EDE9FE;
    --c-purple-text: #5B21B6;

    --c-pink:        #EC4899;
    --c-pink-soft:   #FCE7F3;
    --c-pink-text:   #9D174D;

    --c-cyan:        #0891B2;
    --c-cyan-soft:   #CFFAFE;
    --c-cyan-text:   #155E75;

    --c-orange:      #EA580C;
    --c-orange-soft: #FFEDD5;
    --c-orange-text: #9A3412;

    /* ═══════════ الخطوط ═══════════ */
    --font:           'Tajawal', system-ui, -apple-system, sans-serif;
    --font-en:        'Space Grotesk', 'Tajawal', system-ui, sans-serif;
    --font-mono:      'Space Grotesk', monospace;

    /* ═══════════ أنصاف الأقطار ═══════════ */
    --radius-xs:      6px;
    --radius-sm:      10px;
    --radius:         14px;
    --radius-lg:      20px;
    --radius-xl:      28px;
    --radius-full:    999px;

    /* ═══════════ المسافات ═══════════ */
    --space-1:  4px;
    --space-2:  8px;
    --space-3:  12px;
    --space-4:  16px;
    --space-5:  20px;
    --space-6:  24px;
    --space-7:  32px;
    --space-8:  48px;
    --space-9:  64px;

    /* ═══════════ التخطيط ═══════════ */
    --container:      1200px;
    --navbar-h:       60px;
    --sidebar-w:      260px;
    --sidebar-w-mob:  280px;
    --bottom-nav-h:   64px;

    /* ═══════════ الظلال ═══════════ */
    --shadow-xs:      0 1px 2px rgba(21, 26, 69, 0.04);
    --shadow-sm:      0 2px 8px rgba(21, 26, 69, 0.06);
    --shadow:         0 8px 24px rgba(21, 26, 69, 0.10);
    --shadow-lg:      0 20px 60px -20px rgba(21, 26, 69, 0.20);
    --shadow-red:     0 8px 24px -8px rgba(193, 39, 45, 0.4);

    /* ═══════════ الحركة ═══════════ */
    --ease:           cubic-bezier(0.2, 0.7, 0.3, 1);
    --ease-bounce:    cubic-bezier(0.34, 1.56, 0.64, 1);

    /* ═══════════ Safe Area (iPhone) ═══════════ */
    --safe-top:    env(safe-area-inset-top, 0px);
    --safe-bottom: env(safe-area-inset-bottom, 0px);
    --safe-left:   env(safe-area-inset-left, 0px);
    --safe-right:  env(safe-area-inset-right, 0px);
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Base Reset
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/base.css",
  `*, *::before, *::after {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html {
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  html, body {
    margin: 0;
    padding: 0;
    min-height: 100%;
    overscroll-behavior-y: none;
  }

  body {
    font-family: var(--font);
    font-size: 15px;
    line-height: 1.65;
    color: var(--c-ink);
    background: var(--c-off-white);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    letter-spacing: -0.005em;
  }

  #root {
    min-height: 100vh;
    min-height: 100dvh;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font);
    color: var(--c-ink);
    font-weight: 800;
    line-height: 1.25;
    margin: 0;
    letter-spacing: -0.02em;
  }

  h1 { font-size: 1.75rem; font-weight: 900; letter-spacing: -0.03em; }
  h2 { font-size: 1.35rem; }
  h3 { font-size: 1.1rem; font-weight: 700; }
  h4 { font-size: 1rem; font-weight: 700; }

  p { margin: 0; }

  a {
    color: inherit;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  button, input, select, textarea {
    font: inherit;
    color: inherit;
    -webkit-tap-highlight-color: transparent;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    padding: 0;
  }

  img, svg, video {
    display: block;
    max-width: 100%;
    height: auto;
  }

  ul, ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  ::selection {
    background: var(--c-navy);
    color: #fff;
  }

  /* ═══════════ Scrollbar (Desktop only) ═══════════ */
  @media (min-width: 901px) {
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: var(--c-off-white); }
    ::-webkit-scrollbar-thumb {
      background: var(--c-line-mid);
      border-radius: 999px;
      border: 3px solid var(--c-off-white);
    }
    ::-webkit-scrollbar-thumb:hover { background: var(--c-ink-muted); }
  }

  /* ═══════════ Focus ═══════════ */
  *:focus-visible {
    outline: 2px solid var(--c-red);
    outline-offset: 2px;
    border-radius: var(--radius-xs);
  }

  /* ═══════════ Touch: prevent double-tap zoom ═══════════ */
  button, a, .btn, .nav-link, .sidebar__link, .chip {
    touch-action: manipulation;
  }

  /* ═══════════ Reduced motion ═══════════ */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Layout
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/layout.css",
  `/* ═══════════════════════════════════════════════════════════════
     App Shell
     ═══════════════════════════════════════════════════════════════ */

  .app-shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    min-height: 100dvh;
    padding-top: var(--safe-top);
  }

  .app-main {
    flex: 1;
    padding-bottom: var(--safe-bottom);
  }

  .container {
    width: 100%;
    max-width: var(--container);
    margin-inline: auto;
    padding-inline: 16px;
  }

  @media (min-width: 640px) {
    .container { padding-inline: 20px; }
  }

  @media (min-width: 1024px) {
    .container { padding-inline: 24px; }
  }

  /* ═══════════════════════════════════════════════════════════════
     Sections
     ═══════════════════════════════════════════════════════════════ */

  .section {
    padding-block: 24px;
  }

  .section--tight {
    padding-block: 16px;
  }

  @media (min-width: 640px) {
    .section { padding-block: 32px; }
    .section--tight { padding-block: 20px; }
  }

  /* ═══════════════════════════════════════════════════════════════
     Section Header
     ═══════════════════════════════════════════════════════════════ */

  .section-head {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  @media (min-width: 640px) {
    .section-head {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }
  }

  .section-head__eyebrow {
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--c-red);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .section-head h2 {
    font-size: 1.35rem;
    font-weight: 800;
  }

  .section-head__desc {
    color: var(--c-ink-muted);
    font-size: 0.9rem;
    margin-top: 6px;
    max-width: 62ch;
  }

  /* ═══════════════════════════════════════════════════════════════
     Grid
     ═══════════════════════════════════════════════════════════════ */

  .grid {
    display: grid;
    gap: 12px;
    grid-template-columns: 1fr;
  }

  @media (min-width: 480px) {
    .grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 16px;
    }
  }

  .grid--wide {
    grid-template-columns: 1fr;
  }

  @media (min-width: 640px) {
    .grid--wide { grid-template-columns: repeat(2, 1fr); }
  }

  @media (min-width: 1024px) {
    .grid--wide {
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }
  }

  .grid--narrow {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (min-width: 640px) {
    .grid--narrow {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 14px;
    }
  }

  .grid--2 {
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .grid--2 { grid-template-columns: repeat(2, 1fr); }
  }

  /* ═══════════════════════════════════════════════════════════════
     Stack
     ═══════════════════════════════════════════════════════════════ */

  .stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .stack--sm { gap: 8px; }
  .stack--lg { gap: 20px; }

  /* ═══════════════════════════════════════════════════════════════
     Row
     ═══════════════════════════════════════════════════════════════ */

  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .row--between {
    justify-content: space-between;
  }

  .row--gap-6 { gap: 6px; }
  .row--gap-16 { gap: 16px; }

  /* ═══════════════════════════════════════════════════════════════
     Utilities
     ═══════════════════════════════════════════════════════════════ */

  .muted { color: var(--c-ink-muted); }
  .soft { color: var(--c-ink-soft); }
  .small { font-size: 0.82rem; }
  .tiny { font-size: 0.72rem; }
  .center { text-align: center; }
  .grow { flex: 1; min-width: 0; }
  .nowrap { white-space: nowrap; }

  .mt-1 { margin-top: 4px; }
  .mt-2 { margin-top: 8px; }
  .mt-3 { margin-top: 12px; }
  .mt-4 { margin-top: 16px; }
  .mt-5 { margin-top: 20px; }
  .mt-6 { margin-top: 24px; }

  .mb-1 { margin-bottom: 4px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-3 { margin-bottom: 12px; }
  .mb-4 { margin-bottom: 16px; }

  .hide-mobile { display: none; }

  @media (min-width: 768px) {
    .hide-mobile { display: block; }
    .show-mobile { display: none !important; }
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Navbar
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/navbar.css",
  `/* ═══════════════════════════════════════════════════════════════
     Navbar — مبسّط: الاسم + دخول/خروج + إشعارات
     ═══════════════════════════════════════════════════════════════ */

  .navbar {
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
    gap: 12px;
  }

  .brand {
    font-family: var(--font-en);
    font-weight: 800;
    font-size: 1.15rem;
    color: var(--c-paper);
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: opacity 0.15s;
  }

  .brand:hover { opacity: 0.85; }

  .brand::before {
    content: 'S';
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    background: linear-gradient(150deg, var(--c-red), var(--c-red-soft));
    color: #fff;
    font-size: 0.95rem;
    font-weight: 800;
    box-shadow: var(--shadow-red);
    flex-shrink: 0;
  }

  /* ═══════════ روابط اليمين (خروج/دخول/إشعارات) ═══════════ */

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-inline-start: auto;
  }

  .nav-action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--c-paper-soft);
    transition: all 0.15s var(--ease);
    background: transparent;
    border: 1px solid transparent;
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
    padding: 8px 10px;
    position: relative;
  }

  .nav-action__icon {
    font-size: 1.15rem;
    line-height: 1;
  }

  .nav-action__badge {
    position: absolute;
    top: -2px;
    inset-inline-end: -2px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--c-red);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 800;
    font-family: var(--font-en);
    display: grid;
    place-items: center;
    border: 2px solid var(--c-navy);
  }

  /* ═══════════ Safe area للجوال ═══════════ */

  @media (max-width: 900px) {
    .navbar {
      height: calc(var(--navbar-h) + var(--safe-top));
      padding-top: var(--safe-top);
    }

    .brand { font-size: 1.05rem; }

    .brand::before {
      width: 26px;
      height: 26px;
      font-size: 0.85rem;
    }

    .nav-action {
      padding: 8px 12px;
      font-size: 0.82rem;
    }
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Bottom Navigation (Mobile)
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/bottom-nav.css",
  `/* ═══════════════════════════════════════════════════════════════
     Bottom Navigation — يظهر على الجوال فقط
     ═══════════════════════════════════════════════════════════════ */

  .bottom-nav {
    display: none;
  }

  @media (max-width: 900px) {
    .bottom-nav {
      display: flex;
      position: fixed;
      bottom: 0;
      inset-inline: 0;
      z-index: 60;
      height: calc(var(--bottom-nav-h) + var(--safe-bottom));
      padding-bottom: var(--safe-bottom);
      background: var(--c-white);
      border-top: 1px solid var(--c-line);
      box-shadow: 0 -4px 20px rgba(21, 26, 69, 0.08);
    }

    .bottom-nav__inner {
      display: flex;
      align-items: stretch;
      justify-content: space-around;
      width: 100%;
      padding-inline: 4px;
    }

    .bottom-nav__item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      padding: 8px 4px;
      color: var(--c-ink-muted);
      font-size: 0.68rem;
      font-weight: 700;
      text-decoration: none;
      transition: color 0.15s;
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
    }

    .bottom-nav__item:active {
      background: var(--c-off-white);
    }

    .bottom-nav__item.is-active {
      color: var(--c-red);
    }

    .bottom-nav__item.is-active::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 3px;
      background: var(--c-red);
      border-radius: 0 0 4px 4px;
    }

    .bottom-nav__icon {
      font-size: 1.35rem;
      line-height: 1;
    }

    .bottom-nav__label {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .bottom-nav__badge {
      position: absolute;
      top: 4px;
      inset-inline-end: 50%;
      margin-inline-end: -20px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 999px;
      background: var(--c-red);
      color: #fff;
      font-size: 0.6rem;
      font-weight: 800;
      font-family: var(--font-en);
      display: grid;
      place-items: center;
      border: 2px solid var(--c-white);
    }

    /* إضافة padding للمحتوى لتفادي التغطية */
    .app-main {
      padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 8px);
    }
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Sidebar (Drawer on Mobile)
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/sidebar.css",
  `/* ═══════════════════════════════════════════════════════════════
     Dashboard Layout
     ═══════════════════════════════════════════════════════════════ */

  .dashboard-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    padding-block: 16px;
  }

  @media (min-width: 901px) {
    .dashboard-layout {
      grid-template-columns: var(--sidebar-w) 1fr;
      gap: 24px;
      padding-block: 24px;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     Sidebar — Desktop: sticky
     ═══════════════════════════════════════════════════════════════ */

  .sidebar {
    display: block;
  }

  @media (min-width: 901px) {
    .sidebar {
      position: sticky;
      top: calc(var(--navbar-h) + 16px);
      align-self: start;
      max-height: calc(100vh - var(--navbar-h) - 32px);
      overflow-y: auto;
      padding-inline-end: 4px;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     Sidebar — Mobile: drawer
     ═══════════════════════════════════════════════════════════════ */

  .sidebar-toggle {
    display: none;
  }

  .sidebar-overlay {
    display: none;
  }

  @media (max-width: 900px) {
    .sidebar {
      position: fixed;
      top: 0;
      inset-inline-end: -320px;
      width: var(--sidebar-w-mob);
      max-width: 85vw;
      height: 100vh;
      height: 100dvh;
      background: var(--c-white);
      z-index: 200;
      padding: 20px 16px;
      padding-top: calc(20px + var(--safe-top));
      padding-bottom: calc(20px + var(--safe-bottom));
      overflow-y: auto;
      transition: inset-inline-end 0.28s var(--ease);
      box-shadow: -12px 0 40px rgba(21, 26, 69, 0.15);
      border-inline-start: 1px solid var(--c-line);
      -webkit-overflow-scrolling: touch;
    }

    .sidebar.is-open {
      inset-inline-end: 0;
    }

    .sidebar-overlay {
      display: block;
      position: fixed;
      inset: 0;
      background: rgba(21, 26, 69, 0.55);
      z-index: 199;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s var(--ease);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    }

    .sidebar-overlay.is-open {
      opacity: 1;
      pointer-events: auto;
    }

    .sidebar-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      background: var(--c-line);
      color: var(--c-ink);
      font-size: 1.3rem;
      cursor: pointer;
      margin-inline-start: auto;
      margin-bottom: 16px;
      border: none;
      font-family: inherit;
    }

    .sidebar-close:active {
      background: var(--c-line-mid);
    }
  }

  @media (min-width: 901px) {
    .sidebar-close {
      display: none;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     Sidebar Content
     ═══════════════════════════════════════════════════════════════ */

  .sidebar__user {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    border-radius: var(--radius);
    background: var(--c-navy);
    color: var(--c-paper);
    margin-bottom: 20px;
    box-shadow: var(--shadow-sm);
  }

  .sidebar__avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: linear-gradient(150deg, var(--c-red), var(--c-red-soft));
    color: #fff;
    font-family: var(--font-en);
    font-weight: 800;
    font-size: 0.95rem;
    flex-shrink: 0;
  }

  .sidebar__user-info {
    flex: 1;
    min-width: 0;
  }

  .sidebar__user-name {
    font-weight: 800;
    font-size: 0.95rem;
    color: #fff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar__user-role {
    font-size: 0.75rem;
    color: var(--c-paper-soft);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sidebar__group {
    margin-bottom: 20px;
  }

  .sidebar__title {
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--c-ink-muted);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0 12px;
    margin-bottom: 8px;
  }

  .sidebar__link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 12px;
    border-radius: var(--radius-sm);
    color: var(--c-ink-soft);
    font-size: 0.9rem;
    font-weight: 600;
    transition: all 0.15s var(--ease);
    background: transparent;
    border: none;
    width: 100%;
    text-align: start;
    cursor: pointer;
    font-family: inherit;
    text-decoration: none;
  }

  .sidebar__link:hover {
    background: var(--c-off-white);
    color: var(--c-navy);
  }

  .sidebar__link:active {
    background: var(--c-line);
  }

  .sidebar__link.is-active {
    background: var(--c-navy);
    color: #fff;
  }

  .sidebar__icon {
    font-size: 1.1rem;
    width: 22px;
    text-align: center;
    flex-shrink: 0;
  }

  .sidebar__count {
    margin-inline-start: auto;
    font-family: var(--font-en);
    font-size: 0.7rem;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--c-red);
    color: #fff;
    line-height: 1.3;
    min-width: 22px;
    text-align: center;
  }

  .sidebar__link--danger {
    color: var(--c-red);
  }

  .sidebar__link--danger:hover {
    background: var(--c-red-tint);
    color: var(--c-red-soft);
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Cards
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/cards.css",
  `/* ═══════════════════════════════════════════════════════════════
     Card Base
     ═══════════════════════════════════════════════════════════════ */

  .card {
    position: relative;
    display: block;
    background: var(--c-white);
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    padding: 16px;
    color: var(--c-ink);
    box-shadow: var(--shadow-xs);
    transition: border-color 0.18s var(--ease), transform 0.18s var(--ease), box-shadow 0.18s var(--ease);
  }

  @media (min-width: 640px) {
    .card { padding: 20px; }
  }

  a.card:hover,
  button.card:hover {
    border-color: var(--c-line-mid);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }

  a.card:active,
  button.card:active {
    transform: translateY(0);
  }

  .card.no-click,
  .card--static {
    cursor: default;
  }

  .card.no-click:hover,
  .card--static:hover {
    transform: none;
    box-shadow: var(--shadow-xs);
  }

  .card--navy {
    background: var(--c-navy);
    border-color: var(--c-navy-2);
    color: var(--c-paper);
  }

  .card--navy .card__title { color: var(--c-paper); }
  .card--navy .card__meta { color: var(--c-paper-muted); }
  .card--navy .card__body { color: var(--c-paper-soft); }

  .card__title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--c-ink);
    line-height: 1.35;
  }

  .card__meta {
    font-size: 0.8rem;
    color: var(--c-ink-muted);
    margin-top: 3px;
    line-height: 1.5;
  }

  .card__body {
    margin-top: 10px;
    font-size: 0.88rem;
    color: var(--c-ink-soft);
    line-height: 1.7;
  }

  .card__footer {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--c-line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  /* ═══════════════════════════════════════════════════════════════
     Stats
     ═══════════════════════════════════════════════════════════════ */

  .stat-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (min-width: 640px) {
    .stat-row {
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 14px;
    }
  }

  .stat {
    background: var(--c-navy);
    border: 1px solid var(--c-navy-2);
    border-radius: var(--radius);
    padding: 16px 12px;
    text-align: center;
    transition: transform 0.15s var(--ease);
  }

  @media (min-width: 640px) {
    .stat { padding: 20px 16px; }
  }

  .stat__value {
    font-family: var(--font-en);
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--c-paper);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  @media (min-width: 640px) {
    .stat__value { font-size: 1.8rem; }
  }

  .stat__label {
    margin-top: 8px;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--c-paper-soft);
    letter-spacing: 0.02em;
  }

  .stat--red .stat__value { color: var(--c-red); }
  .stat--success .stat__value { color: var(--c-green); }
  .stat--amber .stat__value { color: var(--c-amber); }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Badges
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/badges.css",
  `/* ═══════════════════════════════════════════════════════════════
     Badge — موحد ومتسق
     ═══════════════════════════════════════════════════════════════ */

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: var(--radius-full);
    font-size: 0.72rem;
    font-weight: 700;
    font-family: var(--font-en);
    letter-spacing: 0.01em;
    white-space: nowrap;
    line-height: 1.4;
    vertical-align: middle;
    background: var(--c-line);
    color: var(--c-ink-soft);
    border: 1px solid var(--c-line-mid);
    flex-shrink: 0;
  }

  .badge__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }

  /* ═══════════ Variants ═══════════ */

  .badge--neutral {
    background: var(--c-line);
    color: var(--c-ink-soft);
    border-color: var(--c-line-mid);
  }

  .badge--success {
    background: var(--c-green-soft);
    color: var(--c-green-text);
    border-color: #86EFAC;
  }

  .badge--warning {
    background: var(--c-amber-soft);
    color: var(--c-amber-text);
    border-color: #FCD34D;
  }

  .badge--danger {
    background: var(--c-red-tint);
    color: #991B1B;
    border-color: #FCA5A5;
  }

  .badge--info {
    background: var(--c-blue-soft);
    color: var(--c-blue-text);
    border-color: #93C5FD;
  }

  .badge--purple {
    background: var(--c-purple-soft);
    color: var(--c-purple-text);
    border-color: #C4B5FD;
  }

  .badge--navy {
    background: var(--c-navy);
    color: #fff;
    border-color: var(--c-navy);
  }

  .badge--red {
    background: var(--c-red);
    color: #fff;
    border-color: var(--c-red);
  }

  /* ═══════════ داخل البطاقات الكحلية ═══════════ */

  .card--navy .badge {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.18);
  }

  .card--navy .badge--success { background: #166534; color: #fff; border-color: #16A34A; }
  .card--navy .badge--warning { background: #92400E; color: #fff; border-color: #D97706; }
  .card--navy .badge--danger  { background: #991B1B; color: #fff; border-color: #DC2626; }
  .card--navy .badge--info    { background: #1E40AF; color: #fff; border-color: #2563EB; }
  .card--navy .badge--red     { background: var(--c-red); color: #fff; border-color: var(--c-red); }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Buttons
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/buttons.css",
  `/* ═══════════════════════════════════════════════════════════════
     Button Base
     ═══════════════════════════════════════════════════════════════ */

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 11px 20px;
    border-radius: var(--radius-sm);
    border: 1.5px solid transparent;
    font-size: 0.9rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s var(--ease);
    text-decoration: none;
    line-height: 1.4;
    white-space: nowrap;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  /* ═══════════ Variants ═══════════ */

  .btn--primary {
    background: var(--c-red);
    color: #fff;
    border-color: var(--c-red);
  }
  .btn--primary:hover:not(:disabled) {
    background: var(--c-red-soft);
    border-color: var(--c-red-soft);
  }

  .btn--navy {
    background: var(--c-navy);
    color: #fff;
    border-color: var(--c-navy);
  }
  .btn--navy:hover:not(:disabled) {
    background: var(--c-navy-2);
    border-color: var(--c-navy-2);
  }

  .btn--ghost {
    background: var(--c-white);
    border-color: var(--c-line-mid);
    color: var(--c-ink);
  }
  .btn--ghost:hover:not(:disabled) {
    background: var(--c-off-white);
    border-color: var(--c-navy);
    color: var(--c-navy);
  }

  .btn--danger {
    background: var(--c-red);
    border-color: var(--c-red);
    color: #fff;
  }
  .btn--danger:hover:not(:disabled) {
    background: var(--c-red-soft);
  }

  .btn--success {
    background: var(--c-green);
    border-color: var(--c-green);
    color: #fff;
  }
  .btn--success:hover:not(:disabled) {
    background: #15803D;
  }

  .btn--outline-danger {
    background: transparent;
    border-color: var(--c-red);
    color: var(--c-red);
  }
  .btn--outline-danger:hover:not(:disabled) {
    background: var(--c-red);
    color: #fff;
  }

  .btn--outline-success {
    background: transparent;
    border-color: var(--c-green);
    color: var(--c-green);
  }
  .btn--outline-success:hover:not(:disabled) {
    background: var(--c-green);
    color: #fff;
  }

  /* ═══════════ Sizes ═══════════ */

  .btn--lg {
    padding: 14px 24px;
    font-size: 0.95rem;
    border-radius: var(--radius);
  }

  .btn--sm {
    padding: 7px 14px;
    font-size: 0.8rem;
  }

  .btn--xs {
    padding: 5px 10px;
    font-size: 0.72rem;
    gap: 4px;
  }

  .btn--block {
    width: 100%;
  }

  .btn--pill {
    border-radius: var(--radius-full);
  }

  .btn--icon-only {
    padding: 10px;
    width: 40px;
    height: 40px;
  }

  .btn--sm.btn--icon-only {
    width: 32px;
    height: 32px;
    padding: 6px;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Tables
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/tables.css",
  `/* ═══════════════════════════════════════════════════════════════
     Table — Desktop + Mobile
     ═══════════════════════════════════════════════════════════════ */

  .table-wrap {
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--c-white);
    box-shadow: var(--shadow-xs);
  }

  table.data {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.88rem;
    color: var(--c-ink);
  }

  table.data th {
    text-align: start;
    padding: 14px 16px;
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--c-paper);
    background: var(--c-navy);
    border-bottom: 1px solid var(--c-navy-2);
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  table.data td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--c-line);
    vertical-align: middle;
  }

  table.data tr:last-child td {
    border-bottom: none;
  }

  table.data tbody tr {
    transition: background 0.15s var(--ease);
  }

  table.data tbody tr:hover {
    background: var(--c-off-white);
  }

  .rank {
    font-family: var(--font-en);
    font-weight: 800;
    color: var(--c-ink-muted);
    width: 48px;
    font-size: 0.85rem;
  }

  .rank--1 { color: var(--c-red); font-weight: 900; }
  .rank--2 { color: var(--c-navy-2); }
  .rank--3 { color: var(--c-ink-soft); }

  .points {
    font-family: var(--font-en);
    font-weight: 800;
    color: var(--c-navy);
  }

  /* ═══════════ Mobile — Convert table to cards ═══════════ */

  @media (max-width: 640px) {
    .table-wrap {
      border: none;
      background: transparent;
      box-shadow: none;
      overflow: visible;
    }

    table.data {
      display: block;
      font-size: 0.88rem;
    }

    table.data thead {
      display: none;
    }

    table.data tbody {
      display: block;
    }

    table.data tr {
      display: block;
      background: var(--c-white);
      border: 1px solid var(--c-line);
      border-radius: var(--radius);
      padding: 14px;
      margin-bottom: 10px;
      box-shadow: var(--shadow-xs);
      position: relative;
    }

    table.data td {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border: none;
      gap: 12px;
      font-size: 0.85rem;
    }

    table.data td:not(:first-child)::before {
      content: attr(data-label);
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--c-ink-muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      flex-shrink: 0;
    }

    table.data tr:last-child { border-bottom: 1px solid var(--c-line); }

    .rank {
      position: absolute;
      top: 12px;
      inset-inline-end: 14px;
      font-size: 0.75rem;
      width: auto;
      padding: 3px 10px;
      background: var(--c-navy);
      color: #fff;
      border-radius: 999px;
    }

    .rank--1 { background: var(--c-red); color: #fff; }
    .rank--2 { background: var(--c-navy-2); color: #fff; }
    .rank--3 { background: var(--c-ink-soft); color: #fff; }
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Forms
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/forms.css",
  `/* ═══════════════════════════════════════════════════════════════
     Form Fields
     ═══════════════════════════════════════════════════════════════ */

  .input {
    width: 100%;
    padding: 12px 14px;
    background: var(--c-white);
    border: 1.5px solid var(--c-line-mid);
    border-radius: var(--radius-sm);
    font-size: 0.92rem;
    font-family: inherit;
    color: var(--c-ink);
    outline: none;
    transition: border-color 0.15s var(--ease), box-shadow 0.15s var(--ease);
    -webkit-appearance: none;
    appearance: none;
  }

  .input::placeholder {
    color: var(--c-ink-muted);
  }

  .input:focus {
    border-color: var(--c-navy);
    box-shadow: 0 0 0 4px rgba(21, 26, 69, 0.08);
  }

  .input:disabled {
    background: var(--c-off-white);
    cursor: not-allowed;
    opacity: 0.6;
  }

  textarea.input {
    min-height: 100px;
    resize: vertical;
    line-height: 1.7;
  }

  select.input {
    cursor: pointer;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7299' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: left 14px center;
    padding-left: 36px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .form-field__label {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--c-ink-soft);
    line-height: 1.4;
  }

  .form-field__req {
    color: var(--c-red);
    margin-inline-start: 2px;
  }

  .form-field__hint {
    font-size: 0.75rem;
    color: var(--c-ink-muted);
    margin-top: -2px;
  }

  .form-field__error {
    font-size: 0.78rem;
    color: var(--c-red);
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1.5;
  }

  .form-field__error::before {
    content: '⚠';
    font-size: 0.9rem;
  }

  /* ═══════════════════════════════════════════════════════════════
     Toolbar
     ═══════════════════════════════════════════════════════════════ */

  .toolbar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
  }

  @media (min-width: 640px) {
    .toolbar {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
    }
  }

  .toolbar .input {
    min-width: 0;
  }

  @media (min-width: 640px) {
    .toolbar .input {
      min-width: 220px;
      width: auto;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     Chips
     ═══════════════════════════════════════════════════════════════ */

  .chips {
    display: flex;
    gap: 8px;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 4px;
    margin-inline: -16px;
    padding-inline: 16px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .chips::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 640px) {
    .chips {
      flex-wrap: wrap;
      margin-inline: 0;
      padding-inline: 0;
      overflow: visible;
    }
  }

  .chip {
    padding: 8px 16px;
    border-radius: var(--radius-full);
    border: 1.5px solid var(--c-line-mid);
    background: var(--c-white);
    color: var(--c-ink-soft);
    font-size: 0.82rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s var(--ease);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .chip:hover {
    border-color: var(--c-navy);
    color: var(--c-navy);
  }

  .chip.is-active {
    background: var(--c-red);
    border-color: var(--c-red);
    color: #fff;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Modal
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/modal.css",
  `/* ═══════════════════════════════════════════════════════════════
     Modal
     ═══════════════════════════════════════════════════════════════ */

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(21, 26, 69, 0.55);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 300;
    padding: 0;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    animation: modal-fade 0.2s var(--ease);
  }

  @media (min-width: 640px) {
    .modal-backdrop {
      align-items: center;
      padding: 20px;
    }
  }

  @keyframes modal-fade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal {
    background: var(--c-white);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    max-width: 100%;
    width: 100%;
    max-height: 92vh;
    max-height: 92dvh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 -20px 60px rgba(21, 26, 69, 0.3);
    animation: modal-slide-up 0.28s var(--ease);
    padding-bottom: var(--safe-bottom);
  }

  @media (min-width: 640px) {
    .modal {
      border-radius: var(--radius-lg);
      max-width: 540px;
      box-shadow: var(--shadow-lg);
      animation: modal-slide-up 0.2s var(--ease);
    }
  }

  .modal--wide {
    max-width: 100%;
  }

  @media (min-width: 640px) {
    .modal--wide { max-width: 720px; }
  }

  @keyframes modal-slide-up {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal__handle {
    width: 44px;
    height: 5px;
    border-radius: 999px;
    background: var(--c-line-mid);
    margin: 12px auto 6px;
    flex-shrink: 0;
  }

  @media (min-width: 640px) {
    .modal__handle { display: none; }
  }

  .modal__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--c-line);
    flex-shrink: 0;
  }

  .modal__head h3 {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--c-ink);
    margin: 0;
  }

  .modal__close {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--c-off-white);
    color: var(--c-ink-soft);
    font-size: 1.3rem;
    display: grid;
    place-items: center;
    border: none;
    cursor: pointer;
    font-family: inherit;
    flex-shrink: 0;
    transition: all 0.15s;
  }

  .modal__close:hover {
    background: var(--c-line);
    color: var(--c-ink);
  }

  .modal__body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    -webkit-overflow-scrolling: touch;
  }

  .modal__foot {
    padding: 16px 20px;
    border-top: 1px solid var(--c-line);
    display: flex;
    gap: 10px;
    flex-shrink: 0;
  }

  .modal__foot .btn {
    flex: 1;
  }

  @media (min-width: 640px) {
    .modal__foot {
      justify-content: flex-end;
    }
    .modal__foot .btn {
      flex: 0 0 auto;
      min-width: 120px;
    }
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Toast
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/toast.css",
  `/* ═══════════════════════════════════════════════════════════════
     Toast — إشعارات منبثقة
     ═══════════════════════════════════════════════════════════════ */

  .toast-container {
    position: fixed;
    bottom: calc(20px + var(--safe-bottom));
    inset-inline: 16px;
    z-index: 400;
    display: flex;
    flex-direction: column;
    gap: 8px;
    pointer-events: none;
  }

  @media (min-width: 640px) {
    .toast-container {
      bottom: 24px;
      inset-inline-end: 24px;
      inset-inline-start: auto;
      max-width: 380px;
    }
  }

  .toast {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: var(--c-navy);
    color: var(--c-paper);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    pointer-events: auto;
    animation: toast-in 0.28s var(--ease-bounce);
    border: 1px solid var(--c-navy-2);
    font-size: 0.88rem;
    line-height: 1.5;
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .toast--success {
    background: var(--c-green);
    border-color: #15803D;
  }

  .toast--error {
    background: var(--c-red);
    border-color: var(--c-red-soft);
  }

  .toast--warning {
    background: var(--c-amber);
    border-color: #B45309;
  }

  .toast__icon {
    font-size: 1.15rem;
    line-height: 1;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .toast__content {
    flex: 1;
    min-width: 0;
  }

  .toast__title {
    font-weight: 800;
    font-size: 0.9rem;
  }

  .toast__message {
    font-size: 0.82rem;
    opacity: 0.92;
    margin-top: 2px;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Notifications (صفحة + قائمة)
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/notifications.css",
  `/* ═══════════════════════════════════════════════════════════════
     Notification Item — تصميم محسّن
     ═══════════════════════════════════════════════════════════════ */

  .notif-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-radius: var(--radius);
    border: 1px solid var(--c-line);
    background: var(--c-white);
    transition: all 0.18s var(--ease);
    position: relative;
    cursor: pointer;
    overflow: hidden;
  }

  .notif-item:hover {
    border-color: var(--c-line-mid);
    background: var(--c-off-white);
    transform: translateY(-1px);
    box-shadow: var(--shadow-xs);
  }

  .notif-item:active {
    transform: translateY(0);
  }

  .notif-item--unread {
    background: #FFFBFC;
    border-color: #FCA5A5;
  }

  .notif-item--unread::before {
    content: '';
    position: absolute;
    inset-inline-start: 0;
    top: 14px;
    bottom: 14px;
    width: 3px;
    background: var(--c-red);
    border-radius: 0 3px 3px 0;
  }

  .notif-item--unread .notif-item__title {
    color: var(--c-navy);
    font-weight: 800;
  }

  .notif-item__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-size: 1.25rem;
    flex-shrink: 0;
    background: var(--c-off-white);
    border: 1px solid var(--c-line);
  }

  .notif-item__icon--approval    { background: var(--c-green-soft); border-color: #86EFAC; }
  .notif-item__icon--request     { background: var(--c-blue-soft);  border-color: #93C5FD; }
  .notif-item__icon--participation { background: var(--c-purple-soft); border-color: #C4B5FD; }
  .notif-item__icon--achievement { background: var(--c-amber-soft); border-color: #FCD34D; }
  .notif-item__icon--warning     { background: var(--c-red-tint);   border-color: #FCA5A5; }
  .notif-item__icon--message     { background: var(--c-pink-soft);  border-color: #F9A8D4; }
  .notif-item__icon--system      { background: var(--c-line);       border-color: var(--c-line-mid); }

  .notif-item__body {
    flex: 1;
    min-width: 0;
  }

  .notif-item__title {
    font-weight: 700;
    font-size: 0.92rem;
    color: var(--c-ink);
    line-height: 1.4;
    word-break: break-word;
  }

  .notif-item__message {
    font-size: 0.83rem;
    color: var(--c-ink-muted);
    margin-top: 3px;
    line-height: 1.55;
    word-break: break-word;
  }

  .notif-item__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 0.72rem;
    color: var(--c-ink-muted);
    font-family: var(--font-en);
  }

  .notif-item__from {
    font-weight: 700;
    color: var(--c-ink-soft);
    font-family: var(--font);
  }

  .notif-item__dot {
    color: var(--c-line-mid);
  }

  .notif-item__priority {
    margin-inline-start: auto;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .notif-item__priority--high {
    background: var(--c-red-tint);
    color: #991B1B;
  }

  /* ═══════════════════════════════════════════════════════════════
     Notifications Header Card
     ═══════════════════════════════════════════════════════════════ */

  .notif-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    background: var(--c-white);
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    margin-bottom: 16px;
  }

  .notif-header__info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .notif-header__icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--c-red-tint);
    color: var(--c-red);
    display: grid;
    place-items: center;
    font-size: 1.3rem;
    flex-shrink: 0;
  }

  .notif-header__count {
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--c-ink);
  }

  .notif-header__hint {
    font-size: 0.78rem;
    color: var(--c-ink-muted);
    margin-top: 2px;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Footer (محسّن بألوان ظاهرة)
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/footer.css",
  `/* ═══════════════════════════════════════════════════════════════
     Footer — تصميم محسّن بألوان واضحة
     ═══════════════════════════════════════════════════════════════ */

  .footer {
    margin-top: 48px;
    background: var(--c-navy);
    color: var(--c-paper);
    border-top: 4px solid var(--c-red);
    padding-block: 32px 24px;
    padding-bottom: calc(24px + var(--safe-bottom));
  }

  @media (min-width: 900px) {
    .footer {
      padding-bottom: 24px;
    }
  }

  .footer__inner {
    display: grid;
    gap: 24px;
    grid-template-columns: 1fr;
  }

  @media (min-width: 640px) {
    .footer__inner {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (min-width: 900px) {
    .footer__inner {
      grid-template-columns: 2fr 3fr;
      gap: 40px;
    }
  }

  .footer__brand-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .footer__brand {
    font-family: var(--font-en);
    font-weight: 800;
    font-size: 1.3rem;
    color: var(--c-paper);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .footer__brand::before {
    content: 'S';
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: linear-gradient(150deg, var(--c-red), var(--c-red-soft));
    color: #fff;
    font-size: 1rem;
    font-weight: 800;
  }

  .footer__tagline {
    font-size: 0.88rem;
    color: var(--c-paper-soft);
    line-height: 1.7;
    max-width: 40ch;
  }

  .footer__copyright {
    font-size: 0.78rem;
    color: var(--c-paper-muted);
    padding-top: 12px;
    border-top: 1px solid var(--c-navy-2);
    margin-top: 4px;
  }

  .footer__links-col {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 640px) {
    .footer__links-col {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .footer__group-title {
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--c-red);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 12px;
  }

  .footer__links {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .footer__link {
    font-size: 0.86rem;
    color: var(--c-paper-soft);
    transition: color 0.15s var(--ease);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    line-height: 1.5;
  }

  .footer__link:hover {
    color: var(--c-red);
  }

  .footer__link::before {
    content: '→';
    font-size: 0.75rem;
    opacity: 0.6;
    transition: transform 0.15s;
  }

  .footer__link:hover::before {
    transform: translateX(-2px);
    opacity: 1;
  }

  @media print {
    .footer { display: none; }
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Profile
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/profile.css",
  `/* ═══════════════════════════════════════════════════════════════
     Profile Card
     ═══════════════════════════════════════════════════════════════ */

  .profile {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    border: 1px solid var(--c-navy-2);
    border-radius: var(--radius-lg);
    background: linear-gradient(150deg, var(--c-navy), var(--c-navy-soft));
    color: var(--c-paper);
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
  }

  .profile::before {
    content: '';
    position: absolute;
    top: -50px;
    inset-inline-end: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(193, 39, 45, 0.25), transparent 70%);
    pointer-events: none;
  }

  @media (min-width: 640px) {
    .profile {
      flex-direction: row;
      align-items: flex-start;
      padding: 28px;
      gap: 28px;
    }
  }

  .profile__main {
    flex: 1;
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .profile__name {
    color: var(--c-paper);
    font-weight: 900;
    font-size: 1.6rem;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  @media (min-width: 640px) {
    .profile__name { font-size: 2rem; }
  }

  .profile__role {
    color: var(--c-red);
    font-weight: 700;
    margin-top: 6px;
    font-size: 0.95rem;
  }

  .profile__bio {
    margin-top: 16px;
    color: var(--c-paper-soft);
    max-width: 68ch;
    font-size: 0.92rem;
    line-height: 1.7;
  }

  .profile__side {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  @media (min-width: 640px) {
    .profile__side {
      grid-template-columns: 1fr;
      min-width: 200px;
      gap: 16px;
    }
  }

  .kv {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .kv__k {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--c-paper-muted);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .kv__v {
    font-family: var(--font-en);
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--c-paper);
    line-height: 1.4;
  }

  /* ═══════════════════════════════════════════════════════════════
     Profile — داخل بطاقة بيضاء
     ═══════════════════════════════════════════════════════════════ */

  .profile--light {
    background: var(--c-white);
    border-color: var(--c-line);
    color: var(--c-ink);
  }

  .profile--light .profile__name { color: var(--c-ink); }
  .profile--light .profile__role { color: var(--c-red); }
  .profile--light .profile__bio { color: var(--c-ink-soft); }
  .profile--light .kv__k { color: var(--c-ink-muted); }
  .profile--light .kv__v { color: var(--c-ink); }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Login
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/login.css",
  `/* ═══════════════════════════════════════════════════════════════
     Login Page — بسيط وأنيق بدون اسم موقع أو demo accounts
     ═══════════════════════════════════════════════════════════════ */

  .login-page {
    min-height: 100vh;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 20px;
    padding-top: calc(20px + var(--safe-top));
    padding-bottom: calc(20px + var(--safe-bottom));
    background:
      radial-gradient(900px 500px at 20% 0%, rgba(193, 39, 45, 0.08), transparent 60%),
      radial-gradient(700px 400px at 80% 100%, rgba(21, 26, 69, 0.10), transparent 60%),
      var(--c-navy);
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background: var(--c-white);
    border-radius: var(--radius-xl);
    padding: 32px 24px;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--c-line);
    animation: login-slide 0.35s var(--ease);
  }

  @media (min-width: 640px) {
    .login-card { padding: 40px 32px; }
  }

  @keyframes login-slide {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ═══════════ Tabs ═══════════ */

  .login-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 4px;
    background: var(--c-off-white);
    border-radius: var(--radius-sm);
    margin-bottom: 24px;
  }

  .login-tab {
    padding: 11px;
    border-radius: 7px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--c-ink-muted);
    cursor: pointer;
    transition: all 0.15s var(--ease);
  }

  .login-tab.is-active {
    background: var(--c-white);
    color: var(--c-navy);
    box-shadow: var(--shadow-xs);
  }

  /* ═══════════ Form ═══════════ */

  .login-field {
    margin-bottom: 16px;
  }

  .login-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--c-ink-soft);
    margin-bottom: 6px;
  }

  .login-input {
    width: 100%;
    padding: 13px 16px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--c-line-mid);
    background: var(--c-white);
    font-family: inherit;
    font-size: 0.95rem;
    color: var(--c-ink);
    outline: none;
    transition: border-color 0.15s var(--ease), box-shadow 0.15s var(--ease);
  }

  .login-input:focus {
    border-color: var(--c-navy);
    box-shadow: 0 0 0 4px rgba(21, 26, 69, 0.08);
  }

  .login-submit {
    width: 100%;
    padding: 14px;
    border-radius: var(--radius-sm);
    border: none;
    background: var(--c-red);
    color: #fff;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    margin-top: 8px;
    transition: all 0.15s var(--ease);
  }

  .login-submit:hover:not(:disabled) {
    background: var(--c-red-soft);
  }

  .login-submit:active:not(:disabled) {
    transform: scale(0.98);
  }

  .login-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .login-error {
    background: var(--c-red-tint);
    color: #991B1B;
    border: 1px solid #FCA5A5;
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    font-size: 0.85rem;
    line-height: 1.6;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .login-error::before {
    content: '⚠';
    font-size: 1rem;
    flex-shrink: 0;
  }

  .login-success {
    background: var(--c-green-soft);
    color: var(--c-green-text);
    border: 1px solid #86EFAC;
    border-radius: var(--radius-sm);
    padding: 12px 14px;
    font-size: 0.85rem;
    line-height: 1.6;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .login-success::before {
    content: '✓';
    font-weight: 800;
    flex-shrink: 0;
  }

  .login-forgot {
    display: block;
    text-align: center;
    margin-top: 16px;
    font-size: 0.85rem;
    color: var(--c-ink-muted);
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    transition: color 0.15s;
  }

  .login-forgot:hover {
    color: var(--c-red);
  }

  /* ═══════════ Change Password Screen ═══════════ */

  .change-password-notice {
    background: var(--c-amber-soft);
    border: 1px solid #FCD34D;
    border-radius: var(--radius-sm);
    padding: 14px;
    margin-bottom: 20px;
    font-size: 0.85rem;
    color: var(--c-amber-text);
    line-height: 1.6;
  }

  .change-password-notice strong {
    display: block;
    margin-bottom: 4px;
    font-size: 0.9rem;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Onboarding
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/onboarding.css",
  `/* ═══════════════════════════════════════════════════════════════
     Onboarding — شاشة أول زيارة
     ═══════════════════════════════════════════════════════════════ */

  .onboarding-backdrop {
    position: fixed;
    inset: 0;
    background: linear-gradient(150deg, var(--c-navy), var(--c-navy-2));
    z-index: 500;
    display: flex;
    flex-direction: column;
    padding: 24px;
    padding-top: calc(24px + var(--safe-top));
    padding-bottom: calc(24px + var(--safe-bottom));
    overflow-y: auto;
    animation: onboarding-in 0.4s var(--ease);
  }

  @keyframes onboarding-in {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }

  .onboarding-header {
    text-align: center;
    padding: 24px 16px;
    color: #fff;
    flex-shrink: 0;
  }

  .onboarding-header__logo {
    width: 68px;
    height: 68px;
    border-radius: 20px;
    background: linear-gradient(150deg, var(--c-red), var(--c-red-soft));
    display: grid;
    place-items: center;
    font-family: var(--font-en);
    font-size: 1.8rem;
    font-weight: 800;
    color: #fff;
    margin: 0 auto 16px;
    box-shadow: var(--shadow-red);
  }

  .onboarding-header__title {
    font-size: 1.6rem;
    font-weight: 900;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }

  .onboarding-header__subtitle {
    font-size: 0.95rem;
    color: var(--c-paper-soft);
    max-width: 40ch;
    margin: 0 auto;
    line-height: 1.7;
  }

  .onboarding-body {
    flex: 1;
    max-width: 900px;
    width: 100%;
    margin-inline: auto;
  }

  .onboarding-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    padding-block: 16px;
  }

  @media (min-width: 640px) {
    .onboarding-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
  }

  .onboarding-card {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius);
    padding: 20px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s var(--ease);
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: start;
  }

  .onboarding-card:hover {
    background: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }

  .onboarding-card__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-size: 1.6rem;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .onboarding-card__title {
    font-size: 1.05rem;
    font-weight: 800;
    line-height: 1.3;
  }

  .onboarding-card__desc {
    font-size: 0.85rem;
    color: var(--c-paper-soft);
    line-height: 1.7;
  }

  .onboarding-footer {
    padding: 20px;
    padding-top: 8px;
    text-align: center;
    flex-shrink: 0;
  }

  .onboarding-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 32px;
    border-radius: var(--radius-full);
    border: none;
    background: var(--c-red);
    color: #fff;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: var(--shadow-red);
  }

  .onboarding-cta:hover {
    background: var(--c-red-soft);
    transform: translateY(-1px);
  }

  .onboarding-cta:active {
    transform: scale(0.98);
  }

  /* ═══════════ PWA Install Banner ═══════════ */

  .pwa-install-banner {
    position: fixed;
    bottom: calc(20px + var(--safe-bottom));
    inset-inline: 16px;
    z-index: 350;
    background: var(--c-navy);
    color: #fff;
    border-radius: var(--radius);
    padding: 16px;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 12px;
    animation: pwa-slide-in 0.35s var(--ease);
  }

  @media (min-width: 640px) {
    .pwa-install-banner {
      inset-inline: auto;
      inset-inline-end: 24px;
      max-width: 400px;
    }
  }

  @keyframes pwa-slide-in {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .pwa-install-banner__icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(150deg, var(--c-red), var(--c-red-soft));
    display: grid;
    place-items: center;
    font-family: var(--font-en);
    font-weight: 800;
    font-size: 1.15rem;
    color: #fff;
    flex-shrink: 0;
  }

  .pwa-install-banner__body {
    flex: 1;
    min-width: 0;
  }

  .pwa-install-banner__title {
    font-weight: 800;
    font-size: 0.9rem;
  }

  .pwa-install-banner__desc {
    font-size: 0.78rem;
    color: var(--c-paper-soft);
    margin-top: 2px;
  }

  .pwa-install-banner__actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Calendar (تقويم حقيقي)
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/calendar.css",
  `/* ═══════════════════════════════════════════════════════════════
     Calendar Grid
     ═══════════════════════════════════════════════════════════════ */

  .calendar-container {
    background: var(--c-white);
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    padding: 16px;
    box-shadow: var(--shadow-xs);
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    gap: 12px;
  }

  .calendar-month {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--c-navy);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .calendar-month__year {
    font-family: var(--font-en);
    font-size: 0.85rem;
    color: var(--c-ink-muted);
    font-weight: 700;
  }

  .calendar-nav {
    display: flex;
    gap: 6px;
  }

  .calendar-nav__btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--c-off-white);
    border: 1px solid var(--c-line);
    color: var(--c-ink);
    font-size: 1.1rem;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all 0.15s;
  }

  .calendar-nav__btn:hover {
    background: var(--c-line);
  }

  .calendar-nav__btn:active {
    background: var(--c-line-mid);
  }

  /* ═══════════ Days of Week ═══════════ */

  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: 8px;
  }

  .calendar-weekday {
    text-align: center;
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--c-ink-muted);
    padding: 6px 0;
    font-family: var(--font);
  }

  /* ═══════════ Days Grid ═══════════ */

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .calendar-day {
    aspect-ratio: 1;
    min-height: 40px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: var(--c-off-white);
    color: var(--c-ink);
    font-size: 0.85rem;
    font-weight: 700;
    font-family: var(--font-en);
    cursor: pointer;
    transition: all 0.15s var(--ease);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .calendar-day:hover {
    background: var(--c-line);
  }

  .calendar-day--empty {
    background: transparent;
    cursor: default;
    pointer-events: none;
  }

  .calendar-day--today {
    background: var(--c-navy);
    color: #fff;
    border-color: var(--c-navy);
  }

  .calendar-day--has-events::after {
    content: '';
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--c-red);
  }

  .calendar-day--today.calendar-day--has-events::after {
    background: #fff;
  }

  .calendar-day--selected {
    background: var(--c-red);
    color: #fff;
    border-color: var(--c-red);
  }

  .calendar-day--selected::after {
    background: #fff;
  }

  /* ═══════════ Events List Below ═══════════ */

  .calendar-events {
    margin-top: 20px;
  }

  .calendar-events__title {
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--c-ink);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--c-line);
  }

  .calendar-event-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--c-line);
    margin-bottom: 8px;
    background: var(--c-white);
    transition: all 0.15s;
  }

  .calendar-event-item:hover {
    border-color: var(--c-line-mid);
  }

  .calendar-event-item__time {
    font-family: var(--font-en);
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--c-red);
    flex-shrink: 0;
    width: 60px;
    padding-top: 2px;
  }

  .calendar-event-item__body {
    flex: 1;
    min-width: 0;
  }

  .calendar-event-item__title {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--c-ink);
    line-height: 1.4;
  }

  .calendar-event-item__meta {
    font-size: 0.75rem;
    color: var(--c-ink-muted);
    margin-top: 4px;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Chat / Messenger
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/chat.css",
  `/* ═══════════════════════════════════════════════════════════════
     Chat — Messenger style
     ═══════════════════════════════════════════════════════════════ */

  .chat-layout {
    display: grid;
    grid-template-columns: 1fr;
    height: calc(100vh - var(--navbar-h) - var(--bottom-nav-h) - 40px);
    height: calc(100dvh - var(--navbar-h) - var(--bottom-nav-h) - 40px);
    gap: 0;
    border: 1px solid var(--c-line);
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--c-white);
  }

  @media (min-width: 900px) {
    .chat-layout {
      grid-template-columns: 320px 1fr;
      height: calc(100vh - var(--navbar-h) - 60px);
      height: calc(100dvh - var(--navbar-h) - 60px);
    }
  }

  /* ═══════════ Conversations List ═══════════ */

  .chat-sidebar {
    background: var(--c-white);
    border-inline-end: 1px solid var(--c-line);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .chat-sidebar__head {
    padding: 16px;
    border-bottom: 1px solid var(--c-line);
    flex-shrink: 0;
    background: var(--c-navy);
    color: #fff;
  }

  .chat-sidebar__title {
    font-size: 1.05rem;
    font-weight: 800;
  }

  .chat-sidebar__search {
    margin-top: 12px;
    width: 100%;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #fff;
    font-family: inherit;
    font-size: 0.85rem;
    outline: none;
  }

  .chat-sidebar__search::placeholder {
    color: var(--c-paper-muted);
  }

  .chat-sidebar__search:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--c-red);
  }

  .chat-conversations {
    flex: 1;
    overflow-y: auto;
  }

  .chat-conv {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--c-line);
    cursor: pointer;
    transition: background 0.15s;
    position: relative;
  }

  .chat-conv:hover {
    background: var(--c-off-white);
  }

  .chat-conv.is-active {
    background: var(--c-red-tint);
    border-inline-start: 3px solid var(--c-red);
    padding-inline-start: 13px;
  }

  .chat-conv__avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-family: var(--font-en);
    font-weight: 800;
    font-size: 1.05rem;
    flex-shrink: 0;
    color: #fff;
    background: var(--c-navy);
  }

  .chat-conv__avatar--general { background: linear-gradient(150deg, var(--c-red), var(--c-red-soft)); }
  .chat-conv__avatar--team    { background: var(--c-navy); }
  .chat-conv__avatar--private { background: var(--c-navy-3); }

  .chat-conv__body {
    flex: 1;
    min-width: 0;
  }

  .chat-conv__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 3px;
  }

  .chat-conv__name {
    font-size: 0.92rem;
    font-weight: 800;
    color: var(--c-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-conv__time {
    font-size: 0.7rem;
    color: var(--c-ink-muted);
    font-family: var(--font-en);
    flex-shrink: 0;
  }

  .chat-conv__preview {
    font-size: 0.82rem;
    color: var(--c-ink-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.5;
  }

  .chat-conv__badge {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--c-red);
    color: #fff;
    font-size: 0.7rem;
    font-weight: 800;
    font-family: var(--font-en);
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  /* ═══════════ Chat Panel ═══════════ */

  .chat-panel {
    display: flex;
    flex-direction: column;
    background: var(--c-off-white);
    overflow: hidden;
    position: relative;
  }

  .chat-panel__empty {
    flex: 1;
    display: grid;
    place-items: center;
    padding: 40px 20px;
    text-align: center;
    color: var(--c-ink-muted);
  }

  .chat-panel__empty-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.4;
  }

  /* ═══════════ Chat Header ═══════════ */

  .chat-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--c-white);
    border-bottom: 1px solid var(--c-line);
    flex-shrink: 0;
  }

  .chat-header__back {
    display: none;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-sm);
    background: var(--c-off-white);
    border: 1px solid var(--c-line);
    color: var(--c-ink);
    font-size: 1.1rem;
    cursor: pointer;
    font-family: inherit;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }

  @media (max-width: 899px) {
    .chat-header__back { display: flex; }
  }

  .chat-header__info {
    flex: 1;
    min-width: 0;
  }

  .chat-header__title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--c-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chat-header__sub {
    font-size: 0.78rem;
    color: var(--c-ink-muted);
    margin-top: 2px;
  }

  /* ═══════════ Messages ═══════════ */

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    -webkit-overflow-scrolling: touch;
  }

  .chat-message {
    display: flex;
    gap: 8px;
    max-width: 80%;
    align-self: flex-start;
    animation: msg-in 0.2s var(--ease);
  }

  @keyframes msg-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .chat-message--mine {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .chat-message__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-family: var(--font-en);
    font-weight: 800;
    font-size: 0.75rem;
    color: #fff;
    background: var(--c-navy-3);
    flex-shrink: 0;
    align-self: flex-end;
  }

  .chat-message__bubble {
    padding: 10px 14px;
    border-radius: 18px;
    background: var(--c-white);
    border: 1px solid var(--c-line);
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--c-ink);
    word-wrap: break-word;
    word-break: break-word;
    position: relative;
    box-shadow: var(--shadow-xs);
  }

  .chat-message--mine .chat-message__bubble {
    background: var(--c-red);
    color: #fff;
    border-color: var(--c-red);
    border-bottom-right-radius: 6px;
  }

  .chat-message:not(.chat-message--mine) .chat-message__bubble {
    border-bottom-left-radius: 6px;
  }

  .chat-message__sender {
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--c-red);
    margin-bottom: 4px;
  }

  .chat-message--mine .chat-message__sender {
    display: none;
  }

  .chat-message__time {
    font-size: 0.66rem;
    font-family: var(--font-en);
    opacity: 0.65;
    margin-top: 4px;
    text-align: end;
  }

  /* ═══════════ Composer ═══════════ */

  .chat-composer {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 12px 16px;
    padding-bottom: calc(12px + var(--safe-bottom));
    background: var(--c-white);
    border-top: 1px solid var(--c-line);
    flex-shrink: 0;
  }

  @media (min-width: 900px) {
    .chat-composer {
      padding-bottom: 12px;
    }
  }

  .chat-composer__input {
    flex: 1;
    min-width: 0;
    padding: 11px 16px;
    border-radius: 22px;
    border: 1.5px solid var(--c-line-mid);
    background: var(--c-off-white);
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--c-ink);
    outline: none;
    resize: none;
    max-height: 120px;
    line-height: 1.5;
    transition: border-color 0.15s, background 0.15s;
  }

  .chat-composer__input:focus {
    background: var(--c-white);
    border-color: var(--c-navy);
  }

  .chat-composer__send {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--c-red);
    color: #fff;
    border: none;
    cursor: pointer;
    display: grid;
    place-items: center;
    font-size: 1.15rem;
    flex-shrink: 0;
    transition: all 0.15s;
    box-shadow: var(--shadow-red);
  }

  .chat-composer__send:hover:not(:disabled) {
    background: var(--c-red-soft);
    transform: scale(1.05);
  }

  .chat-composer__send:active:not(:disabled) {
    transform: scale(0.95);
  }

  .chat-composer__send:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* ═══════════ Mobile: single-column switch ═══════════ */

  @media (max-width: 899px) {
    .chat-sidebar.is-hidden {
      display: none;
    }

    .chat-panel.is-hidden {
      display: none;
    }
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Empty States / Loading / Error
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/states.css",
  `/* ═══════════════════════════════════════════════════════════════
     Empty State
     ═══════════════════════════════════════════════════════════════ */

  .empty {
    padding: 40px 20px;
    text-align: center;
    border: 1.5px dashed var(--c-line-mid);
    border-radius: var(--radius);
    color: var(--c-ink-muted);
    background: var(--c-off-white);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
  }

  .empty__icon {
    font-size: 2.5rem;
    opacity: 0.5;
    line-height: 1;
  }

  .empty__title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--c-ink);
  }

  .empty__message {
    font-size: 0.88rem;
    max-width: 40ch;
    line-height: 1.7;
  }

  /* ═══════════════════════════════════════════════════════════════
     Loading Screen
     ═══════════════════════════════════════════════════════════════ */

  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    min-height: 40vh;
    color: var(--c-ink-muted);
    font-size: 0.9rem;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--c-line);
    border-top-color: var(--c-red);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* ═══════════════════════════════════════════════════════════════
     Skeleton
     ═══════════════════════════════════════════════════════════════ */

  .skeleton {
    background: linear-gradient(90deg, var(--c-line) 25%, #EDEFF5 50%, var(--c-line) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    border-radius: var(--radius-sm);
  }

  .skeleton--text {
    height: 14px;
    margin: 8px 0;
  }

  .skeleton--title {
    height: 20px;
    width: 60%;
    margin: 12px 0;
  }

  .skeleton--card {
    height: 100px;
    border-radius: var(--radius);
  }

  .skeleton--avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ═══════════════════════════════════════════════════════════════
     404 / Not Found
     ═══════════════════════════════════════════════════════════════ */

  .notfound {
    display: grid;
    place-items: center;
    text-align: center;
    padding-block: 64px;
    padding-inline: 20px;
    min-height: 60vh;
  }

  .notfound__code {
    font-family: var(--font-en);
    font-size: clamp(4rem, 14vw, 8rem);
    font-weight: 800;
    color: var(--c-navy);
    line-height: 1;
    letter-spacing: -0.05em;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Timeline
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/timeline.css",
  `/* ═══════════════════════════════════════════════════════════════
     Timeline
     ═══════════════════════════════════════════════════════════════ */

  .timeline {
    position: relative;
    padding-inline-start: 24px;
  }

  .timeline::before {
    content: '';
    position: absolute;
    inset-inline-start: 7px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: var(--c-line-mid);
    border-radius: 2px;
  }

  .timeline__item {
    position: relative;
    padding-block: 10px;
  }

  .timeline__item::before {
    content: '';
    position: absolute;
    inset-inline-start: -24px;
    top: 20px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--c-white);
    border: 2.5px solid var(--c-red);
    box-sizing: border-box;
    z-index: 1;
  }

  .timeline__date {
    font-family: var(--font-en);
    font-size: 0.72rem;
    color: var(--c-ink-muted);
    font-weight: 700;
    margin-bottom: 3px;
  }

  .timeline__title {
    font-weight: 700;
    font-size: 0.92rem;
    color: var(--c-ink);
    line-height: 1.4;
  }

  .timeline__desc {
    font-size: 0.83rem;
    color: var(--c-ink-soft);
    margin-top: 3px;
    line-height: 1.6;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Approval Chain
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/approvals.css",
  `/* ═══════════════════════════════════════════════════════════════
     Approval Chain
     ═══════════════════════════════════════════════════════════════ */

  .approval-chain {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .approval-step {
    display: flex;
    gap: 14px;
    padding: 14px;
    border-radius: var(--radius);
    border: 1.5px solid var(--c-line);
    background: var(--c-white);
    align-items: flex-start;
    transition: all 0.15s;
  }

  .approval-step--done {
    border-color: #86EFAC;
    background: var(--c-green-soft);
  }

  .approval-step--rejected {
    border-color: #FCA5A5;
    background: var(--c-red-tint);
  }

  .approval-step--pending {
    border-color: #FCD34D;
    background: var(--c-amber-soft);
    box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.06);
  }

  .approval-step__index {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-family: var(--font-en);
    font-weight: 800;
    background: var(--c-navy);
    color: #fff;
    flex-shrink: 0;
    font-size: 0.85rem;
  }

  .approval-step--done .approval-step__index { background: var(--c-green); }
  .approval-step--rejected .approval-step__index { background: var(--c-red); }
  .approval-step--pending .approval-step__index { background: var(--c-amber); }

  .approval-step__body {
    flex: 1;
    min-width: 0;
  }

  .approval-step__title {
    font-weight: 800;
    font-size: 0.9rem;
    color: var(--c-ink);
  }

  .approval-step__meta {
    font-size: 0.78rem;
    color: var(--c-ink-muted);
    margin-top: 3px;
    line-height: 1.5;
  }

  .approval-step__comment {
    margin-top: 10px;
    font-size: 0.84rem;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: var(--radius-sm);
    color: var(--c-ink-soft);
    border: 1px solid rgba(0, 0, 0, 0.04);
    line-height: 1.6;
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Print
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/print.css",
  `@media print {
    .no-print,
    .navbar,
    .footer,
    .sidebar,
    .bottom-nav,
    .toast-container,
    .modal-backdrop,
    .pwa-install-banner,
    .onboarding-backdrop { display: none !important; }

    body {
      background: #fff;
      color: #000;
      font-size: 12pt;
    }

    .container {
      max-width: 100%;
      padding: 0;
    }

    .card,
    .card--navy,
    .stat {
      background: #fff !important;
      color: #000 !important;
      border: 1px solid #000 !important;
      box-shadow: none !important;
      page-break-inside: avoid;
    }

    .badge {
      border: 1px solid #000 !important;
      color: #000 !important;
      background: #fff !important;
    }
  }
  `
);

/* ═══════════════════════════════════════════════════════════════
     STYLES — Global Import
     ═══════════════════════════════════════════════════════════════ */

file(
  "src/styles/global.css",
  `/* ═══════════════════════════════════════════════════════════════
     sbapiaryy v5.1 — Global CSS Import
     هذا الملف يستورد كل الأنماط بالترتيب الصحيح
     ═══════════════════════════════════════════════════════════════ */

  @import './tokens.css';
  @import './base.css';
  @import './layout.css';
  @import './navbar.css';
  @import './bottom-nav.css';
  @import './sidebar.css';
  @import './cards.css';
  @import './badges.css';
  @import './buttons.css';
  @import './tables.css';
  @import './forms.css';
  @import './modal.css';
  @import './toast.css';
  @import './notifications.css';
  @import './footer.css';
  @import './profile.css';
  @import './login.css';
  @import './onboarding.css';
  @import './calendar.css';
  @import './chat.css';
  @import './states.css';
  @import './timeline.css';
  @import './approvals.css';
  @import './print.css';
  `
);

console.log("  ✓ Part 4 loaded: Full CSS system (Mobile-First)");
/* ═══════════════════════════════════════════════════════════════
   UI — Stat
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/Stat.tsx",
  `import type { ReactNode } from 'react';

   interface StatProps {
     value: number | string;
     label: string;
     variant?: 'red' | 'success' | 'amber';
   }

   export function Stat({ value, label, variant }: StatProps) {
     const className = 'stat' + (variant ? ' stat--' + variant : '');
     return (
       <div className={className}>
         <div className="stat__value">{value}</div>
         <div className="stat__label">{label}</div>
       </div>
     );
   }

   export function StatRow({ children }: { children: ReactNode }) {
     return <div className="stat-row">{children}</div>;
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Badge
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/Badge.tsx",
  `import type { ReactNode } from 'react';
   import { cx } from '@/lib/format';

   type Variant =
     | 'success'
     | 'warning'
     | 'danger'
     | 'info'
     | 'purple'
     | 'neutral'
     | 'navy'
     | 'red';

   interface BadgeProps {
     children: ReactNode;
     variant?: Variant;
     dot?: boolean;
     className?: string;
   }

   export function Badge({ children, variant, dot, className }: BadgeProps) {
     const cls = variant ? 'badge--' + variant : '';
     return (
       <span className={cx('badge', cls, className)}>
         {dot ? <span className="badge__dot" /> : null}
         {children}
       </span>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — EmptyState
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/EmptyState.tsx",
  `import type { ReactNode } from 'react';

   interface EmptyStateProps {
     icon?: string;
     title?: string;
     message: string;
     action?: ReactNode;
   }

   export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
     return (
       <div className="empty">
         {icon ? <div className="empty__icon">{icon}</div> : null}
         {title ? <div className="empty__title">{title}</div> : null}
         <div className="empty__message">{message}</div>
         {action}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Loading
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/Loading.tsx",
  `interface LoadingProps {
     message?: string;
     fullHeight?: boolean;
   }

   export function Loading({ message = 'جارٍ التحميل...', fullHeight = false }: LoadingProps) {
     return (
       <div className="loading-screen" style={fullHeight ? { minHeight: '60vh' } : undefined}>
         <div className="loading-spinner" />
         <div>{message}</div>
       </div>
     );
   }

   /* Skeleton Components */

   interface SkeletonCardProps {
     count?: number;
   }

   export function SkeletonCard({ count = 3 }: SkeletonCardProps) {
     return (
       <>
         {Array.from({ length: count }).map((_, i) => (
           <div key={i} className="card no-click" style={{ pointerEvents: 'none' }}>
             <div className="skeleton skeleton--title" />
             <div className="skeleton skeleton--text" />
             <div className="skeleton skeleton--text" style={{ width: '70%' }} />
           </div>
         ))}
       </>
     );
   }

   export function SkeletonList({ count = 5 }: SkeletonCardProps) {
     return (
       <div className="stack">
         {Array.from({ length: count }).map((_, i) => (
           <div
             key={i}
             className="card no-click"
             style={{ pointerEvents: 'none', display: 'flex', gap: 12, alignItems: 'center' }}
           >
             <div className="skeleton skeleton--avatar" />
             <div style={{ flex: 1 }}>
               <div className="skeleton skeleton--text" style={{ width: '60%' }} />
               <div className="skeleton skeleton--text" style={{ width: '40%' }} />
             </div>
           </div>
         ))}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Section Header
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/SectionHeader.tsx",
  `import type { ReactNode } from 'react';

   interface SectionHeaderProps {
     eyebrow?: string;
     title: string;
     description?: string;
     action?: ReactNode;
   }

   export function SectionHeader({ eyebrow, title, description, action }: SectionHeaderProps) {
     return (
       <div className="section-head">
         <div>
           {eyebrow ? <div className="section-head__eyebrow">{eyebrow}</div> : null}
           <h2>{title}</h2>
           {description ? <p className="section-head__desc">{description}</p> : null}
         </div>
         {action}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Page Header
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/PageHeader.tsx",
  `import type { ReactNode } from 'react';

   interface PageHeaderProps {
     eyebrow?: string;
     title: string;
     description?: string;
     children?: ReactNode;
   }

   export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
     return (
       <header className="section section--tight">
         {eyebrow ? <div className="section-head__eyebrow">{eyebrow}</div> : null}
         <h1>{title}</h1>
         {description ? (
           <p className="hero__desc" style={{ marginTop: 12 }}>
             {description}
           </p>
         ) : null}
         {children}
       </header>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Form Field
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/FormField.tsx",
  `import type { ReactNode } from 'react';

   interface FormFieldProps {
     label: string;
     required?: boolean;
     hint?: string;
     error?: string;
     children: ReactNode;
   }

   export function FormField({ label, required, hint, error, children }: FormFieldProps) {
     return (
       <div className="form-field">
         <label className="form-field__label">
           {label}
           {required ? <span className="form-field__req">*</span> : null}
         </label>
         {hint ? <div className="form-field__hint">{hint}</div> : null}
         {children}
         {error ? <div className="form-field__error">{error}</div> : null}
       </div>
     );
   }

   /* ═══════════ TextInput ═══════════ */

   interface TextInputProps {
     value: string;
     onChange: (v: string) => void;
     placeholder?: string;
     type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';
     required?: boolean;
     disabled?: boolean;
     autoComplete?: string;
     autoFocus?: boolean;
   }

   export function TextInput({
     value,
     onChange,
     placeholder,
     type = 'text',
     required,
     disabled,
     autoComplete,
     autoFocus,
   }: TextInputProps) {
     return (
       <input
         className="input"
         type={type}
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         required={required}
         disabled={disabled}
         autoComplete={autoComplete}
         autoFocus={autoFocus}
       />
     );
   }

   /* ═══════════ NumberInput ═══════════ */

   interface NumberInputProps {
     value: number;
     onChange: (v: number) => void;
     placeholder?: string;
     min?: number;
     max?: number;
     step?: number;
     disabled?: boolean;
   }

   export function NumberInput({
     value,
     onChange,
     placeholder,
     min,
     max,
     step,
     disabled,
   }: NumberInputProps) {
     return (
       <input
         className="input"
         type="number"
         value={value}
         onChange={(e) => onChange(Number(e.target.value))}
         placeholder={placeholder}
         min={min}
         max={max}
         step={step}
         disabled={disabled}
       />
     );
   }

   /* ═══════════ DateInput ═══════════ */

   interface DateInputProps {
     value: string;
     onChange: (v: string) => void;
     disabled?: boolean;
   }

   export function DateInput({ value, onChange, disabled }: DateInputProps) {
     return (
       <input
         className="input"
         type="date"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         disabled={disabled}
       />
     );
   }

   /* ═══════════ TimeInput ═══════════ */

   interface TimeInputProps {
     value: string;
     onChange: (v: string) => void;
     disabled?: boolean;
   }

   export function TimeInput({ value, onChange, disabled }: TimeInputProps) {
     return (
       <input
         className="input"
         type="time"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         disabled={disabled}
       />
     );
   }

   /* ═══════════ TextArea ═══════════ */

   interface TextAreaProps {
     value: string;
     onChange: (v: string) => void;
     placeholder?: string;
     rows?: number;
     disabled?: boolean;
   }

   export function TextArea({ value, onChange, placeholder, rows = 4, disabled }: TextAreaProps) {
     return (
       <textarea
         className="input"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         placeholder={placeholder}
         rows={rows}
         disabled={disabled}
       />
     );
   }

   /* ═══════════ Select ═══════════ */

   interface SelectOption {
     value: string;
     label: string;
   }

   interface SelectProps {
     value: string;
     onChange: (v: string) => void;
     options: SelectOption[];
     disabled?: boolean;
   }

   export function Select({ value, onChange, options, disabled }: SelectProps) {
     return (
       <select
         className="input"
         value={value}
         onChange={(e) => onChange(e.target.value)}
         disabled={disabled}
       >
         {options.map((o) => (
           <option key={o.value} value={o.value}>
             {o.label}
           </option>
         ))}
       </select>
     );
   }

   /* ═══════════ MultiSelect (chips-style) ═══════════ */

   interface MultiSelectProps {
     values: string[];
     onChange: (v: string[]) => void;
     options: SelectOption[];
     disabled?: boolean;
   }

   export function MultiSelect({ values, onChange, options, disabled }: MultiSelectProps) {
     const toggle = (v: string) => {
       if (disabled) return;
       if (values.includes(v)) {
         onChange(values.filter((x) => x !== v));
       } else {
         onChange([...values, v]);
       }
     };

     return (
       <div className="chips">
         {options.map((o) => (
           <button
             key={o.value}
             type="button"
             disabled={disabled}
             className={'chip' + (values.includes(o.value) ? ' is-active' : '')}
             onClick={() => toggle(o.value)}
           >
             {o.label}
           </button>
         ))}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Modal (Bottom Sheet on Mobile)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/Modal.tsx",
  `import { useEffect, type ReactNode } from 'react';

   interface ModalProps {
     open: boolean;
     title: string;
     onClose: () => void;
     children: ReactNode;
     footer?: ReactNode;
     wide?: boolean;
   }

   export function Modal({ open, title, onClose, children, footer, wide }: ModalProps) {
     // قفل التمرير في الخلفية عند فتح المودال
     useEffect(() => {
       if (open) {
         const original = document.body.style.overflow;
         document.body.style.overflow = 'hidden';
         return () => {
           document.body.style.overflow = original;
         };
       }
       return undefined;
     }, [open]);

     // إغلاق عند الضغط على Escape
     useEffect(() => {
       if (!open) return undefined;
       const handler = (e: KeyboardEvent) => {
         if (e.key === 'Escape') onClose();
       };
       window.addEventListener('keydown', handler);
       return () => window.removeEventListener('keydown', handler);
     }, [open, onClose]);

     if (!open) return null;

     return (
       <div className="modal-backdrop" onClick={onClose}>
         <div
           className={'modal' + (wide ? ' modal--wide' : '')}
           onClick={(e) => e.stopPropagation()}
           role="dialog"
           aria-modal="true"
         >
           <div className="modal__handle" aria-hidden="true" />
           <div className="modal__head">
             <h3>{title}</h3>
             <button
               type="button"
               className="modal__close"
               onClick={onClose}
               aria-label="إغلاق"
             >
               ×
             </button>
           </div>
           <div className="modal__body">{children}</div>
           {footer ? <div className="modal__foot">{footer}</div> : null}
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Confirm Dialog
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/ConfirmDialog.tsx",
  `import { Modal } from './Modal';

   interface ConfirmDialogProps {
     open: boolean;
     title: string;
     message: string;
     confirmLabel?: string;
     cancelLabel?: string;
     danger?: boolean;
     busy?: boolean;
     onConfirm: () => void;
     onCancel: () => void;
   }

   export function ConfirmDialog({
     open,
     title,
     message,
     confirmLabel = 'تأكيد',
     cancelLabel = 'إلغاء',
     danger,
     busy,
     onConfirm,
     onCancel,
   }: ConfirmDialogProps) {
     return (
       <Modal
         open={open}
         title={title}
         onClose={onCancel}
         footer={
           <>
             <button
               type="button"
               className="btn btn--ghost"
               onClick={onCancel}
               disabled={busy}
             >
               {cancelLabel}
             </button>
             <button
               type="button"
               className={'btn ' + (danger ? 'btn--danger' : 'btn--primary')}
               onClick={onConfirm}
               disabled={busy}
             >
               {busy ? '...' : confirmLabel}
             </button>
           </>
         }
       >
         <p style={{ lineHeight: 1.8, color: 'var(--c-ink-soft)' }}>{message}</p>
       </Modal>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Toast Provider + Hook
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/Toast.tsx",
  `import { useEffect, useState, type ReactNode } from 'react';

   type ToastType = 'success' | 'error' | 'info' | 'warning';

   interface ToastItem {
     id: string;
     title: string;
     message?: string;
     type: ToastType;
   }

   interface ToastState {
     toasts: ToastItem[];
     show: (title: string, message?: string, type?: ToastType) => void;
     remove: (id: string) => void;
   }

   let toastStore: ToastState | null = null;
   const listeners = new Set<(state: ToastState) => void>();

   function emit() {
     if (!toastStore) return;
     listeners.forEach((listener) => listener(toastStore!));
   }

   export function useToast(): ToastState {
     const [state, setState] = useState<ToastState>(() => {
       if (!toastStore) {
         toastStore = {
           toasts: [],
           show: () => {},
           remove: () => {},
         };
       }
       return toastStore;
     });

     useEffect(() => {
       listeners.add(setState);
       return () => {
         listeners.delete(setState);
       };
     }, []);

     return state;
   }

   /* ═══════════════════════════════════════════════════════════════
      Toast Container — يُضاف في App
      ═══════════════════════════════════════════════════════════════ */

   const ICONS: Record<ToastType, string> = {
     success: '✓',
     error: '⚠',
     info: 'ℹ',
     warning: '⚠',
   };

   export function ToastContainer() {
     const { toasts, remove } = useToast();

     if (toasts.length === 0) return null;

     return (
       <div className="toast-container">
         {toasts.map((t) => (
           <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
         ))}
       </div>
     );
   }

   function Toast({ toast, onClose }: { toast: ToastItem; onClose: () => void }): ReactNode {
     useEffect(() => {
       const timer = setTimeout(onClose, 4000);
       return () => clearTimeout(timer);
     }, [onClose]);

     return (
       <div className={'toast toast--' + toast.type} onClick={onClose}>
         <div className="toast__icon">{ICONS[toast.type]}</div>
         <div className="toast__content">
           <div className="toast__title">{toast.title}</div>
           {toast.message ? <div className="toast__message">{toast.message}</div> : null}
         </div>
       </div>
     );
   }

   /* ═══════════════════════════════════════════════════════════════
      Global API — يمكن استخدامه من أي مكان
      ═══════════════════════════════════════════════════════════════ */

   export const toast = {
     show(title: string, message?: string, type: ToastType = 'info') {
       if (!toastStore) {
         toastStore = {
           toasts: [],
           show: () => {},
           remove: () => {},
         };
         toastStore.show = (t, m, ty = 'info') => {
           const id = Math.random().toString(36).slice(2, 10);
           toastStore!.toasts = [
             ...toastStore!.toasts,
             { id, title: t, message: m, type: ty },
           ];
           emit();
           setTimeout(() => {
             toastStore!.toasts = toastStore!.toasts.filter((x) => x.id !== id);
             emit();
           }, 4000);
         };
         toastStore.remove = (id) => {
           toastStore!.toasts = toastStore!.toasts.filter((x) => x.id !== id);
           emit();
         };
       }
       toastStore.show(title, message, type);
     },

     success(title: string, message?: string) {
       this.show(title, message, 'success');
     },

     error(title: string, message?: string) {
       this.show(title, message, 'error');
     },

     info(title: string, message?: string) {
       this.show(title, message, 'info');
     },

     warning(title: string, message?: string) {
       this.show(title, message, 'warning');
     },
   };
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Avatar
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/Avatar.tsx",
  `import { initials } from '@/lib/format';

   interface AvatarProps {
     name: string;
     size?: number;
     variant?: 'navy' | 'red' | 'gradient';
   }

   const BG_COLORS: Record<string, string> = {
     navy: 'var(--c-navy)',
     red: 'var(--c-red)',
     gradient: 'linear-gradient(150deg, var(--c-red), var(--c-red-soft))',
   };

   export function Avatar({ name, size = 44, variant = 'navy' }: AvatarProps) {
     return (
       <div
         style={{
           width: size,
           height: size,
           borderRadius: '50%',
           display: 'grid',
           placeItems: 'center',
           fontFamily: 'var(--font-en)',
           fontWeight: 800,
           fontSize: Math.max(10, Math.round(size * 0.36)),
           color: '#fff',
           background: BG_COLORS[variant],
           flexShrink: 0,
           border: '1px solid rgba(255,255,255,0.1)',
           userSelect: 'none',
         }}
         aria-hidden="true"
       >
         {initials(name)}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — ProgressBar
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/ProgressBar.tsx",
  `interface ProgressBarProps {
     percent: number;
     label?: string;
     sublabel?: string;
     color?: string;
   }

   export function ProgressBar({
     percent,
     label,
     sublabel,
     color = 'var(--c-red)',
   }: ProgressBarProps) {
     const safe = Math.max(0, Math.min(100, percent));
     return (
       <div>
         {label ? (
           <div
             style={{
               display: 'flex',
               justifyContent: 'space-between',
               alignItems: 'center',
               marginBottom: 8,
               fontSize: '0.88rem',
               fontWeight: 700,
               color: 'var(--c-ink)',
             }}
           >
             <span>{label}</span>
             <span
               style={{
                 fontFamily: 'var(--font-en)',
                 color: 'var(--c-red)',
                 fontWeight: 800,
               }}
             >
               {safe}%
             </span>
           </div>
         ) : null}
         <div
           style={{
             height: 10,
             background: 'var(--c-line)',
             borderRadius: 999,
             overflow: 'hidden',
           }}
         >
           <div
             style={{
               width: safe + '%',
               height: '100%',
               background: color,
               transition: 'width 0.4s ease',
               borderRadius: 999,
             }}
           />
         </div>
         {sublabel ? (
           <div
             style={{
               marginTop: 8,
               fontSize: '0.78rem',
               color: 'var(--c-ink-muted)',
             }}
           >
             {sublabel}
           </div>
         ) : null}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Error Boundary
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/ErrorBoundary.tsx",
  `import { Component, type ReactNode } from 'react';

   interface Props {
     children: ReactNode;
   }

   interface State {
     hasError: boolean;
     error?: Error;
   }

   export class ErrorBoundary extends Component<Props, State> {
     state: State = { hasError: false };

     static getDerivedStateFromError(error: Error): State {
       return { hasError: true, error };
     }

     componentDidCatch(error: Error) {
       console.error('[sbapiaryy] Error:', error);
     }

     render() {
       if (this.state.hasError) {
         return (
           <div className="notfound">
             <div className="notfound__code">⚠</div>
             <h2 className="mt-4">حدث خطأ غير متوقع</h2>
             <p className="muted mt-3" style={{ maxWidth: '40ch' }}>
               {this.state.error?.message ?? 'حدثت مشكلة. يرجى إعادة المحاولة.'}
             </p>
             <button
               type="button"
               className="btn btn--primary mt-6"
               onClick={() => window.location.reload()}
             >
               إعادة التحميل
             </button>
           </div>
         );
       }
       return this.props.children;
     }
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      UI — Tabs
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/Tabs.tsx",
  `import { cx } from '@/lib/format';

   interface Tab {
     id: string;
     label: string;
     count?: number;
   }

   interface TabsProps {
     tabs: Tab[];
     active: string;
     onChange: (id: string) => void;
   }

   export function Tabs({ tabs, active, onChange }: TabsProps) {
     return (
       <div className="chips" style={{ marginBottom: 'var(--space-4)' }}>
         {tabs.map((t) => (
           <button
             key={t.id}
             type="button"
             className={cx('chip', active === t.id && 'is-active')}
             onClick={() => onChange(t.id)}
           >
             {t.label}
             {t.count !== undefined && t.count > 0 ? ' (' + t.count + ')' : ''}
           </button>
         ))}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LAYOUT — Bottom Navigation (Mobile)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/layout/BottomNav.tsx",
  `import { NavLink } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { cx } from '@/lib/format';
   import type { Notification } from '@/types';

   interface NavTab {
     to: string;
     label: string;
     icon: string;
     badge?: number;
   }

   export function BottomNav() {
     const { user, manager } = useAuth();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');

     if (!user) return null;

     const unread = notifs.filter((n) => n.userId === user.uid && !n.read).length;

     const tabs: NavTab[] = [
       { to: '/dashboard', label: 'الرئيسية', icon: '🏠' },
       { to: '/members', label: 'الأعضاء', icon: '👥' },
       { to: '/conversations', label: 'المحادثات', icon: '💬' },
       { to: '/notifications', label: 'الإشعارات', icon: '🔔', badge: unread },
       { to: manager ? '/admin' : '/profile', label: manager ? 'الإدارة' : 'ملفي', icon: manager ? '⚙️' : '👤' },
     ];

     return (
       <nav className="bottom-nav no-print" aria-label="التنقل السريع">
         <div className="bottom-nav__inner">
           {tabs.map((tab) => (
             <NavLink
               key={tab.to}
               to={tab.to}
               end={tab.to === '/dashboard' || tab.to === '/admin'}
               className={({ isActive }) => cx('bottom-nav__item', isActive && 'is-active')}
             >
               <span className="bottom-nav__icon" aria-hidden="true">{tab.icon}</span>
               <span className="bottom-nav__label">{tab.label}</span>
               {tab.badge && tab.badge > 0 ? (
                 <span className="bottom-nav__badge">
                   {tab.badge > 99 ? '99+' : tab.badge}
                 </span>
               ) : null}
             </NavLink>
           ))}
         </div>
       </nav>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LAYOUT — Sidebar (Mobile Drawer + Desktop Sticky)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/layout/Sidebar.tsx",
  `import { NavLink, useNavigate } from 'react-router-dom';
   import { useEffect, useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { ROLE_LABEL, isAdmin, seesAllTeams } from '@/lib/permissions';
   import { cx, initials } from '@/lib/format';
   import type { Notification, ApprovalStep } from '@/types';

   interface NavItem {
     to: string;
     label: string;
     icon: string;
     count?: number;
   }

   interface SidebarProps {
     open: boolean;
     onClose: () => void;
   }

   function buildAdminNav(unread: number, pending: number): NavItem[] {
     return [
       { to: '/admin', label: 'لوحة الإدارة', icon: '⚙️' },
       { to: '/admin/analytics', label: 'التحليلات', icon: '📊' },
       { to: '/admin/requests', label: 'الطلبات', icon: '📋', count: pending },
       { to: '/admin/users', label: 'المستخدمون', icon: '👤' },
       { to: '/admin/members', label: 'الأعضاء', icon: '👥' },
       { to: '/admin/contributions', label: 'المشاركات', icon: '📝' },
       { to: '/admin/committees', label: 'اللجان', icon: '🏛️' },
       { to: '/admin/achievements', label: 'الإنجازات', icon: '🏆' },
       { to: '/admin/warnings', label: 'التحذيرات', icon: '⚠️' },
       { to: '/admin/calendar', label: 'التقويم', icon: '📅' },
       { to: '/admin/conversations', label: 'المحادثات', icon: '💬' },
       { to: '/admin/notifications', label: 'إرسال إشعار', icon: '🔔' },
       { to: '/admin/audit', label: 'سجل التغييرات', icon: '📜' },
     ];
   }

   function buildManagerNav(unread: number, pending: number): NavItem[] {
     return [
       { to: '/dashboard', label: 'لوحة التحكم', icon: '🏠' },
       { to: '/members', label: 'الأعضاء', icon: '👥' },
       { to: '/requests', label: 'الطلبات', icon: '📋' },
       { to: '/approvals', label: 'الموافقات', icon: '✅', count: pending },
       { to: '/contributions', label: 'المشاركات', icon: '📝' },
       { to: '/committees', label: 'اللجان', icon: '🏛️' },
       { to: '/league', label: 'الليج', icon: '🥇' },
       { to: '/achievements', label: 'الإنجازات', icon: '🏆' },
       { to: '/warnings', label: 'التحذيرات', icon: '⚠️' },
       { to: '/conversations', label: 'المحادثات', icon: '💬' },
       { to: '/calendar', label: 'التقويم', icon: '📅' },
       { to: '/notifications', label: 'الإشعارات', icon: '🔔', count: unread },
       { to: '/reports', label: 'التقارير', icon: '📈' },
     ];
   }

   function buildMemberNav(unread: number): NavItem[] {
     return [
       { to: '/dashboard', label: 'لوحة التحكم', icon: '🏠' },
       { to: '/profile', label: 'ملفي الشخصي', icon: '👤' },
       { to: '/my-contributions', label: 'مشاركاتي', icon: '📝' },
       { to: '/requests/new', label: 'طلب جديد', icon: '➕' },
       { to: '/my-requests', label: 'طلباتي', icon: '📋' },
       { to: '/committees', label: 'اللجان', icon: '🏛️' },
       { to: '/league', label: 'الليج', icon: '🥇' },
       { to: '/achievements', label: 'الإنجازات', icon: '🏆' },
       { to: '/conversations', label: 'المحادثات', icon: '💬' },
       { to: '/calendar', label: 'التقويم', icon: '📅' },
       { to: '/notifications', label: 'الإشعارات', icon: '🔔', count: unread },
       { to: '/governance', label: 'الحوكمة', icon: '📖' },
     ];
   }

   export function Sidebar({ open, onClose }: SidebarProps) {
     const { user } = useAuth();
     const nav = useNavigate();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');
     const { data: approvals } = useRealtimeCollection<ApprovalStep>('approvals');
     const [isMobile, setIsMobile] = useState(false);

     useEffect(() => {
       const mq = window.matchMedia('(max-width: 900px)');
       const update = () => setIsMobile(mq.matches);
       update();
       mq.addEventListener('change', update);
       return () => mq.removeEventListener('change', update);
     }, []);

     if (!user) return null;

     const unread = notifs.filter((n) => n.userId === user.uid && !n.read).length;
     const pending = approvals.filter((a) => {
       if (a.status !== 'PENDING') return false;
       if (isAdmin(user)) return true;
       if (a.requiredRole !== user.role) return false;
       if (a.requiredTeamId !== null && a.requiredTeamId !== user.teamId) return false;
       return true;
     }).length;

     let items: NavItem[];
     if (isAdmin(user)) {
       items = buildAdminNav(unread, pending);
     } else if (user.role === 'MEMBER' || user.role === 'VIEWER') {
       items = buildMemberNav(unread);
     } else {
       items = buildManagerNav(unread, pending);
     }

     const handleLogout = async () => {
       onClose();
       await logout();
       nav('/');
     };

     const handleNavClick = () => {
       if (isMobile) onClose();
     };

     return (
       <>
         <div
           className={'sidebar-overlay' + (open ? ' is-open' : '')}
           onClick={onClose}
           aria-hidden="true"
         />

         <aside className={'sidebar no-print' + (open ? ' is-open' : '')}>
           <button
             type="button"
             className="sidebar-close"
             onClick={onClose}
             aria-label="إغلاق القائمة"
           >
             ×
           </button>

           <div className="sidebar__user">
             <div className="sidebar__avatar">{initials(user.displayName)}</div>
             <div className="sidebar__user-info">
               <div className="sidebar__user-name">{user.displayName}</div>
               <div className="sidebar__user-role">{ROLE_LABEL[user.role]}</div>
             </div>
           </div>

           <div className="sidebar__group">
             <div className="sidebar__title">
               {seesAllTeams(user) ? 'الإدارة' : 'القائمة'}
             </div>
             {items.map((it) => (
               <NavLink
                 key={it.to}
                 to={it.to}
                 end={it.to === '/dashboard' || it.to === '/admin' || it.to === '/'}
                 onClick={handleNavClick}
                 className={({ isActive }) => cx('sidebar__link', isActive && 'is-active')}
               >
                 <span className="sidebar__icon" aria-hidden="true">{it.icon}</span>
                 <span>{it.label}</span>
                 {it.count && it.count > 0 ? (
                   <span className="sidebar__count">{it.count > 99 ? '99+' : it.count}</span>
                 ) : null}
               </NavLink>
             ))}
           </div>

           <div className="sidebar__group">
             <div className="sidebar__title">الحساب</div>
             <button
               type="button"
               className="sidebar__link sidebar__link--danger"
               onClick={handleLogout}
             >
               <span className="sidebar__icon" aria-hidden="true">🚪</span>
               <span>تسجيل الخروج</span>
             </button>
           </div>
         </aside>
       </>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LAYOUT — Navbar (مبسّط: اسم + إشعارات + دخول/خروج)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/layout/Navbar.tsx",
  `import { Link, useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { site } from '@/data';
   import type { Notification } from '@/types';

   interface NavbarProps {
     onMenuToggle?: () => void;
   }

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
           <Link to={user ? '/dashboard' : '/'} className="brand">
             {site.name}
           </Link>

           <div className="nav-actions">
             {user ? (
               <>
                 {onMenuToggle ? (
                   <button
                     type="button"
                     className="nav-action nav-action--icon show-mobile"
                     onClick={onMenuToggle}
                     aria-label="القائمة"
                   >
                     <span className="nav-action__icon">☰</span>
                   </button>
                 ) : null}

                 <Link
                   to="/notifications"
                   className="nav-action nav-action--icon"
                   aria-label="الإشعارات"
                 >
                   <span className="nav-action__icon">🔔</span>
                   {unread > 0 ? (
                     <span className="nav-action__badge">
                       {unread > 99 ? '99+' : unread}
                     </span>
                   ) : null}
                 </Link>

                 <button
                   type="button"
                   className="nav-action nav-action--danger"
                   onClick={doLogout}
                 >
                   خروج
                 </button>
               </>
             ) : (
               <Link to="/login" className="nav-action nav-action--primary">
                 دخول
               </Link>
             )}
           </div>
         </div>
       </header>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LAYOUT — Footer (محسّن بألوان ظاهرة وروابط)
      ═══════════════════════════════════════════════════════════════ */

file(
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
               <div className="footer__brand">{site.name}</div>
               <p className="footer__tagline">
                 {site.description}
               </p>
               <div className="footer__copyright">
                 © {year} {site.organization} — {activeSeason.label}
               </div>
             </div>

             <div className="footer__links-col">
               <div>
                 <div className="footer__group-title">التصفح</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/">الرئيسية</Link>
                   <Link className="footer__link" to="/members">الأعضاء</Link>
                   <Link className="footer__link" to="/teams">الفرق</Link>
                   <Link className="footer__link" to="/league">الليج</Link>
                 </div>
               </div>

               <div>
                 <div className="footer__group-title">المنصة</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/committees">اللجان</Link>
                   <Link className="footer__link" to="/achievements">الإنجازات</Link>
                   <Link className="footer__link" to="/calendar">التقويم</Link>
                   <Link className="footer__link" to="/search">بحث</Link>
                 </div>
               </div>

               <div>
                 <div className="footer__group-title">عن المنظمة</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/about">عن المنحل</Link>
                   <Link className="footer__link" to="/governance">الحوكمة</Link>
                   <Link className="footer__link" to="/login">تسجيل الدخول</Link>
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

/* ═══════════════════════════════════════════════════════════════
      LAYOUT — Dashboard Layout (مع Sidebar drawer)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/layout/DashboardLayout.tsx",
  `import { Outlet } from 'react-router-dom';
   import { Sidebar } from './Sidebar';

   interface DashboardLayoutProps {
     sidebarOpen?: boolean;
     onSidebarClose?: () => void;
   }

   export function DashboardLayout({ sidebarOpen = false, onSidebarClose }: DashboardLayoutProps) {
     return (
       <div className="container">
         <div className="dashboard-layout">
           <Sidebar
             open={sidebarOpen}
             onClose={onSidebarClose ?? (() => {})}
           />
           <div>
             <Outlet />
           </div>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LAYOUT — RequireAuth
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/layout/RequireAuth.tsx",
  `import type { ReactNode } from 'react';
   import { Navigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { Loading } from '@/components/ui/Loading';
   import type { RoleId } from '@/types';

   interface RequireAuthProps {
     children: ReactNode;
     roles?: RoleId[];
   }

   export function RequireAuth({ children, roles }: RequireAuthProps) {
     const { user, loading, mustChangePassword } = useAuth();

     if (loading) {
       return <Loading message="جارٍ التحقق من الجلسة..." fullHeight />;
     }

     if (!user) {
       return <Navigate to="/login" replace />;
     }

     if (mustChangePassword) {
       return <Navigate to="/change-password" replace />;
     }

     if (roles && !roles.includes(user.role)) {
       return <Navigate to="/dashboard" replace />;
     }

     return <>{children}</>;
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PWA — Install Prompt Banner
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/pwa/PwaInstallBanner.tsx",
  `import { useEffect, useState } from 'react';
   import {
     canInstallPwa,
     promptInstall,
     isStandalone,
     isIos,
   } from '@/lib/pwa';
   import { toast } from '@/components/ui/Toast';

   const DISMISSED_KEY = 'sbapiaryy-pwa-dismissed';

   export function PwaInstallBanner() {
     const [visible, setVisible] = useState(false);
     const [iosMode, setIosMode] = useState(false);

     useEffect(() => {
       if (isStandalone()) return;
       if (localStorage.getItem(DISMISSED_KEY) === 'yes') return;

       const check = () => {
         if (canInstallPwa()) {
           setVisible(true);
           setIosMode(false);
         } else if (isIos()) {
           setVisible(true);
           setIosMode(true);
         }
       };

       check();
       const t = setTimeout(check, 2000);

       const handler = () => {
         setVisible(true);
         setIosMode(false);
       };
       window.addEventListener('pwa-install-available', handler);

       return () => {
         clearTimeout(t);
         window.removeEventListener('pwa-install-available', handler);
       };
     }, []);

     const dismiss = () => {
       setVisible(false);
       localStorage.setItem(DISMISSED_KEY, 'yes');
     };

     const install = async () => {
       if (iosMode) {
         toast.info(
           'للتثبيت على iPhone',
           'اضغط زر المشاركة ← Add to Home Screen',
         );
         return;
       }
       const result = await promptInstall();
       if (result === 'accepted') {
         toast.success('تم التثبيت', 'افتح التطبيق من الشاشة الرئيسية');
         setVisible(false);
       } else if (result === 'dismissed') {
         dismiss();
       } else {
         toast.info(
           'التثبيت غير متاح',
           'استخدم قائمة المتصفح ← Install app',
         );
       }
     };

     if (!visible) return null;

     return (
       <div className="pwa-install-banner no-print">
         <div className="pwa-install-banner__icon">S</div>
         <div className="pwa-install-banner__body">
           <div className="pwa-install-banner__title">
             ثبّت sbapiaryy كتطبيق
           </div>
           <div className="pwa-install-banner__desc">
             {iosMode ? 'من Safari: اضغط Share ← Add to Home Screen' : 'وصول أسرع من شاشة هاتفك'}
           </div>
         </div>
         <div className="pwa-install-banner__actions">
           <button
             type="button"
             className="btn btn--ghost btn--xs"
             onClick={dismiss}
           >
             لاحقًا
           </button>
           <button
             type="button"
             className="btn btn--primary btn--xs"
             onClick={install}
           >
             تثبيت
           </button>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PWA — Standalone Indicator (لإظهار أن التطبيق مثبّت)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/pwa/StandaloneIndicator.tsx",
  `import { useEffect, useState } from 'react';
   import { isStandalone } from '@/lib/pwa';

   export function StandaloneIndicator() {
     const [standalone, setStandalone] = useState(false);

     useEffect(() => {
       setStandalone(isStandalone());
     }, []);

     if (!standalone) return null;

     // مجرد إشارة — لا واجهة إضافية
     return null;
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ONBOARDING — Screen (يظهر أول زيارة)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/onboarding/Onboarding.tsx",
  `import { useEffect, useState } from 'react';
   import { onboardingCards } from '@/data';
   import {
     hasCompletedOnboarding,
     markOnboardingComplete,
   } from '@/lib/onboarding';
   import { site } from '@/data';

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
           <div className="onboarding-header__logo">S</div>
           <div className="onboarding-header__title">أهلاً في {site.name}</div>
           <div className="onboarding-header__subtitle">
             تعرّف على المنصة في دقيقة واحدة
           </div>
         </div>

         <div className="onboarding-body">
           <div className="onboarding-grid">
             {sorted.map((card) => (
               <div key={card.id} className="onboarding-card">
                 <div
                   className="onboarding-card__icon"
                   style={{ background: card.accentColor + '22', borderColor: card.accentColor + '55' }}
                 >
                   {card.icon}
                 </div>
                 <div className="onboarding-card__title">{card.title}</div>
                 <div className="onboarding-card__desc">{card.description}</div>
               </div>
             ))}
           </div>
         </div>

         <div className="onboarding-footer">
           <button type="button" className="onboarding-cta" onClick={finish}>
             فهمت، لنبدأ
           </button>
         </div>
       </div>
     );
   }
   `
);

console.log("  ✓ Part 5 loaded: UI Components + Layout + PWA + Onboarding");
/* ═══════════════════════════════════════════════════════════════
   MEMBER — MemberCard (يستخدم الاسم الحقيقي فقط)
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/member/MemberCard.tsx",
  `import { Link } from 'react-router-dom';
   import type { Member } from '@/types';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';

   interface MemberCardProps {
     member: Member;
     showTeam?: boolean;
     showCommittee?: boolean;
   }

   export function MemberCard({ member, showTeam = true, showCommittee = true }: MemberCardProps) {
     const totalHours = member.hours || 0;
     const totalPoints = hoursToPoints(totalHours);

     const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));
     const memberCommittees = committees.filter((c) => member.committeeIds.includes(c.id));

     return (
       <Link to={'/members/' + member.id} className="card">
         <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
           <Avatar name={member.name} size={52} variant="navy" />
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title" style={{ fontSize: '1rem' }}>
               {member.name}
             </div>
             <div className="card__meta">{ROLE_LABEL[member.role]}</div>
           </div>
         </div>

         {showTeam && memberTeams.length > 0 ? (
           <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
             {memberTeams.map((t) => (
               <Badge key={t.id}>{t.name}</Badge>
             ))}
           </div>
         ) : null}

         {showCommittee && memberCommittees.length > 0 ? (
           <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
             {memberCommittees.map((c) => (
               <Badge key={c.id} variant="info">
                 {c.icon} {c.nameAr}
               </Badge>
             ))}
           </div>
         ) : null}

         <div
           className="row row--between"
           style={{
             marginTop: 14,
             paddingTop: 12,
             borderTop: '1px solid var(--c-line)',
           }}
         >
           <div>
             <div className="tiny muted">المشاركات</div>
             <div
               style={{
                 fontFamily: 'var(--font-en)',
                 fontSize: '1.05rem',
                 fontWeight: 800,
                 color: 'var(--c-navy)',
               }}
             >
               {totalHours}
             </div>
           </div>
           <div>
             <div className="tiny muted">النقاط</div>
             <div
               style={{
                 fontFamily: 'var(--font-en)',
                 fontSize: '1.05rem',
                 fontWeight: 800,
                 color: 'var(--c-red)',
               }}
             >
               {totalPoints}
             </div>
           </div>
         </div>
       </Link>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      MEMBER — MemberRow (جدول)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/member/MemberRow.tsx",
  `import { Link } from 'react-router-dom';
   import type { Member } from '@/types';
   import { Avatar } from '@/components/ui/Avatar';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { hoursToPoints } from '@/lib/format';

   interface MemberRowProps {
     member: Member;
     rank?: number;
     showRole?: boolean;
     showTeam?: boolean;
     showCommittee?: boolean;
   }

   export function MemberRow({
     member,
     rank,
     showRole = true,
     showTeam = true,
     showCommittee = false,
   }: MemberRowProps) {
     const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));
     const points = hoursToPoints(member.hours || 0);

     return (
       <tr>
         {rank !== undefined ? (
           <td className={'rank rank--' + (rank <= 3 ? rank : '')} data-label="الترتيب">
             {rank}
           </td>
         ) : null}

         <td data-label="العضو">
           <Link
             to={'/members/' + member.id}
             style={{ display: 'flex', alignItems: 'center', gap: 10 }}
           >
             <Avatar name={member.name} size={34} variant="navy" />
             <span style={{ fontWeight: 700 }}>{member.name}</span>
           </Link>
         </td>

         {showRole ? (
           <td className="muted small" data-label="الدور">
             {ROLE_LABEL[member.role]}
           </td>
         ) : null}

         {showTeam ? (
           <td data-label="الفريق">
             <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
               {memberTeams.map((t) => (
                 <span key={t.id} className="badge">
                   {t.name}
                 </span>
               ))}
             </div>
           </td>
         ) : null}

         {showCommittee ? (
           <td data-label="اللجنة">
             <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
               {member.committeeIds.length === 0 ? (
                 <span className="muted small">—</span>
               ) : null}
             </div>
           </td>
         ) : null}

         <td style={{ fontFamily: 'var(--font-en)' }} data-label="الساعات">
           {member.hours}
         </td>

         <td className="points" data-label="النقاط">
           {points}
         </td>
       </tr>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      MEMBER — MemberStatusBadge
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/member/MemberStatusBadge.tsx",
  `import { Badge } from '@/components/ui/Badge';
   import type { Member } from '@/types';

   export function MemberStatusBadge({ status }: { status: Member['status'] }) {
     if (status === 'active') return <Badge variant="success" dot>نشط</Badge>;
     if (status === 'inactive') return <Badge variant="neutral">غير نشط</Badge>;
     return <Badge variant="danger" dot>موقوف</Badge>;
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      TEAM — TeamCard
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/team/TeamCard.tsx",
  `import { Link } from 'react-router-dom';
   import type { Team } from '@/types';
   import { members } from '@/data/members';
   import { hoursToPoints } from '@/lib/format';

   interface TeamCardProps {
     team: Team;
     rank?: number;
   }

   export function TeamCard({ team, rank }: TeamCardProps) {
     const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
     const totalHours = teamMembers.reduce((sum, m) => sum + (m.hours || 0), 0);
     const totalPoints = hoursToPoints(totalHours);
     const avgPoints = teamMembers.length === 0 ? 0 : Math.round(totalPoints / teamMembers.length);

     return (
       <Link to={'/teams/' + team.id} className="card">
         <div className="row row--between">
           <div className="card__title">{team.name}</div>
           {rank !== undefined ? (
             <span className="badge badge--red">#{rank}</span>
           ) : null}
         </div>

         <div className="card__meta">{team.nameAr}</div>

         <div
           className="row"
           style={{
             marginTop: 14,
             paddingTop: 12,
             borderTop: '1px solid var(--c-line)',
             gap: 20,
           }}
         >
           <div>
             <div
               style={{
                 fontFamily: 'var(--font-en)',
                 fontSize: '1.15rem',
                 fontWeight: 800,
                 color: 'var(--c-navy)',
               }}
             >
               {totalPoints}
             </div>
             <div className="tiny muted">نقاط</div>
           </div>
           <div>
             <div
               style={{
                 fontFamily: 'var(--font-en)',
                 fontSize: '1.15rem',
                 fontWeight: 800,
                 color: 'var(--c-navy)',
               }}
             >
               {teamMembers.length}
             </div>
             <div className="tiny muted">أعضاء</div>
           </div>
           <div>
             <div
               style={{
                 fontFamily: 'var(--font-en)',
                 fontSize: '1.15rem',
                 fontWeight: 800,
                 color: 'var(--c-navy)',
               }}
             >
               {avgPoints}
             </div>
             <div className="tiny muted">متوسط</div>
           </div>
         </div>
       </Link>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      COMMITTEE — CommitteeCard
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/committee/CommitteeCard.tsx",
  `import type { Committee } from '@/types';
   import { members } from '@/data/members';
   import { Badge } from '@/components/ui/Badge';

   interface CommitteeCardProps {
     committee: Committee;
   }

   export function CommitteeCard({ committee }: CommitteeCardProps) {
     const committeeMembers = members.filter((m) =>
       m.committeeIds.includes(committee.id),
     );

     return (
       <div className="card no-click">
         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
           <div
             style={{
               width: 48,
               height: 48,
               borderRadius: 14,
               background: committee.color + '15',
               border: '1px solid ' + committee.color + '30',
               display: 'grid',
               placeItems: 'center',
               fontSize: '1.5rem',
               flexShrink: 0,
             }}
             aria-hidden="true"
           >
             {committee.icon}
           </div>
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{committee.nameAr}</div>
             <div className="card__meta">{committee.description}</div>
           </div>
         </div>

         <div className="row mt-4" style={{ gap: 6 }}>
           <Badge variant="neutral">
             {committeeMembers.length} عضو
           </Badge>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      REQUEST — RequestCard
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/request/RequestCard.tsx",
  `import { Link } from 'react-router-dom';
   import type { RequestRecord, RequestStatus } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { formatDate } from '@/lib/format';

   const TYPE_LABEL: Record<string, string> = {
     TRANSFER: 'نقل',
     PROMOTION: 'ترقية',
     RESIGNATION: 'استقالة',
     COMPLAINT: 'شكوى',
     SUGGESTION: 'اقتراح',
     LEAVE: 'إجازة',
   };

   const STATUS_LABEL: Record<RequestStatus, string> = {
     PENDING: 'قيد الانتظار',
     IN_REVIEW: 'قيد المراجعة',
     APPROVED: 'معتمد',
     REJECTED: 'مرفوض',
     CANCELLED: 'ملغى',
     COMPLETED: 'مكتمل',
   };

   function statusVariant(status: RequestStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
     if (status === 'APPROVED') return 'success';
     if (status === 'REJECTED') return 'danger';
     if (status === 'IN_REVIEW') return 'warning';
     if (status === 'PENDING') return 'info';
     return 'neutral';
   }

   interface RequestCardProps {
     request: RequestRecord;
   }

   export function RequestCard({ request }: RequestCardProps) {
     return (
       <Link to={'/requests/' + request.id} className="card">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{request.title}</div>
             <div className="card__meta">
               {request.requesterName} · {formatDate(request.submittedAt)}
             </div>
           </div>
         </div>

         <div className="row mt-3" style={{ gap: 6 }}>
           <Badge variant="neutral">{TYPE_LABEL[request.type] ?? request.type}</Badge>
           <Badge variant={statusVariant(request.status)}>
             {STATUS_LABEL[request.status]}
           </Badge>
         </div>
       </Link>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      REQUEST — ApprovalChain
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/request/ApprovalChain.tsx",
  `import type { ApprovalStep } from '@/types';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';

   const STATUS_LABEL: Record<string, string> = {
     PENDING: 'بانتظار الموافقة',
     APPROVED: 'موافق عليه',
     REJECTED: 'مرفوض',
     SKIPPED: 'تم تخطيه',
   };

   interface ApprovalChainProps {
     steps: ApprovalStep[];
   }

   export function ApprovalChain({ steps }: ApprovalChainProps) {
     if (steps.length === 0) {
       return <div className="empty">لا توجد مراحل موافقة</div>;
     }

     const sorted = [...steps].sort((a, b) => a.order - b.order);

     return (
       <div className="approval-chain">
         {sorted.map((step) => {
           const cls =
             step.status === 'APPROVED'
               ? 'approval-step--done'
               : step.status === 'REJECTED'
                 ? 'approval-step--rejected'
                 : step.status === 'PENDING'
                   ? 'approval-step--pending'
                   : '';

           const teamName = step.requiredTeamId
             ? teams.find((t) => t.id === step.requiredTeamId)?.name
             : null;

           const roleName = ROLE_LABEL[step.requiredRole] ?? step.requiredRole;

           return (
             <div key={step.id} className={'approval-step ' + cls}>
               <div className="approval-step__index">{step.order}</div>
               <div className="approval-step__body">
                 <div className="approval-step__title">
                   {roleName}
                   {teamName ? ' — ' + teamName : ''}
                 </div>
                 <div className="approval-step__meta">
                   {STATUS_LABEL[step.status]}
                   {step.actionDate ? ' · ' + formatDate(step.actionDate) : ''}
                   {step.approverName ? ' · ' + step.approverName : ''}
                 </div>
                 {step.comment ? (
                   <div className="approval-step__comment">{step.comment}</div>
                 ) : null}
               </div>
             </div>
           );
         })}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      CONTRIBUTION — ContributionRow
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/contribution/ContributionRow.tsx",
  `import type { Contribution } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { formatDate, hoursToPoints } from '@/lib/format';

   interface ContributionRowProps {
     contribution: Contribution;
     showMember?: boolean;
     showTeam?: boolean;
     showCommittee?: boolean;
   }

   export function ContributionRow({
     contribution,
     showMember = true,
     showTeam = true,
     showCommittee = false,
   }: ContributionRowProps) {
     const team = teams.find((t) => t.id === contribution.teamId);
     const committee = contribution.committeeId
       ? committees.find((c) => c.id === contribution.committeeId)
       : null;

     const statusVariant =
       contribution.status === 'approved'
         ? 'success'
         : contribution.status === 'pending'
           ? 'warning'
           : 'danger';

     const statusLabel =
       contribution.status === 'approved'
         ? 'معتمد'
         : contribution.status === 'pending'
           ? 'معلّق'
           : 'مرفوض';

     const points =
       contribution.status === 'approved' ? hoursToPoints(contribution.hours) : 0;

     return (
       <tr>
         {showMember ? (
           <td data-label="العضو" style={{ fontWeight: 700 }}>
             {contribution.memberName}
           </td>
         ) : null}

         {showTeam ? (
           <td data-label="الفريق" className="muted small">
             {team ? team.name : contribution.teamId}
           </td>
         ) : null}

         {showCommittee ? (
           <td data-label="اللجنة" className="muted small">
             {committee ? committee.nameAr : '—'}
           </td>
         ) : null}

         <td data-label="العنوان">{contribution.title}</td>

         <td data-label="التاريخ" className="muted small nowrap">
           {formatDate(contribution.date)}
         </td>

         <td data-label="الساعات" style={{ fontFamily: 'var(--font-en)' }}>
           {contribution.hours}
         </td>

         <td data-label="النقاط" className="points">
           {points > 0 ? points : '—'}
         </td>

         <td data-label="الحالة">
           <Badge variant={statusVariant}>{statusLabel}</Badge>
         </td>
       </tr>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      NOTIFICATION — NotificationItem
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/notification/NotificationItem.tsx",
  `import { useNavigate } from 'react-router-dom';
   import type { Notification } from '@/types';
   import { relativeTime } from '@/lib/format';

   const ICONS: Record<string, string> = {
     approval: '✅',
     request: '📋',
     participation: '📝',
     achievement: '🏆',
     system: '🔔',
     warning: '⚠️',
     message: '💬',
   };

   interface NotificationItemProps {
     notification: Notification;
     onMarkRead?: (id: string) => void;
   }

   export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
     const nav = useNavigate();

     const handleClick = () => {
       if (!notification.read && onMarkRead) {
         onMarkRead(notification.id);
       }
       if (notification.route) {
         nav(notification.route);
       }
     };

     const icon = ICONS[notification.type] || '🔔';

     return (
       <div
         className={'notif-item' + (!notification.read ? ' notif-item--unread' : '')}
         onClick={handleClick}
         role="button"
         tabIndex={0}
         onKeyDown={(e) => {
           if (e.key === 'Enter') handleClick();
         }}
       >
         <div className={'notif-item__icon notif-item__icon--' + notification.type}>
           <span aria-hidden="true">{icon}</span>
         </div>

         <div className="notif-item__body">
           <div className="notif-item__title">{notification.title}</div>
           <div className="notif-item__message">{notification.message}</div>

           <div className="notif-item__meta">
             {notification.fromName ? (
               <>
                 <span className="notif-item__from">{notification.fromName}</span>
                 <span className="notif-item__dot">·</span>
               </>
             ) : null}
             <span>{relativeTime(notification.date)}</span>
             {notification.priority === 'high' ? (
               <span className="notif-item__priority notif-item__priority--high">
                 مهم
               </span>
             ) : null}
           </div>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      CHAT — ConversationList
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/chat/ConversationList.tsx",
  `import type { Conversation, AppUser } from '@/types';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { initials, relativeTime } from '@/lib/format';

   interface ConversationListProps {
     conversations: Conversation[];
     activeId?: string;
     currentUser: AppUser;
     users: AppUser[];
     onSelect: (id: string) => void;
   }

   function getConversationName(
     conv: Conversation,
     currentUser: AppUser,
     users: AppUser[],
   ): string {
     if (conv.type === 'general') return 'المحادثة العامة';
     if (conv.type === 'team') {
       const team = teams.find((t) => t.id === conv.teamId);
       return team ? 'فريق ' + team.nameAr : 'محادثة فريق';
     }
     // private
     const otherUid = conv.participantUids.find((uid) => uid !== currentUser.uid);
     if (!otherUid) return 'محادثة خاصة';
     const other = users.find((u) => u.uid === otherUid);
     return other ? other.displayName : 'محادثة خاصة';
   }

   function getConversationAvatar(
     conv: Conversation,
     currentUser: AppUser,
     users: AppUser[],
   ): { text: string; variant: 'general' | 'team' | 'private' } {
     if (conv.type === 'general') return { text: '🌐', variant: 'general' };
     if (conv.type === 'team') {
       const team = teams.find((t) => t.id === conv.teamId);
       return { text: team ? team.name.slice(0, 2) : 'FT', variant: 'team' };
     }
     const otherUid = conv.participantUids.find((uid) => uid !== currentUser.uid);
     const other = users.find((u) => u.uid === otherUid);
     return { text: other ? initials(other.displayName) : '؟', variant: 'private' };
   }

   export function ConversationList({
     conversations,
     activeId,
     currentUser,
     users,
     onSelect,
   }: ConversationListProps) {
     if (conversations.length === 0) {
       return (
         <div className="empty" style={{ padding: 24 }}>
           <div className="empty__message">لا محادثات بعد</div>
         </div>
       );
     }

     const sorted = [...conversations].sort((a, b) => {
       if (a.type === 'general') return -1;
       if (b.type === 'general') return 1;
       return a.lastMessageAt < b.lastMessageAt ? 1 : -1;
     });

     return (
       <div className="chat-conversations">
         {sorted.map((conv) => {
           const name = getConversationName(conv, currentUser, users);
           const avatar = getConversationAvatar(conv, currentUser, users);
           const unread = conv.unreadCounts?.[currentUser.uid] ?? 0;

           return (
             <button
               key={conv.id}
               type="button"
               className={'chat-conv' + (activeId === conv.id ? ' is-active' : '')}
               onClick={() => onSelect(conv.id)}
             >
               <div
                 className={'chat-conv__avatar chat-conv__avatar--' + avatar.variant}
                 aria-hidden="true"
               >
                 {avatar.text}
               </div>

               <div className="chat-conv__body">
                 <div className="chat-conv__top">
                   <div className="chat-conv__name">{name}</div>
                   <div className="chat-conv__time">
                     {relativeTime(conv.lastMessageAt)}
                   </div>
                 </div>
                 <div className="chat-conv__preview">
                   {conv.lastMessageSender ? (
                     <strong style={{ color: 'var(--c-red)', fontWeight: 700 }}>
                       {conv.lastMessageSender}:{' '}
                     </strong>
                   ) : null}
                   {conv.lastMessageText || 'لا رسائل بعد'}
                 </div>
               </div>

               {unread > 0 ? (
                 <div className="chat-conv__badge">{unread > 99 ? '99+' : unread}</div>
               ) : null}
             </button>
           );
         })}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      CHAT — MessageBubble
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/chat/MessageBubble.tsx",
  `import type { Message, AppUser } from '@/types';
   import { initials, formatTime } from '@/lib/format';

   interface MessageBubbleProps {
     message: Message;
     currentUser: AppUser;
   }

   export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
     const isMine = message.senderUid === currentUser.uid;

     return (
       <div className={'chat-message' + (isMine ? ' chat-message--mine' : '')}>
         {!isMine ? (
           <div className="chat-message__avatar" aria-hidden="true">
             {initials(message.senderName)}
           </div>
         ) : null}

         <div className="chat-message__bubble">
           {!isMine ? (
             <div className="chat-message__sender">{message.senderName}</div>
           ) : null}
           <div>{message.text}</div>
           <div className="chat-message__time">{formatTime(message.sentAt)}</div>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      CHAT — Composer
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/chat/Composer.tsx",
  `import { useState, type KeyboardEvent } from 'react';

   interface ComposerProps {
     onSend: (text: string) => Promise<void> | void;
     disabled?: boolean;
     placeholder?: string;
   }

   export function Composer({ onSend, disabled, placeholder = 'اكتب رسالة...' }: ComposerProps) {
     const [text, setText] = useState('');
     const [busy, setBusy] = useState(false);

     const send = async () => {
       const trimmed = text.trim();
       if (!trimmed || busy || disabled) return;
       setBusy(true);
       try {
         await onSend(trimmed);
         setText('');
       } finally {
         setBusy(false);
       }
     };

     const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
       if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         void send();
       }
     };

     return (
       <div className="chat-composer">
         <textarea
           className="chat-composer__input"
           value={text}
           onChange={(e) => setText(e.target.value)}
           onKeyDown={onKeyDown}
           placeholder={placeholder}
           rows={1}
           disabled={busy || disabled}
         />
         <button
           type="button"
           className="chat-composer__send"
           onClick={send}
           disabled={!text.trim() || busy || disabled}
           aria-label="إرسال"
         >
           ↑
         </button>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      CALENDAR — CalendarGrid (شهر × أيام)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/calendar/CalendarGrid.tsx",
  `import type { CalendarEvent } from '@/types';
   import { getArabicMonth, getDaysInMonth, getFirstWeekdayOfMonth } from '@/lib/format';

   interface CalendarGridProps {
     year: number;
     month: number;
     events: CalendarEvent[];
     selectedDate?: string;
     onSelectDate: (date: string) => void;
     onPrevMonth: () => void;
     onNextMonth: () => void;
   }

   const WEEKDAYS = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

   function pad(n: number): string {
     return n < 10 ? '0' + n : String(n);
   }

   function toIso(year: number, month: number, day: number): string {
     return String(year) + '-' + pad(month + 1) + '-' + pad(day);
   }

   export function CalendarGrid({
     year,
     month,
     events,
     selectedDate,
     onSelectDate,
     onPrevMonth,
     onNextMonth,
   }: CalendarGridProps) {
     const daysInMonth = getDaysInMonth(year, month);
     const firstWeekday = getFirstWeekdayOfMonth(year, month);
     const todayIso = new Date().toISOString().slice(0, 10);

     const eventsByDate = new Map<string, CalendarEvent[]>();
     for (const e of events) {
       if (!eventsByDate.has(e.date)) eventsByDate.set(e.date, []);
       eventsByDate.get(e.date)!.push(e);
     }

     const cells: Array<{ day: number | null; iso: string }> = [];
     for (let i = 0; i < firstWeekday; i += 1) {
       cells.push({ day: null, iso: '' });
     }
     for (let d = 1; d <= daysInMonth; d += 1) {
       cells.push({ day: d, iso: toIso(year, month, d) });
     }

     return (
       <div className="calendar-container">
         <div className="calendar-header">
           <div className="calendar-month">
             {getArabicMonth(month)}
             <span className="calendar-month__year">{year}</span>
           </div>
           <div className="calendar-nav">
             <button
               type="button"
               className="calendar-nav__btn"
               onClick={onPrevMonth}
               aria-label="الشهر السابق"
             >
               ‹
             </button>
             <button
               type="button"
               className="calendar-nav__btn"
               onClick={onNextMonth}
               aria-label="الشهر التالي"
             >
               ›
             </button>
           </div>
         </div>

         <div className="calendar-weekdays">
           {WEEKDAYS.map((d) => (
             <div key={d} className="calendar-weekday">
               {d}
             </div>
           ))}
         </div>

         <div className="calendar-grid">
           {cells.map((cell, idx) => {
             if (cell.day === null) {
               return (
                 <div
                   key={'empty-' + idx}
                   className="calendar-day calendar-day--empty"
                 />
               );
             }

             const hasEvents = eventsByDate.has(cell.iso);
             const isToday = cell.iso === todayIso;
             const isSelected = cell.iso === selectedDate;

             let cls = 'calendar-day';
             if (hasEvents) cls += ' calendar-day--has-events';
             if (isToday) cls += ' calendar-day--today';
             if (isSelected && !isToday) cls += ' calendar-day--selected';

             return (
               <button
                 key={cell.iso}
                 type="button"
                 className={cls}
                 onClick={() => onSelectDate(cell.iso)}
               >
                 {cell.day}
               </button>
             );
           })}
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      CALENDAR — EventCard
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/calendar/EventCard.tsx",
  `import type { CalendarEvent } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';

   const TYPE_LABEL: Record<string, string> = {
     meeting: 'اجتماع',
     event: 'فعالية',
     deadline: 'موعد نهائي',
     workshop: 'ورشة',
   };

   const TYPE_VARIANT: Record<string, 'info' | 'warning' | 'danger' | 'success'> = {
     meeting: 'info',
     event: 'success',
     deadline: 'danger',
     workshop: 'warning',
   };

   interface EventCardProps {
     event: CalendarEvent;
     compact?: boolean;
   }

   export function EventCard({ event, compact = false }: EventCardProps) {
     const team = event.teamId ? teams.find((t) => t.id === event.teamId) : null;

     if (compact) {
       return (
         <div className="calendar-event-item">
           <div className="calendar-event-item__time">
             {event.time || 'طوال اليوم'}
           </div>
           <div className="calendar-event-item__body">
             <div className="calendar-event-item__title">{event.title}</div>
             <div className="calendar-event-item__meta">
               {event.isPublic ? 'عام · ' : ''}
               {team ? team.name + ' · ' : ''}
               {event.location || 'بدون موقع'}
             </div>
           </div>
         </div>
       );
     }

     return (
       <div className="card no-click">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{event.title}</div>
             <div className="card__meta">
               {formatDate(event.date)}
               {event.time ? ' · ' + event.time : ''}
               {event.endTime ? ' — ' + event.endTime : ''}
             </div>
           </div>
           <Badge variant={TYPE_VARIANT[event.type] || 'info'}>
             {TYPE_LABEL[event.type] || event.type}
           </Badge>
         </div>

         {event.description ? (
           <p className="mt-2 small soft">{event.description}</p>
         ) : null}

         <div className="row mt-3" style={{ gap: 6 }}>
           {event.isPublic ? <Badge variant="info">عام</Badge> : null}
           {team ? <Badge>{team.name}</Badge> : null}
           {event.location ? (
             <span className="small muted">📍 {event.location}</span>
           ) : null}
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ACHIEVEMENT — AchievementCard
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/achievement/AchievementCard.tsx",
  `import type { Achievement } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';

   const LEVEL_LABEL: Record<string, string> = {
     branch: 'على مستوى الفرع',
     national: 'على المستوى الوطني',
     international: 'على المستوى الدولي',
   };

   const LEVEL_VARIANT: Record<string, 'info' | 'warning' | 'red'> = {
     branch: 'info',
     national: 'warning',
     international: 'red',
   };

   interface AchievementCardProps {
     achievement: Achievement;
   }

   export function AchievementCard({ achievement }: AchievementCardProps) {
     return (
       <div className="card no-click">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{achievement.title}</div>
             <div className="card__meta">{formatDate(achievement.date)}</div>
           </div>
           <Badge variant={LEVEL_VARIANT[achievement.level] || 'info'}>
             {LEVEL_LABEL[achievement.level] || achievement.level}
           </Badge>
         </div>

         <p className="mt-3 small soft">{achievement.description}</p>

         <div className="row mt-3" style={{ gap: 6 }}>
           {achievement.teamIds.map((id) => {
             const t = teams.find((x) => x.id === id);
             return t ? <Badge key={id}>{t.name}</Badge> : null;
           })}
         </div>

         {achievement.memberNames.length > 0 ? (
           <div
             className="small muted"
             style={{ marginTop: 10 }}
           >
             الأعضاء: {achievement.memberNames.join(' · ')}
           </div>
         ) : null}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      WARNING — WarningCard
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/warning/WarningCard.tsx",
  `import type { WarningRecord } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { formatDate } from '@/lib/format';

   const TYPE_LABEL: Record<string, string> = {
     VERBAL: 'تحذير شفهي',
     WRITTEN: 'تحذير كتابي',
     FINAL: 'تحذير نهائي',
   };

   const SEVERITY_LABEL: Record<string, string> = {
     LOW: 'منخفضة',
     MEDIUM: 'متوسطة',
     HIGH: 'مرتفعة',
   };

   interface WarningCardProps {
     warning: WarningRecord;
   }

   export function WarningCard({ warning }: WarningCardProps) {
     return (
       <div className="card no-click">
         <div className="row row--between">
           <div className="card__title">{warning.memberName}</div>
           <Badge variant={warning.status === 'active' ? 'danger' : 'success'} dot>
             {warning.status === 'active' ? 'نشط' : 'منتهي'}
           </Badge>
         </div>

         <div className="card__meta" style={{ marginTop: 6 }}>
           {warning.reason}
         </div>

         <div className="row mt-3" style={{ gap: 6 }}>
           <Badge variant="neutral">{TYPE_LABEL[warning.type]}</Badge>
           <Badge
             variant={
               warning.severity === 'HIGH'
                 ? 'danger'
                 : warning.severity === 'MEDIUM'
                   ? 'warning'
                   : 'info'
             }
           >
             {SEVERITY_LABEL[warning.severity]}
           </Badge>
           <span className="small muted">{formatDate(warning.issuedAt)}</span>
         </div>

         {warning.notes ? (
           <p className="small soft mt-3">{warning.notes}</p>
         ) : null}

         <div className="tiny muted" style={{ marginTop: 8 }}>
           بواسطة: {warning.issuedByName}
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      COMMITTEE — CommitteeBadge
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/committee/CommitteeBadge.tsx",
  `import { committees } from '@/data/committees';

   interface CommitteeBadgeProps {
     committeeId: string;
   }

   export function CommitteeBadge({ committeeId }: CommitteeBadgeProps) {
     const committee = committees.find((c) => c.id === committeeId);
     if (!committee) return null;

     return (
       <span
         className="badge"
         style={{
           background: committee.color + '15',
           borderColor: committee.color + '40',
           color: committee.color,
         }}
       >
         {committee.icon} {committee.nameAr}
       </span>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      TIMELINE — TimelineList
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/timeline/TimelineList.tsx",
  `import type { TimelineEvent } from '@/types';
   import { formatDate } from '@/lib/format';

   interface TimelineListProps {
     events: TimelineEvent[];
   }

   export function TimelineList({ events }: TimelineListProps) {
     if (events.length === 0) {
       return (
         <div className="empty" style={{ padding: 24 }}>
           <div className="empty__message">لا أحداث بعد</div>
         </div>
       );
     }

     const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1));

     return (
       <div className="timeline">
         {sorted.map((e) => (
           <div key={e.id} className="timeline__item">
             <div className="timeline__date">{formatDate(e.date)}</div>
             <div className="timeline__title">{e.title}</div>
             {e.description ? (
               <div className="timeline__desc">{e.description}</div>
             ) : null}
           </div>
         ))}
       </div>
     );
   }
   `
);

console.log(
  "  ✓ Part 6 loaded: Domain components (Member, Team, Request, Chat, Calendar, etc.)"
);
/* ═══════════════════════════════════════════════════════════════
   PUBLIC — HomePage
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/HomePage.tsx",
  `import { Link } from 'react-router-dom';
   import { site, activeSeason } from '@/data';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { contributions } from '@/data/contributions';
   import { hoursToPoints } from '@/lib/format';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { TeamCard } from '@/components/team/TeamCard';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';

   export function HomePage() {
     const activeMembers = members.filter((m) => m.status === 'active');
     const totalHours = contributions
       .filter((c) => c.status === 'approved')
       .reduce((s, c) => s + c.hours, 0);
     const totalPoints = hoursToPoints(totalHours);

     const teamRanking = teams
       .map((team) => {
         const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
         const teamPoints = teamMembers.reduce(
           (sum, m) => sum + hoursToPoints(m.hours || 0),
           0,
         );
         return { team, points: teamPoints, count: teamMembers.length };
       })
       .sort((a, b) => b.points - a.points)
       .map((r, i) => ({ ...r, rank: i + 1 }));

     const topMembers = [...members]
       .filter((m) => m.role !== 'HEAD' && m.role !== 'VICE')
       .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
       .slice(0, 5)
       .map((m, i) => ({ member: m, rank: i + 1 }));

     return (
       <>
         <section className="hero" style={{ padding: '48px 0 32px' }}>
           <div className="container">
             <div className="section-head__eyebrow">{activeSeason.label}</div>
             <h1
               style={{
                 fontSize: 'clamp(1.9rem, 5vw, 2.8rem)',
                 fontWeight: 900,
                 lineHeight: 1.15,
                 marginTop: 12,
                 maxWidth: '18ch',
               }}
             >
               منصة{' '}
               <span style={{ color: 'var(--c-navy-3)' }}>
                 {site.organization}
               </span>{' '}
               Sub Branches
             </h1>
             <p
               className="hero__desc"
               style={{
                 marginTop: 16,
                 maxWidth: '58ch',
                 color: 'var(--c-ink-soft)',
                 fontSize: '1rem',
                 lineHeight: 1.75,
               }}
             >
               {site.description}
             </p>
             <div
               className="row"
               style={{ marginTop: 24, gap: 10 }}
             >
               <Link to="/members" className="btn btn--primary">
                 تصفح الأعضاء
               </Link>
               <Link to="/league" className="btn btn--ghost">
                 الترتيب العام
               </Link>
               <Link to="/login" className="btn btn--ghost">
                 انضم إلينا
               </Link>
             </div>
           </div>
         </section>

         <section className="container section--tight">
           <StatRow>
             <Stat value={activeMembers.length} label="الأعضاء" />
             <Stat value={teams.length} label="الفرق" />
             <Stat value={totalPoints} label="مجموع النقاط" />
             <Stat value={totalHours} label="مجموع الساعات" />
           </StatRow>
         </section>

         <section className="container section">
           <SectionHeader
             eyebrow="ترتيب الفرق"
             title="الفرق حسب النقاط"
             description="الترتيب تلقائي بمجموع نقاط الأعضاء."
             action={
               <Link to="/teams" className="btn btn--ghost btn--sm">
                 كل الفرق
               </Link>
             }
           />
           <div className="grid">
             {teamRanking.map((r) => (
               <TeamCard key={r.team.id} team={r.team} rank={r.rank} />
             ))}
           </div>
         </section>

         <section className="container section">
           <SectionHeader
             eyebrow="الترتيب العام"
             title="أعلى الأعضاء"
             action={
               <Link to="/league" className="btn btn--ghost btn--sm">
                 الترتيب الكامل
               </Link>
             }
           />
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>#</th>
                   <th>العضو</th>
                   <th>الفرق</th>
                   <th>الساعات</th>
                   <th>النقاط</th>
                 </tr>
               </thead>
               <tbody>
                 {topMembers.map((e) => {
                   const memberTeams = teams.filter((t) =>
                     e.member.teamIds.includes(t.id),
                   );
                   return (
                     <tr key={e.member.id}>
                       <td
                         className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}
                         data-label="الترتيب"
                       >
                         {e.rank}
                       </td>
                       <td data-label="العضو">
                         <Link
                           to={'/members/' + e.member.id}
                           style={{
                             display: 'flex',
                             alignItems: 'center',
                             gap: 10,
                           }}
                         >
                           <Avatar name={e.member.name} size={32} variant="navy" />
                           <span style={{ fontWeight: 700 }}>{e.member.name}</span>
                         </Link>
                       </td>
                       <td data-label="الفرق">
                         <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                           {memberTeams.map((t) => (
                             <span key={t.id} className="badge">
                               {t.name}
                             </span>
                           ))}
                         </div>
                       </td>
                       <td
                         style={{ fontFamily: 'var(--font-en)' }}
                         data-label="الساعات"
                       >
                         {e.member.hours}
                       </td>
                       <td className="points" data-label="النقاط">
                         {hoursToPoints(e.member.hours)}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         </section>

         <section className="container section">
           <div
             className="card card--navy no-click"
             style={{
               padding: '28px 24px',
               textAlign: 'center',
             }}
           >
             <Badge variant="red" dot>
               {activeSeason.theme}
             </Badge>
             <h2
               style={{
                 marginTop: 14,
                 fontSize: '1.4rem',
                 color: '#fff',
               }}
             >
               انضم إلى المنحل
             </h2>
             <p
               style={{
                 marginTop: 10,
                 maxWidth: '44ch',
                 marginInline: 'auto',
                 color: 'var(--c-paper-soft)',
                 fontSize: '0.92rem',
                 lineHeight: 1.75,
               }}
             >
               سجّل دخولك لمتابعة مشاركاتك، التقدم في الليج، والموافقات على طلباتك.
             </p>
             <div
               className="row"
               style={{ marginTop: 20, justifyContent: 'center' }}
             >
               <Link to="/login" className="btn btn--primary">
                 تسجيل الدخول
               </Link>
             </div>
           </div>
         </section>
       </>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — LoginPage (بلا اسم موقع أو demo accounts)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/LoginPage.tsx",
  `import { useState, type FormEvent } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { login, sendPasswordReset } from '@/lib/auth';
   import { FormField, TextInput } from '@/components/ui/FormField';

   type Mode = 'login' | 'forgot';

   export function LoginPage() {
     const nav = useNavigate();
     const [mode, setMode] = useState<Mode>('login');
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [success, setSuccess] = useState('');
     const [busy, setBusy] = useState(false);

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();
       setError('');
       setSuccess('');
       setBusy(true);
       try {
         await login(email.trim(), password);
         nav('/dashboard');
       } catch (err: unknown) {
         setError(translateError(err));
       } finally {
         setBusy(false);
       }
     };

     const onForgot = async (e: FormEvent) => {
       e.preventDefault();
       setError('');
       setSuccess('');
       setBusy(true);
       try {
         await sendPasswordReset(email.trim());
         setSuccess('تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني');
         setTimeout(() => setMode('login'), 2500);
       } catch (err: unknown) {
         setError(translateError(err));
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="login-page">
         <div className="login-card">
           <div className="login-tabs">
             <button
               type="button"
               className={'login-tab' + (mode === 'login' ? ' is-active' : '')}
               onClick={() => {
                 setMode('login');
                 setError('');
                 setSuccess('');
               }}
             >
               تسجيل الدخول
             </button>
             <button
               type="button"
               className={'login-tab' + (mode === 'forgot' ? ' is-active' : '')}
               onClick={() => {
                 setMode('forgot');
                 setError('');
                 setSuccess('');
               }}
             >
               نسيت كلمة المرور
             </button>
           </div>

           {error ? <div className="login-error">{error}</div> : null}
           {success ? <div className="login-success">{success}</div> : null}

           {mode === 'login' ? (
             <form onSubmit={onSubmit}>
               <div className="login-field">
                 <label className="login-label">البريد الإلكتروني</label>
                 <input
                   className="login-input"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="name@resala-stem.org"
                   autoComplete="email"
                   required
                   dir="ltr"
                   style={{ textAlign: 'left' }}
                 />
               </div>

               <div className="login-field">
                 <label className="login-label">كلمة المرور</label>
                 <input
                   className="login-input"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   autoComplete="current-password"
                   required
                   dir="ltr"
                   style={{ textAlign: 'left' }}
                 />
               </div>

               <button
                 type="submit"
                 className="login-submit"
                 disabled={busy || !email || !password}
               >
                 {busy ? '...' : 'تسجيل الدخول'}
               </button>
             </form>
           ) : (
             <form onSubmit={onForgot}>
               <div className="login-field">
                 <label className="login-label">البريد الإلكتروني</label>
                 <input
                   className="login-input"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="name@resala-stem.org"
                   autoComplete="email"
                   required
                   dir="ltr"
                   style={{ textAlign: 'left' }}
                 />
               </div>
               <button
                 type="submit"
                 className="login-submit"
                 disabled={busy || !email}
               >
                 {busy ? '...' : 'إرسال رابط الاستعادة'}
               </button>
             </form>
           )}

           <p style={{ textAlign: 'center', marginTop: 20 }}>
             <Link
               to="/"
               style={{
                 fontSize: '0.82rem',
                 color: 'var(--c-ink-muted)',
               }}
             >
               العودة للرئيسية
             </Link>
           </p>
         </div>
       </div>
     );
   }

   function translateError(err: unknown): string {
     const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
     if (msg.includes('invalid-credential')) return 'البريد أو كلمة المرور غير صحيحة';
     if (msg.includes('user-not-found')) return 'لا يوجد حساب بهذا البريد';
     if (msg.includes('wrong-password')) return 'كلمة المرور غير صحيحة';
     if (msg.includes('invalid-email')) return 'البريد الإلكتروني غير صالح';
     if (msg.includes('network-request-failed')) return 'تعذر الاتصال بالشبكة';
     if (msg.includes('too-many-requests')) return 'حاول مجددًا بعد قليل';
     return msg;
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — ChangePasswordPage (إلزامي عند أول دخول)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/ChangePasswordPage.tsx",
  `import { useState, type FormEvent } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { changePassword } from '@/lib/auth';
   import { logout } from '@/lib/auth';
   import { toast } from '@/components/ui/Toast';
   import { Loading } from '@/components/ui/Loading';

   export function ChangePasswordPage() {
     const nav = useNavigate();
     const { user, loading, mustChangePassword } = useAuth();
     const [newPassword, setNewPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [busy, setBusy] = useState(false);

     if (loading) return <Loading fullHeight />;

     if (!user) {
       nav('/login');
       return null;
     }

     if (!mustChangePassword) {
       nav('/dashboard');
       return null;
     }

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();

       if (newPassword.length < 6) {
         toast.error('كلمة المرور ضعيفة', 'يجب أن تكون 6 أحرف على الأقل');
         return;
       }
       if (newPassword !== confirmPassword) {
         toast.error('كلمتا المرور غير متطابقتين');
         return;
       }

       setBusy(true);
       try {
         await changePassword(newPassword);
         toast.success('تم تحديث كلمة المرور');
         nav('/dashboard');
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل التحديث';
         toast.error('فشل التحديث', msg);
       } finally {
         setBusy(false);
       }
     };

     const handleLogout = async () => {
       await logout();
       nav('/login');
     };

     return (
       <div className="login-page">
         <div className="login-card">
           <div className="change-password-notice">
             <strong>مرحبًا {user.displayName} 👋</strong>
             حسابك جديد على المنصة. يجب تعيين كلمة مرور جديدة قبل المتابعة.
           </div>

           <form onSubmit={onSubmit}>
             <div className="login-field">
               <label className="login-label">كلمة المرور الجديدة</label>
               <input
                 className="login-input"
                 type="password"
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 placeholder="6 أحرف على الأقل"
                 autoComplete="new-password"
                 required
                 dir="ltr"
                 style={{ textAlign: 'left' }}
               />
             </div>

             <div className="login-field">
               <label className="login-label">تأكيد كلمة المرور</label>
               <input
                 className="login-input"
                 type="password"
                 value={confirmPassword}
                 onChange={(e) => setConfirmPassword(e.target.value)}
                 placeholder="••••••••"
                 autoComplete="new-password"
                 required
                 dir="ltr"
                 style={{ textAlign: 'left' }}
               />
             </div>

             <button
               type="submit"
               className="login-submit"
               disabled={busy || !newPassword || !confirmPassword}
             >
               {busy ? '...' : 'حفظ كلمة المرور والمتابعة'}
             </button>
           </form>

           <p style={{ textAlign: 'center', marginTop: 20 }}>
             <button
               type="button"
               onClick={handleLogout}
               style={{
                 fontSize: '0.82rem',
                 color: 'var(--c-ink-muted)',
                 background: 'none',
                 border: 'none',
                 cursor: 'pointer',
                 fontFamily: 'inherit',
               }}
             >
               تسجيل الخروج
             </button>
           </p>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — AboutPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/AboutPage.tsx",
  `import { site, activeSeason, seasons } from '@/data';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { formatDate, hoursToPoints } from '@/lib/format';

   export function AboutPage() {
     const activeMembers = members.filter((m) => m.status === 'active');
     const totalHours = members.reduce((s, m) => s + (m.hours || 0), 0);
     const totalPoints = hoursToPoints(totalHours);

     return (
       <div className="container">
         <PageHeader
           eyebrow="عن المنحل"
           title={site.name}
           description={site.description}
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={activeMembers.length} label="الأعضاء" />
             <Stat value={teams.length} label="الفرق" />
             <Stat value={totalPoints} label="مجموع النقاط" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="الموسم الحالي"
             title={activeSeason.label}
             description={activeSeason.theme}
           />
           <div className="card no-click">
             <div className="kv">
               <span className="kv__k">البداية</span>
               <span className="kv__v">{formatDate(activeSeason.start)}</span>
             </div>
             <div className="kv mt-4">
               <span className="kv__k">النهاية</span>
               <span className="kv__v">{formatDate(activeSeason.end)}</span>
             </div>
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="المواسم" title="السجل" />
           <div className="stack">
             {seasons.map((s) => (
               <div key={s.id} className="card no-click">
                 <div className="row row--between">
                   <div className="card__title">{s.label}</div>
                   <span className="muted small">{s.theme}</span>
                 </div>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="الفرق"
             title="سبع فرق متخصصة"
             description="كل فريق يغطي مجالًا مختلفًا من عمل المنظمة."
           />
           <div className="stack">
             {teams.map((t) => (
               <div key={t.id} className="card no-click">
                 <div className="row row--between">
                   <div>
                     <div className="card__title">{t.name}</div>
                     <div className="card__meta">{t.nameAr}</div>
                   </div>
                 </div>
                 <p className="small soft mt-3">{t.description}</p>
               </div>
             ))}
           </div>
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — MembersPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/MembersPage.tsx",
  `import { useMemo, useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { ROLE_LABEL } from '@/lib/permissions';
   import type { Member, TeamId } from '@/types';
   import { MemberCard } from '@/components/member/MemberCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading, SkeletonList } from '@/components/ui/Loading';
   import { cx } from '@/lib/format';

   export function MembersPage() {
     const { data: members, loading } = useCollection<Member>('members');
     const [query, setQuery] = useState('');
     const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
     const [committeeFilter, setCommitteeFilter] = useState<string>('all');

     const filtered = useMemo(() => {
       const q = query.trim();
       return members.filter((m) => {
         const matchesQuery = !q || m.name.includes(q);
         const matchesTeam =
           teamFilter === 'all' || m.teamIds.includes(teamFilter);
         const matchesCommittee =
           committeeFilter === 'all' ||
           m.committeeIds.includes(committeeFilter);
         return matchesQuery && matchesTeam && matchesCommittee;
       });
     }, [members, query, teamFilter, committeeFilter]);

     return (
       <div className="container">
         <PageHeader
           eyebrow="الأعضاء"
           title="جميع الأعضاء"
           description="تصفّح، ابحث، وفلتر بالفريق واللجنة."
         />

         <div className="toolbar">
           <input
             className="input"
             type="search"
             placeholder="ابحث بالاسم..."
             value={query}
             onChange={(e) => setQuery(e.target.value)}
           />
         </div>

         <div className="chips mb-4">
           <button
             type="button"
             className={cx('chip', teamFilter === 'all' && 'is-active')}
             onClick={() => setTeamFilter('all')}
           >
             كل الفرق
           </button>
           {teams.map((t) => (
             <button
               key={t.id}
               type="button"
               className={cx('chip', teamFilter === t.id && 'is-active')}
               onClick={() => setTeamFilter(t.id)}
             >
               {t.name}
             </button>
           ))}
         </div>

         <div className="chips mb-4">
           <button
             type="button"
             className={cx('chip', committeeFilter === 'all' && 'is-active')}
             onClick={() => setCommitteeFilter('all')}
           >
             كل اللجان
           </button>
           {committees.map((c) => (
             <button
               key={c.id}
               type="button"
               className={cx('chip', committeeFilter === c.id && 'is-active')}
               onClick={() => setCommitteeFilter(c.id)}
             >
               {c.icon} {c.nameAr}
             </button>
           ))}
         </div>

         {loading ? (
           <SkeletonList count={6} />
         ) : filtered.length === 0 ? (
           <EmptyState
             icon="👥"
             title="لا نتائج"
             message="لم يتم العثور على أعضاء مطابقين للبحث."
           />
         ) : (
           <div className="grid grid--wide">
             {filtered.map((m) => (
               <MemberCard key={m.id} member={m} />
             ))}
           </div>
         )}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — MemberProfilePage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/MemberProfilePage.tsx",
  `import { useEffect, useState } from 'react';
   import { Link, useParams } from 'react-router-dom';
   import { getOne } from '@/lib/db';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { hoursToPoints, formatDate } from '@/lib/format';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { MemberStatusBadge } from '@/components/member/MemberStatusBadge';
   import { ContributionRow } from '@/components/contribution/ContributionRow';
   import { TimelineList } from '@/components/timeline/TimelineList';
   import { Loading } from '@/components/ui/Loading';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { NotFoundPage } from './NotFoundPage';
   import type { Member, Contribution, WarningRecord, TimelineEvent } from '@/types';

   export function MemberProfilePage() {
     const { memberId } = useParams<{ memberId: string }>();
     const [member, setMember] = useState<Member | null>(null);
     const [loading, setLoading] = useState(true);
     const { data: contributions } = useCollection<Contribution>('contributions');
     const { data: warnings } = useCollection<WarningRecord>('warnings');

     useEffect(() => {
       if (!memberId) return;
       void (async () => {
         const m = await getOne<Member>('members', memberId);
         setMember(m);
         setLoading(false);
       })();
     }, [memberId]);

     if (loading) return <Loading fullHeight />;
     if (!member) return <NotFoundPage />;

     const myContribs = contributions
       .filter((c) => c.memberId === member.id)
       .sort((a, b) => (a.date < b.date ? 1 : -1));

     const approvedContribs = myContribs.filter((c) => c.status === 'approved');
     const totalHours = approvedContribs.reduce((s, c) => s + c.hours, 0);
     const totalPoints = hoursToPoints(totalHours);

     const myWarnings = warnings.filter((w) => w.memberId === member.id);
     const memberTeams = teams.filter((t) => member.teamIds.includes(t.id));
     const memberCommittees = committees.filter((c) =>
       member.committeeIds.includes(c.id),
     );

     const timeline: TimelineEvent[] = [
       {
         id: 'join',
         memberId: member.id,
         type: 'join',
         title: 'انضم إلى المنظمة',
         date: '2021-09-01',
       },
       ...myContribs.map((c) => ({
         id: 'c-' + c.id,
         memberId: member.id,
         type: 'contribution' as const,
         title: c.title,
         description: c.hours + ' ساعة',
         date: c.date,
       })),
     ];

     return (
       <div className="container section--tight">
         <div className="profile">
           <Avatar name={member.name} size={80} variant="gradient" />

           <div className="profile__main">
             <div className="row row--between" style={{ gap: 12 }}>
               <h1 className="profile__name">{member.name}</h1>
               <MemberStatusBadge status={member.status} />
             </div>

             <div className="profile__role">{ROLE_LABEL[member.role]}</div>

             {member.bio ? (
               <p className="profile__bio">{member.bio}</p>
             ) : null}

             {memberTeams.length > 0 ? (
               <div className="row mt-4" style={{ gap: 6 }}>
                 {memberTeams.map((t) => (
                   <Link key={t.id} to={'/teams/' + t.id}>
                     <Badge variant="navy">{t.name}</Badge>
                   </Link>
                 ))}
               </div>
             ) : null}

             {memberCommittees.length > 0 ? (
               <div className="row mt-2" style={{ gap: 6 }}>
                 {memberCommittees.map((c) => (
                   <Badge
                     key={c.id}
                     className="badge"
                   >
                     {c.icon} {c.nameAr}
                   </Badge>
                 ))}
               </div>
             ) : null}
           </div>

           <div className="profile__side">
             <div className="kv">
               <span className="kv__k">النقاط</span>
               <span className="kv__v" style={{ color: 'var(--c-red)' }}>
                 {totalPoints}
               </span>
             </div>
             <div className="kv">
               <span className="kv__k">الساعات</span>
               <span className="kv__v">{totalHours}</span>
             </div>
             <div className="kv">
               <span className="kv__k">المشاركات</span>
               <span className="kv__v">{myContribs.length}</span>
             </div>
             {member.email ? (
               <div className="kv">
                 <span className="kv__k">البريد</span>
                 <a
                   className="kv__v"
                   href={'mailto:' + member.email}
                   dir="ltr"
                 >
                   {member.email}
                 </a>
               </div>
             ) : null}
           </div>
         </div>

         <section className="section">
           <StatRow>
             <Stat value={totalPoints} label="النقاط" variant="red" />
             <Stat value={totalHours} label="الساعات" />
             <Stat value={myContribs.length} label="المشاركات" />
             <Stat value={myWarnings.length} label="التحذيرات" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="المشاركات" title="سجل المشاركات" />
           {myContribs.length === 0 ? (
             <EmptyState
               icon="📝"
               title="لا مشاركات بعد"
               message="لم يسجل هذا العضو أي مشاركات حتى الآن."
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>العنوان</th>
                     <th>الفريق</th>
                     <th>التاريخ</th>
                     <th>الساعات</th>
                     <th>النقاط</th>
                     <th>الحالة</th>
                   </tr>
                 </thead>
                 <tbody>
                   {myContribs.map((c) => (
                     <ContributionRow
                       key={c.id}
                       contribution={c}
                       showMember={false}
                       showTeam
                     />
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </section>

         {myWarnings.length > 0 ? (
           <section className="section">
             <SectionHeader eyebrow="التحذيرات" title="السجل التأديبي" />
             <div className="stack">
               {myWarnings.map((w) => (
                 <div key={w.id} className="card no-click">
                   <div className="row row--between">
                     <div className="card__title">{w.reason}</div>
                     <Badge
                       variant={w.status === 'active' ? 'danger' : 'success'}
                       dot
                     >
                       {w.status === 'active' ? 'نشط' : 'منتهي'}
                     </Badge>
                   </div>
                   <div className="small muted mt-2">
                     {formatDate(w.issuedAt)} · بواسطة {w.issuedByName}
                   </div>
                 </div>
               ))}
             </div>
           </section>
         ) : null}

         <section className="section">
           <SectionHeader eyebrow="النشاط" title="الخط الزمني" />
           <TimelineList events={timeline} />
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — TeamsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/TeamsPage.tsx",
  `import { teams } from '@/data/teams';
   import { members } from '@/data/members';
   import { hoursToPoints } from '@/lib/format';
   import { TeamCard } from '@/components/team/TeamCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';

   export function TeamsPage() {
     const ranking = teams
       .map((team) => {
         const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
         const points = teamMembers.reduce(
           (sum, m) => sum + hoursToPoints(m.hours || 0),
           0,
         );
         return { team, points };
       })
       .sort((a, b) => b.points - a.points)
       .map((r, i) => ({ team: r.team, rank: i + 1 }));

     return (
       <div className="container">
         <PageHeader
           eyebrow="الهيكل"
           title="الفرق"
           description="سبع فرق متخصصة داخل المنظمة."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={teams.length} label="الفرق" />
             <Stat value={members.length} label="الأعضاء" />
             <Stat
               value={members.reduce(
                 (s, m) => s + hoursToPoints(m.hours || 0),
                 0,
               )}
               label="مجموع النقاط"
             />
           </StatRow>
         </section>

         <section className="section">
           <div className="grid">
             {ranking.map((r) => (
               <TeamCard key={r.team.id} team={r.team} rank={r.rank} />
             ))}
           </div>
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — TeamDetailPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/TeamDetailPage.tsx",
  `import { useParams } from 'react-router-dom';
   import { teams } from '@/data/teams';
   import { members } from '@/data/members';
   import { hoursToPoints } from '@/lib/format';
   import { MemberCard } from '@/components/member/MemberCard';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { NotFoundPage } from './NotFoundPage';
   import type { TeamId } from '@/types';

   export function TeamDetailPage() {
     const { teamId } = useParams<{ teamId: string }>();
     const team = teams.find((t) => t.id === (teamId as TeamId));
     if (!team) return <NotFoundPage />;

     const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
     const totalHours = teamMembers.reduce((s, m) => s + (m.hours || 0), 0);
     const totalPoints = hoursToPoints(totalHours);
     const avgPoints =
       teamMembers.length === 0
         ? 0
         : Math.round(totalPoints / teamMembers.length);

     const board = [...teamMembers]
       .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
       .map((m, i) => ({
         member: m,
         rank: i + 1,
         points: hoursToPoints(m.hours),
       }));

     return (
       <div className="container section--tight">
         <div className="profile">
           <div className="profile__main">
             <h1 className="profile__name">{team.name}</h1>
             <div className="profile__role">{team.nameAr}</div>
             <p className="profile__bio">{team.description}</p>
           </div>
         </div>

         <section className="section">
           <StatRow>
             <Stat value={teamMembers.length} label="الأعضاء" />
             <Stat value={totalPoints} label="مجموع النقاط" />
             <Stat value={avgPoints} label="متوسط النقاط" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الأعضاء" title="أعضاء الفريق" />
           {teamMembers.length === 0 ? (
             <EmptyState
               icon="👥"
               title="لا أعضاء"
               message="لا يوجد أعضاء في هذا الفريق حاليًا."
             />
           ) : (
             <div className="grid grid--wide">
               {teamMembers.map((m) => (
                 <MemberCard key={m.id} member={m} showTeam={false} />
               ))}
             </div>
           )}
         </section>

         <section className="section">
           <SectionHeader eyebrow="الترتيب" title="ترتيب الفريق" />
           {board.length === 0 ? (
             <EmptyState
               icon="📊"
               title="لا بيانات"
               message="لا توجد بيانات لعرض الترتيب."
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>#</th>
                     <th>العضو</th>
                     <th>الساعات</th>
                     <th>النقاط</th>
                   </tr>
                 </thead>
                 <tbody>
                   {board.map((e) => (
                     <tr key={e.member.id}>
                       <td
                         className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}
                         data-label="الترتيب"
                       >
                         {e.rank}
                       </td>
                       <td data-label="العضو" style={{ fontWeight: 700 }}>
                         {e.member.name}
                       </td>
                       <td
                         style={{ fontFamily: 'var(--font-en)' }}
                         data-label="الساعات"
                       >
                         {e.member.hours}
                       </td>
                       <td className="points" data-label="النقاط">
                         {e.points}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — LeaguePage (ليج عام + ليج كل فريق + ليج كل لجنة)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/LeaguePage.tsx",
  `import { useMemo, useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Loading, SkeletonList } from '@/components/ui/Loading';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Avatar } from '@/components/ui/Avatar';
   import { cx } from '@/lib/format';
   import type { Member, TeamId, RoleId } from '@/types';

   const LEAGUE_EXCLUDED: RoleId[] = ['HEAD', 'VICE'];

   type FilterType = 'all' | 'team' | 'committee';

   export function LeaguePage() {
     const { data: members, loading } = useCollection<Member>('members');
     const [filterType, setFilterType] = useState<FilterType>('all');
     const [filterId, setFilterId] = useState<string>('all');

     const eligible = useMemo(
       () => members.filter((m) => !LEAGUE_EXCLUDED.includes(m.role)),
       [members],
     );

     const filtered = useMemo(() => {
       if (filterType === 'all' || filterId === 'all') return eligible;
       if (filterType === 'team') {
         return eligible.filter((m) => m.teamIds.includes(filterId as TeamId));
       }
       return eligible.filter((m) => m.committeeIds.includes(filterId));
     }, [eligible, filterType, filterId]);

     const board = useMemo(() => {
       return [...filtered]
         .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
         .map((m, i) => ({ member: m, rank: i + 1, points: hoursToPoints(m.hours) }));
     }, [filtered]);

     const totalPoints = board.reduce((s, e) => s + e.points, 0);
     const totalHours = filtered.reduce((s, m) => s + (m.hours || 0), 0);

     const title =
       filterType === 'all'
         ? 'الترتيب العام'
         : filterType === 'team'
           ? 'ترتيب فريق ' + (teams.find((t) => t.id === filterId)?.nameAr || '')
           : 'ترتيب لجنة ' +
             (committees.find((c) => c.id === filterId)?.nameAr || '');

     return (
       <div className="container">
         <PageHeader
           eyebrow="الترتيب"
           title="الليج"
           description="ترتيب الأعضاء على مستوى المنظمة، الفريق، واللجنة."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={board.length} label="الأعضاء" />
             <Stat value={totalPoints} label="مجموع النقاط" />
             <Stat value={totalHours} label="مجموع الساعات" />
           </StatRow>
         </section>

         <div className="chips mb-3">
           <button
             type="button"
             className={cx('chip', filterType === 'all' && 'is-active')}
             onClick={() => {
               setFilterType('all');
               setFilterId('all');
             }}
           >
             عام
           </button>
           <button
             type="button"
             className={cx('chip', filterType === 'team' && 'is-active')}
             onClick={() => {
               setFilterType('team');
               setFilterId('all');
             }}
           >
             حسب الفريق
           </button>
           <button
             type="button"
             className={cx('chip', filterType === 'committee' && 'is-active')}
             onClick={() => {
               setFilterType('committee');
               setFilterId('all');
             }}
           >
             حسب اللجنة
           </button>
         </div>

         {filterType === 'team' ? (
           <div className="chips mb-4">
             <button
               type="button"
               className={cx('chip', filterId === 'all' && 'is-active')}
               onClick={() => setFilterId('all')}
             >
               كل الفرق
             </button>
             {teams.map((t) => (
               <button
                 key={t.id}
                 type="button"
                 className={cx('chip', filterId === t.id && 'is-active')}
                 onClick={() => setFilterId(t.id)}
               >
                 {t.name}
               </button>
             ))}
           </div>
         ) : null}

         {filterType === 'committee' ? (
           <div className="chips mb-4">
             <button
               type="button"
               className={cx('chip', filterId === 'all' && 'is-active')}
               onClick={() => setFilterId('all')}
             >
               كل اللجان
             </button>
             {committees.map((c) => (
               <button
                 key={c.id}
                 type="button"
                 className={cx('chip', filterId === c.id && 'is-active')}
                 onClick={() => setFilterId(c.id)}
               >
                 {c.icon} {c.nameAr}
               </button>
             ))}
           </div>
         ) : null}

         <section className="section">
           <SectionHeader eyebrow="الترتيب" title={title} />

           {loading ? (
             <SkeletonList count={8} />
           ) : board.length === 0 ? (
             <EmptyState
               icon="🥇"
               title="لا بيانات"
               message="لا توجد مشاركات مسجلة لهذا التصنيف."
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>#</th>
                     <th>العضو</th>
                     <th>الفريق</th>
                     <th>الساعات</th>
                     <th>النقاط</th>
                   </tr>
                 </thead>
                 <tbody>
                   {board.map((e) => {
                     const memberTeams = teams.filter((t) =>
                       e.member.teamIds.includes(t.id),
                     );
                     return (
                       <tr key={e.member.id}>
                         <td
                           className={
                             'rank rank--' + (e.rank <= 3 ? e.rank : '')
                           }
                           data-label="الترتيب"
                         >
                           {e.rank}
                         </td>
                         <td data-label="العضو">
                           <div
                             style={{
                               display: 'flex',
                               alignItems: 'center',
                               gap: 10,
                             }}
                           >
                             <Avatar name={e.member.name} size={32} variant="navy" />
                             <span style={{ fontWeight: 700 }}>
                               {e.member.name}
                             </span>
                           </div>
                         </td>
                         <td data-label="الفريق">
                           <div
                             style={{
                               display: 'flex',
                               gap: 4,
                               flexWrap: 'wrap',
                             }}
                           >
                             {memberTeams.map((t) => (
                               <span key={t.id} className="badge">
                                 {t.name}
                               </span>
                             ))}
                           </div>
                         </td>
                         <td
                           style={{ fontFamily: 'var(--font-en)' }}
                           data-label="الساعات"
                         >
                           {e.member.hours}
                         </td>
                         <td className="points" data-label="النقاط">
                           {e.points}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — CommitteesPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/CommitteesPage.tsx",
  `import { committees } from '@/data/committees';
   import { members } from '@/data/members';
   import { hoursToPoints } from '@/lib/format';
   import { CommitteeCard } from '@/components/committee/CommitteeCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';

   export function CommitteesPage() {
     const totalCommittees = committees.length;
     const totalMembersInCommittees = new Set(
       members.flatMap((m) => m.committeeIds),
     ).size;
     const totalCommitteePoints = members
       .filter((m) => m.committeeIds.length > 0)
       .reduce((s, m) => s + hoursToPoints(m.hours || 0), 0);

     return (
       <div className="container">
         <PageHeader
           eyebrow="الحوكمة"
           title="اللجان"
           description="لجان المنظمة ومهامها وترتيب الأعضاء داخلها."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={totalCommittees} label="اللجان" />
             <Stat value={totalMembersInCommittees} label="الأعضاء" />
             <Stat value={totalCommitteePoints} label="مجموع النقاط" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="القائمة"
             title="كل اللجان"
             description="اضغط على أي لجنة لعرض تفاصيلها وترتيب أعضائها."
           />
           <div className="grid grid--wide">
             {committees.map((c) => (
               <CommitteeCard key={c.id} committee={c} />
             ))}
           </div>
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — AchievementsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/AchievementsPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { AchievementCard } from '@/components/achievement/AchievementCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonCard } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import type { Achievement } from '@/types';

   export function AchievementsPage() {
     const { data, loading } = useCollection<Achievement>('achievements');

     const branchCount = data.filter((a) => a.level === 'branch').length;
     const nationalCount = data.filter((a) => a.level === 'national').length;
     const internationalCount = data.filter((a) => a.level === 'international').length;

     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

     return (
       <div className="container">
         <PageHeader
           eyebrow="الإنجازات"
           title="تكريمات المنظمة"
           description="كل ما حققته المنظمة على مستوى الفرع، الدولة، والعالم."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={branchCount} label="مستوى الفرع" />
             <Stat value={nationalCount} label="مستوى وطني" />
             <Stat value={internationalCount} label="مستوى دولي" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="القائمة" title="كل الإنجازات" />
           {loading ? (
             <div className="stack">
               <SkeletonCard count={4} />
             </div>
           ) : sorted.length === 0 ? (
             <EmptyState
               icon="🏆"
               title="لا إنجازات بعد"
               message="لم يتم تسجيل أي إنجازات حتى الآن."
             />
           ) : (
             <div className="stack">
               {sorted.map((a) => (
                 <AchievementCard key={a.id} achievement={a} />
               ))}
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — GovernancePage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/GovernancePage.tsx",
  `import { governanceDocuments } from '@/data/governance';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Badge } from '@/components/ui/Badge';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { formatDate } from '@/lib/format';

   export function GovernancePage() {
     const grouped = governanceDocuments.reduce<Record<string, typeof governanceDocuments>>(
       (acc, doc) => {
         if (!acc[doc.category]) acc[doc.category] = [];
         acc[doc.category].push(doc);
         return acc;
       },
       {},
     );

     return (
       <div className="container">
         <PageHeader
           eyebrow="الحوكمة"
           title="الوثائق الرسمية"
           description="السياسات والإجراءات واللوائح الرسمية للمنظمة."
         />

         {Object.entries(grouped).map(([category, docs]) => (
           <section key={category} className="section">
             <SectionHeader eyebrow={category} title={category} />
             <div className="stack">
               {docs.map((d) => (
                 <div key={d.id} className="card no-click">
                   <div className="row row--between">
                     <div className="card__title">{d.title}</div>
                     <Badge variant="neutral">v{d.version}</Badge>
                   </div>
                   <div className="card__meta">{d.description}</div>
                   <div className="small muted mt-3">
                     آخر تحديث {formatDate(d.updatedAt)}
                   </div>
                   <p className="mt-3 small soft" style={{ lineHeight: 1.8 }}>
                     {d.content}
                   </p>
                 </div>
               ))}
             </div>
           </section>
         ))}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — SearchPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/SearchPage.tsx",
  `import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';
   import type { Member, Contribution, Achievement, CalendarEvent } from '@/types';

   interface SearchResult {
     id: string;
     type: 'member' | 'contribution' | 'achievement' | 'event' | 'team' | 'committee';
     title: string;
     subtitle?: string;
     route: string;
     icon: string;
   }

   export function SearchPage() {
     const [query, setQuery] = useState('');
     const { data: members } = useCollection<Member>('members');
     const { data: contributions } = useCollection<Contribution>('contributions');
     const { data: achievements } = useCollection<Achievement>('achievements');
     const { data: events } = useCollection<CalendarEvent>('calendar');

     const results = useMemo<SearchResult[]>(() => {
       const q = query.trim().toLowerCase();
       if (!q || q.length < 2) return [];

       const out: SearchResult[] = [];

       members.forEach((m) => {
         if (m.name.toLowerCase().includes(q)) {
           out.push({
             id: m.id,
             type: 'member',
             title: m.name,
             subtitle: m.bio?.slice(0, 80),
             route: '/members/' + m.id,
             icon: '👤',
           });
         }
       });

       contributions.forEach((c) => {
         if (
           c.title.toLowerCase().includes(q) ||
           c.description.toLowerCase().includes(q)
         ) {
           out.push({
             id: c.id,
             type: 'contribution',
             title: c.title,
             subtitle: c.memberName + ' · ' + c.hours + ' ساعة',
             route: '/contributions/' + c.id,
             icon: '📝',
           });
         }
       });

       achievements.forEach((a) => {
         if (
           a.title.toLowerCase().includes(q) ||
           a.description.toLowerCase().includes(q)
         ) {
           out.push({
             id: a.id,
             type: 'achievement',
             title: a.title,
             subtitle: a.description.slice(0, 80),
             route: '/achievements',
             icon: '🏆',
           });
         }
       });

       events.forEach((e) => {
         if (e.title.toLowerCase().includes(q)) {
           out.push({
             id: e.id,
             type: 'event',
             title: e.title,
             subtitle: e.date,
             route: '/calendar',
             icon: '📅',
           });
         }
       });

       teams.forEach((t) => {
         if (t.name.toLowerCase().includes(q) || t.nameAr.includes(query)) {
           out.push({
             id: t.id,
             type: 'team',
             title: t.name,
             subtitle: t.nameAr,
             route: '/teams/' + t.id,
             icon: '🏅',
           });
         }
       });

       committees.forEach((c) => {
         if (c.nameAr.includes(query) || c.name.toLowerCase().includes(q)) {
           out.push({
             id: c.id,
             type: 'committee',
             title: c.nameAr,
             subtitle: c.description,
             route: '/committees',
             icon: '🏛️',
           });
         }
       });

       return out.slice(0, 50);
     }, [query, members, contributions, achievements, events]);

     return (
       <div className="container">
         <PageHeader
           eyebrow="بحث"
           title="بحث شامل"
           description="ابحث في الأعضاء، المشاركات، الإنجازات، الأحداث، الفرق، واللجان."
         />

         <input
           className="input"
           type="search"
           placeholder="اكتب حرفين على الأقل..."
           value={query}
           onChange={(e) => setQuery(e.target.value)}
           autoFocus
           style={{ marginBottom: 20 }}
         />

         {query.length < 2 ? (
           <EmptyState
             icon="🔍"
             title="ابدأ الكتابة"
             message="اكتب حرفين على الأقل للبحث."
           />
         ) : results.length === 0 ? (
           <EmptyState
             icon="🔍"
             title="لا نتائج"
             message={'لم يتم العثور على نتائج لـ "' + query + '".'}
           />
         ) : (
           <div className="stack">
             {results.map((r) => (
               <Link
                 key={r.type + '-' + r.id}
                 to={r.route}
                 className="card"
               >
                 <div
                   style={{
                     display: 'flex',
                     gap: 12,
                     alignItems: 'center',
                   }}
                 >
                   <div
                     style={{
                       width: 40,
                       height: 40,
                       borderRadius: 10,
                       background: 'var(--c-off-white)',
                       border: '1px solid var(--c-line)',
                       display: 'grid',
                       placeItems: 'center',
                       fontSize: '1.15rem',
                       flexShrink: 0,
                     }}
                   >
                     {r.icon}
                   </div>
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{r.title}</div>
                     {r.subtitle ? (
                       <div className="card__meta">{r.subtitle}</div>
                     ) : null}
                   </div>
                   <Badge variant="neutral">{r.type}</Badge>
                 </div>
               </Link>
             ))}
           </div>
         )}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      PUBLIC — NotFoundPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/NotFoundPage.tsx",
  `import { Link } from 'react-router-dom';

   export function NotFoundPage() {
     return (
       <div className="container notfound">
         <div className="notfound__code">404</div>
         <h2 className="mt-4">الصفحة غير موجودة</h2>
         <p
           className="muted mt-3"
           style={{ maxWidth: '40ch', lineHeight: 1.7 }}
         >
           الرابط الذي فتحته غير صحيح أو تم نقل الصفحة.
         </p>
         <div className="row mt-6" style={{ justifyContent: 'center' }}>
           <Link to="/" className="btn btn--primary">
             العودة للرئيسية
           </Link>
         </div>
       </div>
     );
   }
   `
);

console.log("  ✓ Part 7 loaded: Public pages");
/* ═══════════════════════════════════════════════════════════════
   DASHBOARD — DashboardPage
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/DashboardPage.tsx",
  `import { Link } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import {
     isAdmin,
     isManager,
     seesAllTeams,
     canApproveStep,
   } from '@/lib/permissions';
   import { hoursToPoints, formatDate } from '@/lib/format';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { Avatar } from '@/components/ui/Avatar';
   import { EventCard } from '@/components/calendar/EventCard';
   import { EmptyState } from '@/components/ui/EmptyState';
   import type {
     Notification,
     RequestRecord,
     Contribution,
     ApprovalStep,
     CalendarEvent,
     Member,
   } from '@/types';

   export function DashboardPage() {
     const { user } = useAuth();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');
     const { data: requests } = useRealtimeCollection<RequestRecord>('requests');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const { data: approvals } = useRealtimeCollection<ApprovalStep>('approvals');
     const { data: events } = useRealtimeCollection<CalendarEvent>('calendar');
     const { data: liveMembers } = useRealtimeCollection<Member>('members');

     if (!user) {
       return (
         <div className="container">
           <EmptyState
             icon="🔒"
             title="يجب تسجيل الدخول"
             message="سجّل دخولك للوصول إلى لوحة التحكم."
           />
         </div>
       );
     }

     const allMembers = liveMembers.length > 0 ? liveMembers : members;
     const myMember = user.memberId
       ? allMembers.find((m) => m.id === user.memberId)
       : null;

     const myContribs = contributions.filter((c) => c.memberId === user.memberId);
     const approvedContribs = myContribs.filter((c) => c.status === 'approved');
     const myHours = approvedContribs.reduce((s, c) => s + c.hours, 0);
     const myPoints = hoursToPoints(myHours);

     const myRequests = requests.filter((r) => r.requesterUid === user.uid);

     const myNotifs = notifs
       .filter((n) => n.userId === user.uid)
       .sort((a, b) => (a.date < b.date ? 1 : -1))
       .slice(0, 5);

     const myPendingApprovals = approvals.filter(
       (a) => a.status === 'PENDING' && canApproveStep(user, a),
     );

     const upcomingEvents = events
       .filter((e) => e.date >= new Date().toISOString().slice(0, 10))
       .filter(
         (e) =>
           e.isPublic ||
           e.teamId === user.teamId ||
           seesAllTeams(user),
       )
       .sort((a, b) => (a.date > b.date ? 1 : -1))
       .slice(0, 3);

     const totalOrgPoints = allMembers.reduce(
       (s, m) => s + hoursToPoints(m.hours || 0),
       0,
     );

     const pendingRequestsCount = requests.filter(
       (r) => r.status === 'PENDING' || r.status === 'IN_REVIEW',
     ).length;

     return (
       <>
         <div className="section section--tight">
           <div className="section-head__eyebrow">أهلاً بك</div>
           <h1>{user.displayName}</h1>
         </div>

         {/* ═══════════ Stats ═══════════ */}
         {isManager(user) ? (
           <section className="section--tight">
             <StatRow>
               <Stat value={allMembers.length} label="الأعضاء" />
               <Stat value={teams.length} label="الفرق" />
               <Stat
                 value={pendingRequestsCount}
                 label="طلبات قيد المعالجة"
                 variant="red"
               />
               <Stat value={totalOrgPoints} label="مجموع النقاط" />
             </StatRow>
           </section>
         ) : (
           <section className="section--tight">
             <StatRow>
               <Stat value={myPoints} label="نقاطي" variant="red" />
               <Stat value={myHours} label="ساعاتي" />
               <Stat value={myContribs.length} label="مشاركاتي" />
               <Stat value={myRequests.length} label="طلباتي" />
             </StatRow>
           </section>
         )}

         {/* ═══════════ Quick actions ═══════════ */}
         {user.role === 'MEMBER' ? (
           <section className="section--tight">
             <div className="row" style={{ gap: 10 }}>
               <Link to="/requests/new" className="btn btn--primary btn--sm">
                 + طلب جديد
               </Link>
               <Link
                 to="/my-contributions"
                 className="btn btn--ghost btn--sm"
               >
                 تسجيل مشاركة
               </Link>
             </div>
           </section>
         ) : null}

         {/* ═══════════ Pending Approvals (Manager) ═══════════ */}
         {isManager(user) && myPendingApprovals.length > 0 ? (
           <section className="section">
             <SectionHeader
               eyebrow="بانتظار قرارك"
               title="الموافقات المعلّقة"
               action={
                 <Link to="/approvals" className="btn btn--ghost btn--sm">
                   الكل
                 </Link>
               }
             />
             <div className="stack">
               {myPendingApprovals.slice(0, 4).map((a) => {
                 const req = requests.find((r) => r.id === a.requestId);
                 if (!req) return null;
                 return (
                   <Link
                     key={a.id}
                     to={'/requests/' + req.id}
                     className="card"
                   >
                     <div className="row row--between">
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <div className="card__title">{req.title}</div>
                         <div className="card__meta">
                           {req.requesterName} · مرحلة {a.order}
                         </div>
                       </div>
                       <Badge variant="warning" dot>
                         بانتظارك
                       </Badge>
                     </div>
                   </Link>
                 );
               })}
             </div>
           </section>
         ) : null}

         {/* ═══════════ Notifications (للجميع) ═══════════ */}
         {myNotifs.length > 0 ? (
           <section className="section">
             <SectionHeader
               eyebrow="آخر التحديثات"
               title="الإشعارات"
               action={
                 <Link to="/notifications" className="btn btn--ghost btn--sm">
                   الكل
                 </Link>
               }
             />
             <div className="stack">
               {myNotifs.map((n) => (
                 <Link
                   key={n.id}
                   to={n.route || '/notifications'}
                   className={
                     'card' + (!n.read ? '' : '')
                   }
                   style={
                     !n.read
                       ? { borderColor: '#FCA5A5', background: '#FFFBFC' }
                       : undefined
                   }
                 >
                   <div className="row row--between">
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title">{n.title}</div>
                       <div className="card__meta">{n.message}</div>
                     </div>
                     {!n.read ? <Badge variant="red" dot>جديد</Badge> : null}
                   </div>
                 </Link>
               ))}
             </div>
           </section>
         ) : null}

         {/* ═══════════ Top Members ═══════════ */}
         <section className="section">
           <SectionHeader
             eyebrow="الترتيب"
             title="أعلى الأعضاء"
             action={
               <Link to="/league" className="btn btn--ghost btn--sm">
                 الليج الكامل
               </Link>
             }
           />
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>#</th>
                   <th>العضو</th>
                   <th>الساعات</th>
                   <th>النقاط</th>
                 </tr>
               </thead>
               <tbody>
                 {[...allMembers]
                   .filter((m) => m.role !== 'HEAD' && m.role !== 'VICE')
                   .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
                   .slice(0, 5)
                   .map((m, i) => (
                     <tr key={m.id}>
                       <td
                         className={'rank rank--' + (i + 1 <= 3 ? i + 1 : '')}
                         data-label="الترتيب"
                       >
                         {i + 1}
                       </td>
                       <td data-label="العضو">
                         <Link
                           to={'/members/' + m.id}
                           style={{
                             display: 'flex',
                             alignItems: 'center',
                             gap: 10,
                           }}
                         >
                           <Avatar name={m.name} size={30} variant="navy" />
                           <span style={{ fontWeight: 700 }}>{m.name}</span>
                         </Link>
                       </td>
                       <td
                         style={{ fontFamily: 'var(--font-en)' }}
                         data-label="الساعات"
                       >
                         {m.hours}
                       </td>
                       <td className="points" data-label="النقاط">
                         {hoursToPoints(m.hours)}
                       </td>
                     </tr>
                   ))}
               </tbody>
             </table>
           </div>
         </section>

         {/* ═══════════ Upcoming Events ═══════════ */}
         {upcomingEvents.length > 0 ? (
           <section className="section">
             <SectionHeader
               eyebrow="قريبًا"
               title="الأحداث القادمة"
               action={
                 <Link to="/calendar" className="btn btn--ghost btn--sm">
                   التقويم
                 </Link>
               }
             />
             <div className="stack">
               {upcomingEvents.map((e) => (
                 <EventCard key={e.id} event={e} />
               ))}
             </div>
           </section>
         ) : null}

         {/* ═══════════ My Info ═══════════ */}
         {myMember ? (
           <section className="section">
             <SectionHeader eyebrow="معلوماتي" title="حسابي" />
             <div className="card no-click">
               <div className="kv">
                 <span className="kv__k">الاسم</span>
                 <span className="kv__v">{myMember.name}</span>
               </div>
               <div className="kv mt-3">
                 <span className="kv__k">الدور</span>
                 <span className="kv__v">{user.role}</span>
               </div>
               <div className="kv mt-3">
                 <span className="kv__k">الفريق</span>
                 <span className="kv__v">
                   {user.teamId
                     ? teams.find((t) => t.id === user.teamId)?.name
                     : '—'}
                 </span>
               </div>
               {user.committeeIds.length > 0 ? (
                 <div className="kv mt-3">
                   <span className="kv__k">اللجان</span>
                   <span className="kv__v">
                     {committees
                       .filter((c) => user.committeeIds.includes(c.id))
                       .map((c) => c.nameAr)
                       .join(' · ')}
                   </span>
                 </div>
               ) : null}
               <div className="kv mt-3">
                 <span className="kv__k">تاريخ الانضمام</span>
                 <span className="kv__v">
                   {formatDate(user.createdAt)}
                 </span>
               </div>
               <div className="row mt-4" style={{ gap: 10 }}>
                 <Link to="/profile" className="btn btn--ghost btn--sm">
                   ملفي الشخصي
                 </Link>
                 <Link
                   to="/my-contributions"
                   className="btn btn--ghost btn--sm"
                 >
                   مشاركاتي
                 </Link>
               </div>
             </div>
           </section>
         ) : null}
       </>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — MyProfilePage (Redirect)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/MyProfilePage.tsx",
  `import { Navigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';

   export function MyProfilePage() {
     const { user, loading } = useAuth();

     if (loading) return <Loading fullHeight />;

     if (!user?.memberId) {
       return (
         <div className="container">
           <EmptyState
             icon="👤"
             title="لا يوجد ملف شخصي"
             message="حسابك غير مرتبط بملف عضو. تواصل مع الإدارة."
           />
         </div>
       );
     }

     return <Navigate to={'/members/' + user.memberId} replace />;
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — MyContributionsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/MyContributionsPage.tsx",
  `import { useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { createOne, newId, today } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { notifyTeamManagers } from '@/lib/notifications';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints, formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextInput, NumberInput, TextArea, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Contribution, TeamId, AppUser } from '@/types';

   export function MyContributionsPage() {
     const { user } = useAuth();
     const { data: contributions, loading } = useRealtimeCollection<Contribution>('contributions');
     const { data: users } = useRealtimeCollection<AppUser>('users');

     const [open, setOpen] = useState(false);
     const [busy, setBusy] = useState(false);
     const [title, setTitle] = useState('');
     const [desc, setDesc] = useState('');
     const [hours, setHours] = useState(1);
     const [teamId, setTeamId] = useState<TeamId>((user?.teamId as TeamId) || 'helpers');
     const [committeeId, setCommitteeId] = useState<string>('');
     const [category, setCategory] = useState('عام');

     if (!user?.memberId) {
       return (
         <div className="container">
           <EmptyState
             icon="👤"
             title="لا يوجد عضو مرتبط"
             message="حسابك غير مرتبط بملف عضو."
           />
         </div>
       );
     }

     const myMember = members.find((m) => m.id === user.memberId);
     const myContribs = contributions
       .filter((c) => c.memberId === user.memberId)
       .sort((a, b) => (a.date < b.date ? 1 : -1));

     const approved = myContribs.filter((c) => c.status === 'approved');
     const totalHours = approved.reduce((s, c) => s + c.hours, 0);
     const totalPoints = hoursToPoints(totalHours);
     const pending = myContribs.filter((c) => c.status === 'pending').length;

     const reset = () => {
       setTitle('');
       setDesc('');
       setHours(1);
       setCategory('عام');
       setCommitteeId('');
     };

     const submit = async () => {
       if (!title.trim() || !desc.trim()) {
         toast.error('العنوان والوصف مطلوبان');
         return;
       }
       if (hours <= 0) {
         toast.error('الساعات يجب أن تكون موجبة');
         return;
       }

       setBusy(true);
       try {
         const contrib: Contribution = {
           id: newId('C'),
           memberId: user.memberId!,
           memberName: myMember?.name ?? user.displayName,
           teamId,
           committeeId: committeeId || undefined,
           category,
           title: title.trim(),
           description: desc.trim(),
           date: today(),
           hours,
           status: 'pending',
           seasonId: 'S7',
           createdBy: user.uid,
         };

         await createOne('contributions', contrib);
         await logAudit(user, 'CREATE_CONTRIBUTION', 'Contribution', contrib.id, 'تسجيل مشاركة');

         await notifyTeamManagers(
           users,
           teamId,
           'مشاركة جديدة بانتظار الاعتماد',
           myMember?.name + ' سجّل مشاركة "' + contrib.title + '"',
           'participation',
           '/contributions',
           'normal',
           myMember?.name,
         );

         toast.success('تم الإرسال', 'مشاركتك قيد المراجعة من رئيس الفريق والموارد البشرية');
         setOpen(false);
         reset();
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل الإرسال';
         toast.error('فشل الإرسال', msg);
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="container">
         <PageHeader
           eyebrow="مشاركاتي"
           title="مشاركاتي"
           description="سجّل ساعات عملك. كل ساعة معتمدة = 5 نقاط."
         >
           <button
             type="button"
             className="btn btn--primary mt-4"
             onClick={() => setOpen(true)}
           >
             + تسجيل مشاركة
           </button>
         </PageHeader>

         <section className="section--tight">
           <StatRow>
             <Stat value={totalPoints} label="النقاط" variant="red" />
             <Stat value={totalHours} label="الساعات" />
             <Stat value={myContribs.length} label="المشاركات" />
             <Stat value={pending} label="معلّقة" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="السجل" title="كل مشاركاتي" />
           {loading ? (
             <SkeletonList count={5} />
           ) : myContribs.length === 0 ? (
             <EmptyState
               icon="📝"
               title="لا مشاركات بعد"
               message="سجّل أول مشاركة لك للحصول على النقاط."
               action={
                 <button
                   type="button"
                   className="btn btn--primary"
                   onClick={() => setOpen(true)}
                 >
                   + تسجيل أول مشاركة
                 </button>
               }
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>العنوان</th>
                     <th>الفريق</th>
                     <th>التاريخ</th>
                     <th>الساعات</th>
                     <th>النقاط</th>
                     <th>الحالة</th>
                   </tr>
                 </thead>
                 <tbody>
                   {myContribs.map((c) => {
                     const team = teams.find((t) => t.id === c.teamId);
                     const committee = c.committeeId
                       ? committees.find((x) => x.id === c.committeeId)
                       : null;
                     return (
                       <tr key={c.id}>
                         <td data-label="العنوان">
                           {c.title}
                           {committee ? (
                             <div className="tiny muted mt-1">
                               {committee.icon} {committee.nameAr}
                             </div>
                           ) : null}
                         </td>
                         <td className="muted small" data-label="الفريق">
                           {team?.name ?? c.teamId}
                         </td>
                         <td className="muted small nowrap" data-label="التاريخ">
                           {formatDate(c.date)}
                         </td>
                         <td
                           style={{ fontFamily: 'var(--font-en)' }}
                           data-label="الساعات"
                         >
                           {c.hours}
                         </td>
                         <td className="points" data-label="النقاط">
                           {c.status === 'approved' ? hoursToPoints(c.hours) : '—'}
                         </td>
                         <td data-label="الحالة">
                           {c.status === 'approved' ? (
                             <Badge variant="success">معتمد</Badge>
                           ) : c.status === 'pending' ? (
                             <Badge variant="warning">معلّق</Badge>
                           ) : (
                             <Badge variant="danger">مرفوض</Badge>
                           )}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
           )}
         </section>

         <Modal
           open={open}
           title="تسجيل مشاركة جديدة"
           onClose={() => setOpen(false)}
           wide
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() => setOpen(false)}
               >
                 إلغاء
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={submit}
                 disabled={busy}
               >
                 {busy ? '...' : 'إرسال'}
               </button>
             </>
           }
         >
           <FormField label="العنوان" required>
             <TextInput
               value={title}
               onChange={setTitle}
               placeholder="عنوان المشاركة"
             />
           </FormField>

           <FormField label="الوصف" required>
             <TextArea
               value={desc}
               onChange={setDesc}
               placeholder="تفاصيل المشاركة"
               rows={3}
             />
           </FormField>

           <FormField label="الفريق" required>
             <Select
               value={teamId}
               onChange={(v) => setTeamId(v as TeamId)}
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField label="اللجنة (اختياري)">
             <Select
               value={committeeId}
               onChange={setCommitteeId}
               options={[
                 { value: '', label: '— بدون لجنة —' },
                 ...committees.map((c) => ({
                   value: c.id,
                   label: c.icon + ' ' + c.nameAr,
                 })),
               ]}
             />
           </FormField>

           <FormField label="التصنيف">
             <TextInput value={category} onChange={setCategory} />
           </FormField>

           <FormField label="عدد الساعات" required>
             <NumberInput value={hours} onChange={setHours} min={1} max={100} />
           </FormField>
         </Modal>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — MyRequestsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/MyRequestsPage.tsx",
  `import { Link } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { RequestCard } from '@/components/request/RequestCard';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import type { RequestRecord } from '@/types';

   export function MyRequestsPage() {
     const { user } = useAuth();
     const { data: requests, loading } = useRealtimeCollection<RequestRecord>('requests');

     if (!user) return null;

     const mine = requests
       .filter((r) => r.requesterUid === user.uid)
       .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));

     return (
       <div className="container">
         <PageHeader
           eyebrow="طلباتي"
           title="طلباتي"
           description="تابع كل طلباتك وحالتها اللحظية."
         >
           <Link className="btn btn--primary mt-4" to="/requests/new">
             + طلب جديد
           </Link>
         </PageHeader>

         <section className="section">
           <SectionHeader eyebrow="السجل" title={'كل طلباتي (' + mine.length + ')'} />
           {loading ? (
             <SkeletonList count={4} />
           ) : mine.length === 0 ? (
             <EmptyState
               icon="📋"
               title="لا طلبات بعد"
               message="لم تقم بتقديم أي طلبات حتى الآن."
               action={
                 <Link className="btn btn--primary" to="/requests/new">
                   + قدّم طلبك الأول
                 </Link>
               }
             />
           ) : (
             <div className="stack">
               {mine.map((r) => (
                 <RequestCard key={r.id} request={r} />
               ))}
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — NewRequestPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/NewRequestPage.tsx",
  `import { useState, type FormEvent } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { newId, today } from '@/lib/db';
   import { createRequestWithChain } from '@/lib/approvals';
   import { logAudit } from '@/lib/audit';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { RequestRecord, RequestType, Priority, TeamId } from '@/types';

   const TYPE_LABEL: Record<RequestType, string> = {
     TRANSFER: 'نقل بين الفرق',
     PROMOTION: 'ترقية',
     RESIGNATION: 'استقالة',
     COMPLAINT: 'شكوى',
     SUGGESTION: 'اقتراح',
     LEAVE: 'إجازة',
   };

   export function NewRequestPage() {
     const nav = useNavigate();
     const { user } = useAuth();
     const [type, setType] = useState<RequestType>('TRANSFER');
     const [title, setTitle] = useState('');
     const [description, setDescription] = useState('');
     const [priority, setPriority] = useState<Priority>('NORMAL');
     const [fromTeamId, setFromTeamId] = useState<TeamId | ''>(
       (user?.teamId as TeamId) || '',
     );
     const [toTeamId, setToTeamId] = useState<TeamId | ''>('');
     const [busy, setBusy] = useState(false);

     if (!user) return null;

     const myMember = members.find((m) => m.id === user.memberId);

     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();

       if (!title.trim() || !description.trim()) {
         toast.error('العنوان والوصف مطلوبان');
         return;
       }

       if (type === 'TRANSFER' && (!fromTeamId || !toTeamId)) {
         toast.error('يجب اختيار الفريق الحالي والفريق الجديد');
         return;
       }

       setBusy(true);
       try {
         const id = newId('REQ');
         const newReq: RequestRecord = {
           id,
           type,
           requesterUid: user.uid,
           requesterMemberId: user.memberId ?? '',
           requesterName: myMember?.name ?? user.displayName,
           subjectMemberId: user.memberId ?? undefined,
           title: title.trim(),
           description: description.trim(),
           status: 'PENDING',
           currentStepOrder: 1,
           priority,
           submittedAt: today(),
           updatedAt: today(),
           seasonId: 'S7',
           fromTeamId: fromTeamId || undefined,
           toTeamId: toTeamId || undefined,
         };

         await createRequestWithChain(newReq);
         await logAudit(user, 'CREATE_REQUEST', 'Request', id, 'إنشاء طلب: ' + title);

         toast.success(
           'تم إرسال طلبك',
           'سيتم إشعارك عند كل تحديث على طلبك',
         );
         nav('/my-requests');
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل الإرسال';
         toast.error('فشل الإرسال', msg);
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="container">
         <PageHeader
           eyebrow="طلب جديد"
           title="إرسال طلب"
           description="يمر الطلب بسلسلة موافقات واضحة. تابعها لحظيًا."
         />

         <form
           onSubmit={onSubmit}
           className="card no-click"
           style={{ maxWidth: 720 }}
         >
           <FormField label="نوع الطلب" required>
             <Select
               value={type}
               onChange={(v) => setType(v as RequestType)}
               options={Object.entries(TYPE_LABEL).map(([k, v]) => ({
                 value: k,
                 label: v,
               }))}
             />
           </FormField>

           <FormField label="الأولوية" required>
             <Select
               value={priority}
               onChange={(v) => setPriority(v as Priority)}
               options={[
                 { value: 'LOW', label: 'منخفضة' },
                 { value: 'NORMAL', label: 'عادية' },
                 { value: 'HIGH', label: 'مرتفعة' },
                 { value: 'URGENT', label: 'عاجلة' },
               ]}
             />
           </FormField>

           {type === 'TRANSFER' ? (
             <>
               <FormField label="من فريق" required>
                 <Select
                   value={fromTeamId}
                   onChange={(v) => setFromTeamId(v as TeamId | '')}
                   options={[
                     { value: '', label: '— اختر —' },
                     ...teams.map((t) => ({ value: t.id, label: t.name })),
                   ]}
                 />
               </FormField>

               <FormField label="إلى فريق" required>
                 <Select
                   value={toTeamId}
                   onChange={(v) => setToTeamId(v as TeamId | '')}
                   options={[
                     { value: '', label: '— اختر —' },
                     ...teams
                       .filter((t) => t.id !== fromTeamId)
                       .map((t) => ({ value: t.id, label: t.name })),
                   ]}
                 />
               </FormField>
             </>
           ) : null}

           <FormField label="العنوان" required>
             <TextInput
               value={title}
               onChange={setTitle}
               placeholder="عنوان واضح للطلب"
             />
           </FormField>

           <FormField label="الوصف" required>
             <TextArea
               value={description}
               onChange={setDescription}
               placeholder="اشرح طلبك بالتفصيل"
               rows={5}
             />
           </FormField>

           <button
             type="submit"
             className="btn btn--primary btn--block mt-5"
             disabled={busy}
           >
             {busy ? '...' : 'إرسال الطلب'}
           </button>
         </form>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — RequestsPage (Manager View)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/RequestsPage.tsx",
  `import { useMemo, useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { seesAllTeams } from '@/lib/permissions';
   import type { RequestType, RequestStatus, RequestRecord } from '@/types';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { RequestCard } from '@/components/request/RequestCard';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { cx } from '@/lib/format';

   const TYPES: Array<RequestType | 'all'> = [
     'all',
     'TRANSFER',
     'PROMOTION',
     'RESIGNATION',
     'COMPLAINT',
     'SUGGESTION',
     'LEAVE',
   ];
   const STATUSES: Array<RequestStatus | 'all'> = [
     'all',
     'PENDING',
     'IN_REVIEW',
     'APPROVED',
     'REJECTED',
   ];

   const TYPE_LABEL: Record<string, string> = {
     all: 'الكل',
     TRANSFER: 'نقل',
     PROMOTION: 'ترقية',
     RESIGNATION: 'استقالة',
     COMPLAINT: 'شكوى',
     SUGGESTION: 'اقتراح',
     LEAVE: 'إجازة',
   };

   const STATUS_LABEL: Record<string, string> = {
     all: 'كل الحالات',
     PENDING: 'قيد الانتظار',
     IN_REVIEW: 'قيد المراجعة',
     APPROVED: 'معتمد',
     REJECTED: 'مرفوض',
   };

   export function RequestsPage() {
     const { user } = useAuth();
     const [type, setType] = useState<RequestType | 'all'>('all');
     const [status, setStatus] = useState<RequestStatus | 'all'>('all');
     const { data: all, loading } = useCollection<RequestRecord>('requests');

     const filtered = useMemo(() => {
       let list = all;

       if (user && !seesAllTeams(user)) {
         // للرئيس ونوابه و HR — فقط طلبات فريقه
         list = list.filter(
           (r) =>
             r.fromTeamId === user.teamId ||
             r.toTeamId === user.teamId ||
             r.requesterUid === user.uid,
         );
       }

       return list
         .filter((r) => type === 'all' || r.type === type)
         .filter((r) => status === 'all' || r.status === status)
         .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
     }, [all, type, status, user]);

     return (
       <div className="container">
         <PageHeader
           eyebrow="سير العمل"
           title="الطلبات"
           description={
             user && !seesAllTeams(user)
               ? 'طلبات فريقك فقط.'
               : 'كل الطلبات في المنظمة.'
           }
         />

         <div className="chips mb-3">
           {TYPES.map((t) => (
             <button
               key={t}
               type="button"
               className={cx('chip', type === t && 'is-active')}
               onClick={() => setType(t)}
             >
               {TYPE_LABEL[t] ?? t}
             </button>
           ))}
         </div>

         <div className="chips mb-4">
           {STATUSES.map((s) => (
             <button
               key={s}
               type="button"
               className={cx('chip', status === s && 'is-active')}
               onClick={() => setStatus(s)}
             >
               {STATUS_LABEL[s] ?? s}
             </button>
           ))}
         </div>

         <section className="section">
           <SectionHeader
             eyebrow="القائمة"
             title={'الطلبات (' + filtered.length + ')'}
           />
           {loading ? (
             <SkeletonList count={5} />
           ) : filtered.length === 0 ? (
             <EmptyState
               icon="📋"
               title="لا طلبات"
               message="لا توجد طلبات مطابقة للفلاتر المحددة."
             />
           ) : (
             <div className="stack">
               {filtered.map((r) => (
                 <RequestCard key={r.id} request={r} />
               ))}
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — RequestDetailPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/RequestDetailPage.tsx",
  `import { useEffect, useState } from 'react';
   import { useParams, Link } from 'react-router-dom';
   import { getOne, listWhere } from '@/lib/db';
   import { useAuth } from '@/lib/useAuth';
   import { canApproveStep } from '@/lib/permissions';
   import { approveStep, rejectStep } from '@/lib/approvals';
   import { teams } from '@/data/teams';
   import {
     REQUEST_TYPE_LABEL,
     REQUEST_STATUS_LABEL,
     PRIORITY_LABEL,
     formatDate,
   } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Badge } from '@/components/ui/Badge';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextArea } from '@/components/ui/FormField';
   import { ApprovalChain } from '@/components/request/ApprovalChain';
   import { Loading } from '@/components/ui/Loading';
   import { NotFoundPage } from './NotFoundPage';
   import { toast } from '@/components/ui/Toast';
   import type { RequestRecord, ApprovalStep } from '@/types';

   export function RequestDetailPage() {
     const { requestId } = useParams<{ requestId: string }>();
     const { user } = useAuth();
     const [request, setRequest] = useState<RequestRecord | null>(null);
     const [steps, setSteps] = useState<ApprovalStep[]>([]);
     const [loading, setLoading] = useState(true);
     const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
     const [comment, setComment] = useState('');
     const [busy, setBusy] = useState(false);

     const load = async () => {
       if (!requestId) return;
       setLoading(true);
       const r = await getOne<RequestRecord>('requests', requestId);
       if (r) {
         const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', r.id);
         setSteps(allSteps.sort((a, b) => a.order - b.order));
       }
       setRequest(r);
       setLoading(false);
     };

     useEffect(() => {
       void load();
     }, [requestId]);

     if (loading) return <Loading fullHeight />;
     if (!request) return <NotFoundPage />;

     const currentStep = steps.find(
       (s) => s.status === 'PENDING' && s.order === request.currentStepOrder,
     );
     const canAct = user && currentStep && canApproveStep(user, currentStep);

     const fromTeam = request.fromTeamId
       ? teams.find((t) => t.id === request.fromTeamId)
       : null;
     const toTeam = request.toTeamId
       ? teams.find((t) => t.id === request.toTeamId)
       : null;

     const doAction = async () => {
       if (!user || !currentStep || !actionType) return;
       setBusy(true);
       try {
         if (actionType === 'approve') {
           await approveStep(request, currentStep, user);
           toast.success('تمت الموافقة');
         } else {
           if (!comment.trim()) {
             toast.error('سبب الرفض مطلوب');
             setBusy(false);
             return;
           }
           await rejectStep(request, currentStep, user, comment);
           toast.success('تم رفض الطلب');
         }
         setActionType(null);
         setComment('');
         await load();
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل الإجراء';
         toast.error('فشل الإجراء', msg);
       } finally {
         setBusy(false);
       }
     };

     return (
       <div className="container">
         <PageHeader eyebrow="الطلب" title={request.title} />

         <section className="section">
           <div className="grid grid--2">
             <div className="card no-click">
               <div className="kv">
                 <span className="kv__k">النوع</span>
                 <span className="kv__v">
                   {REQUEST_TYPE_LABEL[request.type]}
                 </span>
               </div>
               <div className="kv mt-4">
                 <span className="kv__k">مقدم الطلب</span>
                 <span className="kv__v">{request.requesterName}</span>
               </div>
               <div className="kv mt-4">
                 <span className="kv__k">التاريخ</span>
                 <span className="kv__v">{formatDate(request.submittedAt)}</span>
               </div>
               {fromTeam ? (
                 <div className="kv mt-4">
                   <span className="kv__k">من فريق</span>
                   <span className="kv__v">{fromTeam.name}</span>
                 </div>
               ) : null}
               {toTeam ? (
                 <div className="kv mt-4">
                   <span className="kv__k">إلى فريق</span>
                   <span className="kv__v">{toTeam.name}</span>
                 </div>
               ) : null}
             </div>

             <div className="card no-click">
               <div className="row row--between">
                 <span className="muted small">الحالة</span>
                 <Badge
                   variant={
                     request.status === 'APPROVED'
                       ? 'success'
                       : request.status === 'REJECTED'
                         ? 'danger'
                         : 'warning'
                   }
                 >
                   {REQUEST_STATUS_LABEL[request.status]}
                 </Badge>
               </div>
               <div className="row row--between mt-4">
                 <span className="muted small">الأولوية</span>
                 <Badge variant="neutral">{PRIORITY_LABEL[request.priority]}</Badge>
               </div>
               <div className="row row--between mt-4">
                 <span className="muted small">المرحلة الحالية</span>
                 <span className="kv__v">
                   {request.currentStepOrder} من {steps.length}
                 </span>
               </div>
               <div className="mt-5">
                 <div className="muted small">الوصف</div>
                 <p className="mt-2" style={{ lineHeight: 1.8 }}>
                   {request.description}
                 </p>
               </div>
             </div>
           </div>
         </section>

         {canAct ? (
           <section className="section">
             <SectionHeader eyebrow="قرارك" title="الإجراء المطلوب منك" />
             <div className="card no-click">
               <p className="muted small mb-4">
                 أنت مخوّل باتخاذ القرار في هذه المرحلة.
               </p>
               <div className="row" style={{ gap: 10 }}>
                 <button
                   type="button"
                   className="btn btn--success"
                   onClick={() => setActionType('approve')}
                 >
                   موافقة
                 </button>
                 <button
                   type="button"
                   className="btn btn--danger"
                   onClick={() => setActionType('reject')}
                 >
                   رفض
                 </button>
               </div>
             </div>
           </section>
         ) : null}

         <section className="section">
           <SectionHeader eyebrow="سلسلة الموافقات" title="الموافقات" />
           <ApprovalChain steps={steps} />
         </section>

         <Modal
           open={actionType !== null}
           title={actionType === 'approve' ? 'موافقة على الطلب' : 'رفض الطلب'}
           onClose={() => {
             setActionType(null);
             setComment('');
           }}
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() => {
                   setActionType(null);
                   setComment('');
                 }}
               >
                 إلغاء
               </button>
               <button
                 type="button"
                 className={
                   'btn ' + (actionType === 'approve' ? 'btn--success' : 'btn--danger')
                 }
                 onClick={doAction}
                 disabled={busy}
               >
                 {busy
                   ? '...'
                   : actionType === 'approve'
                     ? 'تأكيد الموافقة'
                     : 'تأكيد الرفض'}
               </button>
             </>
           }
         >
           <FormField
             label={actionType === 'approve' ? 'تعليق (اختياري)' : 'سبب الرفض'}
             required={actionType === 'reject'}
           >
             <TextArea
               value={comment}
               onChange={setComment}
               placeholder={
                 actionType === 'approve'
                   ? 'ملاحظات إضافية...'
                   : 'اشرح سبب الرفض'
               }
               rows={3}
             />
           </FormField>
         </Modal>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — ApprovalsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/ApprovalsPage.tsx",
  `import { Link } from 'react-router-dom';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { canApproveStep, ROLE_LABEL } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import type { ApprovalStep, RequestRecord } from '@/types';

   export function ApprovalsPage() {
     const { user } = useAuth();
     const { data: approvals, loading } = useCollection<ApprovalStep>('approvals');
     const { data: requests } = useCollection<RequestRecord>('requests');

     if (!user) return null;

     const myPending = approvals.filter(
       (a) => a.status === 'PENDING' && canApproveStep(user, a),
     );
     const done = approvals
       .filter((a) => a.status !== 'PENDING')
       .filter((a) => a.approverUid === user.uid)
       .sort((a, b) => (a.actionDate && b.actionDate ? (a.actionDate < b.actionDate ? 1 : -1) : 0))
       .slice(0, 15);

     const reqOf = (id: string) => requests.find((r) => r.id === id);

     const renderStep = (a: ApprovalStep) => {
       const req = reqOf(a.requestId);
       const teamName = a.requiredTeamId
         ? teams.find((t) => t.id === a.requiredTeamId)?.name
         : null;
       return (
         <Link key={a.id} to={'/requests/' + a.requestId} className="card">
           <div className="row row--between">
             <div style={{ flex: 1, minWidth: 0 }}>
               <div className="card__title">{req?.title ?? a.requestId}</div>
               <div className="card__meta">
                 {ROLE_LABEL[a.requiredRole]}
                 {teamName ? ' — ' + teamName : ''}
                 {' · مرحلة ' + a.order}
               </div>
             </div>
             <Badge variant="warning" dot>
               بانتظارك
             </Badge>
           </div>
         </Link>
       );
     };

     return (
       <div className="container">
         <PageHeader
           eyebrow="سير العمل"
           title="الموافقات"
           description="المراحل التي تنتظر قرارك."
         />

         <section className="section">
           <SectionHeader
             eyebrow="بانتظارك"
             title={'موافقاتك (' + myPending.length + ')'}
           />
           {loading ? (
             <SkeletonList count={3} />
           ) : myPending.length === 0 ? (
             <EmptyState
               icon="✅"
               title="لا شيء بانتظارك"
               message="جميع الموافقات المطلوبة منك تم إنجازها."
             />
           ) : (
             <div className="stack">{myPending.map(renderStep)}</div>
           )}
         </section>

         {done.length > 0 ? (
           <section className="section">
             <SectionHeader eyebrow="منتهية" title="قراراتك السابقة" />
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>الطلب</th>
                     <th>المرحلة</th>
                     <th>الحالة</th>
                     <th>التاريخ</th>
                   </tr>
                 </thead>
                 <tbody>
                   {done.map((a) => (
                     <tr key={a.id}>
                       <td data-label="الطلب">
                         <Link to={'/requests/' + a.requestId}>
                           {a.requestId}
                         </Link>
                       </td>
                       <td data-label="المرحلة">{a.order}</td>
                       <td data-label="الحالة">
                         {a.status === 'APPROVED' ? (
                           <Badge variant="success">موافق</Badge>
                         ) : a.status === 'REJECTED' ? (
                           <Badge variant="danger">مرفوض</Badge>
                         ) : (
                           <Badge variant="neutral">تم تخطيه</Badge>
                         )}
                       </td>
                       <td className="muted small" data-label="التاريخ">
                         {a.actionDate ? formatDate(a.actionDate) : '—'}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </section>
         ) : null}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — ContributionsPage (Manager)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/ContributionsPage.tsx",
  `import { useMemo, useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { seesAllTeams } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { ContributionRow } from '@/components/contribution/ContributionRow';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { cx } from '@/lib/format';
   import type { Contribution, ContributionStatus, TeamId } from '@/types';

   const STATUSES: Array<ContributionStatus | 'all'> = [
     'all',
     'pending',
     'approved',
     'rejected',
   ];

   const STATUS_LABEL: Record<string, string> = {
     all: 'الكل',
     pending: 'معلّقة',
     approved: 'معتمدة',
     rejected: 'مرفوضة',
   };

   export function ContributionsPage() {
     const { user } = useAuth();
     const { data, loading } = useCollection<Contribution>('contributions');
     const [status, setStatus] = useState<ContributionStatus | 'all'>('all');
     const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');

     const filtered = useMemo(() => {
       let list = data;

       if (user && !seesAllTeams(user) && user.teamId) {
         list = list.filter((c) => c.teamId === user.teamId);
       }

       return list
         .filter((c) => status === 'all' || c.status === status)
         .filter((c) => teamFilter === 'all' || c.teamId === teamFilter)
         .sort((a, b) => (a.date < b.date ? 1 : -1));
     }, [data, status, teamFilter, user]);

     return (
       <div className="container">
         <PageHeader
           eyebrow="المشاركات"
           title="كل المشاركات"
           description="مراجعة واعتماد مشاركات الأعضاء. كل ساعة = 5 نقاط."
         />

         <div className="chips mb-3">
           {STATUSES.map((s) => (
             <button
               key={s}
               type="button"
               className={cx('chip', status === s && 'is-active')}
               onClick={() => setStatus(s)}
             >
               {STATUS_LABEL[s]}
             </button>
           ))}
         </div>

         <div className="chips mb-4">
           <button
             type="button"
             className={cx('chip', teamFilter === 'all' && 'is-active')}
             onClick={() => setTeamFilter('all')}
           >
             كل الفرق
           </button>
           {teams.map((t) => (
             <button
               key={t.id}
               type="button"
               className={cx('chip', teamFilter === t.id && 'is-active')}
               onClick={() => setTeamFilter(t.id)}
             >
               {t.name}
             </button>
           ))}
         </div>

         <section className="section">
           <SectionHeader
             eyebrow="السجل"
             title={'المشاركات (' + filtered.length + ')'}
           />
           {loading ? (
             <SkeletonList count={6} />
           ) : filtered.length === 0 ? (
             <EmptyState
               icon="📝"
               title="لا مشاركات"
               message="لا توجد مشاركات مطابقة للفلاتر المحددة."
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>العضو</th>
                     <th>الفريق</th>
                     <th>العنوان</th>
                     <th>التاريخ</th>
                     <th>الساعات</th>
                     <th>النقاط</th>
                     <th>الحالة</th>
                   </tr>
                 </thead>
                 <tbody>
                   {filtered.map((c) => (
                     <ContributionRow
                       key={c.id}
                       contribution={c}
                       showMember
                       showTeam
                     />
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — NotificationsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/NotificationsPage.tsx",
  `import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { updateOne } from '@/lib/db';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { NotificationItem } from '@/components/notification/NotificationItem';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { toast } from '@/components/ui/Toast';
   import type { Notification } from '@/types';

   export function NotificationsPage() {
     const { user } = useAuth();
     const { data: notifs, loading } = useRealtimeCollection<Notification>('notifications');

     if (!user) return null;

     const mine = notifs
       .filter((n) => n.userId === user.uid)
       .sort((a, b) => (a.date < b.date ? 1 : -1));

     const unreadCount = mine.filter((n) => !n.read).length;

     const markRead = async (id: string) => {
       try {
         await updateOne('notifications', id, { read: true });
       } catch {
         // silent
       }
     };

     const markAllRead = async () => {
       try {
         for (const n of mine) {
           if (!n.read) {
             await updateOne('notifications', n.id, { read: true });
           }
         }
         toast.success('تم تعليم الكل كمقروء');
       } catch {
         toast.error('فشل التحديث');
       }
     };

     return (
       <div className="container">
         <PageHeader
           eyebrow="الإشعارات"
           title="الإشعارات"
           description={
             unreadCount > 0
               ? 'لديك ' + unreadCount + ' إشعار غير مقروء'
               : 'كل الإشعارات مقروءة'
           }
         >
           {unreadCount > 0 ? (
             <button
               type="button"
               className="btn btn--ghost btn--sm mt-4"
               onClick={markAllRead}
             >
               تعليم الكل كمقروء
             </button>
           ) : null}
         </PageHeader>

         <section className="section">
           {loading ? (
             <SkeletonList count={5} />
           ) : mine.length === 0 ? (
             <EmptyState
               icon="🔔"
               title="لا إشعارات"
               message="لم تتلقَ أي إشعارات حتى الآن. عند حدوث أي نشاط يخصك، ستظهر هنا."
             />
           ) : (
             <div className="stack">
               {mine.map((n) => (
                 <NotificationItem
                   key={n.id}
                   notification={n}
                   onMarkRead={markRead}
                 />
               ))}
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — ConversationsPage (Messenger style)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/ConversationsPage.tsx",
  `import { useMemo, useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { createOne, newId, now } from '@/lib/db';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { ConversationList } from '@/components/chat/ConversationList';
   import { MessageBubble } from '@/components/chat/MessageBubble';
   import { Composer } from '@/components/chat/Composer';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';
   import { toast } from '@/components/ui/Toast';
   import { initials } from '@/lib/format';
   import type { Conversation, Message, AppUser } from '@/types';

   export function ConversationsPage() {
     const { user } = useAuth();
     const { data: conversations, loading: loadingConvs } = useRealtimeCollection<Conversation>('conversations');
     const { data: messages, loading: loadingMsgs } = useRealtimeCollection<Message>('messages');
     const { data: users } = useRealtimeCollection<AppUser>('users');

     const [activeId, setActiveId] = useState<string | null>(null);
     const [mobileShowChat, setMobileShowChat] = useState(false);

     const myConversations = useMemo(() => {
       if (!user) return [];
       return conversations.filter((c) => {
         if (c.type === 'general') return true;
         if (c.type === 'team') return c.teamId === user.teamId;
         return c.participantUids.includes(user.uid);
       });
     }, [conversations, user]);

     // فتح المحادثة العامة افتراضيًا
     const defaultId = useMemo(() => {
       return myConversations.find((c) => c.type === 'general')?.id ?? null;
     }, [myConversations]);

     const currentId = activeId ?? defaultId;
     const active = currentId
       ? myConversations.find((c) => c.id === currentId)
       : null;

     const activeMessages = useMemo(() => {
       if (!currentId) return [];
       return messages
         .filter((m) => m.conversationId === currentId)
         .sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1));
     }, [messages, currentId]);

     if (!user) return null;

     if (loadingConvs || loadingMsgs) {
       return <Loading fullHeight message="جارٍ تحميل المحادثات..." />;
     }

     const getConvName = (): string => {
       if (!active) return '';
       if (active.type === 'general') return 'المحادثة العامة';
       if (active.type === 'team') {
         const team = teams.find((t) => t.id === active.teamId);
         return team ? 'فريق ' + team.nameAr : 'محادثة الفريق';
       }
       const otherUid = active.participantUids.find((uid) => uid !== user.uid);
       const other = users.find((u) => u.uid === otherUid);
       return other ? other.displayName : 'محادثة خاصة';
     };

     const getConvAvatar = (): { text: string; variant: 'general' | 'team' | 'private' } => {
       if (!active) return { text: '?', variant: 'private' };
       if (active.type === 'general') return { text: '🌐', variant: 'general' };
       if (active.type === 'team') {
         const team = teams.find((t) => t.id === active.teamId);
         return { text: team ? team.name.slice(0, 2) : 'FT', variant: 'team' };
       }
       const otherUid = active.participantUids.find((uid) => uid !== user.uid);
       const other = users.find((u) => u.uid === otherUid);
       return { text: other ? initials(other.displayName) : '؟', variant: 'private' };
     };

     const handleSelect = (id: string) => {
       setActiveId(id);
       setMobileShowChat(true);
     };

     const handleBack = () => {
       setMobileShowChat(false);
     };

     const sendMessage = async (text: string) => {
       if (!currentId || !user) return;
       const myMember = members.find((m) => m.id === user.memberId);

       const msg: Message = {
         id: newId('MSG'),
         conversationId: currentId,
         senderUid: user.uid,
         senderName: myMember?.name ?? user.displayName,
         text,
         sentAt: now(),
       };

       try {
         await createOne('messages', msg);
         await createOne('conversations', {
           id: currentId,
           lastMessageAt: now(),
           lastMessageText: text,
           lastMessageSender: myMember?.name ?? user.displayName,
         });
       } catch (err) {
         const m = err instanceof Error ? err.message : 'فشل الإرسال';
         toast.error('فشل الإرسال', m);
       }
     };

     const avatarInfo = getConvAvatar();

     return (
       <div className="container" style={{ paddingTop: 12 }}>
         <div className="chat-layout">
           {/* ═══════ Conversations List ═══════ */}
           <div
             className={
               'chat-sidebar' + (mobileShowChat ? ' is-hidden show-desktop' : '')
             }
           >
             <div className="chat-sidebar__head">
               <div className="chat-sidebar__title">المحادثات</div>
             </div>
             <ConversationList
               conversations={myConversations}
               activeId={currentId ?? undefined}
               currentUser={user}
               users={users}
               onSelect={handleSelect}
             />
           </div>

           {/* ═══════ Chat Panel ═══════ */}
           <div
             className={
               'chat-panel' + (!mobileShowChat ? ' is-hidden show-desktop' : '')
             }
           >
             {!active ? (
               <div className="chat-panel__empty">
                 <div className="chat-panel__empty-icon">💬</div>
                 <div style={{ fontWeight: 700, marginBottom: 6 }}>
                   اختر محادثة
                 </div>
                 <div className="small muted">
                   اختر محادثة من القائمة لبدء التواصل
                 </div>
               </div>
             ) : (
               <>
                 <div className="chat-header">
                   <button
                     type="button"
                     className="chat-header__back"
                     onClick={handleBack}
                     aria-label="رجوع"
                   >
                     ‹
                   </button>
                   <div
                     className={
                       'chat-conv__avatar chat-conv__avatar--' + avatarInfo.variant
                     }
                     style={{ width: 40, height: 40, fontSize: '0.85rem' }}
                     aria-hidden="true"
                   >
                     {avatarInfo.text}
                   </div>
                   <div className="chat-header__info">
                     <div className="chat-header__title">{getConvName()}</div>
                     <div className="chat-header__sub">
                       {active.type === 'general'
                         ? 'الجميع'
                         : active.type === 'team'
                           ? 'فريق'
                           : 'محادثة خاصة'}
                     </div>
                   </div>
                 </div>

                 <div className="chat-messages">
                   {activeMessages.length === 0 ? (
                     <EmptyState
                       icon="💬"
                       title="ابدأ المحادثة"
                       message="لا رسائل بعد. كن أول من يكتب."
                     />
                   ) : (
                     activeMessages.map((m) => (
                       <MessageBubble
                         key={m.id}
                         message={m}
                         currentUser={user}
                       />
                     ))
                   )}
                 </div>

                 <Composer onSend={sendMessage} />
               </>
             )}
           </div>
         </div>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — CalendarPage (Real Calendar)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/CalendarPage.tsx",
  `import { useMemo, useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { seesAllTeams } from '@/lib/permissions';
   import { CalendarGrid } from '@/components/calendar/CalendarGrid';
   import { EventCard } from '@/components/calendar/EventCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';
   import { formatDate } from '@/lib/format';
   import type { CalendarEvent } from '@/types';

   export function CalendarPage() {
     const { user } = useAuth();
     const { data: allEvents, loading } = useRealtimeCollection<CalendarEvent>('calendar');

     const today = new Date();
     const [year, setYear] = useState(today.getFullYear());
     const [month, setMonth] = useState(today.getMonth());
     const [selectedDate, setSelectedDate] = useState<string | null>(
       today.toISOString().slice(0, 10),
     );

     const visibleEvents = useMemo(() => {
       if (!user) return [];
       return allEvents.filter((e) => {
         if (e.isPublic) return true;
         if (seesAllTeams(user)) return true;
         return e.teamId === user.teamId;
       });
     }, [allEvents, user]);

     const eventsByMonth = useMemo(() => {
       return visibleEvents.filter((e) => {
         const d = new Date(e.date);
         return d.getFullYear() === year && d.getMonth() === month;
       });
     }, [visibleEvents, year, month]);

     const selectedEvents = useMemo(() => {
       if (!selectedDate) return [];
       return visibleEvents
         .filter((e) => e.date === selectedDate)
         .sort((a, b) => (a.time || '') > (b.time || '') ? 1 : -1);
     }, [visibleEvents, selectedDate]);

     const prevMonth = () => {
       if (month === 0) {
         setMonth(11);
         setYear(year - 1);
       } else {
         setMonth(month - 1);
       }
     };

     const nextMonth = () => {
       if (month === 11) {
         setMonth(0);
         setYear(year + 1);
       } else {
         setMonth(month + 1);
       }
     };

     if (loading) return <Loading fullHeight message="جارٍ تحميل التقويم..." />;

     if (!user) return null;

     return (
       <div className="container">
         <PageHeader
           eyebrow="المواعيد"
           title="التقويم"
           description="الأحداث العامة وأحداث فريقك."
         />

         <section className="section">
           <CalendarGrid
             year={year}
             month={month}
             events={eventsByMonth}
             selectedDate={selectedDate ?? undefined}
             onSelectDate={setSelectedDate}
             onPrevMonth={prevMonth}
             onNextMonth={nextMonth}
           />
         </section>

         <section className="section">
           <SectionHeader
             eyebrow={selectedDate ? formatDate(selectedDate) : ''}
             title={
               selectedEvents.length === 0
                 ? 'لا أحداث'
                 : 'الأحداث (' + selectedEvents.length + ')'
             }
           />
           {selectedEvents.length === 0 ? (
             <EmptyState
               icon="📅"
               title="لا أحداث في هذا اليوم"
               message="اختر يومًا آخر من التقويم."
             />
           ) : (
             <div className="stack">
               {selectedEvents.map((e) => (
                 <EventCard key={e.id} event={e} />
               ))}
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — ReportsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/ReportsPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Loading } from '@/components/ui/Loading';
   import type { RequestRecord, Contribution, Member } from '@/types';

   export function ReportsPage() {
     const { data: requests, loading: loadingR } = useCollection<RequestRecord>('requests');
     const { data: contributions, loading: loadingC } = useCollection<Contribution>('contributions');
     const { data: liveMembers, loading: loadingM } = useCollection<Member>('members');

     if (loadingR || loadingC || loadingM) {
       return <Loading fullHeight message="جارٍ تحميل التقارير..." />;
     }

     const allMembers = liveMembers.length > 0 ? liveMembers : members;

     const totalHours = contributions
       .filter((c) => c.status === 'approved')
       .reduce((s, c) => s + c.hours, 0);
     const totalPoints = hoursToPoints(totalHours);

     const byStatus: Record<string, number> = {};
     requests.forEach((r) => {
       byStatus[r.status] = (byStatus[r.status] || 0) + 1;
     });

     const byType: Record<string, number> = {};
     requests.forEach((r) => {
       byType[r.type] = (byType[r.type] || 0) + 1;
     });

     const teamStats = teams.map((t) => {
       const teamMembers = allMembers.filter((m) => m.teamIds.includes(t.id));
       const hours = teamMembers.reduce((s, m) => s + (m.hours || 0), 0);
       return { team: t, memberCount: teamMembers.length, hours, points: hoursToPoints(hours) };
     }).sort((a, b) => b.points - a.points);

     const committeeStats = committees.map((c) => {
       const committeeMembers = allMembers.filter((m) =>
         m.committeeIds.includes(c.id),
       );
       const hours = committeeMembers.reduce((s, m) => s + (m.hours || 0), 0);
       return {
         committee: c,
         memberCount: committeeMembers.length,
         hours,
         points: hoursToPoints(hours),
       };
     }).sort((a, b) => b.points - a.points);

     return (
       <div className="container">
         <PageHeader
           eyebrow="التقارير"
           title="التقارير"
           description="ملخصات شاملة لكل الأنشطة."
         />

         <section className="section">
           <StatRow>
             <Stat value={allMembers.length} label="الأعضاء" />
             <Stat value={totalPoints} label="النقاط" />
             <Stat value={totalHours} label="الساعات" />
             <Stat value={requests.length} label="الطلبات" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الفرق" title="إحصائيات الفرق" />
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>الفريق</th>
                   <th>الأعضاء</th>
                   <th>الساعات</th>
                   <th>النقاط</th>
                 </tr>
               </thead>
               <tbody>
                 {teamStats.map((s) => (
                   <tr key={s.team.id}>
                     <td data-label="الفريق">{s.team.name}</td>
                     <td data-label="الأعضاء">{s.memberCount}</td>
                     <td
                       style={{ fontFamily: 'var(--font-en)' }}
                       data-label="الساعات"
                     >
                       {s.hours}
                     </td>
                     <td className="points" data-label="النقاط">
                       {s.points}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="اللجان" title="إحصائيات اللجان" />
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>اللجنة</th>
                   <th>الأعضاء</th>
                   <th>الساعات</th>
                   <th>النقاط</th>
                 </tr>
               </thead>
               <tbody>
                 {committeeStats.map((s) => (
                   <tr key={s.committee.id}>
                     <td data-label="اللجنة">
                       {s.committee.icon} {s.committee.nameAr}
                     </td>
                     <td data-label="الأعضاء">{s.memberCount}</td>
                     <td
                       style={{ fontFamily: 'var(--font-en)' }}
                       data-label="الساعات"
                     >
                       {s.hours}
                     </td>
                     <td className="points" data-label="النقاط">
                       {s.points}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الطلبات" title="حسب الحالة" />
           <div className="grid grid--narrow">
             {Object.entries(byStatus).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__title">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.6rem',
                     fontWeight: 800,
                     color: 'var(--c-red)',
                     marginTop: 8,
                   }}
                 >
                   {v}
                 </div>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الطلبات" title="حسب النوع" />
           <div className="grid grid--narrow">
             {Object.entries(byType).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__title">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.6rem',
                     fontWeight: 800,
                     color: 'var(--c-navy)',
                     marginTop: 8,
                   }}
                 >
                   {v}
                 </div>
               </div>
             ))}
           </div>
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DASHBOARD — AuditPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/AuditPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { formatDateTime } from '@/lib/format';
   import type { AuditRecord } from '@/types';

   export function AuditPage() {
     const { data, loading } = useCollection<AuditRecord>('audit');
     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 50);

     return (
       <div className="container">
         <PageHeader
           eyebrow="السجل"
           title="سجل التغييرات"
           description="كل الإجراءات الإدارية موثّقة هنا."
         />

         <section className="section">
           {loading ? (
             <SkeletonList count={6} />
           ) : sorted.length === 0 ? (
             <EmptyState
               icon="📜"
               title="لا أحداث"
               message="لم يتم تسجيل أي إجراءات إدارية بعد."
             />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead>
                   <tr>
                     <th>التاريخ</th>
                     <th>المستخدم</th>
                     <th>الإجراء</th>
                     <th>الوصف</th>
                   </tr>
                 </thead>
                 <tbody>
                   {sorted.map((a) => (
                     <tr key={a.id}>
                       <td className="muted small nowrap" data-label="التاريخ">
                         {formatDateTime(a.date)}
                       </td>
                       <td data-label="المستخدم" style={{ fontWeight: 700 }}>
                         {a.actorName}
                       </td>
                       <td data-label="الإجراء">
                         <span className="badge badge--neutral">{a.action}</span>
                       </td>
                       <td data-label="الوصف">{a.description}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

console.log("  ✓ Part 8 loaded: Dashboard pages");
/* ═══════════════════════════════════════════════════════════════
   ADMIN — AdminHomePage
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminHomePage.tsx",
  `import { Link } from 'react-router-dom';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { seedAll, type SeedResult } from '@/lib/seed';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';
   import { useState } from 'react';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { toast } from '@/components/ui/Toast';
   import type {
     AppUser,
     RequestRecord,
     Contribution,
     Notification,
     Member,
   } from '@/types';

   interface AdminCard {
     to: string;
     title: string;
     icon: string;
     count?: number;
     description: string;
   }

   export function AdminHomePage() {
     const { data: users } = useRealtimeCollection<AppUser>('users');
     const { data: liveMembers } = useRealtimeCollection<Member>('members');
     const { data: requests } = useRealtimeCollection<RequestRecord>('requests');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');

     const [seeding, setSeeding] = useState(false);
     const [result, setResult] = useState<SeedResult | null>(null);

     const allMembers = liveMembers.length > 0 ? liveMembers : members;

     const pendingReq = requests.filter(
       (r) => r.status === 'PENDING' || r.status === 'IN_REVIEW',
     ).length;

     const pendingContribs = contributions.filter(
       (c) => c.status === 'pending',
     ).length;

     const totalPoints = allMembers.reduce(
       (s, m) => s + hoursToPoints(m.hours || 0),
       0,
     );

     const onSeed = async () => {
       if (!window.confirm('سيتم رفع البيانات الأساسية إلى Firestore. متابعة؟')) {
         return;
       }
       setSeeding(true);
       try {
         const r = await seedAll();
         setResult(r);
         toast.success('تم رفع البيانات بنجاح');
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل الرفع';
         toast.error('فشل الرفع', msg);
       } finally {
         setSeeding(false);
       }
     };

     const cards: AdminCard[] = [
       {
         to: '/admin/analytics',
         title: 'التحليلات',
         icon: '📊',
         description: 'نظرة شاملة على الإحصائيات',
       },
       {
         to: '/admin/requests',
         title: 'الطلبات',
         icon: '📋',
         count: pendingReq,
         description: 'إدارة كل الطلبات',
       },
       {
         to: '/admin/users',
         title: 'المستخدمون',
         icon: '👤',
         count: users.length,
         description: 'الحسابات والأدوار',
       },
       {
         to: '/admin/members',
         title: 'الأعضاء',
         icon: '👥',
         count: allMembers.length,
         description: 'إدارة بيانات الأعضاء',
       },
       {
         to: '/admin/contributions',
         title: 'المشاركات',
         icon: '📝',
         count: pendingContribs,
         description: 'اعتماد مشاركات الأعضاء',
       },
       {
         to: '/admin/committees',
         title: 'اللجان',
         icon: '🏛️',
         count: committees.length,
         description: 'إدارة اللجان وتوزيع الأعضاء',
       },
       {
         to: '/admin/achievements',
         title: 'الإنجازات',
         icon: '🏆',
         description: 'إدارة الإنجازات',
       },
       {
         to: '/admin/warnings',
         title: 'التحذيرات',
         icon: '⚠️',
         description: 'إصدار ومتابعة التحذيرات',
       },
       {
         to: '/admin/calendar',
         title: 'التقويم',
         icon: '📅',
         description: 'إدارة الأحداث',
       },
       {
         to: '/admin/conversations',
         title: 'المحادثات',
         icon: '💬',
         description: 'إدارة المحادثات الجماعية',
       },
       {
         to: '/admin/notifications',
         title: 'إرسال إشعار',
         icon: '🔔',
         count: notifs.length,
         description: 'إرسال إشعارات جماعية',
       },
       {
         to: '/admin/audit',
         title: 'سجل التغييرات',
         icon: '📜',
         description: 'تتبع كل الإجراءات',
       },
     ];

     return (
       <div>
         <PageHeader
           eyebrow="لوحة الإدارة"
           title="مرحبًا"
           description="تحكم كامل بالمحتوى والأعضاء والطلبات."
         />

         <section className="section--tight">
           <StatRow>
             <Stat value={users.length} label="المستخدمون" />
             <Stat value={allMembers.length} label="الأعضاء" />
             <Stat value={pendingReq} label="طلبات معلّقة" variant="red" />
             <Stat value={pendingContribs} label="مشاركات معلّقة" variant="amber" />
             <Stat value={totalPoints} label="مجموع النقاط" />
             <Stat value={notifs.length} label="الإشعارات" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="التهيئة"
             title="رفع البيانات الأساسية"
             description="لمرة واحدة فقط — إن كانت Firestore فارغة."
             action={
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={onSeed}
                 disabled={seeding}
               >
                 {seeding ? 'جارٍ الرفع...' : 'رفع البيانات'}
               </button>
             }
           />
           {result ? (
             <div className="card no-click mt-4">
               <div className="card__title">✓ تم الرفع بنجاح</div>
               <div
                 className="small muted mt-2"
                 style={{ lineHeight: 1.9 }}
               >
                 أعضاء: {result.members} · فرق: {result.teams} · مشاركات: {result.contributions} ·
                 طلبات: {result.requests} · موافقات: {result.approvals} · تحذيرات: {result.warnings} ·
                 إنجازات: {result.achievements} · إشعارات: {result.notifications} ·
                 محادثات: {result.conversations} · رسائل: {result.messages}
               </div>
             </div>
           ) : null}
         </section>

         <section className="section">
           <SectionHeader eyebrow="الأقسام" title="روابط سريعة" />
           <div className="grid grid--wide">
             {cards.map((c) => (
               <Link key={c.to} to={c.to} className="card">
                 <div className="row row--between">
                   <div className="row" style={{ gap: 10 }}>
                     <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
                     <div className="card__title">{c.title}</div>
                   </div>
                   {c.count !== undefined && c.count > 0 ? (
                     <span className="badge badge--red">{c.count}</span>
                   ) : null}
                 </div>
                 <div className="card__meta mt-2">{c.description}</div>
               </Link>
             ))}
           </div>
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminUsersPage (إنشاء حساب من الإدارة)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminUsersPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { adminCreateMember, type CreateMemberInput } from '@/lib/auth';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import {
     FormField,
     TextInput,
     Select,
     MultiSelect,
   } from '@/components/ui/FormField';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import type { AppUser, RoleId, TeamId } from '@/types';

   const ROLE_OPTIONS: Array<{ value: RoleId; label: string }> = (
     Object.entries(ROLE_LABEL) as Array<[RoleId, string]>
   ).map(([value, label]) => ({ value, label }));

   function generatePassword(): string {
     const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
     let pass = '';
     for (let i = 0; i < 10; i += 1) {
       pass += chars.charAt(Math.floor(Math.random() * chars.length));
     }
     return pass + '@1';
   }

   export function AdminUsersPage() {
     const { user: me } = useAuth();
     const { data: users, loading } = useCollection<AppUser>('users');

     const [openCreate, setOpenCreate] = useState(false);
     const [openEdit, setOpenEdit] = useState<AppUser | null>(null);
     const [toDelete, setToDelete] = useState<string | null>(null);
     const [busy, setBusy] = useState(false);

     // Form state
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState(generatePassword());
     const [name, setName] = useState('');
     const [role, setRole] = useState<RoleId>('MEMBER');
     const [teamId, setTeamId] = useState<TeamId>('helpers');
     const [committeeIds, setCommitteeIds] = useState<string[]>([]);
     const [bio, setBio] = useState('');
     const [createdAccount, setCreatedAccount] = useState<{
       email: string;
       password: string;
       name: string;
     } | null>(null);

     const resetForm = () => {
       setEmail('');
       setPassword(generatePassword());
       setName('');
       setRole('MEMBER');
       setTeamId('helpers');
       setCommitteeIds([]);
       setBio('');
     };

     const handleCreate = async () => {
       if (!email.trim() || !password || !name.trim()) {
         toast.error('البيانات ناقصة', 'البريد، كلمة المرور، والاسم مطلوبة');
         return;
       }
       if (password.length < 6) {
         toast.error('كلمة المرور ضعيفة', 'يجب 6 أحرف على الأقل');
         return;
       }
       setBusy(true);
       try {
         const input: CreateMemberInput = {
           email: email.trim(),
           temporaryPassword: password,
           name: name.trim(),
           role,
           teamIds: [teamId],
           committeeIds,
           bio: bio.trim() || undefined,
         };

         await adminCreateMember(input, me?.uid ?? 'system');
         await logAudit(me, 'CREATE_USER', 'User', email, 'إنشاء حساب: ' + name);

         setCreatedAccount({
           email: input.email,
           password: input.temporaryPassword,
           name: input.name,
         });

         toast.success(
           'تم إنشاء الحساب',
           'أرسل بيانات الدخول للعضو',
         );
         resetForm();
         setOpenCreate(false);
       } catch (err) {
         const msg = err instanceof Error ? err.message : 'فشل الإنشاء';
         toast.error('فشل الإنشاء', msg);
       } finally {
         setBusy(false);
       }
     };

     const changeRole = async (uid: string, newRole: RoleId) => {
       try {
         await updateOne('users', uid, { role: newRole });
         await logAudit(me, 'CHANGE_ROLE', 'User', uid, 'تغيير الدور إلى ' + newRole);
         toast.success('تم تغيير الدور');
       } catch {
         toast.error('فشل التغيير');
       }
     };

     const changeTeam = async (uid: string, newTeam: TeamId) => {
       try {
         await updateOne('users', uid, { teamId: newTeam });
         await logAudit(me, 'CHANGE_TEAM', 'User', uid, 'تغيير الفريق إلى ' + newTeam);
         toast.success('تم تغيير الفريق');
       } catch {
         toast.error('فشل التغيير');
       }
     };

     const linkMember = async (uid: string, memberId: string) => {
       try {
         await updateOne('users', uid, { memberId: memberId || null });
         if (memberId) {
           await updateOne('members', memberId, { linkedUserId: uid });
         }
         await logAudit(me, 'LINK_MEMBER', 'User', uid, 'ربط عضو');
         toast.success('تم الربط');
       } catch {
         toast.error('فشل الربط');
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('users', toDelete);
         await logAudit(me, 'DELETE_USER', 'User', toDelete, 'حذف مستخدم');
         toast.success('تم الحذف');
         setToDelete(null);
       } catch {
         toast.error('فشل الحذف');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="المستخدمون"
           description="إنشاء الحسابات، تغيير الأدوار، وربط الأعضاء."
         />

         <SectionHeader
           eyebrow="القائمة"
           title={'المستخدمون (' + users.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={() => {
                 resetForm();
                 setOpenCreate(true);
               }}
             >
               + مستخدم جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={6} />
         ) : users.length === 0 ? (
           <EmptyState
             icon="👤"
             title="لا مستخدمين"
             message="ابدأ بإنشاء أول مستخدم."
           />
         ) : (
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>الاسم</th>
                   <th>البريد</th>
                   <th>الدور</th>
                   <th>الفريق</th>
                   <th>العضو</th>
                   <th>إجراءات</th>
                 </tr>
               </thead>
               <tbody>
                 {users.map((u) => (
                   <tr key={u.uid}>
                     <td data-label="الاسم" style={{ fontWeight: 700 }}>
                       {u.displayName}
                       {u.mustChangePassword ? (
                         <Badge variant="warning" className="mt-2">جديد</Badge>
                       ) : null}
                     </td>
                     <td className="muted small" data-label="البريد" dir="ltr">
                       {u.email}
                     </td>
                     <td data-label="الدور">
                       <select
                         className="input"
                         value={u.role}
                         onChange={(e) =>
                           changeRole(u.uid, e.target.value as RoleId)
                         }
                         style={{ minWidth: 140 }}
                       >
                         {ROLE_OPTIONS.map((o) => (
                           <option key={o.value} value={o.value}>
                             {o.label}
                           </option>
                         ))}
                       </select>
                     </td>
                     <td data-label="الفريق">
                       <select
                         className="input"
                         value={u.teamId ?? ''}
                         onChange={(e) =>
                           changeTeam(u.uid, e.target.value as TeamId)
                         }
                         style={{ minWidth: 120 }}
                       >
                         <option value="">— بدون —</option>
                         {teams.map((t) => (
                           <option key={t.id} value={t.id}>
                             {t.name}
                           </option>
                         ))}
                       </select>
                     </td>
                     <td data-label="العضو">
                       <select
                         className="input"
                         value={u.memberId ?? ''}
                         onChange={(e) => linkMember(u.uid, e.target.value)}
                         style={{ minWidth: 140 }}
                       >
                         <option value="">— غير مرتبط —</option>
                         {members.map((m) => (
                           <option key={m.id} value={m.id}>
                             {m.name}
                           </option>
                         ))}
                       </select>
                     </td>
                     <td data-label="إجراءات">
                       <div style={{ display: 'flex', gap: 4 }}>
                         <button
                           type="button"
                           className="btn btn--ghost btn--xs"
                           onClick={() => setOpenEdit(u)}
                         >
                           تفاصيل
                         </button>
                         <button
                           type="button"
                           className="btn btn--danger btn--xs"
                           onClick={() => setToDelete(u.uid)}
                         >
                           حذف
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}

         {/* Create Modal */}
         <Modal
           open={openCreate}
           title="إنشاء مستخدم جديد"
           onClose={() => setOpenCreate(false)}
           wide
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() => setOpenCreate(false)}
               >
                 إلغاء
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={handleCreate}
                 disabled={busy}
               >
                 {busy ? '...' : 'إنشاء'}
               </button>
             </>
           }
         >
           <FormField label="الاسم الكامل" required>
             <TextInput
               value={name}
               onChange={setName}
               placeholder="مثال: أحمد محمد"
             />
           </FormField>

           <FormField label="البريد الإلكتروني" required>
             <TextInput
               value={email}
               onChange={setEmail}
               type="email"
               placeholder="name@resala-stem.org"
             />
           </FormField>

           <FormField
             label="كلمة المرور المؤقتة"
             required
             hint="سيُطلب من العضو تغييرها عند أول دخول"
           >
             <div style={{ display: 'flex', gap: 8 }}>
               <TextInput
                 value={password}
                 onChange={setPassword}
                 type="text"
               />
               <button
                 type="button"
                 className="btn btn--ghost btn--sm"
                 onClick={() => setPassword(generatePassword())}
               >
                 توليد
               </button>
             </div>
           </FormField>

           <FormField label="الدور" required>
             <Select
               value={role}
               onChange={(v) => setRole(v as RoleId)}
               options={ROLE_OPTIONS}
             />
           </FormField>

           <FormField label="الفريق" required>
             <Select
               value={teamId}
               onChange={(v) => setTeamId(v as TeamId)}
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField label="اللجان">
             <MultiSelect
               values={committeeIds}
               onChange={setCommitteeIds}
               options={committees.map((c) => ({
                 value: c.id,
                 label: c.icon + ' ' + c.nameAr,
               }))}
             />
           </FormField>

           <FormField label="نبذة قصيرة">
             <TextInput
               value={bio}
               onChange={setBio}
               placeholder="مثال: مطور واجهات"
             />
           </FormField>
         </Modal>

         {/* Show created account info */}
         <Modal
           open={createdAccount !== null}
           title="✓ تم إنشاء الحساب"
           onClose={() => setCreatedAccount(null)}
           footer={
             <button
               type="button"
               className="btn btn--primary"
               onClick={() => setCreatedAccount(null)}
             >
               فهمت
             </button>
           }
         >
           <p style={{ lineHeight: 1.8, marginBottom: 16 }}>
             أرسل بيانات الدخول التالية إلى العضو:
           </p>
           <div
             style={{
               background: 'var(--c-off-white)',
               border: '1px solid var(--c-line)',
               borderRadius: 'var(--radius-sm)',
               padding: 16,
               fontSize: '0.9rem',
               lineHeight: 2,
             }}
           >
             <div>
               <strong>الاسم:</strong> {createdAccount?.name}
             </div>
             <div style={{ wordBreak: 'break-all' }}>
               <strong>البريد:</strong>{' '}
               <span dir="ltr">{createdAccount?.email}</span>
             </div>
             <div style={{ wordBreak: 'break-all' }}>
               <strong>كلمة المرور:</strong>{' '}
               <span dir="ltr" style={{ fontFamily: 'var(--font-en)' }}>
                 {createdAccount?.password}
               </span>
             </div>
           </div>
           <p
             style={{
               fontSize: '0.82rem',
               color: 'var(--c-ink-muted)',
               marginTop: 16,
               lineHeight: 1.7,
             }}
           >
             ⚠️ سيُطلب من العضو تغيير كلمة المرور عند أول تسجيل دخول. احفظ هذه
             البيانات في مكان آمن قبل الإغلاق.
           </p>
         </Modal>

         {/* Edit Modal */}
         <Modal
           open={openEdit !== null}
           title={'تفاصيل المستخدم'}
           onClose={() => setOpenEdit(null)}
         >
           {openEdit ? (
             <>
               <div className="kv">
                 <span className="kv__k">الاسم</span>
                 <span className="kv__v">{openEdit.displayName}</span>
               </div>
               <div className="kv mt-3">
                 <span className="kv__k">البريد</span>
                 <span className="kv__v" dir="ltr">
                   {openEdit.email}
                 </span>
               </div>
               <div className="kv mt-3">
                 <span className="kv__k">الدور</span>
                 <span className="kv__v">{ROLE_LABEL[openEdit.role]}</span>
               </div>
               {openEdit.teamId ? (
                 <div className="kv mt-3">
                   <span className="kv__k">الفريق</span>
                   <span className="kv__v">
                     {teams.find((t) => t.id === openEdit.teamId)?.name}
                   </span>
                 </div>
               ) : null}
               {openEdit.memberId ? (
                 <div className="kv mt-3">
                   <span className="kv__k">العضو المرتبط</span>
                   <span className="kv__v">
                     {members.find((m) => m.id === openEdit.memberId)?.name}
                   </span>
                 </div>
               ) : null}
             </>
           ) : null}
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف المستخدم"
           message="هل أنت متأكد؟ لا يمكن التراجع عن هذه العملية."
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminMembersPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminMembersPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import {
     FormField,
     TextInput,
     NumberInput,
     TextArea,
     Select,
     MultiSelect,
   } from '@/components/ui/FormField';
   import { Avatar } from '@/components/ui/Avatar';
   import { toast } from '@/components/ui/Toast';
   import type { Member, RoleId, TeamId } from '@/types';

   const ROLE_OPTIONS = Object.entries(ROLE_LABEL).map(([value, label]) => ({
     value,
     label,
   }));

   const EMPTY_MEMBER: Omit<Member, 'id'> = {
     name: '',
     role: 'MEMBER',
     teamIds: [],
     committeeIds: [],
     joinedSeason: 7,
     hours: 0,
     status: 'active',
     bio: '',
     email: '',
   };

   export function AdminMembersPage() {
     const { user: me } = useAuth();
     const { data: members, loading } = useCollection<Member>('members');

     const [editing, setEditing] = useState<Member | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<Member, 'id'>>(EMPTY_MEMBER);
     const [toDelete, setToDelete] = useState<Member | null>(null);
     const [busy, setBusy] = useState(false);
     const [search, setSearch] = useState('');

     const filtered = members.filter(
       (m) => !search.trim() || m.name.includes(search.trim()),
     );

     const openCreate = () => {
       setForm(EMPTY_MEMBER);
       setCreating(true);
       setEditing(null);
     };

     const openEdit = (m: Member) => {
       setForm({
         name: m.name,
         role: m.role,
         teamIds: m.teamIds,
         committeeIds: m.committeeIds,
         joinedSeason: m.joinedSeason,
         hours: m.hours,
         status: m.status,
         bio: m.bio || '',
         email: m.email || '',
       });
       setEditing(m);
       setCreating(false);
     };

     const close = () => {
       setCreating(false);
       setEditing(null);
     };

     const save = async () => {
       if (!form.name.trim()) {
         toast.error('الاسم مطلوب');
         return;
       }
       if (form.teamIds.length === 0) {
         toast.error('يجب اختيار فريق واحد على الأقل');
         return;
       }
       setBusy(true);
       try {
         if (editing) {
           await updateOne('members', editing.id, form);
           await logAudit(me, 'UPDATE_MEMBER', 'Member', editing.id, form.name);
           toast.success('تم التحديث');
         } else {
           const id = 'M-' + Date.now().toString(36).toUpperCase();
           await createOne('members', { id, ...form });
           await logAudit(me, 'CREATE_MEMBER', 'Member', id, form.name);
           toast.success('تم الإضافة');
         }
         close();
       } catch {
         toast.error('فشل الحفظ');
       } finally {
         setBusy(false);
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('members', toDelete.id);
         await logAudit(me, 'DELETE_MEMBER', 'Member', toDelete.id, toDelete.name);
         toast.success('تم الحذف');
         setToDelete(null);
       } catch {
         toast.error('فشل الحذف');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="الأعضاء"
           description="إضافة وتعديل وحذف بيانات الأعضاء."
         />

         <div className="toolbar">
           <input
             className="input"
             type="search"
             placeholder="ابحث..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
         </div>

         <SectionHeader
           eyebrow="القائمة"
           title={'الأعضاء (' + filtered.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={openCreate}
             >
               + عضو جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={6} />
         ) : filtered.length === 0 ? (
           <EmptyState
             icon="👥"
             title="لا أعضاء"
             message="لم يتم العثور على أعضاء."
           />
         ) : (
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>الاسم</th>
                   <th>الدور</th>
                   <th>الفرق</th>
                   <th>الساعات</th>
                   <th>النقاط</th>
                   <th>إجراءات</th>
                 </tr>
               </thead>
               <tbody>
                 {filtered.map((m) => {
                   const memberTeams = teams.filter((t) =>
                     m.teamIds.includes(t.id),
                   );
                   return (
                     <tr key={m.id}>
                       <td data-label="الاسم">
                         <div
                           style={{
                             display: 'flex',
                             alignItems: 'center',
                             gap: 10,
                           }}
                         >
                           <Avatar name={m.name} size={30} variant="navy" />
                           <span style={{ fontWeight: 700 }}>{m.name}</span>
                         </div>
                       </td>
                       <td className="muted small" data-label="الدور">
                         {ROLE_LABEL[m.role]}
                       </td>
                       <td data-label="الفرق">
                         <div
                           style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}
                         >
                           {memberTeams.map((t) => (
                             <span key={t.id} className="badge">
                               {t.name}
                             </span>
                           ))}
                         </div>
                       </td>
                       <td
                         style={{ fontFamily: 'var(--font-en)' }}
                         data-label="الساعات"
                       >
                         {m.hours}
                       </td>
                       <td className="points" data-label="النقاط">
                         {hoursToPoints(m.hours)}
                       </td>
                       <td data-label="إجراءات">
                         <div style={{ display: 'flex', gap: 4 }}>
                           <button
                             type="button"
                             className="btn btn--ghost btn--xs"
                             onClick={() => openEdit(m)}
                           >
                             تعديل
                           </button>
                           <button
                             type="button"
                             className="btn btn--danger btn--xs"
                             onClick={() => setToDelete(m)}
                           >
                             حذف
                           </button>
                         </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
         )}

         <Modal
           open={creating || editing !== null}
           title={editing ? 'تعديل عضو' : 'إضافة عضو'}
           onClose={close}
           wide
           footer={
             <>
               <button type="button" className="btn btn--ghost" onClick={close}>
                 إلغاء
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={save}
                 disabled={busy}
               >
                 {busy ? '...' : 'حفظ'}
               </button>
             </>
           }
         >
           <FormField label="الاسم الكامل" required>
             <TextInput
               value={form.name}
               onChange={(v) => setForm({ ...form, name: v })}
               placeholder="الاسم الحقيقي"
             />
           </FormField>

           <FormField label="البريد الإلكتروني">
             <TextInput
               value={form.email || ''}
               onChange={(v) => setForm({ ...form, email: v })}
               type="email"
             />
           </FormField>

           <FormField label="الدور" required>
             <Select
               value={form.role}
               onChange={(v) => setForm({ ...form, role: v as RoleId })}
               options={ROLE_OPTIONS}
             />
           </FormField>

           <FormField label="الفرق" required>
             <MultiSelect
               values={form.teamIds}
               onChange={(v) =>
                 setForm({ ...form, teamIds: v as TeamId[] })
               }
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField label="اللجان">
             <MultiSelect
               values={form.committeeIds}
               onChange={(v) => setForm({ ...form, committeeIds: v })}
               options={committees.map((c) => ({
                 value: c.id,
                 label: c.icon + ' ' + c.nameAr,
               }))}
             />
           </FormField>

           <FormField label="الساعات">
             <NumberInput
               value={form.hours}
               onChange={(v) => setForm({ ...form, hours: v })}
               min={0}
             />
           </FormField>

           <FormField label="الحالة">
             <Select
               value={form.status}
               onChange={(v) =>
                 setForm({
                   ...form,
                   status: v as 'active' | 'inactive' | 'suspended',
                 })
               }
               options={[
                 { value: 'active', label: 'نشط' },
                 { value: 'inactive', label: 'غير نشط' },
                 { value: 'suspended', label: 'موقوف' },
               ]}
             />
           </FormField>

           <FormField label="نبذة">
             <TextArea
               value={form.bio || ''}
               onChange={(v) => setForm({ ...form, bio: v })}
               rows={2}
             />
           </FormField>
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف العضو"
           message={
             'سيتم حذف "' + (toDelete?.name || '') + '". هل أنت متأكد؟'
           }
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminContributionsPage (موافقة بضغطة)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminContributionsPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { notifyUser } from '@/lib/notifications';
   import { teams } from '@/data/teams';
   import { hoursToPoints, formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { toast } from '@/components/ui/Toast';
   import { cx } from '@/lib/format';
   import type { Contribution, ContributionStatus } from '@/types';

   const STATUS_LABEL: Record<string, string> = {
     all: 'الكل',
     pending: 'معلّقة',
     approved: 'معتمدة',
     rejected: 'مرفوضة',
   };

   export function AdminContributionsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<Contribution>('contributions');
     const [status, setStatus] = useState<ContributionStatus | 'all'>('pending');
     const [toDelete, setToDelete] = useState<Contribution | null>(null);
     const [busy, setBusy] = useState(false);

     const filtered = data
       .filter((c) => status === 'all' || c.status === status)
       .sort((a, b) => (a.date < b.date ? 1 : -1));

     const approve = async (c: Contribution) => {
       try {
         await updateOne('contributions', c.id, { status: 'approved' });
         await logAudit(me, 'APPROVE_CONTRIBUTION', 'Contribution', c.id, c.title);
         await notifyUser(
           c.createdBy,
           'تم اعتماد مشاركتك',
           '"' + c.title + '" — +' + hoursToPoints(c.hours) + ' نقطة',
           'participation',
           '/my-contributions',
           'normal',
           me?.displayName,
         );
         toast.success('تم الاعتماد');
       } catch {
         toast.error('فشل الاعتماد');
       }
     };

     const reject = async (c: Contribution) => {
       try {
         await updateOne('contributions', c.id, { status: 'rejected' });
         await logAudit(me, 'REJECT_CONTRIBUTION', 'Contribution', c.id, c.title);
         await notifyUser(
           c.createdBy,
           'تم رفض مشاركتك',
           '"' + c.title + '"',
           'participation',
           '/my-contributions',
           'high',
           me?.displayName,
         );
         toast.success('تم الرفض');
       } catch {
         toast.error('فشل الرفض');
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('contributions', toDelete.id);
         await logAudit(me, 'DELETE_CONTRIBUTION', 'Contribution', toDelete.id, toDelete.title);
         toast.success('تم الحذف');
         setToDelete(null);
       } catch {
         toast.error('فشل الحذف');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="المشاركات"
           description="اعتماد أو رفض مشاركات الأعضاء بضغطة واحدة."
         />

         <div className="chips mb-4">
           {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
             <button
               key={s}
               type="button"
               className={cx('chip', status === s && 'is-active')}
               onClick={() => setStatus(s)}
             >
               {STATUS_LABEL[s]}
             </button>
           ))}
         </div>

         <SectionHeader
           eyebrow="القائمة"
           title={'المشاركات (' + filtered.length + ')'}
         />

         {loading ? (
           <SkeletonList count={5} />
         ) : filtered.length === 0 ? (
           <EmptyState
             icon="📝"
             title="لا مشاركات"
             message="لا توجد مشاركات بهذه الحالة."
           />
         ) : (
           <div className="stack">
             {filtered.map((c) => {
               const team = teams.find((t) => t.id === c.teamId);
               return (
                 <div key={c.id} className="card no-click">
                   <div className="row row--between">
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title">{c.title}</div>
                       <div className="card__meta">
                         {c.memberName} · {team?.name} ·{' '}
                         {formatDate(c.date)}
                       </div>
                     </div>
                     <Badge
                       variant={
                         c.status === 'approved'
                           ? 'success'
                           : c.status === 'pending'
                             ? 'warning'
                             : 'danger'
                       }
                     >
                       {c.status === 'approved'
                         ? 'معتمد'
                         : c.status === 'pending'
                           ? 'معلّق'
                           : 'مرفوض'}
                     </Badge>
                   </div>

                   <p className="small soft mt-2">{c.description}</p>

                   <div
                     className="row mt-3"
                     style={{ gap: 10, justifyContent: 'space-between' }}
                   >
                     <div
                       style={{
                         display: 'flex',
                         gap: 12,
                         fontFamily: 'var(--font-en)',
                         fontSize: '0.85rem',
                       }}
                     >
                       <span>
                         {c.hours} <span className="muted">ساعة</span>
                       </span>
                       <span className="points">{hoursToPoints(c.hours)} نقطة</span>
                     </div>

                     <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                       {c.status === 'pending' ? (
                         <>
                           <button
                             type="button"
                             className="btn btn--success btn--sm"
                             onClick={() => approve(c)}
                           >
                             ✓ اعتماد
                           </button>
                           <button
                             type="button"
                             className="btn btn--outline-danger btn--sm"
                             onClick={() => reject(c)}
                           >
                             ✕ رفض
                           </button>
                         </>
                       ) : null}
                       <button
                         type="button"
                         className="btn btn--ghost btn--sm"
                         onClick={() => setToDelete(c)}
                       >
                         حذف
                       </button>
                     </div>
                   </div>
                 </div>
               );
             })}
           </div>
         )}

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف المشاركة"
           message={
             'سيتم حذف "' + (toDelete?.title || '') + '". هل أنت متأكد؟'
           }
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminCommitteesPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminCommitteesPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { updateOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { committees } from '@/data/committees';
   import { teams } from '@/data/teams';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import type { Member } from '@/types';

   export function AdminCommitteesPage() {
     const { user: me } = useAuth();
     const { data: members, loading } = useCollection<Member>('members');
     const [busy, setBusy] = useState<string | null>(null);

     const toggleCommittee = async (
       member: Member,
       committeeId: string,
     ) => {
       setBusy(member.id + '-' + committeeId);
       try {
         const has = member.committeeIds.includes(committeeId);
         const newIds = has
           ? member.committeeIds.filter((c) => c !== committeeId)
           : [...member.committeeIds, committeeId];
         await updateOne('members', member.id, { committeeIds: newIds });
         await logAudit(
           me,
           has ? 'REMOVE_FROM_COMMITTEE' : 'ADD_TO_COMMITTEE',
           'Member',
           member.id,
           committeeId,
         );
         toast.success(has ? 'تم الإزالة' : 'تم الإضافة');
       } catch {
         toast.error('فشل التحديث');
       } finally {
         setBusy(null);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="اللجان"
           description="توزيع الأعضاء على اللجان بضغطة واحدة."
         />

         {loading ? (
           <SkeletonList count={5} />
         ) : members.length === 0 ? (
           <EmptyState
             icon="🏛️"
             title="لا أعضاء"
             message="أضف أعضاء أولًا لتوزيعهم على اللجان."
           />
         ) : (
           <section className="section">
             <SectionHeader
               eyebrow="القائمة"
               title={'الأعضاء (' + members.length + ')'}
             />
             <div className="stack">
               {members.map((m) => (
                 <div key={m.id} className="card no-click">
                   <div
                     style={{
                       display: 'flex',
                       gap: 12,
                       alignItems: 'center',
                     }}
                   >
                     <Avatar name={m.name} size={44} variant="navy" />
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title">{m.name}</div>
                       <div className="card__meta">
                         {teams
                           .filter((t) => m.teamIds.includes(t.id))
                           .map((t) => t.name)
                           .join(' · ')}
                         {' · '}
                         {hoursToPoints(m.hours)} نقطة
                       </div>
                     </div>
                   </div>

                   <div className="chips mt-3">
                     {committees.map((c) => {
                       const has = m.committeeIds.includes(c.id);
                       const isBusy = busy === m.id + '-' + c.id;
                       return (
                         <button
                           key={c.id}
                           type="button"
                           disabled={isBusy}
                           className={cx('chip', has && 'is-active')}
                           onClick={() => toggleCommittee(m, c.id)}
                         >
                           {c.icon} {c.nameAr}
                           {has ? ' ✓' : ''}
                         </button>
                       );
                     })}
                   </div>

                   {m.committeeIds.length > 0 ? (
                     <div className="row mt-3" style={{ gap: 6 }}>
                       <span className="small muted">مسجّل في:</span>
                       {committees
                         .filter((c) => m.committeeIds.includes(c.id))
                         .map((c) => (
                           <Badge
                             key={c.id}
                             variant="info"
                           >
                             {c.icon} {c.nameAr}
                           </Badge>
                         ))}
                     </div>
                   ) : null}
                 </div>
               ))}
             </div>
           </section>
         )}
       </div>
     );
   }

   // helper محلي
   import { cx } from '@/lib/format';
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminAchievementsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminAchievementsPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { members } from '@/data/members';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import {
     FormField,
     TextInput,
     TextArea,
     DateInput,
     Select,
     MultiSelect,
   } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Achievement, TeamId } from '@/types';

   const LEVEL_OPTIONS = [
     { value: 'branch', label: 'على مستوى الفرع' },
     { value: 'national', label: 'على المستوى الوطني' },
     { value: 'international', label: 'على المستوى الدولي' },
   ];

   const EMPTY: Omit<Achievement, 'id'> = {
     title: '',
     description: '',
     date: new Date().toISOString().slice(0, 10),
     level: 'branch',
     teamIds: [],
     memberIds: [],
     memberNames: [],
     seasonId: 'S7',
   };

   export function AdminAchievementsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<Achievement>('achievements');
     const [editing, setEditing] = useState<Achievement | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<Achievement, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<Achievement | null>(null);
     const [busy, setBusy] = useState(false);

     const openCreate = () => {
       setForm(EMPTY);
       setCreating(true);
       setEditing(null);
     };

     const openEdit = (a: Achievement) => {
       setForm({
         title: a.title,
         description: a.description,
         date: a.date,
         level: a.level,
         teamIds: a.teamIds,
         memberIds: a.memberIds,
         memberNames: a.memberNames,
         seasonId: a.seasonId,
       });
       setEditing(a);
       setCreating(false);
     };

     const close = () => {
       setCreating(false);
       setEditing(null);
     };

     const save = async () => {
       if (!form.title.trim() || !form.description.trim()) {
         toast.error('العنوان والوصف مطلوبان');
         return;
       }
       setBusy(true);
       try {
         const memberNames = form.memberIds
           .map((id) => members.find((m) => m.id === id)?.name)
           .filter((n): n is string => Boolean(n));

         const payload = { ...form, memberNames };

         if (editing) {
           await updateOne('achievements', editing.id, payload);
           await logAudit(me, 'UPDATE_ACHIEVEMENT', 'Achievement', editing.id, form.title);
           toast.success('تم التحديث');
         } else {
           const id = 'A-' + Date.now().toString(36).toUpperCase();
           await createOne('achievements', { id, ...payload });
           await logAudit(me, 'CREATE_ACHIEVEMENT', 'Achievement', id, form.title);
           toast.success('تم الإضافة');
         }
         close();
       } catch {
         toast.error('فشل الحفظ');
       } finally {
         setBusy(false);
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('achievements', toDelete.id);
         await logAudit(me, 'DELETE_ACHIEVEMENT', 'Achievement', toDelete.id, toDelete.title);
         toast.success('تم الحذف');
         setToDelete(null);
       } catch {
         toast.error('فشل الحذف');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="الإنجازات"
           description="إضافة وتعديل وحذف الإنجازات."
         />

         <SectionHeader
           eyebrow="القائمة"
           title={'الإنجازات (' + data.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={openCreate}
             >
               + إنجاز جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={5} />
         ) : data.length === 0 ? (
           <EmptyState
             icon="🏆"
             title="لا إنجازات"
             message="أضف أول إنجاز للمنظمة."
           />
         ) : (
           <div className="stack">
             {data.map((a) => (
               <div key={a.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{a.title}</div>
                     <div className="card__meta">{formatDate(a.date)}</div>
                   </div>
                   <Badge
                     variant={
                       a.level === 'international'
                         ? 'red'
                         : a.level === 'national'
                           ? 'warning'
                           : 'info'
                     }
                   >
                     {a.level}
                   </Badge>
                 </div>
                 <p className="small soft mt-2">{a.description}</p>
                 <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                   <button
                     type="button"
                     className="btn btn--ghost btn--xs"
                     onClick={() => openEdit(a)}
                   >
                     تعديل
                   </button>
                   <button
                     type="button"
                     className="btn btn--danger btn--xs"
                     onClick={() => setToDelete(a)}
                   >
                     حذف
                   </button>
                 </div>
               </div>
             ))}
           </div>
         )}

         <Modal
           open={creating || editing !== null}
           title={editing ? 'تعديل إنجاز' : 'إنجاز جديد'}
           onClose={close}
           wide
           footer={
             <>
               <button type="button" className="btn btn--ghost" onClick={close}>
                 إلغاء
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={save}
                 disabled={busy}
               >
                 {busy ? '...' : 'حفظ'}
               </button>
             </>
           }
         >
           <FormField label="العنوان" required>
             <TextInput
               value={form.title}
               onChange={(v) => setForm({ ...form, title: v })}
             />
           </FormField>

           <FormField label="الوصف" required>
             <TextArea
               value={form.description}
               onChange={(v) => setForm({ ...form, description: v })}
               rows={3}
             />
           </FormField>

           <FormField label="التاريخ" required>
             <DateInput
               value={form.date}
               onChange={(v) => setForm({ ...form, date: v })}
             />
           </FormField>

           <FormField label="المستوى" required>
             <Select
               value={form.level}
               onChange={(v) =>
                 setForm({
                   ...form,
                   level: v as Achievement['level'],
                 })
               }
               options={LEVEL_OPTIONS}
             />
           </FormField>

           <FormField label="الفرق">
             <MultiSelect
               values={form.teamIds}
               onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })}
               options={teams.map((t) => ({ value: t.id, label: t.name }))}
             />
           </FormField>

           <FormField label="الأعضاء">
             <MultiSelect
               values={form.memberIds}
               onChange={(v) => setForm({ ...form, memberIds: v })}
               options={members.map((m) => ({ value: m.id, label: m.name }))}
             />
           </FormField>
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف الإنجاز"
           message={'سيتم حذف "' + (toDelete?.title || '') + '".'}
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminWarningsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminWarningsPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { notifyUser } from '@/lib/notifications';
   import { members } from '@/data/members';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import {
     FormField,
     TextInput,
     TextArea,
     DateInput,
     Select,
   } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { WarningRecord } from '@/types';

   const EMPTY: Omit<WarningRecord, 'id'> = {
     memberId: '',
     memberName: '',
     type: 'VERBAL',
     reason: '',
     severity: 'LOW',
     issuedByMemberId: '',
     issuedByName: '',
     issuedAt: new Date().toISOString().slice(0, 10),
     status: 'active',
     notes: '',
   };

   export function AdminWarningsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<WarningRecord>('warnings');
     const [editing, setEditing] = useState<WarningRecord | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<WarningRecord, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<WarningRecord | null>(null);
     const [busy, setBusy] = useState(false);

     const openCreate = () => {
       setForm({
         ...EMPTY,
         issuedByMemberId: me?.memberId ?? '',
         issuedByName: me?.displayName ?? '',
       });
       setCreating(true);
       setEditing(null);
     };

     const openEdit = (w: WarningRecord) => {
       setForm({
         memberId: w.memberId,
         memberName: w.memberName,
         type: w.type,
         reason: w.reason,
         severity: w.severity,
         issuedByMemberId: w.issuedByMemberId,
         issuedByName: w.issuedByName,
         issuedAt: w.issuedAt,
         status: w.status,
         notes: w.notes || '',
       });
       setEditing(w);
       setCreating(false);
     };

     const close = () => {
       setCreating(false);
       setEditing(null);
     };

     const save = async () => {
       if (!form.memberId || !form.reason.trim()) {
         toast.error('العضو والسبب مطلوبان');
         return;
       }
       setBusy(true);
       try {
         const member = members.find((m) => m.id === form.memberId);
         const payload = {
           ...form,
           memberName: member?.name ?? form.memberName,
         };

         if (editing) {
           await updateOne('warnings', editing.id, payload);
           await logAudit(me, 'UPDATE_WARNING', 'Warning', editing.id, form.reason);
           toast.success('تم التحديث');
         } else {
           const id = 'WARN-' + Date.now().toString(36).toUpperCase();
           await createOne('warnings', { id, ...payload });
           await logAudit(me, 'CREATE_WARNING', 'Warning', id, form.reason);

           // إشعار العضو المعني
           const memberUser = (await import('@/lib/db')).listWhere<{ uid: string }>(
             'users',
             'memberId',
             form.memberId,
           );
           const users = await memberUser;
           if (users.length > 0) {
             await notifyUser(
               users[0].uid,
               'تحذير جديد',
               form.reason,
               'warning',
               '/dashboard',
               'high',
               me?.displayName,
             );
           }

           toast.success('تم إصدار التحذير');
         }
         close();
       } catch {
         toast.error('فشل الحفظ');
       } finally {
         setBusy(false);
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('warnings', toDelete.id);
         await logAudit(me, 'DELETE_WARNING', 'Warning', toDelete.id, toDelete.reason);
         toast.success('تم الحذف');
         setToDelete(null);
       } catch {
         toast.error('فشل الحذف');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="التحذيرات"
           description="إصدار ومتابعة التحذيرات الرسمية."
         />

         <SectionHeader
           eyebrow="القائمة"
           title={'التحذيرات (' + data.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={openCreate}
             >
               + تحذير جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={4} />
         ) : data.length === 0 ? (
           <EmptyState
             icon="⚠️"
             title="لا تحذيرات"
             message="لم يتم إصدار أي تحذيرات."
           />
         ) : (
           <div className="stack">
             {data.map((w) => (
               <div key={w.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{w.memberName}</div>
                     <div className="card__meta">{w.reason}</div>
                   </div>
                   <Badge
                     variant={w.status === 'active' ? 'danger' : 'success'}
                     dot
                   >
                     {w.status === 'active' ? 'نشط' : 'منتهي'}
                   </Badge>
                 </div>

                 <div className="row mt-3" style={{ gap: 6 }}>
                   <Badge variant="neutral">{w.type}</Badge>
                   <Badge
                     variant={
                       w.severity === 'HIGH'
                         ? 'danger'
                         : w.severity === 'MEDIUM'
                           ? 'warning'
                           : 'info'
                     }
                   >
                     {w.severity}
                   </Badge>
                   <span className="small muted">{formatDate(w.issuedAt)}</span>
                 </div>

                 <div
                   className="row mt-3"
                   style={{ gap: 6, justifyContent: 'flex-end' }}
                 >
                   <button
                     type="button"
                     className="btn btn--ghost btn--xs"
                     onClick={() => openEdit(w)}
                   >
                     تعديل
                   </button>
                   <button
                     type="button"
                     className="btn btn--danger btn--xs"
                     onClick={() => setToDelete(w)}
                   >
                     حذف
                   </button>
                 </div>
               </div>
             ))}
           </div>
         )}

         <Modal
           open={creating || editing !== null}
           title={editing ? 'تعديل تحذير' : 'تحذير جديد'}
           onClose={close}
           wide
           footer={
             <>
               <button type="button" className="btn btn--ghost" onClick={close}>
                 إلغاء
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={save}
                 disabled={busy}
               >
                 {busy ? '...' : 'حفظ'}
               </button>
             </>
           }
         >
           <FormField label="العضو" required>
             <Select
               value={form.memberId}
               onChange={(v) => {
                 const m = members.find((x) => x.id === v);
                 setForm({
                   ...form,
                   memberId: v,
                   memberName: m?.name ?? '',
                 });
               }}
               options={[
                 { value: '', label: '— اختر —' },
                 ...members.map((m) => ({ value: m.id, label: m.name })),
               ]}
             />
           </FormField>

           <FormField label="النوع" required>
             <Select
               value={form.type}
               onChange={(v) =>
                 setForm({ ...form, type: v as WarningRecord['type'] })
               }
               options={[
                 { value: 'VERBAL', label: 'شفهي' },
                 { value: 'WRITTEN', label: 'كتابي' },
                 { value: 'FINAL', label: 'نهائي' },
               ]}
             />
           </FormField>

           <FormField label="السبب" required>
             <TextArea
               value={form.reason}
               onChange={(v) => setForm({ ...form, reason: v })}
               rows={3}
             />
           </FormField>

           <FormField label="الخطورة" required>
             <Select
               value={form.severity}
               onChange={(v) =>
                 setForm({ ...form, severity: v as WarningRecord['severity'] })
               }
               options={[
                 { value: 'LOW', label: 'منخفضة' },
                 { value: 'MEDIUM', label: 'متوسطة' },
                 { value: 'HIGH', label: 'مرتفعة' },
               ]}
             />
           </FormField>

           <FormField label="التاريخ" required>
             <DateInput
               value={form.issuedAt}
               onChange={(v) => setForm({ ...form, issuedAt: v })}
             />
           </FormField>

           <FormField label="الحالة">
             <Select
               value={form.status}
               onChange={(v) =>
                 setForm({ ...form, status: v as 'active' | 'resolved' })
               }
               options={[
                 { value: 'active', label: 'نشط' },
                 { value: 'resolved', label: 'منتهي' },
               ]}
             />
           </FormField>

           <FormField label="ملاحظات">
             <TextArea
               value={form.notes || ''}
               onChange={(v) => setForm({ ...form, notes: v })}
               rows={2}
             />
           </FormField>
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف التحذير"
           message="هل أنت متأكد من الحذف؟"
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminCalendarPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminCalendarPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import {
     FormField,
     TextInput,
     TextArea,
     DateInput,
     TimeInput,
     Select,
   } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { CalendarEvent, TeamId } from '@/types';

   const EMPTY: Omit<CalendarEvent, 'id'> = {
     title: '',
     description: '',
     date: new Date().toISOString().slice(0, 10),
     time: '',
     endTime: '',
     teamId: null,
     isPublic: true,
     type: 'meeting',
     location: '',
     seasonId: 'S7',
     createdBy: '',
     createdByName: '',
   };

   export function AdminCalendarPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<CalendarEvent>('calendar');
     const [editing, setEditing] = useState<CalendarEvent | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<CalendarEvent, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<CalendarEvent | null>(null);
     const [busy, setBusy] = useState(false);

     const sorted = [...data].sort((a, b) => (a.date > b.date ? 1 : -1));

     const openCreate = () => {
       setForm({
         ...EMPTY,
         createdBy: me?.uid ?? '',
         createdByName: me?.displayName ?? '',
       });
       setCreating(true);
       setEditing(null);
     };

     const openEdit = (e: CalendarEvent) => {
       setForm({
         title: e.title,
         description: e.description || '',
         date: e.date,
         time: e.time || '',
         endTime: e.endTime || '',
         teamId: e.teamId ?? null,
         isPublic: e.isPublic,
         type: e.type,
         location: e.location || '',
         seasonId: e.seasonId,
         createdBy: e.createdBy,
         createdByName: e.createdByName,
       });
       setEditing(e);
       setCreating(false);
     };

     const close = () => {
       setCreating(false);
       setEditing(null);
     };

     const save = async () => {
       if (!form.title.trim() || !form.date) {
         toast.error('العنوان والتاريخ مطلوبان');
         return;
       }
       setBusy(true);
       try {
         const payload = {
           ...form,
           teamId: form.isPublic ? null : form.teamId,
         };
         if (editing) {
           await updateOne('calendar', editing.id, payload);
           await logAudit(me, 'UPDATE_EVENT', 'Calendar', editing.id, form.title);
           toast.success('تم التحديث');
         } else {
           const id = 'EVT-' + Date.now().toString(36).toUpperCase();
           await createOne('calendar', { id, ...payload });
           await logAudit(me, 'CREATE_EVENT', 'Calendar', id, form.title);
           toast.success('تم الإضافة');
         }
         close();
       } catch {
         toast.error('فشل الحفظ');
       } finally {
         setBusy(false);
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('calendar', toDelete.id);
         await logAudit(me, 'DELETE_EVENT', 'Calendar', toDelete.id, toDelete.title);
         toast.success('تم الحذف');
         setToDelete(null);
       } catch {
         toast.error('فشل الحذف');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="التقويم"
           description="إدارة الأحداث العامة وأحداث الفرق."
         />

         <SectionHeader
           eyebrow="القائمة"
           title={'الأحداث (' + data.length + ')'}
           action={
             <button
               type="button"
               className="btn btn--primary btn--sm"
               onClick={openCreate}
             >
               + حدث جديد
             </button>
           }
         />

         {loading ? (
           <SkeletonList count={5} />
         ) : sorted.length === 0 ? (
           <EmptyState
             icon="📅"
             title="لا أحداث"
             message="أضف أول حدث."
           />
         ) : (
           <div className="stack">
             {sorted.map((e) => {
               const team = e.teamId ? teams.find((t) => t.id === e.teamId) : null;
               return (
                 <div key={e.id} className="card no-click">
                   <div className="row row--between">
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title">{e.title}</div>
                       <div className="card__meta">
                         {formatDate(e.date)}
                         {e.time ? ' · ' + e.time : ''}
                         {e.endTime ? ' — ' + e.endTime : ''}
                       </div>
                     </div>
                     <Badge variant={e.isPublic ? 'info' : 'neutral'}>
                       {e.isPublic ? 'عام' : team?.name || 'فريق'}
                     </Badge>
                   </div>
                   <div
                     className="row mt-3"
                     style={{ gap: 6, justifyContent: 'flex-end' }}
                   >
                     <button
                       type="button"
                       className="btn btn--ghost btn--xs"
                       onClick={() => openEdit(e)}
                     >
                       تعديل
                     </button>
                     <button
                       type="button"
                       className="btn btn--danger btn--xs"
                       onClick={() => setToDelete(e)}
                     >
                       حذف
                     </button>
                   </div>
                 </div>
               );
             })}
           </div>
         )}

         <Modal
           open={creating || editing !== null}
           title={editing ? 'تعديل حدث' : 'حدث جديد'}
           onClose={close}
           wide
           footer={
             <>
               <button type="button" className="btn btn--ghost" onClick={close}>
                 إلغاء
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={save}
                 disabled={busy}
               >
                 {busy ? '...' : 'حفظ'}
               </button>
             </>
           }
         >
           <FormField label="العنوان" required>
             <TextInput
               value={form.title}
               onChange={(v) => setForm({ ...form, title: v })}
             />
           </FormField>

           <FormField label="الوصف">
             <TextArea
               value={form.description || ''}
               onChange={(v) => setForm({ ...form, description: v })}
               rows={2}
             />
           </FormField>

           <FormField label="التاريخ" required>
             <DateInput
               value={form.date}
               onChange={(v) => setForm({ ...form, date: v })}
             />
           </FormField>

           <FormField label="وقت البداية">
             <TimeInput
               value={form.time || ''}
               onChange={(v) => setForm({ ...form, time: v })}
             />
           </FormField>

           <FormField label="وقت النهاية">
             <TimeInput
               value={form.endTime || ''}
               onChange={(v) => setForm({ ...form, endTime: v })}
             />
           </FormField>

           <FormField label="النوع">
             <Select
               value={form.type}
               onChange={(v) =>
                 setForm({ ...form, type: v as CalendarEvent['type'] })
               }
               options={[
                 { value: 'meeting', label: 'اجتماع' },
                 { value: 'event', label: 'فعالية' },
                 { value: 'workshop', label: 'ورشة' },
                 { value: 'deadline', label: 'موعد نهائي' },
               ]}
             />
           </FormField>

           <FormField
             label="النطاق"
             required
             hint="عام = يظهر للجميع، الفريق = يظهر لأعضاء فريق واحد فقط"
           >
             <Select
               value={form.isPublic ? 'public' : form.teamId ?? 'helpers'}
               onChange={(v) => {
                 if (v === 'public') {
                   setForm({ ...form, isPublic: true, teamId: null });
                 } else {
                   setForm({ ...form, isPublic: false, teamId: v as TeamId });
                 }
               }}
               options={[
                 { value: 'public', label: 'عام — للجميع' },
                 ...teams.map((t) => ({ value: t.id, label: 'فريق ' + t.name })),
               ]}
             />
           </FormField>

           <FormField label="المكان">
             <TextInput
               value={form.location || ''}
               onChange={(v) => setForm({ ...form, location: v })}
               placeholder="مثال: أونلاين — Zoom"
             />
           </FormField>
         </Modal>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف الحدث"
           message={'سيتم حذف "' + (toDelete?.title || '') + '".'}
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminConversationsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminConversationsPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, removeOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { toast } from '@/components/ui/Toast';
   import { relativeTime } from '@/lib/format';
   import type { Conversation, TeamId } from '@/types';

   export function AdminConversationsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<Conversation>('conversations');
     const [toDelete, setToDelete] = useState<Conversation | null>(null);
     const [busy, setBusy] = useState(false);

     const createTeamConv = async (team: (typeof teams)[number]) => {
       const exists = data.some((c) => c.type === 'team' && c.teamId === team.id);
       if (exists) {
         toast.info('المحادثة موجودة بالفعل');
         return;
       }
       setBusy(true);
       try {
         const id = 'CONV-TEAM-' + team.id;
         await createOne('conversations', {
           id,
           type: 'team',
           title: 'فريق ' + team.nameAr,
           teamId: team.id,
           participantUids: [],
           lastMessageAt: new Date().toISOString(),
         });
         await logAudit(me, 'CREATE_CONVERSATION', 'Conversation', id, team.name);
         toast.success('تم إنشاء محادثة الفريق');
       } catch {
         toast.error('فشل الإنشاء');
       } finally {
         setBusy(false);
       }
     };

     const handleDelete = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('conversations', toDelete.id);
         await logAudit(me, 'DELETE_CONVERSATION', 'Conversation', toDelete.id, toDelete.title);
         toast.success('تم الحذف');
         setToDelete(null);
       } catch {
         toast.error('فشل الحذف');
       } finally {
         setBusy(false);
       }
     };

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="المحادثات"
           description="إدارة محادثات الفرق والمحادثة العامة."
         />

         <section className="section">
           <SectionHeader
             eyebrow="إنشاء سريع"
             title="محادثات الفرق"
             description="محادثة واحدة لكل فريق — تُنشأ تلقائيًا لكل فريق."
           />
           <div className="chips">
             {teams.map((t) => {
               const exists = data.some(
                 (c) => c.type === 'team' && c.teamId === t.id,
               );
               return (
                 <button
                   key={t.id}
                   type="button"
                   disabled={busy || exists}
                   className={'chip' + (exists ? ' is-active' : '')}
                   onClick={() => createTeamConv(t)}
                 >
                   {t.name} {exists ? '✓' : '+'}
                 </button>
               );
             })}
           </div>
         </section>

         <section className="section">
           <SectionHeader
             eyebrow="القائمة"
             title={'المحادثات (' + data.length + ')'}
           />
           {loading ? (
             <SkeletonList count={5} />
           ) : data.length === 0 ? (
             <EmptyState
               icon="💬"
               title="لا محادثات"
               message="أنشئ محادثات الفرق من الأعلى."
             />
           ) : (
             <div className="stack">
               {data.map((c) => {
                 const team = c.teamId ? teams.find((t) => t.id === c.teamId) : null;
                 return (
                   <div key={c.id} className="card no-click">
                     <div className="row row--between">
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <div className="card__title">
                           {c.title ||
                             (c.type === 'general'
                               ? 'المحادثة العامة'
                               : team?.name)}
                         </div>
                         <div className="card__meta">
                           {c.type === 'general'
                             ? 'عام'
                             : c.type === 'team'
                               ? 'فريق'
                               : 'خاصة'}
                           {c.lastMessageAt
                             ? ' · ' + relativeTime(c.lastMessageAt)
                             : ''}
                         </div>
                       </div>
                       <Badge
                         variant={
                           c.type === 'general'
                             ? 'red'
                             : c.type === 'team'
                               ? 'info'
                               : 'neutral'
                         }
                       >
                         {c.type}
                       </Badge>
                     </div>

                     {c.type !== 'general' ? (
                       <div
                         className="row mt-3"
                         style={{ justifyContent: 'flex-end' }}
                       >
                         <button
                           type="button"
                           className="btn btn--danger btn--xs"
                           onClick={() => setToDelete(c)}
                         >
                           حذف
                         </button>
                       </div>
                     ) : null}
                   </div>
                 );
               })}
             </div>
           )}
         </section>

         <ConfirmDialog
           open={toDelete !== null}
           title="حذف المحادثة"
           message="سيتم حذف المحادثة وكل رسائلها."
           confirmLabel="حذف"
           danger
           busy={busy}
           onConfirm={handleDelete}
           onCancel={() => setToDelete(null)}
         />
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminNotificationsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminNotificationsPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { notifyUser, notifyUsers } from '@/lib/notifications';
   import { logAudit } from '@/lib/audit';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import { relativeTime } from '@/lib/format';
   import type { AppUser, Notification } from '@/types';

   export function AdminNotificationsPage() {
     const { user: me } = useAuth();
     const { data: users } = useCollection<AppUser>('users');
     const { data: notifs, loading } = useCollection<Notification>('notifications');

     const [target, setTarget] = useState<string>('all');
     const [title, setTitle] = useState('');
     const [message, setMessage] = useState('');
     const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
     const [busy, setBusy] = useState(false);

     const send = async () => {
       if (!title.trim() || !message.trim()) {
         toast.error('العنوان والرسالة مطلوبان');
         return;
       }
       setBusy(true);
       try {
         if (target === 'all') {
           await notifyUsers(
             users,
             title.trim(),
             message.trim(),
             'system',
             undefined,
             priority,
             me?.displayName,
           );
         } else if (target === 'managers') {
           const managers = users.filter((u) =>
             ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'].includes(u.role),
           );
           await notifyUsers(
             managers,
             title.trim(),
             message.trim(),
             'system',
             undefined,
             priority,
             me?.displayName,
           );
         } else {
           const u = users.find((x) => x.uid === target);
           await notifyUser(
             target,
             title.trim(),
             message.trim(),
             'system',
             undefined,
             priority,
             me?.displayName,
           );
           if (!u) {
             toast.error('المستخدم غير موجود');
             return;
           }
         }
         await logAudit(me, 'SEND_NOTIFICATION', 'Notification', target, title);
         setTitle('');
         setMessage('');
         toast.success('تم الإرسال');
       } catch {
         toast.error('فشل الإرسال');
       } finally {
         setBusy(false);
       }
     };

     const sorted = [...notifs]
       .sort((a, b) => (a.date < b.date ? 1 : -1))
       .slice(0, 30);

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="إرسال إشعار"
           description="إرسال إشعارات فورية للأعضاء والمدراء."
         />

         <SectionHeader eyebrow="إرسال" title="إشعار جديد" />
         <div className="card no-click" style={{ maxWidth: 720 }}>
           <FormField label="المستقبل" required>
             <Select
               value={target}
               onChange={setTarget}
               options={[
                 { value: 'all', label: 'الجميع' },
                 { value: 'managers', label: 'المدراء فقط (Head/Vice/HR)' },
                 ...users.map((u) => ({
                   value: u.uid,
                   label: u.displayName + ' (' + u.email + ')',
                 })),
               ]}
             />
           </FormField>

           <FormField label="العنوان" required>
             <TextInput value={title} onChange={setTitle} />
           </FormField>

           <FormField label="الرسالة" required>
             <TextArea value={message} onChange={setMessage} rows={4} />
           </FormField>

           <FormField label="الأولوية">
             <Select
               value={priority}
               onChange={(v) => setPriority(v as 'low' | 'normal' | 'high')}
               options={[
                 { value: 'low', label: 'منخفضة' },
                 { value: 'normal', label: 'عادية' },
                 { value: 'high', label: 'مرتفعة' },
               ]}
             />
           </FormField>

           <button
             type="button"
             className="btn btn--primary btn--block"
             onClick={send}
             disabled={busy}
           >
             {busy ? '...' : 'إرسال الإشعار'}
           </button>
         </div>

         <SectionHeader
           eyebrow="السجل"
           title={'آخر الإشعارات (' + notifs.length + ')'}
         />

         {loading ? (
           <SkeletonList count={6} />
         ) : sorted.length === 0 ? (
           <EmptyState
             icon="🔔"
             title="لا إشعارات"
             message="لم يتم إرسال أي إشعارات بعد."
           />
         ) : (
           <div className="stack">
             {sorted.map((n) => (
               <div key={n.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{n.title}</div>
                     <div className="card__meta">{n.message}</div>
                   </div>
                   {!n.read ? (
                     <Badge variant="red">جديد</Badge>
                   ) : (
                     <Badge variant="success">مقروء</Badge>
                   )}
                 </div>
                 <div className="tiny muted mt-2">
                   {relativeTime(n.date)}
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminAnalyticsPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminAnalyticsPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { members } from '@/data/members';
   import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { hoursToPoints } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Loading } from '@/components/ui/Loading';
   import type { Member, Contribution, RequestRecord } from '@/types';

   export function AdminAnalyticsPage() {
     const { data: liveMembers, loading: loadingM } = useCollection<Member>('members');
     const { data: contributions, loading: loadingC } = useCollection<Contribution>('contributions');
     const { data: requests, loading: loadingR } = useCollection<RequestRecord>('requests');

     if (loadingM || loadingC || loadingR) {
       return <Loading fullHeight message="جارٍ تحميل التحليلات..." />;
     }

     const allMembers = liveMembers.length > 0 ? liveMembers : members;

     const teamStats = teams
       .map((t) => {
         const teamMembers = allMembers.filter((m) => m.teamIds.includes(t.id));
         const points = teamMembers.reduce(
           (s, m) => s + hoursToPoints(m.hours || 0),
           0,
         );
         return { team: t, points, count: teamMembers.length };
       })
       .sort((a, b) => b.points - a.points);

     const committeeStats = committees
       .map((c) => {
         const committeeMembers = allMembers.filter((m) =>
           m.committeeIds.includes(c.id),
         );
         const points = committeeMembers.reduce(
           (s, m) => s + hoursToPoints(m.hours || 0),
           0,
         );
         return { committee: c, points, count: committeeMembers.length };
       })
       .sort((a, b) => b.points - a.points);

     const maxTeamPoints = Math.max(1, ...teamStats.map((s) => s.points));
     const maxCommitteePoints = Math.max(1, ...committeeStats.map((s) => s.points));

     const statusCounts: Record<string, number> = {};
     requests.forEach((r) => {
       statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
     });

     const typeCounts: Record<string, number> = {};
     requests.forEach((r) => {
       typeCounts[r.type] = (typeCounts[r.type] || 0) + 1;
     });

     const contributionsStatusCounts: Record<string, number> = {};
     contributions.forEach((c) => {
       contributionsStatusCounts[c.status] =
         (contributionsStatusCounts[c.status] || 0) + 1;
     });

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="التحليلات"
           description="نظرة شاملة على بيانات المنظمة."
         />

         <section className="section">
           <SectionHeader eyebrow="الفرق" title="نقاط الفرق" />
           <div className="card no-click">
             {teamStats.map((s) => (
               <div key={s.team.id} className="chart-row">
                 <span style={{ fontWeight: 700 }}>{s.team.name}</span>
                 <div
                   className="chart-bar"
                   style={{
                     width: Math.round((s.points / maxTeamPoints) * 100) + '%',
                   }}
                 />
                 <span
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontWeight: 800,
                     color: 'var(--c-navy)',
                   }}
                 >
                   {s.points}
                 </span>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="اللجان" title="نقاط اللجان" />
           <div className="card no-click">
             {committeeStats.map((s) => (
               <div key={s.committee.id} className="chart-row">
                 <span style={{ fontWeight: 700 }}>
                   {s.committee.icon} {s.committee.nameAr}
                 </span>
                 <div
                   className="chart-bar chart-bar--red"
                   style={{
                     width: Math.round((s.points / maxCommitteePoints) * 100) + '%',
                   }}
                 />
                 <span
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontWeight: 800,
                     color: 'var(--c-red)',
                   }}
                 >
                   {s.points}
                 </span>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الطلبات" title="حسب الحالة" />
           <div className="grid grid--narrow">
             {Object.entries(statusCounts).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__meta">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.8rem',
                     fontWeight: 800,
                     color: 'var(--c-navy)',
                     marginTop: 6,
                   }}
                 >
                   {v}
                 </div>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="الطلبات" title="حسب النوع" />
           <div className="grid grid--narrow">
             {Object.entries(typeCounts).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__meta">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.8rem',
                     fontWeight: 800,
                     color: 'var(--c-red)',
                     marginTop: 6,
                   }}
                 >
                   {v}
                 </div>
               </div>
             ))}
           </div>
         </section>

         <section className="section">
           <SectionHeader eyebrow="المشاركات" title="حسب الحالة" />
           <div className="grid grid--narrow">
             {Object.entries(contributionsStatusCounts).map(([k, v]) => (
               <div key={k} className="card no-click">
                 <div className="card__meta">{k}</div>
                 <div
                   style={{
                     fontFamily: 'var(--font-en)',
                     fontSize: '1.8rem',
                     fontWeight: 800,
                     color: 'var(--c-navy)',
                     marginTop: 6,
                   }}
                 >
                   {v}
                 </div>
               </div>
             ))}
           </div>
         </section>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      ADMIN — AdminAuditPage
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminAuditPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import type { AuditRecord } from '@/types';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { formatDateTime } from '@/lib/format';

   export function AdminAuditPage() {
     const { data, loading } = useCollection<AuditRecord>('audit');
     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));

     return (
       <div>
         <PageHeader
           eyebrow="إدارة"
           title="سجل التغييرات"
           description="كل الإجراءات الإدارية موثّقة هنا."
         />

         <SectionHeader eyebrow="السجل" title={'الأحداث (' + data.length + ')'} />

         {loading ? (
           <SkeletonList count={8} />
         ) : sorted.length === 0 ? (
           <EmptyState
             icon="📜"
             title="لا أحداث"
             message="لم يتم تسجيل أي إجراءات بعد."
           />
         ) : (
           <div className="table-wrap">
             <table className="data">
               <thead>
                 <tr>
                   <th>التاريخ</th>
                   <th>المستخدم</th>
                   <th>الإجراء</th>
                   <th>الوصف</th>
                 </tr>
               </thead>
               <tbody>
                 {sorted.map((a) => (
                   <tr key={a.id}>
                     <td className="muted small nowrap" data-label="التاريخ">
                       {formatDateTime(a.date)}
                     </td>
                     <td data-label="المستخدم" style={{ fontWeight: 700 }}>
                       {a.actorName}
                     </td>
                     <td data-label="الإجراء">
                       <span className="badge badge--neutral">{a.action}</span>
                     </td>
                     <td data-label="الوصف">{a.description}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
       </div>
     );
   }
   `
);

console.log("  ✓ Part 9 loaded: Admin pages");
/* ═══════════════════════════════════════════════════════════════
   APP — App.tsx (Routing كامل)
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/App.tsx",
  `import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
   import { Layout } from '@/components/layout/Layout';
   import { RequireAuth } from '@/components/layout/RequireAuth';
   import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
   import { ToastContainer } from '@/components/ui/Toast';
   import { Onboarding } from '@/components/onboarding/Onboarding';
   import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';

   // ═══════════ Public Pages ═══════════
   import { HomePage } from '@/pages/HomePage';
   import { LoginPage } from '@/pages/LoginPage';
   import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
   import { AboutPage } from '@/pages/AboutPage';
   import { MembersPage } from '@/pages/MembersPage';
   import { MemberProfilePage } from '@/pages/MemberProfilePage';
   import { TeamsPage } from '@/pages/TeamsPage';
   import { TeamDetailPage } from '@/pages/TeamDetailPage';
   import { LeaguePage } from '@/pages/LeaguePage';
   import { CommitteesPage } from '@/pages/CommitteesPage';
   import { AchievementsPage } from '@/pages/AchievementsPage';
   import { GovernancePage } from '@/pages/GovernancePage';
   import { SearchPage } from '@/pages/SearchPage';
   import { NotFoundPage } from '@/pages/NotFoundPage';

   // ═══════════ Dashboard Pages ═══════════
   import { DashboardPage } from '@/pages/DashboardPage';
   import { MyProfilePage } from '@/pages/MyProfilePage';
   import { MyContributionsPage } from '@/pages/MyContributionsPage';
   import { MyRequestsPage } from '@/pages/MyRequestsPage';
   import { NewRequestPage } from '@/pages/NewRequestPage';
   import { RequestsPage } from '@/pages/RequestsPage';
   import { RequestDetailPage } from '@/pages/RequestDetailPage';
   import { ApprovalsPage } from '@/pages/ApprovalsPage';
   import { ContributionsPage } from '@/pages/ContributionsPage';
   import { NotificationsPage } from '@/pages/NotificationsPage';
   import { ConversationsPage } from '@/pages/ConversationsPage';
   import { CalendarPage } from '@/pages/CalendarPage';
   import { ReportsPage } from '@/pages/ReportsPage';
   import { AuditPage } from '@/pages/AuditPage';

   // ═══════════ Admin Pages ═══════════
   import { AdminHomePage } from '@/pages/admin/AdminHomePage';
   import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
   import { AdminMembersPage } from '@/pages/admin/AdminMembersPage';
   import { AdminContributionsPage } from '@/pages/admin/AdminContributionsPage';
   import { AdminCommitteesPage } from '@/pages/admin/AdminCommitteesPage';
   import { AdminAchievementsPage } from '@/pages/admin/AdminAchievementsPage';
   import { AdminWarningsPage } from '@/pages/admin/AdminWarningsPage';
   import { AdminCalendarPage } from '@/pages/admin/AdminCalendarPage';
   import { AdminConversationsPage } from '@/pages/admin/AdminConversationsPage';
   import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage';
   import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
   import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';

   export default function App() {
     return (
       <ErrorBoundary>
         <HashRouter>
           <Routes>
             <Route element={<Layout />}>
               {/* ═══════ Public ═══════ */}
               <Route path="/" element={<HomePage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/change-password" element={<ChangePasswordPage />} />
               <Route path="/about" element={<AboutPage />} />
               <Route path="/members" element={<MembersPage />} />
               <Route path="/members/:memberId" element={<MemberProfilePage />} />
               <Route path="/teams" element={<TeamsPage />} />
               <Route path="/teams/:teamId" element={<TeamDetailPage />} />
               <Route path="/league" element={<LeaguePage />} />
               <Route path="/committees" element={<CommitteesPage />} />
               <Route path="/achievements" element={<AchievementsPage />} />
               <Route path="/governance" element={<GovernancePage />} />
               <Route path="/search" element={<SearchPage />} />

               {/* ═══════ Protected ═══════ */}
               <Route
                 path="/dashboard"
                 element={
                   <RequireAuth>
                     <DashboardPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/profile"
                 element={
                   <RequireAuth>
                     <MyProfilePage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/my-contributions"
                 element={
                   <RequireAuth>
                     <MyContributionsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/my-requests"
                 element={
                   <RequireAuth>
                     <MyRequestsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/requests/new"
                 element={
                   <RequireAuth>
                     <NewRequestPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/requests"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR']}>
                     <RequestsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/requests/:requestId"
                 element={
                   <RequireAuth>
                     <RequestDetailPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/approvals"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR']}>
                     <ApprovalsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/contributions"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR']}>
                     <ContributionsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/notifications"
                 element={
                   <RequireAuth>
                     <NotificationsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/conversations"
                 element={
                   <RequireAuth>
                     <ConversationsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/calendar"
                 element={
                   <RequireAuth>
                     <CalendarPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/reports"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR']}>
                     <ReportsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/audit"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AuditPage />
                   </RequireAuth>
                 }
               />

               {/* ═══════ Admin ═══════ */}
               <Route
                 path="/admin"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminHomePage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/users"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminUsersPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/members"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminMembersPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/contributions"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminContributionsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/committees"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminCommitteesPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/achievements"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminAchievementsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/warnings"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminWarningsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/calendar"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminCalendarPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/conversations"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminConversationsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/notifications"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminNotificationsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/analytics"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminAnalyticsPage />
                   </RequireAuth>
                 }
               />
               <Route
                 path="/admin/audit"
                 element={
                   <RequireAuth roles={['HEAD', 'VICE']}>
                     <AdminAuditPage />
                   </RequireAuth>
                 }
               />
               <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

               {/* ═══════ Fallback ═══════ */}
               <Route path="*" element={<NotFoundPage />} />
             </Route>
           </Routes>

           <ToastContainer />
           <Onboarding />
           <PwaInstallBanner />
         </HashRouter>
       </ErrorBoundary>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      LAYOUT — Layout (Shell + Navbar + BottomNav + Footer)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/layout/Layout.tsx",
  `import { useEffect, useState } from 'react';
   import { Outlet, useLocation, useNavigate } from 'react-router-dom';
   import { Navbar } from './Navbar';
   import { BottomNav } from './BottomNav';
   import { Sidebar } from './Sidebar';
   import { Footer } from './Footer';
   import { useAuth } from '@/lib/useAuth';
   import { initPwa } from '@/lib/pwa';

   export function Layout() {
     const { pathname } = useLocation();
     const nav = useNavigate();
     const { user, mustChangePassword, loading } = useAuth();
     const [sidebarOpen, setSidebarOpen] = useState(false);

     // ═══ PWA init (once) ═══
     useEffect(() => {
       initPwa();
     }, []);

     // ═══ Scroll to top on route change ═══
     useEffect(() => {
       window.scrollTo(0, 0);
       setSidebarOpen(false);
     }, [pathname]);

     // ═══ إعادة التوجيه لتغيير كلمة المرور ═══
     useEffect(() => {
       if (loading) return;
       if (user && mustChangePassword && pathname !== '/change-password') {
         nav('/change-password');
       }
     }, [user, mustChangePassword, pathname, nav, loading]);

     // ═══ إغلاق الـ drawer عند تغيير المسار ═══
     const handleMenuToggle = () => {
       setSidebarOpen((v) => !v);
     };

     const handleSidebarClose = () => {
       setSidebarOpen(false);
     };

     return (
       <div className="app-shell">
         <Navbar onMenuToggle={user ? handleMenuToggle : undefined} />

         <main className="app-main">
           {/* Sidebar يُعرض كـ drawer على الجوال، ودائمًا ظاهر بجانب المحتوى في الـ dashboard */}
           <Outlet />

           {/* الـ Sidebar الفعلي يُدار داخل DashboardLayout في الصفحات المخصصة */}
           {user && sidebarOpen ? (
             <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
           ) : null}
         </main>

         {user ? <BottomNav /> : null}
         <Footer />
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      MAIN — main.tsx (نقطة الدخول)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/main.tsx",
  `import { StrictMode } from 'react';
   import { createRoot } from 'react-dom/client';
   import App from './App';
   import './styles/global.css';

   const container = document.getElementById('root');

   if (!container) {
     throw new Error('Root element #root was not found in index.html');
   }

   createRoot(container).render(
     <StrictMode>
       <App />
     </StrictMode>,
   );
   `
);

/* ═══════════════════════════════════════════════════════════════
      LIB — Seed (v5.1 محدّث)
      ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/seed.ts",
  `import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { members } from '@/data/members';
   import { contributions } from '@/data/contributions';
   import { requests } from '@/data/requests';
   import { approvals } from '@/data/approvals';
   import { warnings } from '@/data/warnings';
   import { achievements } from '@/data/achievements';
   import { notifications } from '@/data/notifications';
   import { conversations, messages } from '@/data/conversations';
   import { calendarEvents } from '@/data/calendar';
   import { governanceDocuments } from '@/data/governance';
   import { createOne, listAll } from './db';

   export interface SeedResult {
     teams: number;
     committees: number;
     members: number;
     contributions: number;
     requests: number;
     approvals: number;
     warnings: number;
     achievements: number;
     notifications: number;
     conversations: number;
     messages: number;
     calendar: number;
     governance: number;
   }

   export async function seedAll(): Promise<SeedResult> {
     const existingTeams = await listAll('teams').catch(() => []);
     if (existingTeams.length > 0) {
       throw new Error(
         'البيانات موجودة مسبقًا. امسح المجموعات من Firebase Console إن أردت إعادة الرفع.',
       );
     }

     for (const t of teams) await createOne('teams', t);
     for (const c of committees) await createOne('committees', c);
     for (const m of members) await createOne('members', m);
     for (const c of contributions) await createOne('contributions', c);
     for (const r of requests) await createOne('requests', r);
     for (const a of approvals) await createOne('approvals', a);
     for (const w of warnings) await createOne('warnings', w);
     for (const a of achievements) await createOne('achievements', a);
     for (const n of notifications) await createOne('notifications', n);
     for (const c of conversations) await createOne('conversations', c);
     for (const m of messages) await createOne('messages', m);
     for (const e of calendarEvents) await createOne('calendar', e);
     for (const g of governanceDocuments) await createOne('governance', g);

     return {
       teams: teams.length,
       committees: committees.length,
       members: members.length,
       contributions: contributions.length,
       requests: requests.length,
       approvals: approvals.length,
       warnings: warnings.length,
       achievements: achievements.length,
       notifications: notifications.length,
       conversations: conversations.length,
       messages: messages.length,
       calendar: calendarEvents.length,
       governance: governanceDocuments.length,
     };
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      DOCS — Firestore Rules v5.1
      ═══════════════════════════════════════════════════════════════ */

file(
  "docs/FIRESTORE_RULES.md",
  `# Firestore Rules v5.1

   ## الخطوات
   1. Firebase Console → Firestore Database → Rules
   2. امسح كل شيء والصق المحتوى بالأسفل
   3. اضغط Publish

   ## القواعد

   \`\`\`
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       function isSignedIn() {
         return request.auth != null;
       }

       function userData() {
         return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
       }

       function userDocExists() {
         return exists(/databases/$(database)/documents/users/$(request.auth.uid));
       }

       function isAdmin() {
         return isSignedIn()
           && userDocExists()
           && userData().role in ['HEAD', 'VICE'];
       }

       function isManager() {
         return isSignedIn()
           && userDocExists()
           && userData().role in ['HEAD', 'VICE', 'HEAD_HR', 'PRESIDENT', 'VICE_PRESIDENT', 'HR'];
       }

       function sameTeam() {
         return isSignedIn()
           && userDocExists()
           && resource.data.teamId == userData().teamId;
       }

       // ═══════════ USERS ═══════════
       match /users/{uid} {
         allow read: if isSignedIn();
         allow create: if request.auth.uid == uid;
         allow update: if isAdmin() || request.auth.uid == uid;
         allow delete: if isAdmin();
       }

       // ═══════════ MEMBERS ═══════════
       match /members/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && (
           request.resource.data.linkedUserId == request.auth.uid
           || isAdmin()
         );
         allow update: if isAdmin() || (
           isManager()
           && userData().teamId in resource.data.teamIds
         );
         allow delete: if isAdmin();
       }

       // ═══════════ TEAMS ═══════════
       match /teams/{id} {
         allow read: if isSignedIn();
         allow write: if isAdmin();
       }

       // ═══════════ COMMITTEES ═══════════
       match /committees/{id} {
         allow read: if isSignedIn();
         allow write: if isAdmin();
       }

       // ═══════════ CONTRIBUTIONS ═══════════
       match /contributions/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && (
           request.resource.data.createdBy == request.auth.uid
           || isManager()
         );
         allow update: if isManager();
         allow delete: if isAdmin();
       }

       // ═══════════ WARNINGS ═══════════
       match /warnings/{id} {
         allow read: if isManager() || (
           isSignedIn()
           && resource.data.memberId == userData().memberId
         );
         allow write: if isAdmin() || (
           isManager()
           && userData().teamId in get(/databases/$(database)/documents/members/$(request.resource.data.memberId)).data.teamIds
         );
       }

       // ═══════════ ACHIEVEMENTS ═══════════
       match /achievements/{id} {
         allow read: if true;
         allow write: if isManager();
       }

       // ═══════════ NOTIFICATIONS ═══════════
       match /notifications/{id} {
         allow read: if isSignedIn() && (
           resource.data.userId == request.auth.uid
           || isManager()
         );
         allow create: if isSignedIn();
         allow update: if isSignedIn() && resource.data.userId == request.auth.uid;
         allow delete: if isAdmin();
       }

       // ═══════════ CONVERSATIONS ═══════════
       match /conversations/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn();
         allow update: if isSignedIn();
         allow delete: if isAdmin();
       }

       // ═══════════ MESSAGES ═══════════
       match /messages/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && request.resource.data.senderUid == request.auth.uid;
         allow update, delete: if isAdmin();
       }

       // ═══════════ CALENDAR ═══════════
       match /calendar/{id} {
         allow read: if true;
         allow write: if isManager();
       }

       // ═══════════ GOVERNANCE ═══════════
       match /governance/{id} {
         allow read: if true;
         allow write: if isAdmin();
       }

       // ═══════════ AUDIT ═══════════
       match /audit/{id} {
         allow read: if isAdmin();
         allow create: if isSignedIn();
       }

       // ═══════════ REQUESTS ═══════════
       match /requests/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && (
           request.resource.data.requesterUid == request.auth.uid
           || isManager()
         );
         allow update: if isManager();
         allow delete: if isAdmin();
       }

       // ═══════════ APPROVALS ═══════════
       match /approvals/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn();
         allow update, delete: if isManager();
       }
     }
   }
   \`\`\`
   `
);

/* ═══════════════════════════════════════════════════════════════
      DOCS — Installation Guide
      ═══════════════════════════════════════════════════════════════ */

file(
  "docs/INSTALL.md",
  `# دليل التثبيت — sbapiaryy v5.1

   ## قبل البدء

   1. حساب GitHub
   2. حساب Firebase
   3. Node.js 18+ مثبت على جهازك
   4. Git مثبت

   ## ═══════════ 1. استبدال الملفات على GitHub ═══════════

   ### الطريقة الأسرع — من GitHub Web

   #### أ) احفظ setup.js

   انسخ الكود من الأجزاء 1-10 إلى ملف واحد باسم \`setup.js\`.

   #### ب) شغّله محليًا

   \`\`\`bash
   mkdir sbapiaryy-v51
   cd sbapiaryy-v51
   # انسخ setup.js هنا
   node setup.js
   \`\`\`

   سيكوّن المشروع كاملًا.

   #### ج) ارفع إلى GitHub

   \`\`\`bash
   git init
   git branch -M main
   git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git
   git add .
   git commit -m "feat: v5.1 complete rebuild"
   git push origin main --force
   \`\`\`

   ### الطريقة اليدوية — على GitHub Web

   **8 ملفات فقط تحتاج تعديل:**

   1. \`src/components/layout/Navbar.tsx\` — Navbar مبسّط
   2. \`src/components/layout/Sidebar.tsx\` — Drawer على الجوال
   3. \`src/pages/LoginPage.tsx\` — بدون demo accounts
   4. \`src/pages/NotificationsPage.tsx\` — تصميم جديد
   5. \`src/pages/ConversationsPage.tsx\` — Messenger style
   6. \`src/pages/CalendarPage.tsx\` — تقويم حقيقي
   7. \`src/App.tsx\` — routing محدث
   8. \`src/main.tsx\` — إعادة توجيه CSS

   **ملفات جديدة تحتاج إنشاء:**

   1. \`src/styles/*.css\` (24 ملف CSS)
   2. \`src/components/onboarding/Onboarding.tsx\`
   3. \`src/components/pwa/PwaInstallBanner.tsx\`
   4. \`src/components/layout/BottomNav.tsx\`
   5. \`src/components/chat/*.tsx\` (3 ملفات)
   6. \`src/components/calendar/CalendarGrid.tsx\`
   7. \`public/manifest.json\`
   8. \`public/sw.js\`

   ## ═══════════ 2. Firebase Setup ═══════════

   ### أ) مشروع Firebase

   1. https://console.firebase.google.com
   2. Add project → sbapiaryy
   3. Disable Analytics

   ### ب) Authentication

   - Build → Authentication → Get started
   - Sign-in method → **Email/Password** → Enable → Save

   ### ج) Firestore

   - Build → Firestore Database → Create
   - **Production mode**
   - Location: \`me-central1\`
   - Enable

   ### د) Firestore Rules

   - Firestore → Rules
   - انسخ من \`docs/FIRESTORE_RULES.md\`
   - Publish

   ### هـ) Firebase Config

   - Project Settings → General → Your apps → Web
   - انسخ \`firebaseConfig\`

   ## ═══════════ 3. ملف .env ═══════════

   أنشئ ملف \`.env\` في جذر المشروع:

   \`\`\`
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=sbapiaryy.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=sbapiaryy
   VITE_FIREBASE_STORAGE_BUCKET=sbapiaryy.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc...
   \`\`\`

   ## ═══════════ 4. GitHub Secrets ═══════════

   - GitHub repo → Settings → Secrets and variables → Actions
   - أضف 6 أسرار بنفس الأسماء أعلاه

   ## ═══════════ 5. GitHub Pages ═══════════

   - Settings → Pages
   - Source: **GitHub Actions**

   ## ═══════════ 6. Firebase Authorized Domains ═══════════

   - Firebase → Authentication → Settings → Authorized domains
   - Add: \`hazimshendy-stack.github.io\`

   ## ═══════════ 7. أول حساب Head ═══════════

   1. انتظر GitHub Actions (5-7 دقائق)
   2. افتح \`https://hazimshendy-stack.github.io/sbapiaryyy/#/login\`
   3. **لا يمكن التسجيل من الواجهة** (حسابات تُنشأ من الأدمن فقط)
   4. أنشئ أول حساب يدويًا:

   ### أ) من Firebase Console → Authentication → Users

   - Add user → email + password
   - انسخ الـ UID

   ### ب) من Firestore → users

   - Add document → ID = UID
   - أضف الحقول:
     \`\`\`
     uid: "UID"
     email: "your@email.com"
     displayName: "اسمك"
     role: "HEAD"
     teamId: null
     committeeIds: []
     memberId: null
     createdAt: "2026-01-01T00:00:00.000Z"
     emailVerified: true
     mustChangePassword: false
     \`\`\`

   ### ج) سجّل دخول

   - افتح الموقع
   - البريد + كلمة المرور
   - اذهب إلى \`/admin\`
   - اضغط **رفع البيانات**

   ## ═══════════ 8. تثبيت التطبيق على الجوال ═══════════

   ### Android (Chrome)

   1. افتح الموقع في Chrome
   2. ⋮ → **Install app**
   3. ستظهر أيقونة sbapiaryy على الشاشة

   ### iPhone (Safari)

   1. افتح الموقع في **Safari** (ليس Chrome)
   2. Share → **Add to Home Screen**
   3. **Add**

   ## ═══════════ 9. إنشاء أول عضو من الأدمن ═══════════

   1. \`/admin/users\` → **+ مستخدم جديد**
   2. املأ:
      - الاسم
      - البريد
      - كلمة مرور مؤقتة (توليد تلقائي متاح)
      - الدور
      - الفريق
      - اللجان
   3. **إنشاء**
   4. سترى كلمة المرور في نافذة
   5. أرسلها للعضو

   العضو يسجّل دخول → يُطلب منه تغيير كلمة المرور → يبدأ.

   ## ═══════════ إعادة الرفع بعد التعديل ═══════════

   \`\`\`bash
   cd sbapiaryy-v51
   git add .
   git commit -m "update"
   git push origin main
   \`\`\`

   GitHub Actions يبني وينشر تلقائيًا.
   `
);

file(
  "docs/MOBILE_GUIDE.md",
  `# دليل PWA v5.1

   ## ما هو PWA؟

   Progressive Web App — تطبيق ويب يمكن تثبيته على الجوال ويعمل مثل التطبيق الأصلي.

   ## الفوائد

   - ✅ بدون شريط المتصفح
   - ✅ أيقونة على الشاشة الرئيسية
   - ✅ يعمل offline (جزئيًا)
   - ✅ يحفظ الجلسة
   - ✅ أسرع من المتصفح
   - ✅ Push notifications (قريبًا)

   ## التثبيت

   ### Android (Chrome / Edge / Samsung Internet)

   1. افتح الموقع
   2. بعد 30 ثانية سيظهر بانر "ثبّت sbapiaryy"
   3. اضغط **تثبيت**
   4. أو يدويًا: ⋮ → **Install app**

   ### iPhone (Safari فقط)

   1. افتح الموقع في Safari
   2. اضغط زر **Share** (مربع + سهم)
   3. اسحب لأسفل → **Add to Home Screen**
   4. **Add**
   5. ستظهر الأيقونة

   **ملاحظة:** iPhone لا يدعم البانر التلقائي. استخدم الطريقة اليدوية.

   ## بعد التثبيت

   - التطبيق يظهر مع التطبيقات الأخرى
   - يفتح بدون شريط المتصفح
   - يمكن إغلاقه كأي تطبيق
   - يعمل بدون إنترنت (البيانات المحفوظة)

   ## إلغاء التثبيت

   ### Android
   - اضغط مطولًا على أيقونة التطبيق → **Uninstall**

   ### iPhone
   - اضغط مطولًا على الأيقونة → **Remove App** → **Delete**

   ## تقنيات

   - **Manifest:** \`public/manifest.json\`
   - **Service Worker:** \`public/sw.js\`
   - **Icons:** \`public/icon-192.png\` و \`public/icon-512.png\`

   ## توليد أيقونات حقيقية

   1. اذهب إلى: https://realfavicongenerator.net
   2. ارفع \`public/favicon.svg\`
   3. حمّل الحزمة
   4. انسخ \`icon-192.png\` و \`icon-512.png\` إلى \`public/\`
   `
);

/* ═══════════════════════════════════════════════════════════════
      WRITE ALL FILES
      ═══════════════════════════════════════════════════════════════ */

function write() {
  const entries = Object.entries(files);
  let written = 0;

  for (const [relative, raw] of entries) {
    // تجاهل الـ placeholders للأيقونات PNG
    if (raw === "PLACEHOLDER_192" || raw === "PLACEHOLDER_512") {
      continue;
    }

    const absolute = path.join(ROOT, relative);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, raw.replace(/^\n/, ""), "utf8");
    written += 1;
  }

  const dirs = new Set(
    entries.map(([relative]) => path.dirname(relative)).filter((d) => d !== ".")
  );

  console.log("");
  console.log("  ╔══════════════════════════════════════════════════════╗");
  console.log("  ║                                                      ║");
  console.log("  ║   sbapiaryy v5.1 — Setup Complete                    ║");
  console.log("  ║   Mobile-First + PWA + Complete Rebuild              ║");
  console.log("  ║                                                      ║");
  console.log("  ╚══════════════════════════════════════════════════════╝");
  console.log("");
  console.log("  📦 Files written : " + written);
  console.log("  📁 Folders       : " + dirs.size);
  console.log("");
  console.log("  ═══════════════════════════════════════════════════════");
  console.log("  🎯 التالي:");
  console.log("  ═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  1️⃣  npm install");
  console.log("  2️⃣  أنشئ ملف .env بمفاتيح Firebase (اقرأ docs/INSTALL.md)");
  console.log("  3️⃣  npm run dev");
  console.log("  4️⃣  افتح http://localhost:5173");
  console.log("");
  console.log("  ═══════════════════════════════════════════════════════");
  console.log("  📚 الدليل الكامل:");
  console.log("  ═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  📖 docs/INSTALL.md       — دليل التثبيت الكامل");
  console.log("  🔥 docs/FIRESTORE_RULES.md — قواعد Firestore");
  console.log("  📱 docs/MOBILE_GUIDE.md  — تثبيت PWA على الجوال");
  console.log("");
  console.log("  ═══════════════════════════════════════════════════════");
  console.log("  ✨ الجديد في v5.1:");
  console.log("  ═══════════════════════════════════════════════════════");
  console.log("");
  console.log("  ✅ تصميم Mobile-First من الصفر");
  console.log("  ✅ Bottom Navigation على الجوال");
  console.log("  ✅ Sidebar Drawer مع overlay");
  console.log("  ✅ PWA — قابل للتثبيت كتطبيق");
  console.log("  ✅ Onboarding لأول زيارة");
  console.log("  ✅ إشعارات Real-time (بدون refresh)");
  console.log("  ✅ محادثات Messenger-style");
  console.log("  ✅ تقويم حقيقي (شهر + أيام)");
  console.log("  ✅ إنشاء حسابات من الأدمن");
  console.log("  ✅ إلزام تغيير كلمة المرور");
  console.log("  ✅ Forgot password");
  console.log("  ✅ نظام لجان كامل");
  console.log("  ✅ موافقات متعددة المستويات");
  console.log("  ✅ Notifications للأدوار الإدارية فقط");
  console.log("  ✅ إزالة الشهادات والتوصيات");
  console.log("");
  console.log("  ═══════════════════════════════════════════════════════");
  console.log("");
}

write();
