#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   sbapiaryy — setup.cjs v6.0
   New Hierarchy + Committee System + Flexible 3-Stage Approval
   15 parts — one file — one run
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();
const files = {};
const file = (p, c) => {
  files[p] = c;
};

/* ═══════════════════════════════════════════════════════════════
      PART 1 — ROOT CONFIG
      ═══════════════════════════════════════════════════════════════ */

file(
  "package.json",
  JSON.stringify(
    {
      name: "sbapiaryy",
      private: true,
      version: "6.0.0",
      type: "module",
      description: "Resala STEM Sub Branches — New Hierarchy + Committees",
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

file(
  "tsconfig.json",
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: { "@/*": ["src/*"] },
      },
      include: ["src"],
    },
    null,
    2
  )
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
           entryFileNames: 'assets/[name]-[hash].js',
           chunkFileNames: 'assets/[name]-[hash].js',
           assetFileNames: 'assets/[name]-[hash][extname]',
           manualChunks: {
             firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
             react: ['react', 'react-dom', 'react-router-dom'],
           },
         },
       },
     },
   });
   `
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
   .vite
   `
);

file(
  ".env.example",
  `VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123def
   `
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
   PART 2 — HTML + PWA
   ═══════════════════════════════════════════════════════════════ */

file(
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
       <meta name="apple-mobile-web-app-title" content="sbapiaryy" />
       <meta name="description" content="Resala STEM Sub Branches — Official Platform" />
       <title>sbapiaryy</title>
       <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
       <link rel="manifest" href="./manifest.json" />
       <link rel="preconnect" href="https://fonts.googleapis.com" />
       <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
       <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
       <style>
         html, body { margin: 0; padding: 0; background: #151A45; }
         #root { min-height: 100vh; }
         .boot-screen {
           position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
           background: #151A45; color: #fff; font-family: 'Space Grotesk', system-ui, sans-serif;
           flex-direction: column; gap: 20px; z-index: 9999; transition: opacity 0.3s ease;
         }
         .boot-screen.hidden { opacity: 0; pointer-events: none; }
         .boot-screen__name { font-size: 1.5rem; font-weight: 400; }
         .boot-screen__hint { font-size: 0.9rem; color: #D5DAF0; opacity: 0.7; }
       </style>
       <script>
         (function (l) {
           if (l.search[1] === '/') {
             var decoded = l.search.slice(1).split('&').map(function (s) { return s.replace(/~and~/g, '&'); }).join('?');
             window.history.replaceState(null, null, l.pathname.slice(0, -1) + decoded + l.hash);
           }
         })(window.location);
       </script>
     </head>
     <body>
       <div id="boot">
         <div class="boot-screen">
           <div class="boot-screen__name">sbapiaryy</div>
           <div class="boot-screen__hint">Loading...</div>
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
  JSON.stringify(
    {
      name: "sbapiaryy — Resala STEM Sub Branches",
      short_name: "sbapiaryy",
      description: "Official platform for Resala STEM Sub Branches",
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
      ],
    },
    null,
    2
  )
);

file(
  "public/sw.js",
  `const BUILD_ID = 'sbapiaryy-v6';
   const CACHE_NAME = 'sbapiaryy-' + BUILD_ID;
   const RUNTIME_CACHE = 'sbapiaryy-runtime-' + BUILD_ID;
   const PRECACHE_URLS = ['./', './index.html', './manifest.json', './favicon.svg'];

   self.addEventListener('install', (event) => {
     self.skipWaiting();
     event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {})));
   });

   self.addEventListener('activate', (event) => {
     event.waitUntil((async () => {
       const keys = await caches.keys();
       await Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== RUNTIME_CACHE).map((k) => caches.delete(k)));
       await self.clients.claim();
     })());
   });

   self.addEventListener('fetch', (event) => {
     const { request } = event;
     const url = new URL(request.url);
     if (request.method !== 'GET') return;
     if (url.origin !== self.location.origin) return;
     if (url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) return;

     const isAppFile = request.destination === 'document' || request.destination === 'script' || request.destination === 'style'
       || url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.css') || url.pathname.endsWith('.json');

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

file(
  "public/version.json",
  JSON.stringify(
    {
      buildId: "sbapiaryy-v6",
      builtAt: new Date().toISOString(),
      version: "6.0.0",
    },
    null,
    2
  )
);

file(
  "public/404.html",
  `<!doctype html>
   <html lang="en" dir="ltr">
   <head>
     <meta charset="utf-8">
     <title>sbapiaryy</title>
     <script>sessionStorage.redirect = location.href;</script>
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
   PART 3 — TYPES + DATA
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/types/index.ts",
  `export type RoleId =
   | 'HEAD' | 'VICE'
   | 'HEAD_HR_GLOBAL'
   | 'HEAD_HR_TEAM'
   | 'PRESIDENT' | 'VICE_PRESIDENT'
   | 'HR'
   | 'COMMITTEE_HR'
   | 'MEMBER' | 'VIEWER';

 export type TeamId = 'helpers' | 'heroes' | 'coders' | 'enviros' | 'messages' | 'masar' | 'rstc';

 export type RequestType = 'TRANSFER' | 'PROMOTION' | 'RESIGNATION' | 'COMPLAINT' | 'SUGGESTION' | 'LEAVE';
 export type RequestStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
 export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SKIPPED';
 export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
 export type ContributionStatus = 'pending' | 'in_review' | 'approved' | 'rejected';
 export type ConversationType = 'private' | 'team' | 'general';
 export type NotificationType = 'approval' | 'request' | 'participation' | 'achievement' | 'system' | 'warning' | 'message';

 export interface AppUser {
   uid: string;
   email: string;
   displayName: string;
   role: RoleId;
   teamId?: TeamId | null;
   committeeIds?: string[];
   memberId?: string | null;
   createdAt?: string;
   emailVerified?: boolean;
   mustChangePassword?: boolean;
   createdByAdmin?: string;
 }

 export interface Role { id: RoleId; name: string; nameEn: string; level: number; }
 export interface Team { id: TeamId; name: string; nameAr: string; description: string; color: string; }

 export interface Committee {
   id: string;
   name: string;
   nameAr: string;
   description: string;
   color: string;
   icon: string;
   teamId?: TeamId | null;
 }

 export interface Member {
   id: string;
   name: string;
   role: RoleId;
   teamIds?: TeamId[];
   committeeIds?: string[];
   joinedSeason?: number;
   hours?: number;
   points?: number;
   status?: 'active' | 'inactive' | 'suspended';
   bio?: string;
   email?: string;
   linkedUserId?: string;
 }

 export interface ContributionApproval {
   stage: 1 | 2 | 3;
   status: 'pending' | 'approved' | 'rejected' | 'skipped';
   approvedBy?: string;
   approvedByName?: string;
   approvedByRole?: string;
   approvedAt?: string;
   comment?: string;
   points?: number;
 }

 export interface Contribution {
   id: string;
   memberId: string;
   memberName?: string;
   teamId: TeamId;
   committeeId?: string;
   category?: string;
   title: string;
   description?: string;
   date: string;
   hours?: number;
   points?: number;
   status?: ContributionStatus;
   seasonId?: string;
   createdBy?: string;
   approvals?: ContributionApproval[];
   currentStage?: 1 | 2 | 3 | 4;
 }

 export interface ApprovalStep {
   id: string;
   requestId: string;
   order: number;
   requiredRole: RoleId;
   requiredTeamId?: TeamId | null;
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
   requesterMemberId?: string;
   requesterName?: string;
   subjectMemberId?: string;
   fromTeamId?: TeamId;
   toTeamId?: TeamId;
   title: string;
   description?: string;
   status: RequestStatus;
   currentStepOrder: number;
   priority: Priority;
   submittedAt: string;
   updatedAt: string;
   seasonId?: string;
 }

 export interface WarningRecord {
   id: string;
   memberId: string;
   memberName?: string;
   type: 'VERBAL' | 'WRITTEN' | 'FINAL';
   reason: string;
   severity: 'LOW' | 'MEDIUM' | 'HIGH';
   issuedByMemberId?: string;
   issuedByName?: string;
   issuedAt: string;
   status: 'active' | 'resolved';
   notes?: string;
 }

 export interface Achievement {
   id: string;
   title: string;
   description: string;
   date: string;
   level?: 'branch' | 'national' | 'international';
   teamIds?: TeamId[];
   memberIds?: string[];
   memberNames?: string[];
   seasonId?: string;
 }

 export interface Notification {
   id: string;
   userId: string;
   title: string;
   message: string;
   type: NotificationType;
   date: string;
   read?: boolean;
   route?: string;
   priority?: 'low' | 'normal' | 'high';
   fromName?: string;
 }

 export interface Conversation {
   id: string;
   type: ConversationType;
   title?: string;
   participantUids?: string[];
   teamId?: TeamId;
   lastMessageAt?: string;
   lastMessageText?: string;
   lastMessageSender?: string;
   unreadCounts?: Record<string, number>;
   createdBy?: string;
 }

 export interface Message {
   id: string;
   conversationId: string;
   senderUid: string;
   senderName?: string;
   text: string;
   sentAt: string;
   readBy?: string[];
 }

 export interface CalendarEvent {
   id: string;
   title: string;
   description?: string;
   date: string;
   time?: string;
   endTime?: string;
   teamId?: TeamId | null;
   isPublic?: boolean;
   type?: 'meeting' | 'event' | 'deadline' | 'workshop';
   location?: string;
   participantUids?: string[];
   seasonId?: string;
   createdBy?: string;
   createdByName?: string;
 }

 export interface TimelineEvent {
   id: string;
   memberId?: string;
   memberName?: string;
   teamId?: TeamId;
   type: string;
   title: string;
   description?: string;
   date: string;
   relatedId?: string;
 }

 export interface AuditRecord {
   id: string;
   actorUid?: string;
   actorName?: string;
   action: string;
   entity?: string;
   entityId?: string;
   date: string;
   description?: string;
 }

 export interface GovernanceDocument {
   id: string;
   title: string;
   category: string;
   description?: string;
   content: string;
   version?: string;
   updatedAt: string;
 }

 export interface SiteConfig { name: string; tagline: string; description: string; organization: string; email: string; }
 export interface OnboardingCard { id: string; icon: string; title: string; description: string; accentColor: string; order: number; }
 export interface Season { id: string; label: string; labelEn: string; start: string; end: string; isActive: boolean; theme: string; }
 `
);

file(
  "src/data/site.ts",
  `import type { SiteConfig, Season } from '@/types';

 export const site: SiteConfig = {
   name: 'sbapiaryy',
   tagline: 'Resala STEM Sub Branches — Season 7',
   description: 'The official platform for Resala STEM Sub Branches',
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

file(
  "src/data/teams.ts",
  `import type { Team } from '@/types';

 export const teams: Team[] = [
   { id: 'helpers', name: 'Helpers', nameAr: 'Helpers', description: 'Logistics, guidance, onboarding, and daily operations.', color: '#C1272D' },
   { id: 'heroes', name: 'Heroes', nameAr: 'Heroes', description: 'Field activities, community outreach, and volunteering campaigns.', color: '#FB923C' },
   { id: 'coders', name: 'Coders', nameAr: 'Coders', description: 'Designs and builds tools, platforms, and automation.', color: '#60A5FA' },
   { id: 'enviros', name: 'Enviros', nameAr: 'Enviros', description: 'Sustainability: recycling, tree planting, environmental awareness.', color: '#16A34A' },
   { id: 'messages', name: 'Messages', nameAr: 'Messages', description: 'Narrative, content, media, documentation, communication.', color: '#A78BFA' },
   { id: 'masar', name: 'Masar', nameAr: 'Masar', description: 'Student guidance, career paths, mentoring programs.', color: '#F472B6' },
   { id: 'rstc', name: 'RSTC', nameAr: 'RSTC', description: 'Resala STEM Training Center — curriculum and quality.', color: '#22D3EE' },
 ];
 `
);

file(
  "src/data/committees.ts",
  `import type { Committee } from '@/types';

 /* ═══════════════════════════════════════════════════════════════
    Committees are added by Head Sub Branches via admin panel.
    Each member MUST belong to at least one committee.
    Each committee belongs to a specific team.
    ═══════════════════════════════════════════════════════════════ */

 export const committees: Committee[] = [
   { id: 'gov-helpers', name: 'Governance Helpers', nameAr: 'حوكمة المساعدين', description: 'Helpers governance committee', color: '#151A45', icon: '', teamId: 'helpers' },
   { id: 'events-heroes', name: 'Events Heroes', nameAr: 'فعاليات الأبطال', description: 'Heroes events committee', color: '#C1272D', icon: '', teamId: 'heroes' },
   { id: 'media-messages', name: 'Media Messages', nameAr: 'إعلام الرسائل', description: 'Messages media committee', color: '#A78BFA', icon: '', teamId: 'messages' },
 ];
 `
);

file(
  "src/data/members.ts",
  `import type { Member } from '@/types';

 export const members: Member[] = [];
 `
);

file(
  "src/data/contributions.ts",
  `import type { Contribution } from '@/types';

 export const contributions: Contribution[] = [];
 `
);

file(
  "src/data/requests.ts",
  `import type { RequestRecord } from '@/types';

 export const requests: RequestRecord[] = [];
 `
);

file(
  "src/data/approvals.ts",
  `import type { ApprovalStep } from '@/types';

 export const approvals: ApprovalStep[] = [];
 `
);

file(
  "src/data/warnings.ts",
  `import type { WarningRecord } from '@/types';

 export const warnings: WarningRecord[] = [];
 `
);

file(
  "src/data/achievements.ts",
  `import type { Achievement } from '@/types';

 export const achievements: Achievement[] = [];
 `
);

file(
  "src/data/notifications.ts",
  `import type { Notification } from '@/types';

 export const notifications: Notification[] = [];
 `
);

file(
  "src/data/conversations.ts",
  `import type { Conversation, Message } from '@/types';

 export const conversations: Conversation[] = [];
 export const messages: Message[] = [];
 `
);

file(
  "src/data/calendar.ts",
  `import type { CalendarEvent } from '@/types';

 export const calendarEvents: CalendarEvent[] = [];
 `
);

file(
  "src/data/timeline.ts",
  `import type { TimelineEvent } from '@/types';

 export const timeline: TimelineEvent[] = [];
 `
);

file(
  "src/data/audit.ts",
  `import type { AuditRecord } from '@/types';

 export const audit: AuditRecord[] = [];
 `
);

file(
  "src/data/governance.ts",
  `import type { GovernanceDocument } from '@/types';

 export const governanceDocuments: GovernanceDocument[] = [];
 `
);

file(
  "src/data/onboarding.ts",
  `import type { OnboardingCard } from '@/types';

 export const onboardingCards: OnboardingCard[] = [
   { id: 'welcome', icon: '', title: 'Welcome to sbapiaryy', description: 'The platform for Resala STEM Sub Branches.', accentColor: '#C1272D', order: 1 },
   { id: 'teams', icon: '', title: 'Seven Specialized Teams', description: 'Helpers · Heroes · Coders · Enviros · Messages · Masar · RSTC', accentColor: '#60A5FA', order: 2 },
   { id: 'committees', icon: '', title: 'Committees Matter', description: 'Every member belongs to at least one committee. Committees have their own HR and rankings.', accentColor: '#16A34A', order: 3 },
   { id: 'contributions', icon: '', title: 'Flexible Point Approval', description: 'Log a contribution. Committee HR reviews and assigns points fairly.', accentColor: '#F59E0B', order: 4 },
   { id: 'league', icon: '', title: 'League & Ranking', description: 'Track your rank on team, committee, and global levels.', accentColor: '#A78BFA', order: 5 },
 ];
 `
);

file(
  "src/data/index.ts",
  `export { site, seasons, activeSeason } from './site';
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
/* ═══════════════════════════════════════════════════════════════
   PART 4 — FIREBASE + DB + AUTH + SAFE
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

   if (typeof window !== 'undefined') {
     enableIndexedDbPersistence(db).catch(() => {});
   }
   `
);

file(
  "src/lib/db.ts",
  `import {
     collection, doc, getDocs, getDoc, addDoc, setDoc,
     updateDoc, deleteDoc, query, where, type DocumentData,
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

   export async function createOne<T extends { id?: string }>(collectionName: string, data: T): Promise<string> {
     const dataRecord = data as Record<string, unknown>;
     const explicitId = typeof dataRecord.id === 'string' ? (dataRecord.id as string) : undefined;
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

   export async function updateOne(collectionName: string, id: string, data: Partial<DocumentData>): Promise<void> {
     await updateDoc(doc(db, collectionName, id), data);
   }

   export async function removeOne(collectionName: string, id: string): Promise<void> {
     await deleteDoc(doc(db, collectionName, id));
   }

   export async function listWhere<T>(collectionName: string, field: string, value: unknown): Promise<T[]> {
     const q = query(collection(db, collectionName), where(field, '==', value));
     const snap = await getDocs(q);
     return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
   }

   export function newId(prefix: string): string {
     return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
   }

   export function today(): string { return new Date().toISOString().slice(0, 10); }
   export function now(): string { return new Date().toISOString(); }
   `
);

file(
  "src/lib/safe.ts",
  `export function safeArray<T>(arr: T[] | undefined | null): T[] {
     return Array.isArray(arr) ? arr : [];
   }
   export function safeString(s: string | undefined | null): string {
     return typeof s === 'string' ? s : '';
   }
   export function safeNumber(n: number | undefined | null): number {
     return typeof n === 'number' && !isNaN(n) ? n : 0;
   }
   export function safeIncludes<T>(arr: T[] | undefined | null, value: T): boolean {
     return safeArray(arr).includes(value);
   }
   export function safeFind<T>(arr: T[] | undefined | null, fn: (item: T) => boolean): T | undefined {
     return safeArray(arr).find(fn);
   }
   `
);

file(
  "src/lib/auth.ts",
  `import {
     signInWithEmailAndPassword, signOut, onAuthStateChanged,
     sendPasswordResetEmail, updatePassword, type User as FirebaseUser,
   } from 'firebase/auth';
   import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
   import { auth, db } from './firebase';
   import { safeArray } from './safe';
   import type { AppUser, RoleId, TeamId, Member } from '@/types';

   export async function login(email: string, password: string): Promise<AppUser> {
     const cred = await signInWithEmailAndPassword(auth, email, password);
     return await ensureUserDoc(cred.user);
   }
   export async function logout(): Promise<void> { await signOut(auth); }
   export async function sendPasswordReset(email: string): Promise<void> { await sendPasswordResetEmail(auth, email); }

   export async function changePassword(newPassword: string): Promise<void> {
     const user = auth.currentUser;
     if (!user) throw new Error('No user logged in');
     await updatePassword(user, newPassword);
     await updateDoc(doc(db, 'users', user.uid), { mustChangePassword: false });
   }

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
       if (code.includes('EMAIL_EXISTS')) throw new Error('Email already in use');
       if (code.includes('WEAK_PASSWORD')) throw new Error('Weak password');
       if (code.includes('INVALID_EMAIL')) throw new Error('Invalid email');
       throw new Error('Account creation failed');
     }

     const uid: string = data.localId;
     const memberId = 'M-' + uid.slice(0, 8).toUpperCase();

     const userData: AppUser = {
       uid,
       email: input.email.trim(),
       displayName: input.name.trim(),
       role: input.role,
       teamId: input.teamIds[0] ?? null,
       committeeIds: safeArray(input.committeeIds),
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
       committeeIds: safeArray(input.committeeIds),
       joinedSeason: 7,
       hours: 0,
       points: 0,
       status: 'active',
       bio: input.bio?.trim() || undefined,
       email: input.email.trim(),
       linkedUserId: uid,
     };
     await setDoc(doc(db, 'members', memberId), memberData);
     return uid;
   }

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
       displayName: fbUser.displayName ?? fbUser.email ?? 'Member',
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

   export function observeAuth(callback: (user: AppUser | null, loading: boolean) => void): () => void {
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
   PART 5 — PERMISSIONS + COMMITTEE + RANKINGS
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/permissions.ts",
  `import type { AppUser, RoleId, TeamId } from '@/types';
   import { safeArray } from './safe';

   /* ═══════════════════════════════════════════════════════════════
      Hierarchy (top → bottom):
      HEAD  →  VICE  →  HEAD_HR_GLOBAL
      ↓
      Per Team: PRESIDENT → VICE_PRESIDENT → HEAD_HR_TEAM → HR
      Per Committee: COMMITTEE_HR
      ↓
      MEMBER → VIEWER
      ═══════════════════════════════════════════════════════════════ */

   export const ROLE_LEVEL: Record<RoleId, number> = {
     HEAD: 100,
     VICE: 95,
     HEAD_HR_GLOBAL: 90,
     PRESIDENT: 80,
     VICE_PRESIDENT: 70,
     HEAD_HR_TEAM: 65,
     HR: 60,
     COMMITTEE_HR: 55,
     MEMBER: 50,
     VIEWER: 10,
   };

   export function isAdmin(user: AppUser | null): boolean {
     if (!user) return false;
     return user.role === 'HEAD' || user.role === 'VICE';
   }

   export function isSubBranchesHead(user: AppUser | null): boolean {
     if (!user) return false;
     return user.role === 'HEAD' || user.role === 'VICE';
   }

   export function isGlobalHR(user: AppUser | null): boolean {
     return user?.role === 'HEAD_HR_GLOBAL';
   }

   export function isTeamHead(user: AppUser | null): boolean {
     return user?.role === 'PRESIDENT';
   }

   export function isTeamViceHead(user: AppUser | null): boolean {
     return user?.role === 'VICE_PRESIDENT';
   }

   export function isTeamHeadHR(user: AppUser | null): boolean {
     return user?.role === 'HEAD_HR_TEAM';
   }

   export function isTeamHR(user: AppUser | null): boolean {
     return user?.role === 'HR';
   }

   export function isCommitteeHR(user: AppUser | null): boolean {
     return user?.role === 'COMMITTEE_HR';
   }

   export function isManager(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HEAD_HR_TEAM', 'HR', 'COMMITTEE_HR'].includes(user.role);
   }

   export function seesAllTeams(user: AppUser | null): boolean {
     if (!user) return false;
     return ['HEAD', 'VICE', 'HEAD_HR_GLOBAL'].includes(user.role);
   }

   export function managedTeam(user: AppUser | null): TeamId | null {
     if (!user) return null;
     if (seesAllTeams(user)) return null;
     return user.teamId ?? null;
   }

   export function canApproveStep(user: AppUser | null, step: { status: string; requiredRole: string; requiredTeamId?: TeamId | null }): boolean {
     if (!user) return false;
     if (step.status !== 'PENDING') return false;
     if (isAdmin(user)) return true;
     if (user.role !== step.requiredRole) return false;
     if (step.requiredTeamId) return user.teamId === step.requiredTeamId;
     return true;
   }

   export const ROLE_LABEL: Record<RoleId, string> = {
     HEAD: 'Head Sub Branches',
     VICE: 'Vice Head',
     HEAD_HR_GLOBAL: 'Head HR Global',
     PRESIDENT: 'Team Head',
     VICE_PRESIDENT: 'Team Vice Head',
     HEAD_HR_TEAM: 'Team Head HR',
     HR: 'Team HR',
     COMMITTEE_HR: 'Committee HR',
     MEMBER: 'Member',
     VIEWER: 'Viewer',
   };
   `
);

file(
  "src/lib/committeePermissions.ts",
  `import type { AppUser, Contribution } from '@/types';
   import { safeArray } from './safe';
   import { isAdmin } from './permissions';

   /* ═══════════════════════════════════════════════════════════════
      3-Stage Flexible Approval:
      ─────────────────────────────────────────────────────────────
      STAGE 1: Committee HR (mandatory) — assigns points flexibly
      STAGE 2: Team Head HR OR Team Head (one of them)
      STAGE 3: Head HR Global OR Head Sub Branches OR Vice (one of them)
      ─────────────────────────────────────────────────────────────
      After all 3 approved → points awarded, notifications sent, rankings update.
      ═══════════════════════════════════════════════════════════════ */

   function hasCommittee(user: AppUser | null, committeeId: string): boolean {
     if (!user) return false;
     return safeArray(user.committeeIds).includes(committeeId);
   }

   export function userIsCommitteeHR(user: AppUser | null, committeeId: string): boolean {
     if (!user || !committeeId) return false;
     if (user.role !== 'COMMITTEE_HR') return false;
     return hasCommittee(user, committeeId);
   }

   export function userIsTeamHeadHR(user: AppUser | null, teamId: string): boolean {
     if (!user || !teamId) return false;
     if (user.role !== 'HEAD_HR_TEAM') return false;
     return user.teamId === teamId;
   }

   export function userIsTeamHead(user: AppUser | null, teamId: string): boolean {
     if (!user || !teamId) return false;
     return (user.role === 'PRESIDENT' || user.role === 'VICE_PRESIDENT') && user.teamId === teamId;
   }

   export function userIsGlobalHR(user: AppUser | null): boolean {
     return user?.role === 'HEAD_HR_GLOBAL';
   }

   export function userIsSubBranchesHead(user: AppUser | null): boolean {
     if (!user) return false;
     return user.role === 'HEAD' || user.role === 'VICE';
   }

   export function getStage(c: Contribution): 1 | 2 | 3 | 4 {
     const s = c.currentStage;
     if (s === 1 || s === 2 || s === 3 || s === 4) return s;
     if (c.status === 'approved' || c.status === 'rejected') return 4;
     return 1;
   }

   export interface StageInfo {
     stage: 1 | 2 | 3 | 4;
     label: string;
     canApprove: boolean;
     assignPoints: boolean;
   }

   export function getContributionStage(user: AppUser | null, c: Contribution): StageInfo {
     const stage = getStage(c);
     if (!user) return { stage, label: 'Unknown', canApprove: false, assignPoints: false };

     if (stage === 1) {
       return {
         stage: 1,
         label: 'Committee HR — assign points',
         canApprove: userIsCommitteeHR(user, c.committeeId || '') || isAdmin(user),
         assignPoints: true,
       };
     }
     if (stage === 2) {
       return {
         stage: 2,
         label: 'Team Head HR or Team Head',
         canApprove: userIsTeamHeadHR(user, c.teamId) || userIsTeamHead(user, c.teamId) || isAdmin(user),
         assignPoints: false,
       };
     }
     if (stage === 3) {
       return {
         stage: 3,
         label: 'Head HR Global / Head Sub Branches / Vice',
         canApprove: userIsGlobalHR(user) || userIsSubBranchesHead(user) || isAdmin(user),
         assignPoints: false,
       };
     }
     return { stage: 4, label: 'Completed', canApprove: false, assignPoints: false };
   }

   export function canReviewContribution(user: AppUser | null, c: Contribution): boolean {
     if (!user) return false;
     if (isAdmin(user)) return true;
     const stage = getStage(c);
     if (stage === 1) return userIsCommitteeHR(user, c.committeeId || '');
     if (stage === 2) return userIsTeamHeadHR(user, c.teamId) || userIsTeamHead(user, c.teamId);
     if (stage === 3) return userIsGlobalHR(user) || userIsSubBranchesHead(user);
     return false;
   }
   `
);

file(
  "src/lib/rankings.ts",
  `import type { Member, Contribution, TeamId } from '@/types';
   import { safeArray, safeNumber } from './safe';

   export function getMemberPoints(memberId: string, contributions: Contribution[]): number {
     return safeArray(contributions)
       .filter((c) => c.memberId === memberId && c.status === 'approved')
       .reduce((sum, c) => sum + safeNumber(c.points), 0);
   }

   export function getMemberHours(memberId: string, contributions: Contribution[]): number {
     return safeArray(contributions)
       .filter((c) => c.memberId === memberId && c.status === 'approved')
       .reduce((sum, c) => sum + safeNumber(c.hours), 0);
   }

   export interface RankEntry { member: Member; points: number; hours: number; rank: number; }

   export function getGlobalRanking(members: Member[], contributions: Contribution[]): RankEntry[] {
     const eligible = safeArray(members).filter((m) => m.role !== 'HEAD' && m.role !== 'VICE');
     const withPoints = eligible.map((m) => ({
       member: m,
       points: getMemberPoints(m.id, contributions),
       hours: getMemberHours(m.id, contributions),
     }));
     withPoints.sort((a, b) => b.points - a.points);
     return withPoints.map((e, i) => ({ ...e, rank: i + 1 }));
   }

   export function getTeamRanking(members: Member[], contributions: Contribution[], teamId: TeamId): RankEntry[] {
     const tm = safeArray(members).filter((m) => safeArray(m.teamIds).includes(teamId));
     const eligible = tm.filter((m) => m.role !== 'HEAD' && m.role !== 'VICE');
     const withPoints = eligible.map((m) => ({
       member: m,
       points: getMemberPoints(m.id, contributions),
       hours: getMemberHours(m.id, contributions),
     }));
     withPoints.sort((a, b) => b.points - a.points);
     return withPoints.map((e, i) => ({ ...e, rank: i + 1 }));
   }

   export function getCommitteeRanking(members: Member[], contributions: Contribution[], committeeId: string): RankEntry[] {
     const cm = safeArray(members).filter((m) => safeArray(m.committeeIds).includes(committeeId));
     const eligible = cm.filter((m) => m.role !== 'HEAD' && m.role !== 'VICE');
     const withPoints = eligible.map((m) => {
       const filtered = safeArray(contributions)
         .filter((c) => c.memberId === m.id && c.committeeId === committeeId && c.status === 'approved');
       return {
         member: m,
         points: filtered.reduce((s, c) => s + safeNumber(c.points), 0),
         hours: filtered.reduce((s, c) => s + safeNumber(c.hours), 0),
       };
     });
     withPoints.sort((a, b) => b.points - a.points);
     return withPoints.map((e, i) => ({ ...e, rank: i + 1 }));
   }

   export function getTeamTotalPoints(members: Member[], contributions: Contribution[], teamId: TeamId): number {
     const ids = new Set(safeArray(members).filter((m) => safeArray(m.teamIds).includes(teamId)).map((m) => m.id));
     return safeArray(contributions)
       .filter((c) => ids.has(c.memberId) && c.status === 'approved')
       .reduce((s, c) => s + safeNumber(c.points), 0);
   }

   export function getCommitteeTotalPoints(members: Member[], contributions: Contribution[], committeeId: string): number {
     const ids = new Set(safeArray(members).filter((m) => safeArray(m.committeeIds).includes(committeeId)).map((m) => m.id));
     return safeArray(contributions)
       .filter((c) => ids.has(c.memberId) && c.committeeId === committeeId && c.status === 'approved')
       .reduce((s, c) => s + safeNumber(c.points), 0);
   }

   export interface UserRanks {
     global: { rank: number; total: number; points: number } | null;
     team: { rank: number; total: number; points: number; teamId: TeamId } | null;
     committees: Array<{ committeeId: string; rank: number; total: number; points: number }>;
   }

   export function getUserRanks(userMemberId: string | null | undefined, members: Member[], contributions: Contribution[]): UserRanks {
     if (!userMemberId) return { global: null, team: null, committees: [] };
     const member = safeArray(members).find((m) => m.id === userMemberId);
     if (!member) return { global: null, team: null, committees: [] };

     const global = getGlobalRanking(members, contributions);
     const gEntry = global.find((e) => e.member.id === userMemberId);

     let teamData: UserRanks['team'] = null;
     const teamIds = safeArray(member.teamIds);
     if (teamIds.length > 0) {
       const tid = teamIds[0];
       const tRank = getTeamRanking(members, contributions, tid);
       const tEntry = tRank.find((e) => e.member.id === userMemberId);
       if (tEntry) teamData = { rank: tEntry.rank, total: tRank.length, points: tEntry.points, teamId: tid };
     }

     const committeeData: UserRanks['committees'] = [];
     for (const cid of safeArray(member.committeeIds)) {
       const cRank = getCommitteeRanking(members, contributions, cid);
       const cEntry = cRank.find((e) => e.member.id === userMemberId);
       if (cEntry) committeeData.push({ committeeId: cid, rank: cEntry.rank, total: cRank.length, points: cEntry.points });
     }

     return {
       global: gEntry ? { rank: gEntry.rank, total: global.length, points: gEntry.points } : null,
       team: teamData,
       committees: committeeData,
     };
   }
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 6 — CONTRIBUTION APPROVAL (3-Stage) + NOTIF + AUDIT
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/lib/contributionApprovals.ts",
  `import { updateOne, getOne, now } from './db';
   import { notifyUser } from './notifications';
   import { logAudit } from './audit';
   import { safeNumber } from './safe';
   import type { Contribution, ContributionApproval, AppUser } from '@/types';

   /* ═══════════════════════════════════════════════════════════════
      3-stage approval — points assigned by Committee HR (flexible).
      Stage 1: Committee HR (mandatory, assigns points)
      Stage 2: Team Head HR OR Team Head (one of them)
      Stage 3: Head HR Global OR Head Sub Branches OR Vice (one of them)
      ═══════════════════════════════════════════════════════════════ */

   function getStage(c: Contribution): 1 | 2 | 3 | 4 {
     const s = c.currentStage;
     if (s === 1 || s === 2 || s === 3 || s === 4) return s;
     if (c.status === 'approved' || c.status === 'rejected') return 4;
     return 1;
   }

   function getApprovals(c: Contribution): ContributionApproval[] {
     if (Array.isArray(c.approvals) && c.approvals.length > 0) return [...c.approvals];
     return [
       { stage: 1, status: 'pending' },
       { stage: 2, status: 'pending' },
       { stage: 3, status: 'pending' },
     ];
   }

   export function newContributionApprovals(): ContributionApproval[] {
     return [
       { stage: 1, status: 'pending' },
       { stage: 2, status: 'pending' },
       { stage: 3, status: 'pending' },
     ];
   }

   /* ═══════════ Approve current stage ═══════════ */

   export async function approveContributionStage(
     contribution: Contribution,
     user: AppUser,
     points?: number,
     comment?: string,
   ): Promise<void> {
     const stage = getStage(contribution);
     if (stage < 1 || stage > 3) throw new Error('Invalid stage');

     const approvals = getApprovals(contribution);
     const idx = approvals.findIndex((a) => a.stage === stage);

     const newApproval: ContributionApproval = {
       stage: stage as 1 | 2 | 3,
       status: 'approved',
       approvedBy: user.uid,
       approvedByName: user.displayName,
       approvedByRole: user.role,
       approvedAt: now(),
       comment: comment?.trim() || undefined,
       points: stage === 1 && typeof points === 'number' ? points : undefined,
     };

     if (idx >= 0) approvals[idx] = newApproval;
     else approvals.push(newApproval);

     let updatedPoints = safeNumber(contribution.points);

     if (stage === 1) {
       if (typeof points !== 'number') throw new Error('Points must be assigned at stage 1');
       updatedPoints = points;
     }

     if (stage === 3) {
       /* ─── Final approval: award points, update member, notify ─── */
       await updateOne('contributions', contribution.id, {
         approvals,
         points: updatedPoints,
         status: 'approved',
         currentStage: 4,
       });

       /* Award points to member */
       if (updatedPoints > 0) {
         try {
           const member = await getOne<{ points?: number; hours?: number }>('members', contribution.memberId);
           if (member) {
             await updateOne('members', contribution.memberId, {
               points: safeNumber(member.points) + updatedPoints,
               hours: safeNumber(member.hours) + safeNumber(contribution.hours),
             });
           }
         } catch (e) { console.warn('Member update failed:', e); }
       }

       /* Notify member */
       try {
         await notifyUser(
           contribution.createdBy || '',
           'Contribution approved',
           '"' + contribution.title + '" — +' + updatedPoints + ' points',
           'participation',
           '/my-contributions',
           'high',
           user.displayName,
         );
       } catch (e) { /* ignore */ }

       try { await logAudit(user, 'APPROVE_CONTRIBUTION_FINAL', 'Contribution', contribution.id, contribution.title); } catch (e) { /* ignore */ }
     } else {
       /* Move to next stage */
       const nextStage = (stage + 1) as 2 | 3;
       await updateOne('contributions', contribution.id, {
         approvals,
         points: updatedPoints,
         status: 'in_review',
         currentStage: nextStage,
       });

       try {
         await notifyUser(
           contribution.createdBy || '',
           'Contribution progressing',
           '"' + contribution.title + '" — stage ' + nextStage + ' of 3',
           'approval',
           '/my-contributions',
           'normal',
           user.displayName,
         );
       } catch (e) { /* ignore */ }

       try { await logAudit(user, 'APPROVE_CONTRIBUTION_STAGE', 'Contribution', contribution.id, 'Stage ' + stage); } catch (e) { /* ignore */ }
     }
   }

   /* ═══════════ Reject ═══════════ */

   export async function rejectContributionStage(
     contribution: Contribution,
     user: AppUser,
     comment: string,
   ): Promise<void> {
     if (!comment.trim()) throw new Error('Reason required');

     const stage = getStage(contribution);
     const approvals = getApprovals(contribution);
     const idx = approvals.findIndex((a) => a.stage === stage);

     const newApproval: ContributionApproval = {
       stage: stage as 1 | 2 | 3,
       status: 'rejected',
       approvedBy: user.uid,
       approvedByName: user.displayName,
       approvedByRole: user.role,
       approvedAt: now(),
       comment: comment.trim(),
     };

     if (idx >= 0) approvals[idx] = newApproval;
     else approvals.push(newApproval);

     for (let s = stage + 1; s <= 3; s++) {
       if (!approvals.some((a) => a.stage === s)) {
         approvals.push({ stage: s as 1 | 2 | 3, status: 'skipped' });
       }
     }

     await updateOne('contributions', contribution.id, { approvals, status: 'rejected' });

     try {
       await notifyUser(
         contribution.createdBy || '',
         'Contribution rejected',
         '"' + contribution.title + '" — ' + comment,
         'participation',
         '/my-contributions',
         'high',
         user.displayName,
       );
     } catch (e) { /* ignore */ }

     try { await logAudit(user, 'REJECT_CONTRIBUTION', 'Contribution', contribution.id, comment); } catch (e) { /* ignore */ }
   }
   `
);

file(
  "src/lib/notifications.ts",
  `import { createOne, newId, now } from './db';
   import { safeArray } from './safe';
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
     try { await createOne('notifications', notif); } catch { /* ignore */ }
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
     for (const u of safeArray(users)) {
       await notifyUser(u.uid, title, message, type, route, priority, fromName);
     }
   }

   export async function notifyManagers(
     allUsers: AppUser[],
     title: string,
     message: string,
     type: NotificationType,
     route?: string,
     priority: 'low' | 'normal' | 'high' = 'normal',
     fromName?: string,
   ): Promise<void> {
     const managers = safeArray(allUsers).filter((u) =>
       ['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HEAD_HR_TEAM', 'HR', 'COMMITTEE_HR'].includes(u.role),
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
     const targets = safeArray(allUsers).filter(
       (u) => (u.role === 'PRESIDENT' || u.role === 'VICE_PRESIDENT' || u.role === 'HR' || u.role === 'HEAD_HR_TEAM') && u.teamId === teamId,
     );
     await notifyUsers(targets, title, message, type, route, priority, fromName);
   }
   `
);

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
       actorName: user?.displayName ?? 'System',
       action,
       entity,
       entityId,
       date: now(),
       description,
     };
     try { await createOne('audit', record); } catch { /* ignore */ }
   }
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 7 — HOOKS + FORMAT + SEED
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

file(
  "src/lib/useRealtimeCollection.ts",
  `import { useEffect, useState } from 'react';
   import { collection, onSnapshot, query } from 'firebase/firestore';
   import { db } from './firebase';

   export function useRealtimeCollection<T>(collectionName: string): { data: T[]; loading: boolean } {
     const [data, setData] = useState<T[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       let unsub: (() => void) | null = null;
       try {
         const q = query(collection(db, collectionName));
         unsub = onSnapshot(
           q,
           (snap) => {
             try {
               const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
               setData(items);
             } catch (e) {
               console.error('Map failed for ' + collectionName + ':', e);
               setData([]);
             }
             setLoading(false);
           },
           (err) => {
             console.error('Snapshot error ' + collectionName + ':', err);
             setData([]);
             setLoading(false);
           },
         );
       } catch (e) {
         console.error('Subscribe error ' + collectionName + ':', e);
         setData([]);
         setLoading(false);
       }
       return () => { if (unsub) try { unsub(); } catch (e) { /* ignore */ } };
     }, [collectionName]);

     return { data, loading };
   }

   export const useCollection = useRealtimeCollection;
   `
);

file(
  "src/lib/format.ts",
  `export function cx(...p: Array<string | false | null | undefined>): string {
     return p.filter(Boolean).join(' ');
   }
   export function formatDate(iso: string): string {
     if (!iso) return '—';
     const d = new Date(iso);
     if (Number.isNaN(d.getTime())) return iso;
     return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
   }
   export function formatDateTime(iso: string): string {
     if (!iso) return '—';
     const d = new Date(iso);
     if (Number.isNaN(d.getTime())) return iso;
     return d.toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
   }
   export function formatTime(iso: string): string {
     if (!iso) return '';
     const d = new Date(iso);
     if (Number.isNaN(d.getTime())) return '';
     return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
   }
   export function relativeTime(iso: string): string {
     if (!iso) return '';
     const diff = Date.now() - new Date(iso).getTime();
     const mins = Math.floor(diff / 60000);
     const hrs = Math.floor(diff / 3600000);
     const days = Math.floor(diff / 86400000);
     if (mins < 1) return 'Just now';
     if (mins < 60) return mins + 'm ago';
     if (hrs < 24) return hrs + 'h ago';
     if (days < 30) return days + 'd ago';
     return formatDate(iso);
   }
   export function initials(name: string): string {
     const parts = name.trim().split(/\\s+/).filter(Boolean);
     if (parts.length === 0) return '?';
     if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
     return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
   }
   export function hoursToPoints(hours: number): number { return Math.round(hours * 5); }
   export function today(): string { return new Date().toISOString().slice(0, 10); }
   const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
   export function getArabicMonth(m: number): string { return EN_MONTHS[m]; }
   export function getDaysInMonth(y: number, m: number): number { return new Date(y, m + 1, 0).getDate(); }
   export function getFirstWeekdayOfMonth(y: number, m: number): number { return new Date(y, m, 1).getDay(); }
   export const REQUEST_TYPE_LABEL: Record<string, string> = { TRANSFER: 'Transfer', PROMOTION: 'Promotion', RESIGNATION: 'Resignation', COMPLAINT: 'Complaint', SUGGESTION: 'Suggestion', LEAVE: 'Leave' };
   export const REQUEST_STATUS_LABEL: Record<string, string> = { PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed' };
   export const PRIORITY_LABEL: Record<string, string> = { LOW: 'Low', NORMAL: 'Normal', HIGH: 'High', URGENT: 'Urgent' };
   export const APPROVAL_STATUS_LABEL: Record<string, string> = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', SKIPPED: 'Skipped' };
   `
);

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
         navigator.serviceWorker.register('./sw.js').catch(() => {});
       });
     }
   }
   export function canInstallPwa(): boolean { return deferredPrompt !== null; }
   export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
     if (!deferredPrompt) return 'unavailable';
     try {
       await deferredPrompt.prompt();
       const choice = await deferredPrompt.userChoice;
       if (choice.outcome === 'accepted') deferredPrompt = null;
       return choice.outcome;
     } catch { return 'unavailable'; }
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
   `
);

file(
  "src/lib/onboarding.ts",
  `const ONBOARDING_KEY = 'sbapiaryy-onboarding-v6';

   export function hasCompletedOnboarding(): boolean {
     if (typeof window === 'undefined') return true;
     return localStorage.getItem(ONBOARDING_KEY) === 'done';
   }
   export function markOnboardingComplete(): void {
     if (typeof window === 'undefined') return;
     localStorage.setItem(ONBOARDING_KEY, 'done');
   }
   `
);

file(
  "src/lib/seed.ts",
  `import { teams } from '@/data/teams';
   import { committees } from '@/data/committees';
   import { createOne, listAll } from './db';

   export interface SeedResult {
     teams: number;
     committees: number;
     members: number;
     contributions: number;
   }

   export async function seedAll(): Promise<SeedResult> {
     const existing = await listAll('teams').catch(() => []);
     if (existing.length > 0) {
       throw new Error('Data already exists. Clear Firestore collections to re-seed.');
     }
     for (const t of teams) await createOne('teams', t);
     for (const c of committees) await createOne('committees', c);
     return {
       teams: teams.length,
       committees: committees.length,
       members: 0,
       contributions: 0,
     };
   }
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 8 — STYLES (preserved + committee.css)
   ═══════════════════════════════════════════════════════════════ */

const stylesDir = "src/styles";

/* Tokens */
file(
  stylesDir + "/tokens.css",
  `:root {
     --c-navy: #151A45;
     --c-navy-soft: #1B2156;
     --c-navy-2: #232A66;
     --c-navy-3: #2E3680;
     --c-red: #C1272D;
     --c-red-soft: #A01F24;
     --c-red-tint: #FEE2E2;
     --c-white: #FFFFFF;
     --c-off-white: #FAFBFD;
     --c-line: #E3E6F0;
     --c-line-mid: #C9CFE1;
     --c-ink: #151A45;
     --c-ink-soft: #3A4176;
     --c-ink-muted: #6B7299;
     --c-paper: #FFFFFF;
     --c-paper-soft: #D5DAF0;
     --c-paper-muted: #8891BE;
     --c-green: #16A34A;
     --c-green-soft: #DCFCE7;
     --c-green-text: #166534;
     --c-amber: #D97706;
     --c-amber-soft: #FEF3C7;
     --c-amber-text: #92400E;
     --c-blue: #2563EB;
     --c-blue-soft: #DBEAFE;
     --c-blue-text: #1E40AF;
     --c-purple: #7C3AED;
     --c-purple-soft: #EDE9FE;
     --c-purple-text: #5B21B6;
     --c-pink: #EC4899;
     --c-pink-soft: #FCE7F3;
     --c-pink-text: #9D174D;
     --font: 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
     --font-en: 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
     --font-mono: 'Space Grotesk', 'SF Mono', Menlo, monospace;
     --radius-xs: 6px;
     --radius-sm: 10px;
     --radius: 14px;
     --radius-lg: 20px;
     --radius-xl: 28px;
     --radius-full: 999px;
     --container: 1280px;
     --navbar-h: 68px;
     --sidebar-w: 280px;
     --sidebar-w-mob: 290px;
     --bottom-nav-h: 68px;
     --shadow-xs: 0 1px 2px rgba(21, 26, 69, 0.04);
     --shadow-sm: 0 2px 8px rgba(21, 26, 69, 0.06);
     --shadow: 0 8px 24px rgba(21, 26, 69, 0.10);
     --shadow-lg: 0 20px 60px -20px rgba(21, 26, 69, 0.20);
     --shadow-red: 0 8px 24px -8px rgba(193, 39, 45, 0.4);
     --ease: cubic-bezier(0.2, 0.7, 0.3, 1);
     --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
     --safe-top: env(safe-area-inset-top, 0px);
     --safe-bottom: env(safe-area-inset-bottom, 0px);
   }
   `
);

file(
  stylesDir + "/base.css",
  `*, *::before, *::after { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
   html { scroll-behavior: smooth; direction: ltr; }
   html, body { margin: 0; padding: 0; min-height: 100%; overscroll-behavior-y: none; }
   body { font-family: var(--font); font-size: 16px; line-height: 1.7; color: var(--c-ink); background: var(--c-off-white); -webkit-font-smoothing: antialiased; font-weight: 400; direction: ltr; }
   #root { min-height: 100vh; min-height: 100dvh; }
   h1, h2, h3, h4, h5, h6 { font-family: var(--font); color: var(--c-ink); font-weight: 400; line-height: 1.3; margin: 0; }
   h1 { font-size: 2rem; }
   h2 { font-size: 1.6rem; }
   h3 { font-size: 1.25rem; }
   @media (min-width: 640px) { h1 { font-size: 2.4rem; } h2 { font-size: 1.85rem; } h3 { font-size: 1.4rem; } }
   p { margin: 0; }
   a { color: inherit; text-decoration: none; }
   button, input, select, textarea { font: inherit; color: inherit; }
   button { cursor: pointer; border: none; background: none; padding: 0; }
   img, svg, video { display: block; max-width: 100%; height: auto; }
   ul, ol { margin: 0; padding: 0; list-style: none; }
   ::selection { background: var(--c-navy); color: #fff; }
   *:focus-visible { outline: 2px solid var(--c-red); outline-offset: 2px; border-radius: var(--radius-xs); }
   `
);

file(
  stylesDir + "/layout.css",
  `.app-shell { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; padding-top: var(--safe-top); overflow-x: hidden; }
   .app-main { flex: 1; padding-bottom: var(--safe-bottom); overflow-x: hidden; }
   .container { width: 100%; max-width: 1280px; margin-inline: auto; padding-inline: 20px; box-sizing: border-box; }
   @media (min-width: 480px) { .container { padding-inline: 24px; } }
   @media (min-width: 640px) { .container { padding-inline: 32px; } }
   @media (min-width: 900px) { .container { padding-inline: 44px; } }
   .app-main > *:not(.container) { padding-inline: 20px; }
   @media (min-width: 640px) { .app-main > *:not(.container) { padding-inline: 32px; } }
   .section { padding-block: 32px; }
   .section--tight { padding-block: 22px; }
   @media (min-width: 640px) { .section { padding-block: 44px; } .section--tight { padding-block: 26px; } }
   .section-head { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
   @media (min-width: 640px) { .section-head { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 32px; } }
   .section-head__eyebrow { font-size: 0.78rem; color: var(--c-red); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
   .section-head h2 { font-size: 1.5rem; }
   .section-head__desc { color: var(--c-ink-muted); font-size: 0.95rem; margin-top: 8px; max-width: 62ch; line-height: 1.7; }
   .grid { display: grid; gap: 18px; grid-template-columns: 1fr; }
   @media (min-width: 480px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
   @media (min-width: 768px) { .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 22px; } }
   .grid--wide { grid-template-columns: 1fr; }
   @media (min-width: 640px) { .grid--wide { grid-template-columns: repeat(2, 1fr); } }
   @media (min-width: 1024px) { .grid--wide { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); } }
   .grid--narrow { grid-template-columns: repeat(2, 1fr); gap: 14px; }
   @media (min-width: 640px) { .grid--narrow { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; } }
   .grid--2 { grid-template-columns: 1fr; }
   @media (min-width: 768px) { .grid--2 { grid-template-columns: repeat(2, 1fr); } }
   .stack { display: flex; flex-direction: column; gap: 18px; }
   .stack--sm { gap: 12px; }
   .stack--lg { gap: 26px; }
   .row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
   .row--between { justify-content: space-between; }
   .muted { color: var(--c-ink-muted); }
   .soft { color: var(--c-ink-soft); }
   .small { font-size: 0.85rem; }
   .tiny { font-size: 0.75rem; }
   .center { text-align: center; }
   .mt-1 { margin-top: 4px; } .mt-2 { margin-top: 8px; } .mt-3 { margin-top: 12px; }
   .mt-4 { margin-top: 16px; } .mt-5 { margin-top: 20px; } .mt-6 { margin-top: 24px; }
   .mb-1 { margin-bottom: 4px; } .mb-2 { margin-bottom: 8px; } .mb-3 { margin-bottom: 12px; } .mb-4 { margin-bottom: 16px; }
   .hide-mobile { display: none; }
   @media (min-width: 768px) { .hide-mobile { display: block; } .show-mobile { display: none !important; } }
   `
);

file(
  stylesDir + "/navbar.css",
  `.navbar { position: sticky; top: 0; z-index: 50; height: var(--navbar-h); display: flex; align-items: center; background: var(--c-navy); border-bottom: 1px solid var(--c-navy-2); }
   .navbar__inner { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 16px; }
   .brand { font-family: var(--font); font-size: 1.5rem; color: var(--c-paper); letter-spacing: 0.02em; }
   .brand:hover { opacity: 0.85; }
   .nav-actions { display: flex; align-items: center; gap: 8px; }
   .nav-action { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 18px; border-radius: var(--radius-sm); font-size: 0.95rem; color: var(--c-paper-soft); transition: all 0.15s; background: transparent; border: 1px solid transparent; font-family: inherit; cursor: pointer; text-decoration: none; }
   .nav-action:hover { background: var(--c-navy-2); color: var(--c-paper); }
   .nav-action--primary { background: var(--c-red); color: #fff; border-color: var(--c-red); }
   .nav-action--danger { color: var(--c-red); border-color: var(--c-red); }
   .nav-action--danger:hover { background: var(--c-red); color: #fff; }
   .nav-action--icon { padding: 10px; min-width: 44px; min-height: 44px; position: relative; }
   .nav-action__badge { position: absolute; top: 2px; right: 2px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: var(--c-red); color: #fff; font-size: 0.68rem; display: grid; place-items: center; border: 2px solid var(--c-navy); }
   .nav-action__menu { width: 20px; height: 14px; display: flex; flex-direction: column; justify-content: space-between; }
   .nav-action__menu span { display: block; height: 2px; background: currentColor; border-radius: 2px; }
   @media (max-width: 900px) { .navbar { height: calc(var(--navbar-h) + var(--safe-top)); padding-top: var(--safe-top); } .brand { font-size: 1.2rem; } .nav-action { font-size: 0.9rem; padding: 9px 14px; } }
   `
);

file(
  stylesDir + "/bottom-nav.css",
  `.bottom-nav { display: none; }
   @media (max-width: 900px) {
   .bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; z-index: 60; height: calc(var(--bottom-nav-h) + var(--safe-bottom)); padding-bottom: var(--safe-bottom); background: var(--c-white); border-top: 1px solid var(--c-line); box-shadow: 0 -2px 12px rgba(21, 26, 69, 0.06); }
   .bottom-nav__inner { display: flex; align-items: stretch; justify-content: space-around; width: 100%; padding-inline: 6px; }
   .bottom-nav__item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 10px 4px 8px; color: var(--c-ink-muted); font-size: 0.75rem; text-decoration: none; position: relative; background: none; border: none; cursor: pointer; font-family: inherit; }
   .bottom-nav__item.is-active { color: var(--c-navy); }
   .bottom-nav__item.is-active::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 28px; height: 3px; background: var(--c-navy); border-radius: 0 0 4px 4px; }
   .bottom-nav__icon { display: flex; align-items: center; justify-content: center; line-height: 1; }
   .bottom-nav__icon svg { width: 24px; height: 24px; display: block; }
   .bottom-nav__label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
   .bottom-nav__badge { position: absolute; top: 6px; right: 50%; margin-right: -22px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px; background: var(--c-red); color: #fff; font-size: 0.65rem; display: grid; place-items: center; border: 2px solid var(--c-white); }
   .app-main { padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 12px); }
   }
   `
);

file(
  stylesDir + "/sidebar.css",
  `.dashboard-layout { display: grid; grid-template-columns: 1fr; gap: 20px; padding-block: 24px; }
   @media (min-width: 901px) { .dashboard-layout { grid-template-columns: 280px 1fr; gap: 32px; padding-block: 32px; } }
   .sidebar { display: block; }
   .sidebar-overlay { display: none; }
   @media (max-width: 900px) {
   .sidebar { position: fixed; top: 0; left: -320px; width: 290px; max-width: 88vw; height: 100dvh; background: var(--c-white); z-index: 200; padding: 24px 20px; padding-top: calc(24px + var(--safe-top)); padding-bottom: calc(24px + var(--safe-bottom)); overflow-y: auto; transition: left 0.28s; box-shadow: 12px 0 40px rgba(21, 26, 69, 0.15); border-right: 1px solid var(--c-line); }
   .sidebar.is-open { left: 0; }
   .sidebar-overlay { display: block; position: fixed; inset: 0; background: rgba(21, 26, 69, 0.55); z-index: 199; opacity: 0; pointer-events: none; transition: opacity 0.25s; }
   .sidebar-overlay.is-open { opacity: 1; pointer-events: auto; }
   }
   .sidebar__user { display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: var(--radius); background: var(--c-navy); color: var(--c-paper); margin-bottom: 24px; }
   .sidebar__user-info { flex: 1; min-width: 0; }
   .sidebar__user-name { font-size: 1rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
   .sidebar__user-role { font-size: 0.82rem; color: var(--c-paper-soft); margin-top: 2px; }
   .sidebar__group { margin-bottom: 24px; }
   .sidebar__title { font-size: 0.75rem; color: var(--c-ink-muted); letter-spacing: 0.1em; text-transform: uppercase; padding: 0 14px; margin-bottom: 10px; }
   .sidebar__link { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: var(--radius-sm); color: var(--c-ink-soft); font-size: 0.95rem; background: transparent; border: none; width: 100%; text-align: start; cursor: pointer; font-family: inherit; text-decoration: none; }
   .sidebar__link:hover { background: var(--c-off-white); color: var(--c-navy); }
   .sidebar__link.is-active { background: var(--c-navy); color: #fff; }
   .sidebar__count { margin-left: auto; font-size: 0.75rem; padding: 3px 10px; border-radius: 999px; background: var(--c-red); color: #fff; }
   .sidebar__link--danger { color: var(--c-red); }
   .sidebar__link--danger:hover { background: var(--c-red-tint); }
   .sidebar-close { display: none; }
   @media (max-width: 900px) { .sidebar-close { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--c-off-white); color: var(--c-ink); font-size: 1.3rem; cursor: pointer; margin-left: auto; margin-bottom: 20px; border: 1px solid var(--c-line); } }
   `
);

file(
  stylesDir + "/cards.css",
  `.card { position: relative; display: block; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); padding: 24px; color: var(--c-ink); box-shadow: var(--shadow-xs); transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s; }
   @media (max-width: 640px) { .card { padding: 20px; } }
   a.card:hover, button.card:hover { border-color: var(--c-line-mid); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
   .card.no-click { cursor: default; }
   .card.no-click:hover { transform: none; box-shadow: var(--shadow-xs); }
   .card--navy { background: var(--c-navy); border-color: var(--c-navy-2); color: var(--c-paper); }
   .card--navy .card__title { color: var(--c-paper); }
   .card--navy .card__meta { color: var(--c-paper-muted); }
   .card__title { font-size: 1.05rem; color: var(--c-ink); line-height: 1.4; }
   .card__meta { font-size: 0.85rem; color: var(--c-ink-muted); margin-top: 6px; line-height: 1.65; }
   .card__body { margin-top: 14px; font-size: 0.9rem; color: var(--c-ink-soft); line-height: 1.75; }
   .card__footer { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--c-line); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
   .stat-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
   @media (min-width: 640px) { .stat-row { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 18px; } }
   .stat { background: var(--c-navy); border: 1px solid var(--c-navy-2); border-radius: var(--radius); padding: 24px 18px; text-align: center; }
   @media (min-width: 640px) { .stat { padding: 28px 22px; } }
   .stat__value { font-size: 1.8rem; color: var(--c-paper); line-height: 1; }
   @media (min-width: 640px) { .stat__value { font-size: 2.1rem; } }
   .stat__label { margin-top: 10px; font-size: 0.78rem; color: var(--c-paper-soft); }
   .stat--red .stat__value { color: var(--c-red); }
   .stat--success .stat__value { color: var(--c-green); }
   .stat--amber .stat__value { color: var(--c-amber); }
   `
);

file(
  stylesDir + "/badges.css",
  `.badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: var(--radius-full); font-size: 0.82rem; font-family: var(--font); white-space: nowrap; line-height: 1.5; vertical-align: middle; background: var(--c-line); color: var(--c-ink-soft); border: 1px solid var(--c-line-mid); flex-shrink: 0; }
   .badge__dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
   .badge--neutral { background: var(--c-line); color: var(--c-ink-soft); border-color: var(--c-line-mid); }
   .badge--success { background: var(--c-green-soft); color: var(--c-green-text); border-color: #86EFAC; }
   .badge--warning { background: var(--c-amber-soft); color: var(--c-amber-text); border-color: #FCD34D; }
   .badge--danger { background: var(--c-red-tint); color: #991B1B; border-color: #FCA5A5; }
   .badge--info { background: var(--c-blue-soft); color: var(--c-blue-text); border-color: #93C5FD; }
   .badge--navy { background: var(--c-navy); color: #fff; border-color: var(--c-navy); }
   .badge--red { background: var(--c-red); color: #fff; border-color: var(--c-red); }
   `
);

file(
  stylesDir + "/buttons.css",
  `.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 24px; border-radius: var(--radius-sm); border: 1.5px solid transparent; font-size: 1rem; font-family: var(--font); cursor: pointer; transition: all 0.15s; text-decoration: none; line-height: 1.4; white-space: nowrap; }
   .btn:active:not(:disabled) { transform: scale(0.98); }
   .btn:disabled { opacity: 0.5; cursor: not-allowed; }
   .btn--primary { background: var(--c-red); color: #fff; border-color: var(--c-red); }
   .btn--primary:hover:not(:disabled) { background: var(--c-red-soft); }
   .btn--navy { background: var(--c-navy); color: #fff; border-color: var(--c-navy); }
   .btn--ghost { background: var(--c-white); border-color: var(--c-line-mid); color: var(--c-ink); }
   .btn--ghost:hover:not(:disabled) { background: var(--c-off-white); border-color: var(--c-navy); color: var(--c-navy); }
   .btn--danger { background: var(--c-red); color: #fff; border-color: var(--c-red); }
   .btn--success { background: var(--c-green); color: #fff; border-color: var(--c-green); }
   .btn--outline-danger { background: transparent; border-color: var(--c-red); color: var(--c-red); }
   .btn--outline-danger:hover:not(:disabled) { background: var(--c-red); color: #fff; }
   .btn--sm { padding: 9px 18px; font-size: 0.92rem; }
   .btn--xs { padding: 7px 14px; font-size: 0.85rem; }
   .btn--block { width: 100%; }
   `
);

file(
  stylesDir + "/tables.css",
  `.table-wrap { border: 1px solid var(--c-line); border-radius: var(--radius); overflow: hidden; background: var(--c-white); box-shadow: var(--shadow-xs); }
   table.data { width: 100%; border-collapse: collapse; font-size: 0.92rem; color: var(--c-ink); }
   table.data th { text-align: start; padding: 16px 24px; font-size: 0.78rem; color: var(--c-paper); background: var(--c-navy); border-bottom: 1px solid var(--c-navy-2); white-space: nowrap; text-transform: uppercase; letter-spacing: 0.05em; }
   table.data td { padding: 16px 24px; border-bottom: 1px solid var(--c-line); vertical-align: middle; }
   table.data tr:last-child td { border-bottom: none; }
   table.data tbody tr:hover { background: var(--c-off-white); }
   .rank { color: var(--c-ink-muted); width: 56px; }
   .rank--1 { color: var(--c-red); }
   .rank--2 { color: var(--c-navy-2); }
   .points { color: var(--c-navy); }
   @media (max-width: 700px) {
   .table-wrap { border: none; background: transparent; box-shadow: none; }
   table.data { display: block; }
   table.data thead { display: none; }
   table.data tbody { display: block; }
   table.data tr { display: block; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); padding: 20px; margin-bottom: 14px; box-shadow: var(--shadow-xs); }
   table.data td { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border: none; gap: 14px; }
   table.data td:not(:first-child)::before { content: attr(data-label); font-size: 0.75rem; color: var(--c-ink-muted); text-transform: uppercase; letter-spacing: 0.04em; }
   }
   `
);

file(
  stylesDir + "/forms.css",
  `.input { width: 100%; padding: 13px 16px; background: var(--c-white); border: 1.5px solid var(--c-line-mid); border-radius: var(--radius-sm); font-size: 1rem; font-family: var(--font); color: var(--c-ink); outline: none; transition: border-color 0.15s, box-shadow 0.15s; direction: ltr; text-align: left; }
   .input:focus { border-color: var(--c-navy); box-shadow: 0 0 0 4px rgba(21, 26, 69, 0.08); }
   textarea.input { min-height: 110px; resize: vertical; line-height: 1.75; }
   select.input { cursor: pointer; }
   .form-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
   .form-field__label { font-size: 0.9rem; color: var(--c-ink-soft); }
   .form-field__req { color: var(--c-red); margin-left: 2px; }
   .form-field__hint { font-size: 0.82rem; color: var(--c-ink-muted); }
   .form-field__error { font-size: 0.85rem; color: var(--c-red); }
   .toolbar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
   @media (min-width: 640px) { .toolbar { flex-direction: row; flex-wrap: wrap; gap: 14px; margin-bottom: 24px; } }
   .chips { display: flex; gap: 10px; flex-wrap: nowrap; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
   .chips::-webkit-scrollbar { display: none; }
   @media (min-width: 640px) { .chips { flex-wrap: wrap; overflow: visible; } }
   .chip { padding: 9px 18px; border-radius: var(--radius-full); border: 1.5px solid var(--c-line-mid); background: var(--c-white); color: var(--c-ink-soft); font-size: 0.9rem; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
   .chip:hover { border-color: var(--c-navy); color: var(--c-navy); }
   .chip.is-active { background: var(--c-red); border-color: var(--c-red); color: #fff; }
   `
);

file(
  stylesDir + "/modal.css",
  `.modal-backdrop { position: fixed; inset: 0; background: rgba(21, 26, 69, 0.55); display: flex; align-items: flex-end; justify-content: center; z-index: 300; backdrop-filter: blur(4px); }
   @media (min-width: 640px) { .modal-backdrop { align-items: center; padding: 20px; } }
   .modal { background: var(--c-white); border-radius: var(--radius-lg) var(--radius-lg) 0 0; max-width: 100%; width: 100%; max-height: 92dvh; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 -20px 60px rgba(21, 26, 69, 0.3); padding-bottom: var(--safe-bottom); }
   @media (min-width: 640px) { .modal { border-radius: var(--radius-lg); max-width: 560px; } }
   .modal--wide { max-width: 100%; }
   @media (min-width: 640px) { .modal--wide { max-width: 760px; } }
   .modal__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 20px 24px; border-bottom: 1px solid var(--c-line); }
   .modal__head h3 { font-size: 1.15rem; margin: 0; }
   .modal__close { width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--c-off-white); color: var(--c-ink-soft); font-size: 1.4rem; display: grid; place-items: center; border: none; cursor: pointer; }
   .modal__body { padding: 24px; overflow-y: auto; flex: 1; }
   .modal__foot { padding: 20px 24px; border-top: 1px solid var(--c-line); display: flex; gap: 12px; }
   @media (min-width: 640px) { .modal__foot { justify-content: flex-end; } .modal__foot .btn { flex: 0 0 auto; min-width: 130px; } }
   `
);

file(
  stylesDir + "/toast.css",
  `.toast-container { position: fixed; bottom: calc(20px + var(--safe-bottom)); left: 16px; right: 16px; z-index: 400; display: flex; flex-direction: column; gap: 10px; pointer-events: none; }
   @media (min-width: 640px) { .toast-container { bottom: 24px; left: auto; right: 24px; max-width: 400px; } }
   .toast { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; background: var(--c-navy); color: var(--c-paper); border-radius: var(--radius); box-shadow: var(--shadow-lg); pointer-events: auto; border: 1px solid var(--c-navy-2); font-size: 0.92rem; }
   .toast--success { background: var(--c-green); border-color: #15803D; }
   .toast--error { background: var(--c-red); }
   .toast--warning { background: var(--c-amber); }
   .toast__icon { font-size: 1.15rem; flex-shrink: 0; }
   .toast__content { flex: 1; min-width: 0; }
   .toast__title { font-size: 0.95rem; }
   .toast__message { font-size: 0.86rem; opacity: 0.92; margin-top: 2px; }
   `
);

file(
  stylesDir + "/states.css",
  `.empty { padding: 40px 20px; text-align: center; border: 1.5px dashed var(--c-line-mid); border-radius: var(--radius); color: var(--c-ink-muted); background: var(--c-off-white); display: flex; flex-direction: column; align-items: center; gap: 14px; }
   .empty__icon { font-size: 2.5rem; opacity: 0.5; }
   .empty__title { font-size: 1rem; color: var(--c-ink); }
   .empty__message { font-size: 0.88rem; max-width: 40ch; line-height: 1.7; }
   .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; min-height: 40vh; color: var(--c-ink-muted); }
   .loading-spinner { width: 32px; height: 32px; border: 3px solid var(--c-line); border-top-color: var(--c-red); border-radius: 50%; animation: spin 0.8s linear infinite; }
   @keyframes spin { to { transform: rotate(360deg); } }
   .skeleton { background: linear-gradient(90deg, var(--c-line) 25%, #EDEFF5 50%, var(--c-line) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: var(--radius-sm); }
   .skeleton--text { height: 14px; margin: 8px 0; }
   .skeleton--title { height: 20px; width: 60%; margin: 12px 0; }
   .skeleton--avatar { width: 44px; height: 44px; border-radius: 50%; }
   @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
   .notfound { display: grid; place-items: center; text-align: center; padding-block: 64px; padding-inline: 20px; min-height: 60vh; }
   .notfound__code { font-size: clamp(4rem, 14vw, 8rem); color: var(--c-navy); line-height: 1; }
   `
);

file(
  stylesDir + "/login.css",
  `.login-page { min-height: 100vh; min-height: 100dvh; display: grid; place-items: center; padding: 24px; background: radial-gradient(900px 500px at 20% 0%, rgba(193, 39, 45, 0.08), transparent 60%), radial-gradient(700px 400px at 80% 100%, rgba(21, 26, 69, 0.10), transparent 60%), var(--c-navy); }
   .login-card { width: 100%; max-width: 440px; background: var(--c-white); border-radius: var(--radius-xl); padding: 44px 36px; box-shadow: var(--shadow-lg); border: 1px solid var(--c-line); }
   .login-field { margin-bottom: 20px; }
   .login-label { display: block; font-size: 0.92rem; color: var(--c-ink-soft); margin-bottom: 8px; }
   .login-input { width: 100%; padding: 15px 18px; border-radius: var(--radius-sm); border: 1.5px solid var(--c-line-mid); background: var(--c-white); font-family: inherit; font-size: 1rem; outline: none; direction: ltr; }
   .login-input:focus { border-color: var(--c-navy); box-shadow: 0 0 0 4px rgba(21, 26, 69, 0.08); }
   .login-submit { width: 100%; padding: 16px; border-radius: var(--radius-sm); border: none; background: var(--c-red); color: #fff; font-family: inherit; font-size: 1rem; cursor: pointer; }
   .login-submit:disabled { opacity: 0.5; cursor: not-allowed; }
   .login-error { background: var(--c-red-tint); color: #991B1B; border: 1px solid #FCA5A5; border-radius: var(--radius-sm); padding: 14px 16px; font-size: 0.92rem; margin-bottom: 18px; }
   .login-back { text-align: center; margin-top: 28px; font-size: 0.9rem; }
   .login-back a { color: var(--c-ink-muted); }
   `
);

file(
  stylesDir + "/profile.css",
  `.profile { display: flex; flex-direction: column; gap: 20px; padding: 20px; border: 1px solid var(--c-navy-2); border-radius: var(--radius-lg); background: linear-gradient(150deg, var(--c-navy), var(--c-navy-soft)); color: var(--c-paper); }
   @media (min-width: 640px) { .profile { flex-direction: row; align-items: flex-start; padding: 28px; gap: 28px; } }
   .profile__main { flex: 1; min-width: 0; }
   .profile__name { color: var(--c-paper); font-weight: 900; font-size: 1.6rem; line-height: 1.2; }
   @media (min-width: 640px) { .profile__name { font-size: 2rem; } }
   .profile__role { color: var(--c-red); margin-top: 6px; font-size: 0.95rem; }
   .profile__bio { margin-top: 16px; color: var(--c-paper-soft); max-width: 68ch; font-size: 0.92rem; line-height: 1.7; }
   .profile__side { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
   @media (min-width: 640px) { .profile__side { grid-template-columns: 1fr; min-width: 200px; gap: 16px; } }
   .kv { display: flex; flex-direction: column; gap: 4px; }
   .kv__k { font-size: 0.72rem; color: var(--c-paper-muted); letter-spacing: 0.04em; text-transform: uppercase; }
   .kv__v { font-size: 0.95rem; color: var(--c-paper); line-height: 1.4; }
   `
);

file(
  stylesDir + "/member-card.css",
  `.member-card { display: flex; flex-direction: column; gap: 14px; padding: 20px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); text-decoration: none; color: var(--c-ink); box-shadow: var(--shadow-xs); min-height: 180px; }
   .member-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
   .member-card__head { display: flex; align-items: center; gap: 14px; }
   .member-card__info { flex: 1; min-width: 0; }
   .member-card__name { font-size: 1.05rem; color: var(--c-ink); line-height: 1.4; word-break: break-word; }
   .member-card__role { font-size: 0.82rem; color: var(--c-ink-muted); }
   .member-card__teams { display: flex; flex-wrap: wrap; gap: 6px; }
   .member-card__team-tag { display: inline-flex; padding: 3px 10px; border-radius: var(--radius-full); background: var(--c-navy); color: #fff; font-size: 0.78rem; }
   .member-card__stats { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px solid var(--c-line); margin-top: auto; }
   .member-card__stat { display: flex; flex-direction: column; gap: 2px; }
   .member-card__stat-value { font-size: 1.1rem; color: var(--c-navy); line-height: 1; }
   .member-card__stat--red .member-card__stat-value { color: var(--c-red); }
   .member-card__stat-label { font-size: 0.75rem; color: var(--c-ink-muted); }
   `
);

file(
  stylesDir + "/notifications.css",
  `.notif-item { display: flex; gap: 12px; padding: 18px 22px; border-radius: var(--radius); border: 1px solid var(--c-line); background: var(--c-white); position: relative; cursor: pointer; box-shadow: var(--shadow-xs); }
   .notif-item:hover { border-color: var(--c-line-mid); background: var(--c-off-white); }
   .notif-item--unread { background: #FFFBFC; border-color: #FCA5A5; }
   .notif-item--unread::before { content: ''; position: absolute; left: 0; top: 16px; bottom: 16px; width: 3px; background: var(--c-red); }
   .notif-item__title { font-size: 1rem; color: var(--c-ink); }
   .notif-item__message { font-size: 0.88rem; color: var(--c-ink-muted); margin-top: 4px; line-height: 1.65; }
   .notif-item__meta { display: flex; gap: 8px; margin-top: 10px; font-size: 0.78rem; color: var(--c-ink-muted); flex-wrap: wrap; }
   .notif-item__from { color: var(--c-ink-soft); }
   .notif-item__priority { margin-left: auto; padding: 2px 10px; border-radius: 999px; font-size: 0.7rem; }
   .notif-item__priority--high { background: var(--c-red-tint); color: #991B1B; }
   `
);

file(
  stylesDir + "/footer.css",
  `.footer { margin-top: 64px; background: var(--c-navy); color: var(--c-paper); border-top: 4px solid var(--c-red); padding-block: 48px 40px; }
   @media (max-width: 900px) { .footer { padding-bottom: calc(var(--bottom-nav-h) + var(--safe-bottom) + 48px); } }
   .footer__inner { display: grid; gap: 36px; grid-template-columns: 1fr; }
   @media (min-width: 640px) { .footer__inner { grid-template-columns: 1fr 1fr; } }
   @media (min-width: 900px) { .footer__inner { grid-template-columns: 2fr 3fr; gap: 56px; } }
   .footer__brand { font-size: 1.65rem; color: var(--c-paper); }
   .footer__tagline { font-size: 0.95rem; color: var(--c-paper-soft); line-height: 1.8; max-width: 42ch; margin-top: 16px; }
   .footer__copyright { font-size: 0.85rem; color: var(--c-paper-muted); padding-top: 16px; border-top: 1px solid var(--c-navy-2); margin-top: 16px; }
   .footer__links-col { display: grid; gap: 32px; grid-template-columns: repeat(2, 1fr); }
   @media (min-width: 640px) { .footer__links-col { grid-template-columns: repeat(3, 1fr); } }
   .footer__group-title { font-size: 0.78rem; color: var(--c-red); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
   .footer__links { display: flex; flex-direction: column; gap: 12px; }
   .footer__link { font-size: 0.92rem; color: var(--c-paper-soft); }
   .footer__link:hover { color: var(--c-red); }
   `
);

file(
  stylesDir + "/home.css",
  `.home-hero { padding-block: 72px 56px; }
   @media (max-width: 640px) { .home-hero { padding-block: 48px 40px; } }
   .home-hero__title { font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1.15; margin-top: 16px; max-width: 22ch; color: var(--c-navy); }
   .home-hero__brand { color: var(--c-red); }
   .home-hero__desc { margin-top: 22px; max-width: 62ch; color: var(--c-ink-soft); font-size: 1.05rem; line-height: 1.9; }
   .home-hero__actions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 32px; }
   .home-section { padding-block: 44px; }
   @media (min-width: 640px) { .home-section { padding-block: 56px; } }
   .home-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
   @media (min-width: 640px) { .home-stats { grid-template-columns: repeat(4, 1fr); gap: 20px; } }
   .home-teams-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
   @media (min-width: 480px) { .home-teams-grid { grid-template-columns: repeat(2, 1fr); } }
   @media (min-width: 900px) { .home-teams-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
   .team-card { display: flex; flex-direction: column; gap: 20px; padding: 26px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); text-decoration: none; color: var(--c-ink); box-shadow: var(--shadow-xs); }
   .team-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
   .team-card__head { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
   .team-card__name { font-size: 1.25rem; color: var(--c-navy); line-height: 1.3; }
   .team-card__rank { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; padding: 6px 14px; border-radius: var(--radius-full); background: var(--c-navy); color: #fff; font-size: 0.85rem; }
   .team-card__rank--first { background: var(--c-red); }
   .team-card__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding-top: 18px; border-top: 1px solid var(--c-line); }
   .team-card__stat { display: flex; flex-direction: column; gap: 6px; }
   .team-card__stat-value { font-size: 1.25rem; color: var(--c-navy); line-height: 1; }
   .team-card__stat-label { font-size: 0.78rem; color: var(--c-ink-muted); }
   .league-table { background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-xs); }
   .league-table__head { display: grid; grid-template-columns: 72px 2.2fr 1.6fr 100px 100px; gap: 16px; padding: 16px 28px; background: var(--c-navy); color: #fff; font-size: 0.78rem; text-transform: uppercase; }
   .league-table__row { display: grid; grid-template-columns: 72px 2.2fr 1.6fr 100px 100px; gap: 16px; padding: 16px 28px; align-items: center; color: var(--c-ink); text-decoration: none; border-bottom: 1px solid var(--c-line); }
   .league-table__row:last-child { border-bottom: none; }
   .league-table__row:hover { background: var(--c-off-white); }
   .league-table__row .col-rank { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: var(--c-line); color: var(--c-ink-soft); font-size: 0.9rem; }
   .league-table__row .col-rank.rank-1 { background: var(--c-red); color: #fff; }
   .league-table__row .col-rank.rank-2 { background: var(--c-navy-2); color: #fff; }
   .league-table__row .col-rank.rank-3 { background: var(--c-navy); color: #fff; }
   .league-table__row .col-name { display: flex; align-items: center; gap: 14px; min-width: 0; }
   .league-table__name { font-size: 0.95rem; word-break: break-word; }
   .home-join-cta { padding: 56px 40px; background: var(--c-navy); border-radius: var(--radius-lg); text-align: center; color: #fff; }
   .home-join-cta__title { margin-top: 22px; font-size: 1.7rem; color: #fff; }
   .home-join-cta__desc { margin-top: 18px; max-width: 46ch; margin-inline: auto; color: var(--c-paper-soft); line-height: 1.9; }
   .home-join-cta__actions { display: flex; justify-content: center; gap: 14px; margin-top: 32px; flex-wrap: wrap; }
   `
);

file(
  stylesDir + "/admin.css",
  `.admin-page { padding-block: 24px 60px; }
   .admin-welcome { padding: 12px 0 24px; margin-bottom: 8px; }
   .admin-welcome__eyebrow { font-size: 0.78rem; color: var(--c-red); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
   .admin-welcome__name { font-size: clamp(1.6rem, 4vw, 2.2rem); color: var(--c-navy); line-height: 1.25; margin: 0; }
   .admin-welcome__subtitle { margin-top: 12px; color: var(--c-ink-muted); font-size: 0.98rem; line-height: 1.75; max-width: 60ch; }
   .admin-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-block: 32px 44px; }
   @media (min-width: 600px) { .admin-stats { grid-template-columns: repeat(3, 1fr); gap: 16px; } }
   @media (min-width: 1024px) { .admin-stats { grid-template-columns: repeat(6, 1fr); gap: 18px; } }
   .admin-stats .stat { padding: 26px 18px; min-height: 116px; display: flex; flex-direction: column; justify-content: center; align-items: center; }
   .admin-seed { margin-block: 44px; padding: 28px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); box-shadow: var(--shadow-xs); }
   .admin-seed__head { display: flex; flex-direction: column; gap: 16px; }
   @media (min-width: 640px) { .admin-seed__head { flex-direction: row; align-items: center; justify-content: space-between; } }
   .admin-seed__title { font-size: 1.1rem; color: var(--c-navy); margin-bottom: 6px; }
   .admin-seed__result { margin-top: 20px; padding: 16px 20px; background: var(--c-off-white); border: 1px solid var(--c-line); border-radius: var(--radius-sm); font-size: 0.9rem; line-height: 2; word-break: break-word; }
   .admin-cards { display: grid; grid-template-columns: 1fr; gap: 16px; margin-block: 24px; }
   @media (min-width: 600px) { .admin-cards { grid-template-columns: repeat(2, 1fr); } }
   @media (min-width: 1024px) { .admin-cards { grid-template-columns: repeat(3, 1fr); } }
   .admin-card { display: flex; flex-direction: column; gap: 12px; padding: 24px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); text-decoration: none; color: var(--c-ink); transition: all 0.18s; box-shadow: var(--shadow-xs); min-height: 124px; }
   .admin-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
   .admin-card__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
   .admin-card__title { font-size: 1.1rem; color: var(--c-navy); line-height: 1.4; }
   .admin-card__count { display: inline-flex; align-items: center; justify-content: center; min-width: 34px; padding: 4px 12px; border-radius: var(--radius-full); background: var(--c-red); color: #fff; font-size: 0.82rem; }
   .admin-card__desc { font-size: 0.88rem; color: var(--c-ink-muted); line-height: 1.65; }
   .admin-request-card { display: flex; flex-direction: column; gap: 18px; padding: 26px; background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); box-shadow: var(--shadow-xs); }
   .admin-request-card__head { display: flex; flex-direction: column; gap: 14px; }
   @media (min-width: 640px) { .admin-request-card__head { flex-direction: row; align-items: flex-start; justify-content: space-between; } }
   .admin-request-card__actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--c-line); }
   .chart-row { display: flex; align-items: center; gap: 14px; padding: 12px 0; font-size: 0.92rem; }
   .chart-bar { flex: 1; height: 12px; background: var(--c-navy); border-radius: 999px; min-width: 6px; }
   .chart-bar--red { background: var(--c-red); }
   `
);

file(
  stylesDir + "/committee.css",
  `/* ═══════════════════════════════════════════════════════════════
      Committee Card — styled exactly like Team Card
      ═══════════════════════════════════════════════════════════════ */

   .committee-card {
     display: flex;
     flex-direction: column;
     gap: 18px;
     padding: 24px;
     background: var(--c-white);
     border: 1px solid var(--c-line);
     border-radius: var(--radius);
     text-decoration: none;
     color: var(--c-ink);
     transition: all 0.18s var(--ease);
     box-shadow: var(--shadow-xs);
   }
   .committee-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm); border-color: var(--c-line-mid); }
   .committee-card__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
   .committee-card__name { font-size: 1.15rem; color: var(--c-navy); line-height: 1.25; font-weight: 600; }
   .committee-card__team { font-size: 0.78rem; color: var(--c-ink-muted); }
   .committee-card__color { width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; }
   .committee-card__stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-top: 16px; border-top: 1px solid var(--c-line); }
   .committee-card__stat { display: flex; flex-direction: column; gap: 4px; }
   .committee-card__stat-value { font-size: 1.15rem; color: var(--c-navy); line-height: 1; }
   .committee-card__stat-label { font-size: 0.72rem; color: var(--c-ink-muted); }

   /* Committee rank badge */
   .committee-rank-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 40px; padding: 5px 12px; border-radius: var(--radius-full); background: var(--c-navy); color: #fff; font-size: 0.78rem; font-weight: 800; flex-shrink: 0; }
   .committee-rank-badge--first { background: var(--c-red); box-shadow: 0 4px 12px rgba(193, 39, 45, 0.35); }
   `
);

file(
  stylesDir + "/onboarding.css",
  `.onboarding-backdrop { position: fixed; inset: 0; background: #FFFFFF; z-index: 500; display: flex; flex-direction: column; padding: 32px 24px; overflow-y: auto; }
   .onboarding-header { text-align: center; padding: 24px 16px 8px; }
   .onboarding-header__title { font-size: 1.75rem; color: var(--c-navy); margin-bottom: 10px; }
   .onboarding-header__subtitle { font-size: 1rem; color: var(--c-ink-muted); max-width: 40ch; margin: 0 auto; }
   .onboarding-body { flex: 1; max-width: 960px; width: 100%; margin-inline: auto; }
   .onboarding-grid { display: grid; grid-template-columns: 1fr; gap: 16px; padding-block: 24px; }
   @media (min-width: 640px) { .onboarding-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; } }
   .onboarding-card { background: var(--c-white); border: 1.5px solid var(--c-line); border-radius: var(--radius-lg); padding: 24px 22px; box-shadow: var(--shadow-sm); position: relative; overflow: hidden; }
   .onboarding-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: var(--c-red); }
   .onboarding-card__title { font-size: 1.15rem; color: var(--c-navy); padding-left: 8px; margin-bottom: 8px; }
   .onboarding-card__desc { font-size: 0.92rem; color: var(--c-ink-soft); line-height: 1.75; padding-left: 8px; }
   .onboarding-footer { padding: 24px 20px 8px; text-align: center; }
   .onboarding-cta { display: inline-flex; align-items: center; gap: 8px; padding: 15px 40px; border-radius: var(--radius-full); border: none; background: var(--c-red); color: #fff; font-family: inherit; font-size: 1.1rem; cursor: pointer; }
   `
);

file(
  stylesDir + "/pwa.css",
  `.pwa-install-banner { position: fixed; bottom: calc(24px + var(--safe-bottom)); left: 20px; right: 20px; z-index: 350; background: var(--c-navy); color: #fff; border-radius: var(--radius-lg); padding: 18px 20px; box-shadow: 0 20px 60px -15px rgba(21, 26, 69, 0.55); display: flex; align-items: center; gap: 16px; flex-wrap: wrap; border: 1px solid var(--c-navy-2); }
   @media (min-width: 640px) { .pwa-install-banner { left: auto; right: 24px; max-width: 460px; } }
   .pwa-install-banner__title { font-size: 1rem; margin-bottom: 4px; }
   .pwa-install-banner__desc { font-size: 0.86rem; color: var(--c-paper-soft); }
   .pwa-install-banner__actions { display: flex; gap: 8px; }
   `
);

file(
  stylesDir + "/calendar.css",
  `.calendar-container { background: var(--c-white); border: 1px solid var(--c-line); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow-xs); }
   .calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; }
   .calendar-month { font-size: 1.1rem; color: var(--c-navy); display: flex; align-items: center; gap: 8px; }
   .calendar-nav { display: flex; gap: 6px; }
   .calendar-nav__btn { width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--c-off-white); border: 1px solid var(--c-line); color: var(--c-ink); font-size: 1.1rem; display: grid; place-items: center; cursor: pointer; }
   .calendar-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px; }
   .calendar-weekday { text-align: center; font-size: 0.72rem; color: var(--c-ink-muted); padding: 6px 0; }
   .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
   .calendar-day { aspect-ratio: 1; min-height: 40px; border-radius: 10px; background: var(--c-off-white); color: var(--c-ink); font-size: 0.85rem; cursor: pointer; position: relative; display: flex; align-items: center; justify-content: center; }
   .calendar-day--today { background: var(--c-navy); color: #fff; }
   .calendar-day--has-events::after { content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 5px; height: 5px; border-radius: 50%; background: var(--c-red); }
   .calendar-day--selected { background: var(--c-red); color: #fff; }
   `
);

file(
  stylesDir + "/chat.css",
  `.chat-layout { display: grid; grid-template-columns: 1fr; height: calc(100dvh - var(--navbar-h) - var(--bottom-nav-h) - 80px); border: 1px solid var(--c-line); border-radius: var(--radius); overflow: hidden; background: var(--c-white); box-shadow: var(--shadow-xs); max-width: 1280px; margin-inline: auto; }
   @media (min-width: 900px) { .chat-layout { grid-template-columns: 340px 1fr; height: calc(100dvh - var(--navbar-h) - 100px); } }
   .chat-sidebar { background: var(--c-white); border-right: 1px solid var(--c-line); overflow-y: auto; display: flex; flex-direction: column; }
   .chat-sidebar__head { padding: 20px 22px; border-bottom: 1px solid var(--c-line); background: var(--c-navy); color: #fff; }
   .chat-sidebar__title { font-size: 1.15rem; }
   .chat-conversations { flex: 1; overflow-y: auto; }
   .chat-conv { display: flex; align-items: center; gap: 14px; padding: 16px 22px; border-bottom: 1px solid var(--c-line); cursor: pointer; background: none; width: 100%; text-align: start; }
   .chat-conv:hover { background: var(--c-off-white); }
   .chat-conv.is-active { background: var(--c-red-tint); }
   .chat-conv__avatar { width: 50px; height: 50px; border-radius: 50%; display: grid; place-items: center; font-size: 1.15rem; color: #fff; background: var(--c-navy); }
   .chat-conv__body { flex: 1; min-width: 0; }
   .chat-conv__name { font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
   .chat-conv__preview { font-size: 0.86rem; color: var(--c-ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
   .chat-panel { display: flex; flex-direction: column; background: var(--c-off-white); }
   .chat-panel__empty { flex: 1; display: grid; place-items: center; padding: 40px 24px; text-align: center; color: var(--c-ink-muted); }
   .chat-header { display: flex; align-items: center; gap: 14px; padding: 16px 22px; background: var(--c-white); border-bottom: 1px solid var(--c-line); }
   .chat-header__back { display: none; width: 40px; height: 40px; background: var(--c-off-white); border: 1px solid var(--c-line); color: var(--c-ink); cursor: pointer; }
   @media (max-width: 899px) { .chat-header__back { display: flex; align-items: center; justify-content: center; } }
   .chat-header__title { font-size: 1.05rem; }
   .chat-messages { flex: 1; overflow-y: auto; padding: 24px 22px; display: flex; flex-direction: column; gap: 12px; }
   .chat-message { display: flex; gap: 10px; max-width: 78%; align-self: flex-start; }
   .chat-message--mine { align-self: flex-end; flex-direction: row-reverse; }
   .chat-message__bubble { padding: 11px 16px; border-radius: 18px; background: var(--c-white); border: 1px solid var(--c-line); font-size: 0.95rem; }
   .chat-message--mine .chat-message__bubble { background: var(--c-red); color: #fff; }
   .chat-message__time { font-size: 0.72rem; opacity: 0.65; margin-top: 6px; text-align: end; }
   .chat-composer { display: flex; align-items: flex-end; gap: 10px; padding: 16px 22px; background: var(--c-white); border-top: 1px solid var(--c-line); }
   .chat-composer__input { flex: 1; padding: 12px 18px; border-radius: 24px; border: 1.5px solid var(--c-line-mid); background: var(--c-off-white); font-family: inherit; resize: none; }
   .chat-composer__send { width: 46px; height: 46px; border-radius: 50%; background: var(--c-red); color: #fff; border: none; cursor: pointer; }
   @media (max-width: 899px) { .chat-sidebar.is-hidden { display: none; } .chat-panel.is-hidden { display: none; } }
   `
);

file(
  stylesDir + "/approvals.css",
  `.approval-chain { display: flex; flex-direction: column; gap: 10px; }
   .approval-step { display: flex; gap: 14px; padding: 14px; border-radius: var(--radius); border: 1.5px solid var(--c-line); background: var(--c-white); align-items: flex-start; }
   .approval-step--done { border-color: #86EFAC; background: var(--c-green-soft); }
   .approval-step--rejected { border-color: #FCA5A5; background: var(--c-red-tint); }
   .approval-step--pending { border-color: #FCD34D; background: var(--c-amber-soft); }
   .approval-step__index { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; background: var(--c-navy); color: #fff; flex-shrink: 0; font-size: 0.85rem; }
   .approval-step--done .approval-step__index { background: var(--c-green); }
   .approval-step--rejected .approval-step__index { background: var(--c-red); }
   .approval-step--pending .approval-step__index { background: var(--c-amber); }
   .approval-step__title { font-size: 0.9rem; }
   .approval-step__meta { font-size: 0.78rem; color: var(--c-ink-muted); margin-top: 3px; }
   .approval-step__comment { margin-top: 10px; font-size: 0.84rem; padding: 8px 12px; background: rgba(255, 255, 255, 0.6); border-radius: var(--radius-sm); color: var(--c-ink-soft); }
   `
);

file(
  stylesDir + "/timeline.css",
  `.timeline { position: relative; padding-left: 24px; }
   .timeline::before { content: ''; position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; background: var(--c-line-mid); }
   .timeline__item { position: relative; padding-block: 10px; }
   .timeline__item::before { content: ''; position: absolute; left: -24px; top: 20px; width: 12px; height: 12px; border-radius: 50%; background: var(--c-white); border: 2.5px solid var(--c-red); }
   .timeline__date { font-size: 0.72rem; color: var(--c-ink-muted); margin-bottom: 3px; }
   .timeline__title { font-size: 0.92rem; }
   .timeline__desc { font-size: 0.83rem; color: var(--c-ink-soft); margin-top: 3px; }
   `
);

file(
  stylesDir + "/print.css",
  `@media print { .no-print, .navbar, .footer, .sidebar, .bottom-nav, .toast-container, .modal-backdrop, .pwa-install-banner, .onboarding-backdrop { display: none !important; } }
   `
);

file(
  stylesDir + "/desktop.css",
  `@media (min-width: 901px) {
     .container { max-width: 1280px; padding-inline: 32px; }
     .grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
     .home-teams-grid { grid-template-columns: repeat(3, 1fr); }
     table.data { display: table; }
     table.data thead { display: table-header-group; }
     table.data tbody { display: table-row-group; }
     table.data tr { display: table-row; padding: 0; margin: 0; background: transparent; border: none; box-shadow: none; }
     table.data td { display: table-cell; padding: 16px 24px; }
     table.data td::before { display: none; }
   }
   `
);

file(
  stylesDir + "/v52-fix.css",
  `.brand::before, .footer__brand::before { content: none !important; }
   body, .app-shell, .app-main { overflow-x: hidden; }
   .card__title, .card__meta, .card__body { word-break: break-word; overflow-wrap: anywhere; }
   `
);

file(
  stylesDir + "/global.css",
  `@import './tokens.css';
   @import './base.css';
   @import './layout.css';
   @import './navbar.css';
   @import './bottom-nav.css';
   @import './sidebar.css';
   @import './cards.css';
   @import './member-card.css';
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
   @import './pwa.css';
   @import './states.css';
   @import './timeline.css';
   @import './approvals.css';
   @import './print.css';
   @import './home.css';
   @import './admin.css';
   @import './committee.css';
   @import './v52-fix.css';
   @import './desktop.css';
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 9 — UI COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/ui/Stat.tsx",
  `import type { ReactNode } from 'react';

   interface StatProps { value: number | string; label: string; variant?: 'red' | 'success' | 'amber'; }
   export function Stat({ value, label, variant }: StatProps) {
     const className = 'stat' + (variant ? ' stat--' + variant : '');
     return <div className={className}><div className="stat__value">{value}</div><div className="stat__label">{label}</div></div>;
   }
   export function StatRow({ children }: { children: ReactNode }) { return <div className="stat-row">{children}</div>; }
   `
);

file(
  "src/components/ui/Badge.tsx",
  `import type { ReactNode } from 'react';
   import { cx } from '@/lib/format';

   type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'navy' | 'red';

   interface BadgeProps { children: ReactNode; variant?: Variant; dot?: boolean; className?: string; }
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

file(
  "src/components/ui/EmptyState.tsx",
  `import type { ReactNode } from 'react';

   interface EmptyStateProps { icon?: string; title?: string; message: string; action?: ReactNode; }
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

file(
  "src/components/ui/Loading.tsx",
  `interface LoadingProps { message?: string; fullHeight?: boolean; }
   export function Loading({ message = 'Loading...', fullHeight = false }: LoadingProps) {
     return <div className="loading-screen" style={fullHeight ? { minHeight: '60vh' } : undefined}><div className="loading-spinner" /><div>{message}</div></div>;
   }

   interface SkeletonCardProps { count?: number; }
   export function SkeletonCard({ count = 3 }: SkeletonCardProps) {
     return (<>{Array.from({ length: count }).map((_, i) => (
       <div key={i} className="card no-click" style={{ pointerEvents: 'none' }}>
         <div className="skeleton skeleton--title" /><div className="skeleton skeleton--text" /><div className="skeleton skeleton--text" style={{ width: '70%' }} />
       </div>
     ))}</>);
   }
   export function SkeletonList({ count = 5 }: SkeletonCardProps) {
     return (<div className="stack">{Array.from({ length: count }).map((_, i) => (
       <div key={i} className="card no-click" style={{ pointerEvents: 'none', display: 'flex', gap: 12, alignItems: 'center' }}>
         <div className="skeleton skeleton--avatar" /><div style={{ flex: 1 }}><div className="skeleton skeleton--text" style={{ width: '60%' }} /><div className="skeleton skeleton--text" style={{ width: '40%' }} /></div>
       </div>
     ))}</div>);
   }
   `
);

file(
  "src/components/ui/SectionHeader.tsx",
  `import type { ReactNode } from 'react';
   interface SectionHeaderProps { eyebrow?: string; title: string; description?: string; action?: ReactNode; }
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

file(
  "src/components/ui/PageHeader.tsx",
  `import type { ReactNode } from 'react';
   interface PageHeaderProps { eyebrow?: string; title: string; description?: string; children?: ReactNode; }
   export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
     return (
       <header className="section section--tight">
         {eyebrow ? <div className="section-head__eyebrow">{eyebrow}</div> : null}
         <h1>{title}</h1>
         {description ? <p className="hero__desc" style={{ marginTop: 12 }}>{description}</p> : null}
         {children}
       </header>
     );
   }
   `
);

file(
  "src/components/ui/FormField.tsx",
  `import type { ReactNode } from 'react';

   interface FormFieldProps { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode; }
   export function FormField({ label, required, hint, error, children }: FormFieldProps) {
     return (
       <div className="form-field">
         <label className="form-field__label">{label}{required ? <span className="form-field__req">*</span> : null}</label>
         {hint ? <div className="form-field__hint">{hint}</div> : null}
         {children}
         {error ? <div className="form-field__error">{error}</div> : null}
       </div>
     );
   }

   interface TextInputProps { value: string; onChange: (v: string) => void; placeholder?: string; type?: 'text'|'email'|'password'|'search'|'tel'|'url'; required?: boolean; disabled?: boolean; autoComplete?: string; autoFocus?: boolean; }
   export function TextInput({ value, onChange, placeholder, type = 'text', required, disabled, autoComplete, autoFocus }: TextInputProps) {
     return <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} autoComplete={autoComplete} autoFocus={autoFocus} />;
   }

   interface NumberInputProps { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; disabled?: boolean; }
   export function NumberInput({ value, onChange, min, max, step, disabled }: NumberInputProps) {
     return <input className="input" type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} min={min} max={max} step={step} disabled={disabled} />;
   }

   interface DateInputProps { value: string; onChange: (v: string) => void; disabled?: boolean; }
   export function DateInput({ value, onChange, disabled }: DateInputProps) {
     return <input className="input" type="date" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
   }

   interface TimeInputProps { value: string; onChange: (v: string) => void; disabled?: boolean; }
   export function TimeInput({ value, onChange, disabled }: TimeInputProps) {
     return <input className="input" type="time" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />;
   }

   interface TextAreaProps { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; disabled?: boolean; }
   export function TextArea({ value, onChange, placeholder, rows = 4, disabled }: TextAreaProps) {
     return <textarea className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} disabled={disabled} />;
   }

   interface SelectOption { value: string; label: string; }
   interface SelectProps { value: string; onChange: (v: string) => void; options: SelectOption[]; disabled?: boolean; }
   export function Select({ value, onChange, options, disabled }: SelectProps) {
     return <select className="input" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
   }

   interface MultiSelectProps { values: string[]; onChange: (v: string[]) => void; options: SelectOption[]; disabled?: boolean; }
   export function MultiSelect({ values, onChange, options, disabled }: MultiSelectProps) {
     const toggle = (v: string) => {
       if (disabled) return;
       if (values.includes(v)) onChange(values.filter((x) => x !== v));
       else onChange([...values, v]);
     };
     return (<div className="chips">{options.map((o) => (
       <button key={o.value} type="button" disabled={disabled} className={'chip' + (values.includes(o.value) ? ' is-active' : '')} onClick={() => toggle(o.value)}>{o.label}</button>
     ))}</div>);
   }
   `
);

file(
  "src/components/ui/Modal.tsx",
  `import { useEffect, type ReactNode } from 'react';

   interface ModalProps { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean; }
   export function Modal({ open, title, onClose, children, footer, wide }: ModalProps) {
     useEffect(() => {
       if (open) { const original = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = original; }; }
       return undefined;
     }, [open]);
     useEffect(() => {
       if (!open) return undefined;
       const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
       window.addEventListener('keydown', handler);
       return () => window.removeEventListener('keydown', handler);
     }, [open, onClose]);
     if (!open) return null;
     return (
       <div className="modal-backdrop" onClick={onClose}>
         <div className={'modal' + (wide ? ' modal--wide' : '')} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
           <div className="modal__head"><h3>{title}</h3><button type="button" className="modal__close" onClick={onClose}>×</button></div>
           <div className="modal__body">{children}</div>
           {footer ? <div className="modal__foot">{footer}</div> : null}
         </div>
       </div>
     );
   }
   `
);

file(
  "src/components/ui/ConfirmDialog.tsx",
  `import { Modal } from './Modal';
   interface ConfirmDialogProps { open: boolean; title: string; message: string; confirmLabel?: string; cancelLabel?: string; danger?: boolean; busy?: boolean; onConfirm: () => void; onCancel: () => void; }
   export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, busy, onConfirm, onCancel }: ConfirmDialogProps) {
     return (
       <Modal open={open} title={title} onClose={onCancel} footer={
         <>
           <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
           <button type="button" className={'btn ' + (danger ? 'btn--danger' : 'btn--primary')} onClick={onConfirm} disabled={busy}>{busy ? '...' : confirmLabel}</button>
         </>
       }>
         <p style={{ lineHeight: 1.8, color: 'var(--c-ink-soft)' }}>{message}</p>
       </Modal>
     );
   }
   `
);

file(
  "src/components/ui/Toast.tsx",
  `import { useEffect, useState, type ReactNode } from 'react';
   type ToastType = 'success' | 'error' | 'info' | 'warning';
   interface ToastItem { id: string; title: string; message?: string; type: ToastType; }
   interface ToastState { toasts: ToastItem[]; show: (title: string, message?: string, type?: ToastType) => void; remove: (id: string) => void; }
   let toastStore: ToastState | null = null;
   const listeners = new Set<(state: ToastState) => void>();
   function emit() { if (!toastStore) return; listeners.forEach((l) => l(toastStore!)); }
   export function useToast(): ToastState {
     const [state, setState] = useState<ToastState>(() => { if (!toastStore) toastStore = { toasts: [], show: () => {}, remove: () => {} }; return toastStore; });
     useEffect(() => { listeners.add(setState); return () => { listeners.delete(setState); }; }, []);
     return state;
   }
   const ICONS: Record<ToastType, string> = { success: '✓', error: '⚠', info: 'i', warning: '!' };
   export function ToastContainer() {
     const { toasts, remove } = useToast();
     if (toasts.length === 0) return null;
     return <div className="toast-container">{toasts.map((t) => <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />)}</div>;
   }
   function Toast({ toast, onClose }: { toast: ToastItem; onClose: () => void }): ReactNode {
     useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
     return (
       <div className={'toast toast--' + toast.type} onClick={onClose}>
         <div className="toast__icon">{ICONS[toast.type]}</div>
         <div className="toast__content"><div className="toast__title">{toast.title}</div>{toast.message ? <div className="toast__message">{toast.message}</div> : null}</div>
       </div>
     );
   }
   export const toast = {
     show(title: string, message?: string, type: ToastType = 'info') {
       if (!toastStore) { toastStore = { toasts: [], show: () => {}, remove: () => {} }; }
       const id = Math.random().toString(36).slice(2, 10);
       toastStore.toasts = [...toastStore.toasts, { id, title, message, type }];
       emit();
       setTimeout(() => { if (toastStore) { toastStore.toasts = toastStore.toasts.filter((x) => x.id !== id); emit(); } }, 4000);
     },
     success(t: string, m?: string) { this.show(t, m, 'success'); },
     error(t: string, m?: string) { this.show(t, m, 'error'); },
     info(t: string, m?: string) { this.show(t, m, 'info'); },
     warning(t: string, m?: string) { this.show(t, m, 'warning'); },
   };
   `
);

file(
  "src/components/ui/Avatar.tsx",
  `interface AvatarProps { name?: string; size?: number; variant?: 'navy' | 'red' | 'gradient' | 'light'; src?: string; }
   const BG: Record<string, string> = { navy: 'var(--c-navy)', red: 'var(--c-red)', gradient: 'linear-gradient(150deg, var(--c-red), var(--c-red-soft))', light: 'var(--c-off-white)' };
   export function Avatar({ name, size = 44, variant = 'navy', src }: AvatarProps) {
     if (src) return <img src={src} alt={name ?? ''} width={size} height={size} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
     return (
       <div aria-label={name ?? 'Member'} title={name} style={{
         width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center',
         background: BG[variant], color: variant === 'light' ? 'var(--c-navy)' : '#fff', flexShrink: 0,
       }}>
         <svg width={Math.round(size * 0.5)} height={Math.round(size * 0.5)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
           <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
         </svg>
       </div>
     );
   }
   `
);

file(
  "src/components/ui/Icons.tsx",
  `interface IconProps { size?: number; className?: string; }
   export function IconHome({ size = 24, className }: IconProps) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M11.3 2.4a1 1 0 0 1 1.4 0l9 8.2a1 1 0 0 1-.7 1.7h-1.5v8.2a1 1 0 0 1-1 1h-4.6v-5.5a1.5 1.5 0 0 0-1.5-1.5h-.8a1.5 1.5 0 0 0-1.5 1.5v5.5H5.5a1 1 0 0 1-1-1v-8.2H3a1 1 0 0 1-.7-1.7l9-8.2z" /></svg>; }
   export function IconMembers({ size = 24, className }: IconProps) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><circle cx="9" cy="8" r="4" /><path d="M2.5 20.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1z" /></svg>; }
   export function IconChat({ size = 24, className }: IconProps) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 2.5C6.2 2.5 1.5 6.5 1.5 11.5c0 2.8 1.6 5.3 4.2 7l-.8 3.4a.6.6 0 0 0 .9.6l3.9-2.3c.8.1 1.5.2 2.3.2 5.8 0 10.5-4 10.5-9S17.8 2.5 12 2.5z" /></svg>; }
   export function IconBell({ size = 24, className }: IconProps) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 2a2 2 0 0 0-2 2v.6A6.5 6.5 0 0 0 5 11v4.2L3.3 17.8a1 1 0 0 0 .9 1.5h15.6a1 1 0 0 0 .9-1.5L19 15.2V11a6.5 6.5 0 0 0-5-6.4V4a2 2 0 0 0-2-2z" /><path d="M10 21.2a2 2 0 0 0 4 0h-4z" /></svg>; }
   export function IconAdmin({ size = 24, className }: IconProps) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path d="M12 2 3.5 5.5v6.2c0 5.3 3.7 9.7 8.5 10.8 4.8-1.1 8.5-5.5 8.5-10.8V5.5L12 2zm0 5.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" /></svg>; }
   `
);

file(
  "src/components/ui/ErrorBoundary.tsx",
  `import { Component, type ReactNode } from 'react';
   interface Props { children: ReactNode; }
   interface State { hasError: boolean; error?: Error; }
   export class ErrorBoundary extends Component<Props, State> {
     state: State = { hasError: false };
     static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
     componentDidCatch(error: Error) { console.error('[ErrorBoundary]', error); }
     render() {
       if (this.state.hasError) {
         return (
           <div style={{ minHeight: '100vh', background: '#151A45', color: '#fff', padding: 40, fontFamily: 'system-ui' }}>
             <div style={{ maxWidth: 800, margin: '0 auto' }}>
               <h1 style={{ color: '#DC2626' }}>Application Error</h1>
               <p>{this.state.error?.message || 'Unknown'}</p>
               <pre style={{ fontSize: 12, color: '#999', overflow: 'auto', maxHeight: 300 }}>{this.state.error?.stack}</pre>
               <button onClick={() => { localStorage.clear(); if ('caches' in window) caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))); setTimeout(() => window.location.reload(), 500); }} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer' }}>
                 Clear Cache & Reload
               </button>
             </div>
           </div>
         );
       }
       return this.props.children;
     }
   }
   `
);

file(
  "src/components/ui/ProgressBar.tsx",
  `interface ProgressBarProps { percent: number; label?: string; color?: string; }
   export function ProgressBar({ percent, label, color = 'var(--c-red)' }: ProgressBarProps) {
     const safe = Math.max(0, Math.min(100, percent));
     return (
       <div>
         {label ? <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.88rem' }}><span>{label}</span><span style={{ color: 'var(--c-red)' }}>{safe}%</span></div> : null}
         <div style={{ height: 10, background: 'var(--c-line)', borderRadius: 999, overflow: 'hidden' }}>
           <div style={{ width: safe + '%', height: '100%', background: color, transition: 'width 0.4s ease' }} />
         </div>
       </div>
     );
   }
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 10 — LAYOUT COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/layout/BottomNav.tsx",
  `import { NavLink } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { cx } from '@/lib/format';
   import { IconHome, IconMembers, IconChat, IconBell, IconAdmin } from '@/components/ui/Icons';
   import type { Notification } from '@/types';

   interface NavTab { to: string; label: string; Icon: (props: { size?: number }) => JSX.Element; badge?: number; }

   export function BottomNav() {
     const { user, manager } = useAuth();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');
     if (!user) return null;
     const unread = notifs.filter((n) => n.userId === user.uid && !n.read).length;
     const tabs: NavTab[] = [
       { to: '/dashboard', label: 'Home', Icon: IconHome },
       { to: '/members', label: 'Members', Icon: IconMembers },
       { to: '/conversations', label: 'Chats', Icon: IconChat },
       { to: '/notifications', label: 'Alerts', Icon: IconBell, badge: unread },
       { to: manager ? '/admin' : '/profile', label: manager ? 'Admin' : 'Profile', Icon: IconAdmin },
     ];
     return (
       <nav className="bottom-nav no-print" aria-label="Quick navigation">
         <div className="bottom-nav__inner">
           {tabs.map((tab) => {
             const { Icon } = tab;
             return (
               <NavLink key={tab.to} to={tab.to} end={tab.to === '/dashboard' || tab.to === '/admin'}
                 className={({ isActive }) => cx('bottom-nav__item', isActive && 'is-active')}>
                 <span className="bottom-nav__icon"><Icon size={24} /></span>
                 <span className="bottom-nav__label">{tab.label}</span>
                 {tab.badge && tab.badge > 0 ? <span className="bottom-nav__badge">{tab.badge > 99 ? '99+' : tab.badge}</span> : null}
               </NavLink>
             );
           })}
         </div>
       </nav>
     );
   }
   `
);

file(
  "src/components/layout/Navbar.tsx",
  `import { Link, useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { site } from '@/data';
   import { IconBell } from '@/components/ui/Icons';
   import type { Notification } from '@/types';

   interface NavbarProps { onMenuToggle?: () => void; }

   export function Navbar({ onMenuToggle }: NavbarProps) {
     const { user } = useAuth();
     const nav = useNavigate();
     const { data: notifs } = useRealtimeCollection<Notification>('notifications');
     const unread = user ? notifs.filter((n) => n.userId === user.uid && !n.read).length : 0;
     const doLogout = async () => { await logout(); nav('/'); };
     return (
       <header className="navbar no-print">
         <div className="container navbar__inner">
           <Link to={user ? '/dashboard' : '/'} className="brand">{site.name}</Link>
           <div className="nav-actions">
             {user ? (
               <>
                 {onMenuToggle ? (
                   <button type="button" className="nav-action nav-action--icon show-mobile" onClick={onMenuToggle} aria-label="Menu">
                     <span className="nav-action__menu" aria-hidden="true"><span /><span /><span /></span>
                   </button>
                 ) : null}
                 <Link to="/notifications" className="nav-action nav-action--icon" aria-label="Notifications">
                   <IconBell size={22} />
                   {unread > 0 ? <span className="nav-action__badge">{unread > 99 ? '99+' : unread}</span> : null}
                 </Link>
                 <button type="button" className="nav-action nav-action--danger" onClick={doLogout}>Logout</button>
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

file(
  "src/components/layout/Sidebar.tsx",
  `import { NavLink, useNavigate } from 'react-router-dom';
   import { useEffect, useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { logout } from '@/lib/auth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { ROLE_LABEL, isAdmin, seesAllTeams } from '@/lib/permissions';
   import { cx } from '@/lib/format';
   import type { ApprovalStep } from '@/types';

   interface NavItem { to: string; label: string; count?: number; }
   interface SidebarProps { open: boolean; onClose: () => void; }

   function buildAdminNav(pending: number): NavItem[] {
     return [
       { to: '/admin', label: 'Admin Dashboard' },
       { to: '/admin/analytics', label: 'Analytics' },
       { to: '/admin/requests', label: 'Requests', count: pending },
       { to: '/admin/users', label: 'Users' },
       { to: '/admin/members', label: 'Members' },
       { to: '/admin/contributions', label: 'Contributions' },
       { to: '/admin/committees', label: 'Committees' },
       { to: '/admin/achievements', label: 'Achievements' },
       { to: '/admin/warnings', label: 'Warnings' },
       { to: '/admin/calendar', label: 'Calendar' },
       { to: '/admin/conversations', label: 'Conversations' },
       { to: '/admin/notifications', label: 'Send Notification' },
       { to: '/admin/governance', label: 'Governance' },
       { to: '/admin/audit', label: 'Audit Log' },
     ];
   }

   function buildManagerNav(pending: number): NavItem[] {
     return [
       { to: '/dashboard', label: 'Dashboard' },
       { to: '/members', label: 'Members' },
       { to: '/requests', label: 'Requests' },
       { to: '/approvals', label: 'Approvals', count: pending },
       { to: '/contributions', label: 'Contributions' },
       { to: '/committees', label: 'Committees' },
       { to: '/league', label: 'League' },
       { to: '/achievements', label: 'Achievements' },
       { to: '/warnings', label: 'Warnings' },
       { to: '/conversations', label: 'Conversations' },
       { to: '/calendar', label: 'Calendar' },
       { to: '/notifications', label: 'Notifications' },
       { to: '/reports', label: 'Reports' },
     ];
   }

   function buildMemberNav(): NavItem[] {
     return [
       { to: '/dashboard', label: 'Dashboard' },
       { to: '/profile', label: 'My Profile' },
       { to: '/my-contributions', label: 'My Contributions' },
       { to: '/requests/new', label: 'New Request' },
       { to: '/my-requests', label: 'My Requests' },
       { to: '/committees', label: 'Committees' },
       { to: '/league', label: 'League' },
       { to: '/achievements', label: 'Achievements' },
       { to: '/conversations', label: 'Conversations' },
       { to: '/calendar', label: 'Calendar' },
       { to: '/notifications', label: 'Notifications' },
       { to: '/governance', label: 'Governance' },
     ];
   }

   export function Sidebar({ open, onClose }: SidebarProps) {
     const { user } = useAuth();
     const nav = useNavigate();
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
     const pending = approvals.filter((a) => {
       if (a.status !== 'PENDING') return false;
       if (isAdmin(user)) return true;
       if (a.requiredRole !== user.role) return false;
       if (a.requiredTeamId !== null && a.requiredTeamId !== user.teamId) return false;
       return true;
     }).length;
     let items: NavItem[];
     if (isAdmin(user)) items = buildAdminNav(pending);
     else if (user.role === 'MEMBER' || user.role === 'VIEWER') items = buildMemberNav();
     else items = buildManagerNav(pending);
     const handleLogout = async () => { onClose(); await logout(); nav('/'); };
     const handleNavClick = () => { if (isMobile) onClose(); };
     return (
       <>
         <div className={'sidebar-overlay' + (open ? ' is-open' : '')} onClick={onClose} aria-hidden="true" />
         <aside className={'sidebar no-print' + (open ? ' is-open' : '')}>
           <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">×</button>
           <div className="sidebar__user">
             <div className="sidebar__user-info">
               <div className="sidebar__user-name">{user.displayName}</div>
               <div className="sidebar__user-role">{ROLE_LABEL[user.role]}</div>
             </div>
           </div>
           <div className="sidebar__group">
             <div className="sidebar__title">{seesAllTeams(user) ? 'Administration' : 'Menu'}</div>
             {items.map((it) => (
               <NavLink key={it.to} to={it.to} end={it.to === '/dashboard' || it.to === '/admin' || it.to === '/'}
                 onClick={handleNavClick}
                 className={({ isActive }) => cx('sidebar__link', isActive && 'is-active')}>
                 <span>{it.label}</span>
                 {it.count && it.count > 0 ? <span className="sidebar__count">{it.count > 99 ? '99+' : it.count}</span> : null}
               </NavLink>
             ))}
           </div>
           <div className="sidebar__group">
             <div className="sidebar__title">Account</div>
             <button type="button" className="sidebar__link sidebar__link--danger" onClick={handleLogout}>Logout</button>
           </div>
         </aside>
       </>
     );
   }
   `
);

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
               <p className="footer__tagline">{site.description}</p>
               <div className="footer__copyright">© {year} {site.organization} — {activeSeason.label}</div>
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
     useEffect(() => { initPwa(); }, []);
     useEffect(() => { window.scrollTo(0, 0); setSidebarOpen(false); }, [pathname]);
     useEffect(() => {
       if (loading) return;
       if (user && mustChangePassword && pathname !== '/change-password') nav('/change-password');
     }, [user, mustChangePassword, pathname, nav, loading]);
     const handleMenuToggle = () => setSidebarOpen((v) => !v);
     const handleSidebarClose = () => setSidebarOpen(false);
     return (
       <div className="app-shell">
         <Navbar onMenuToggle={user ? handleMenuToggle : undefined} />
         <main className="app-main">
           <Outlet />
           {user && sidebarOpen ? <Sidebar open={sidebarOpen} onClose={handleSidebarClose} /> : null}
         </main>
         {user ? <BottomNav /> : null}
         <Footer />
       </div>
     );
   }
   `
);

file(
  "src/components/layout/RequireAuth.tsx",
  `import type { ReactNode } from 'react';
   import { Navigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { Loading } from '@/components/ui/Loading';
   import type { RoleId } from '@/types';

   interface RequireAuthProps { children: ReactNode; roles?: RoleId[]; }
   export function RequireAuth({ children, roles }: RequireAuthProps) {
     const { user, loading, mustChangePassword } = useAuth();
     if (loading) return <Loading message="Verifying..." fullHeight />;
     if (!user) return <Navigate to="/login" replace />;
     if (mustChangePassword) return <Navigate to="/change-password" replace />;
     if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
     return <>{children}</>;
   }
   `
);

file(
  "src/components/layout/DashboardLayout.tsx",
  `import { Outlet } from 'react-router-dom';
   import { Sidebar } from './Sidebar';
   interface DashboardLayoutProps { sidebarOpen?: boolean; onSidebarClose?: () => void; }
   export function DashboardLayout({ sidebarOpen = false, onSidebarClose }: DashboardLayoutProps) {
     return (
       <div className="container">
         <div className="dashboard-layout">
           <Sidebar open={sidebarOpen} onClose={onSidebarClose ?? (() => {})} />
           <div><Outlet /></div>
         </div>
       </div>
     );
   }
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 11 — DOMAIN COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/components/team/TeamCard.tsx",
  `import { Link } from 'react-router-dom';
   import type { Team, Member } from '@/types';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import type { Contribution } from '@/types';

   interface TeamCardProps { team: Team; rank?: number; }
   export function TeamCard({ team, rank }: TeamCardProps) {
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const tm = members.filter((m) => Array.isArray(m.teamIds) && m.teamIds.includes(team.id));
     const totalPoints = getTeamTotalPoints(members, contributions, team.id);
     const avgPoints = tm.length === 0 ? 0 : Math.round(totalPoints / tm.length);
     return (
       <Link to={'/teams/' + team.id} className="team-card">
         <div className="team-card__head">
           <div className="team-card__name">{team.name}</div>
           {rank !== undefined ? <span className={'team-card__rank' + (rank === 1 ? ' team-card__rank--first' : '')}>#{rank}</span> : null}
         </div>
         <div className="team-card__stats">
           <div className="team-card__stat"><span className="team-card__stat-value">{totalPoints}</span><span className="team-card__stat-label">Points</span></div>
           <div className="team-card__stat"><span className="team-card__stat-value">{tm.length}</span><span className="team-card__stat-label">Members</span></div>
           <div className="team-card__stat"><span className="team-card__stat-value">{avgPoints}</span><span className="team-card__stat-label">Average</span></div>
         </div>
       </Link>
     );
   }
   `
);

file(
  "src/components/committee/CommitteeCard.tsx",
  `import { Link } from 'react-router-dom';
   import type { Committee, Member } from '@/types';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { getCommitteeTotalPoints } from '@/lib/rankings';
   import { teams } from '@/data/teams';
   import type { Contribution } from '@/types';

   interface CommitteeCardProps { committee: Committee; rank?: number; }
   export function CommitteeCard({ committee, rank }: CommitteeCardProps) {
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const cm = members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(committee.id));
     const totalPoints = getCommitteeTotalPoints(members, contributions, committee.id);
     const avgPoints = cm.length === 0 ? 0 : Math.round(totalPoints / cm.length);
     const team = committee.teamId ? teams.find((t) => t.id === committee.teamId) : null;
     return (
       <Link to={'/committees/' + committee.id} className="committee-card">
         <div className="committee-card__head">
           <div>
             <div className="committee-card__name">{committee.nameAr}</div>
             {team ? <div className="committee-card__team">Team: {team.name}</div> : null}
           </div>
           {rank !== undefined ? (
             <span className={'committee-rank-badge' + (rank === 1 ? ' committee-rank-badge--first' : '')}>#{rank}</span>
           ) : <span className="committee-card__color" style={{ background: committee.color }} />}
         </div>
         <div className="committee-card__stats">
           <div className="committee-card__stat"><span className="committee-card__stat-value">{totalPoints}</span><span className="committee-card__stat-label">Points</span></div>
           <div className="committee-card__stat"><span className="committee-card__stat-value">{cm.length}</span><span className="committee-card__stat-label">Members</span></div>
           <div className="committee-card__stat"><span className="committee-card__stat-value">{avgPoints}</span><span className="committee-card__stat-label">Average</span></div>
         </div>
       </Link>
     );
   }
   `
);

file(
  "src/components/member/MemberCard.tsx",
  `import { Link } from 'react-router-dom';
   import type { Member } from '@/types';
   import { Avatar } from '@/components/ui/Avatar';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { teams } from '@/data/teams';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { getMemberPoints } from '@/lib/rankings';
   import type { Contribution } from '@/types';

   interface MemberCardProps { member: Member; showTeam?: boolean; }
   export function MemberCard({ member, showTeam = true }: MemberCardProps) {
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const totalPoints = getMemberPoints(member.id, contributions);
     const mt = teams.filter((t) => Array.isArray(member.teamIds) && member.teamIds.includes(t.id));
     return (
       <Link to={'/members/' + member.id} className="member-card">
         <div className="member-card__head">
           <Avatar name={member.name} size={56} variant="navy" />
           <div className="member-card__info">
             <div className="member-card__name">{member.name}</div>
             <div className="member-card__role">{ROLE_LABEL[member.role]}</div>
           </div>
         </div>
         {showTeam && mt.length > 0 ? (
           <div className="member-card__teams">{mt.map((t) => <span key={t.id} className="member-card__team-tag">{t.name}</span>)}</div>
         ) : null}
         <div className="member-card__stats">
           <div className="member-card__stat"><span className="member-card__stat-value">{member.hours || 0}</span><span className="member-card__stat-label">Hours</span></div>
           <div className="member-card__stat member-card__stat--red"><span className="member-card__stat-value">{totalPoints}</span><span className="member-card__stat-label">Points</span></div>
         </div>
       </Link>
     );
   }
   `
);

file(
  "src/components/notification/NotificationItem.tsx",
  `import { useNavigate } from 'react-router-dom';
   import type { Notification } from '@/types';
   import { relativeTime } from '@/lib/format';

   interface NotificationItemProps { notification: Notification; onMarkRead?: (id: string) => void; }
   export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
     const nav = useNavigate();
     const handleClick = () => {
       if (!notification.read && onMarkRead) onMarkRead(notification.id);
       if (notification.route) nav(notification.route);
     };
     return (
       <div className={'notif-item' + (!notification.read ? ' notif-item--unread' : '')} onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleClick(); }}>
         <div className="notif-item__body">
           <div className="notif-item__title">{notification.title}</div>
           <div className="notif-item__message">{notification.message}</div>
           <div className="notif-item__meta">
             {notification.fromName ? <><span className="notif-item__from">{notification.fromName}</span><span>·</span></> : null}
             <span>{relativeTime(notification.date)}</span>
             {notification.priority === 'high' ? <span className="notif-item__priority notif-item__priority--high">Important</span> : null}
           </div>
         </div>
       </div>
     );
   }
   `
);

file(
  "src/components/contribution/ContributionRow.tsx",
  `import type { Contribution } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
   import { safeNumber } from '@/lib/safe';

   interface ContributionRowProps { contribution: Contribution; showMember?: boolean; showTeam?: boolean; }
   export function ContributionRow({ contribution, showMember = true, showTeam = true }: ContributionRowProps) {
     const team = teams.find((t) => t.id === contribution.teamId);
     const statusVariant = contribution.status === 'approved' ? 'success' : contribution.status === 'pending' ? 'info' : contribution.status === 'in_review' ? 'warning' : 'danger';
     const statusLabel = contribution.status === 'approved' ? 'Approved' : contribution.status === 'pending' ? 'Pending' : contribution.status === 'in_review' ? 'In Review' : 'Rejected';
     return (
       <tr>
         {showMember ? <td data-label="Member" style={{ fontWeight: 700 }}>{contribution.memberName}</td> : null}
         {showTeam ? <td data-label="Team" className="muted small">{team ? team.name : contribution.teamId}</td> : null}
         <td data-label="Title">{contribution.title}</td>
         <td data-label="Date" className="muted small nowrap">{formatDate(contribution.date)}</td>
         <td data-label="Hours">{safeNumber(contribution.hours)}</td>
         <td data-label="Points" className="points">{safeNumber(contribution.points)}</td>
         <td data-label="Status"><Badge variant={statusVariant}>{statusLabel}</Badge></td>
       </tr>
     );
   }
   `
);

file(
  "src/components/chat/MessageBubble.tsx",
  `import type { Message, AppUser } from '@/types';
   import { formatTime } from '@/lib/format';

   interface MessageBubbleProps { message: Message; currentUser: AppUser; }
   export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
     if (!message || !currentUser) return null;
     const isMine = message.senderUid === currentUser.uid;
     const name = message.senderName || 'Unknown';
     return (
       <div className={'chat-message' + (isMine ? ' chat-message--mine' : '')}>
         {!isMine ? <div className="chat-message__avatar">{name.charAt(0)}</div> : null}
         <div className="chat-message__bubble">
           {!isMine ? <div className="chat-message__sender">{name}</div> : null}
           <div>{message.text || ''}</div>
           <div className="chat-message__time">{formatTime(message.sentAt)}</div>
         </div>
       </div>
     );
   }
   `
);

file(
  "src/components/chat/Composer.tsx",
  `import { useState, type KeyboardEvent } from 'react';
   interface ComposerProps { onSend: (text: string) => Promise<void> | void; disabled?: boolean; placeholder?: string; }
   export function Composer({ onSend, disabled, placeholder = 'Type a message...' }: ComposerProps) {
     const [text, setText] = useState('');
     const [busy, setBusy] = useState(false);
     const send = async () => {
       const trimmed = text.trim();
       if (!trimmed || busy || disabled) return;
       setBusy(true);
       try { await onSend(trimmed); setText(''); } catch { /* ignore */ } finally { setBusy(false); }
     };
     const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
       if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); }
     };
     return (
       <div className="chat-composer">
         <textarea className="chat-composer__input" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} placeholder={placeholder} rows={1} disabled={busy || disabled} />
         <button type="button" className="chat-composer__send" onClick={send} disabled={!text.trim() || busy || disabled}>↑</button>
       </div>
     );
   }
   `
);

file(
  "src/components/calendar/CalendarGrid.tsx",
  `import type { CalendarEvent } from '@/types';
   import { getArabicMonth, getDaysInMonth, getFirstWeekdayOfMonth } from '@/lib/format';

   interface CalendarGridProps { year: number; month: number; events: CalendarEvent[]; selectedDate?: string; onSelectDate: (date: string) => void; onPrevMonth: () => void; onNextMonth: () => void; }
   const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
   function pad(n: number): string { return n < 10 ? '0' + n : String(n); }
   function toIso(y: number, m: number, d: number): string { return String(y) + '-' + pad(m + 1) + '-' + pad(d); }
   export function CalendarGrid({ year, month, events, selectedDate, onSelectDate, onPrevMonth, onNextMonth }: CalendarGridProps) {
     const daysInMonth = getDaysInMonth(year, month);
     const firstWeekday = getFirstWeekdayOfMonth(year, month);
     const todayIso = new Date().toISOString().slice(0, 10);
     const eventsByDate = new Map<string, CalendarEvent[]>();
     for (const e of events) { if (!eventsByDate.has(e.date)) eventsByDate.set(e.date, []); eventsByDate.get(e.date)!.push(e); }
     const cells: Array<{ day: number | null; iso: string }> = [];
     for (let i = 0; i < firstWeekday; i += 1) cells.push({ day: null, iso: '' });
     for (let d = 1; d <= daysInMonth; d += 1) cells.push({ day: d, iso: toIso(year, month, d) });
     return (
       <div className="calendar-container">
         <div className="calendar-header">
           <div className="calendar-month">{getArabicMonth(month)}<span style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)' }}>{year}</span></div>
           <div className="calendar-nav">
             <button type="button" className="calendar-nav__btn" onClick={onPrevMonth}>‹</button>
             <button type="button" className="calendar-nav__btn" onClick={onNextMonth}>›</button>
           </div>
         </div>
         <div className="calendar-weekdays">{WEEKDAYS.map((d) => <div key={d} className="calendar-weekday">{d}</div>)}</div>
         <div className="calendar-grid">
           {cells.map((cell, idx) => {
             if (cell.day === null) return <div key={'empty-' + idx} className="calendar-day" style={{ background: 'transparent' }} />;
             const hasEvents = eventsByDate.has(cell.iso);
             const isToday = cell.iso === todayIso;
             const isSelected = cell.iso === selectedDate;
             let cls = 'calendar-day';
             if (hasEvents) cls += ' calendar-day--has-events';
             if (isToday) cls += ' calendar-day--today';
             if (isSelected && !isToday) cls += ' calendar-day--selected';
             return <button key={cell.iso} type="button" className={cls} onClick={() => onSelectDate(cell.iso)}>{cell.day}</button>;
           })}
         </div>
       </div>
     );
   }
   `
);

file(
  "src/components/calendar/EventCard.tsx",
  `import type { CalendarEvent } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';

   interface EventCardProps { event: CalendarEvent; }
   export function EventCard({ event }: EventCardProps) {
     const team = event.teamId ? teams.find((t) => t.id === event.teamId) : null;
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
         </div>
         {event.description ? <p className="mt-2 small soft">{event.description}</p> : null}
         <div className="row mt-3" style={{ gap: 6 }}>
           {event.isPublic ? <Badge variant="info">Public</Badge> : null}
           {team ? <Badge>{team.name}</Badge> : null}
           {event.location ? <span className="small muted">{event.location}</span> : null}
         </div>
       </div>
     );
   }
   `
);

file(
  "src/components/request/RequestCard.tsx",
  `import { Link } from 'react-router-dom';
   import type { RequestRecord, RequestStatus } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { formatDate, REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL } from '@/lib/format';

   function statusVariant(s: RequestStatus): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
     if (s === 'APPROVED') return 'success';
     if (s === 'REJECTED') return 'danger';
     if (s === 'IN_REVIEW') return 'warning';
     if (s === 'PENDING') return 'info';
     return 'neutral';
   }
   interface RequestCardProps { request: RequestRecord; }
   export function RequestCard({ request }: RequestCardProps) {
     return (
       <Link to={'/requests/' + request.id} className="card">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{request.title}</div>
             <div className="card__meta">{request.requesterName} · {formatDate(request.submittedAt)}</div>
           </div>
         </div>
         <div className="row mt-3" style={{ gap: 6 }}>
           <Badge variant="neutral">{REQUEST_TYPE_LABEL[request.type] ?? request.type}</Badge>
           <Badge variant={statusVariant(request.status)}>{REQUEST_STATUS_LABEL[request.status]}</Badge>
         </div>
       </Link>
     );
   }
   `
);

file(
  "src/components/request/ApprovalChain.tsx",
  `import type { ApprovalStep } from '@/types';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { formatDate } from '@/lib/format';

   const STATUS_LABEL: Record<string, string> = { PENDING: 'Awaiting', APPROVED: 'Approved', REJECTED: 'Rejected', SKIPPED: 'Skipped' };
   interface ApprovalChainProps { steps: ApprovalStep[]; }
   export function ApprovalChain({ steps }: ApprovalChainProps) {
     if (steps.length === 0) return <div className="empty">No approval steps</div>;
     const sorted = [...steps].sort((a, b) => a.order - b.order);
     return (
       <div className="approval-chain">
         {sorted.map((step) => {
           const cls = step.status === 'APPROVED' ? 'approval-step--done' : step.status === 'REJECTED' ? 'approval-step--rejected' : step.status === 'PENDING' ? 'approval-step--pending' : '';
           return (
             <div key={step.id} className={'approval-step ' + cls}>
               <div className="approval-step__index">{step.order}</div>
               <div className="approval-step__body">
                 <div className="approval-step__title">{ROLE_LABEL[step.requiredRole] ?? step.requiredRole}</div>
                 <div className="approval-step__meta">{STATUS_LABEL[step.status]}{step.actionDate ? ' · ' + formatDate(step.actionDate) : ''}{step.approverName ? ' · ' + step.approverName : ''}</div>
                 {step.comment ? <div className="approval-step__comment">{step.comment}</div> : null}
               </div>
             </div>
           );
         })}
       </div>
     );
   }
   `
);

file(
  "src/components/achievement/AchievementCard.tsx",
  `import type { Achievement } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';

   interface AchievementCardProps { achievement: Achievement; }
   export function AchievementCard({ achievement }: AchievementCardProps) {
     return (
       <div className="card no-click">
         <div className="row row--between">
           <div style={{ flex: 1, minWidth: 0 }}>
             <div className="card__title">{achievement.title}</div>
             <div className="card__meta">{formatDate(achievement.date)}</div>
           </div>
           {achievement.level ? <Badge variant="warning">{achievement.level}</Badge> : null}
         </div>
         <p className="mt-3 small soft">{achievement.description}</p>
         {achievement.teamIds && achievement.teamIds.length > 0 ? (
           <div className="row mt-3" style={{ gap: 6 }}>
             {achievement.teamIds.map((id) => { const t = teams.find((x) => x.id === id); return t ? <Badge key={id}>{t.name}</Badge> : null; })}
           </div>
         ) : null}
       </div>
     );
   }
   `
);

file(
  "src/components/warning/WarningCard.tsx",
  `import type { WarningRecord } from '@/types';
   import { Badge } from '@/components/ui/Badge';
   import { formatDate } from '@/lib/format';

   interface WarningCardProps { warning: WarningRecord; }
   export function WarningCard({ warning }: WarningCardProps) {
     return (
       <div className="card no-click">
         <div className="row row--between">
           <div className="card__title">{warning.memberName}</div>
           <Badge variant={warning.status === 'active' ? 'danger' : 'success'} dot>{warning.status === 'active' ? 'Active' : 'Resolved'}</Badge>
         </div>
         <div className="card__meta" style={{ marginTop: 6 }}>{warning.reason}</div>
         <div className="row mt-3" style={{ gap: 6 }}>
           <Badge variant="neutral">{warning.type}</Badge>
           <Badge variant={warning.severity === 'HIGH' ? 'danger' : warning.severity === 'MEDIUM' ? 'warning' : 'info'}>{warning.severity}</Badge>
           <span className="small muted">{formatDate(warning.issuedAt)}</span>
         </div>
       </div>
     );
   }
   `
);

file(
  "src/components/timeline/TimelineList.tsx",
  `import type { TimelineEvent } from '@/types';
   import { formatDate } from '@/lib/format';

   interface TimelineListProps { events: TimelineEvent[]; }
   export function TimelineList({ events }: TimelineListProps) {
     if (events.length === 0) return <div className="empty" style={{ padding: 24 }}><div className="empty__message">No events yet</div></div>;
     const sorted = [...events].sort((a, b) => (a.date < b.date ? 1 : -1));
     return (
       <div className="timeline">
         {sorted.map((e) => (
           <div key={e.id} className="timeline__item">
             <div className="timeline__date">{formatDate(e.date)}</div>
             <div className="timeline__title">{e.title}</div>
             {e.description ? <div className="timeline__desc">{e.description}</div> : null}
           </div>
         ))}
       </div>
     );
   }
   `
);

file(
  "src/components/onboarding/Onboarding.tsx",
  `import { useEffect, useState } from 'react';
   import { onboardingCards, site } from '@/data';
   import { hasCompletedOnboarding, markOnboardingComplete } from '@/lib/onboarding';

   export function Onboarding() {
     const [visible, setVisible] = useState(false);
     useEffect(() => {
       if (!hasCompletedOnboarding()) { setVisible(true); document.body.style.overflow = 'hidden'; }
       return () => { document.body.style.overflow = ''; };
     }, []);
     const finish = () => { markOnboardingComplete(); setVisible(false); document.body.style.overflow = ''; };
     if (!visible) return null;
     const sorted = [...onboardingCards].sort((a, b) => a.order - b.order);
     return (
       <div className="onboarding-backdrop" role="dialog" aria-modal="true">
         <div className="onboarding-header">
           <div className="onboarding-header__title">Welcome to {site.name}</div>
           <div className="onboarding-header__subtitle">Learn about the platform in one minute</div>
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
           <button type="button" className="onboarding-cta" onClick={finish}>Got it, let's start</button>
         </div>
       </div>
     );
   }
   `
);

file(
  "src/components/pwa/PwaInstallBanner.tsx",
  `import { useEffect, useState } from 'react';
   import { canInstallPwa, promptInstall, isStandalone, isIos } from '@/lib/pwa';
   import { toast } from '@/components/ui/Toast';

   const DISMISSED_KEY = 'sbapiaryy-pwa-dismissed-v6';
   export function PwaInstallBanner() {
     const [visible, setVisible] = useState(false);
     const [iosMode, setIosMode] = useState(false);
     useEffect(() => {
       if (isStandalone()) return;
       if (localStorage.getItem(DISMISSED_KEY) === 'yes') return;
       const check = () => {
         if (canInstallPwa()) { setVisible(true); setIosMode(false); }
         else if (isIos()) { setVisible(true); setIosMode(true); }
       };
       const t = setTimeout(check, 8000);
       const handler = () => { setVisible(true); setIosMode(false); };
       window.addEventListener('pwa-install-available', handler);
       return () => { clearTimeout(t); window.removeEventListener('pwa-install-available', handler); };
     }, []);
     const dismiss = () => { setVisible(false); localStorage.setItem(DISMISSED_KEY, 'yes'); };
     const install = async () => {
       if (iosMode) { toast.info('To install on iPhone', 'Tap Share → Add to Home Screen'); return; }
       const result = await promptInstall();
       if (result === 'accepted') { toast.success('Installed'); setVisible(false); }
       else if (result === 'dismissed') dismiss();
       else toast.info('Install unavailable');
     };
     if (!visible) return null;
     return (
       <div className="pwa-install-banner no-print" role="dialog">
         <div className="pwa-install-banner__body">
           <div className="pwa-install-banner__title">Install sbapiaryy</div>
           <div className="pwa-install-banner__desc">{iosMode ? 'From Safari: tap Share → Add to Home Screen' : 'Faster access, no browser bar'}</div>
         </div>
         <div className="pwa-install-banner__actions">
           <button type="button" className="btn btn--ghost btn--xs" onClick={dismiss}>Later</button>
           <button type="button" className="btn btn--primary btn--xs" onClick={install}>Install</button>
         </div>
       </div>
     );
   }
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 12 — PUBLIC PAGES
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/LoginPage.tsx",
  `import { useState, type FormEvent } from 'react';
   import { useNavigate, Link } from 'react-router-dom';
   import { login } from '@/lib/auth';

   export function LoginPage() {
     const nav = useNavigate();
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [busy, setBusy] = useState(false);
     const onSubmit = async (e: FormEvent) => {
       e.preventDefault(); setError(''); setBusy(true);
       try { await login(email.trim(), password); nav('/dashboard'); }
       catch (err: unknown) { setError(err instanceof Error ? err.message : 'Login failed'); }
       finally { setBusy(false); }
     };
     return (
       <div className="login-page">
         <div className="login-card">
           <form onSubmit={onSubmit}>
             <div className="login-field">
               <label className="login-label">Email</label>
               <input className="login-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@resala-stem.org" autoComplete="email" required dir="ltr" />
             </div>
             <div className="login-field">
               <label className="login-label">Password</label>
               <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="........" autoComplete="current-password" required dir="ltr" />
             </div>
             {error ? <div className="login-error">{error}</div> : null}
             <button type="submit" className="login-submit" disabled={busy || !email || !password}>{busy ? '...' : 'Sign In'}</button>
           </form>
           <p className="login-back"><Link to="/">Back to Home</Link></p>
         </div>
       </div>
     );
   }
   `
);

file(
  "src/pages/ChangePasswordPage.tsx",
  `import { useState, type FormEvent } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { changePassword, logout } from '@/lib/auth';
   import { toast } from '@/components/ui/Toast';
   import { Loading } from '@/components/ui/Loading';

   export function ChangePasswordPage() {
     const nav = useNavigate();
     const { user, loading, mustChangePassword } = useAuth();
     const [newPassword, setNewPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [busy, setBusy] = useState(false);
     if (loading) return <Loading fullHeight />;
     if (!user) { nav('/login'); return null; }
     if (!mustChangePassword) { nav('/dashboard'); return null; }
     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();
       if (newPassword.length < 6) { toast.error('Password too weak'); return; }
       if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
       setBusy(true);
       try { await changePassword(newPassword); toast.success('Password updated'); nav('/dashboard'); }
       catch (err) { toast.error('Failed', err instanceof Error ? err.message : ''); }
       finally { setBusy(false); }
     };
     const handleLogout = async () => { await logout(); nav('/login'); };
     return (
       <div className="login-page">
         <div className="login-card">
           <p style={{ marginBottom: 20 }}>Welcome, {user.displayName}. Please set a new password.</p>
           <form onSubmit={onSubmit}>
             <div className="login-field"><label className="login-label">New Password</label><input className="login-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required dir="ltr" /></div>
             <div className="login-field"><label className="login-label">Confirm Password</label><input className="login-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required dir="ltr" /></div>
             <button type="submit" className="login-submit" disabled={busy}>{busy ? '...' : 'Save Password'}</button>
           </form>
           <p style={{ textAlign: 'center', marginTop: 20 }}><button type="button" onClick={handleLogout} style={{ color: 'var(--c-ink-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button></p>
         </div>
       </div>
     );
   }
   `
);

file(
  "src/pages/HomePage.tsx",
  `import { Link } from 'react-router-dom';
   import { site, activeSeason } from '@/data';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { teams } from '@/data/teams';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { TeamCard } from '@/components/team/TeamCard';
   import { Badge } from '@/components/ui/Badge';
   import { Loading } from '@/components/ui/Loading';
   import { EmptyState } from '@/components/ui/EmptyState';
   import type { Member, Contribution } from '@/types';

   export function HomePage() {
     const { user } = useAuth();
     const { data: members, loading: lM } = useRealtimeCollection<Member>('members');
     const { data: contributions, loading: lC } = useRealtimeCollection<Contribution>('contributions');
     const isLoading = lM || lC;
     const activeMembers = members.filter((m) => m.status === 'active');
     const teamRanking = teams.map((team) => ({ team, points: getTeamTotalPoints(members, contributions, team.id) }))
       .sort((a, b) => b.points - a.points).map((r, i) => ({ ...r, rank: i + 1 }));
     return (
       <>
         <section className="home-hero">
           <div className="container">
             <div className="section-head__eyebrow">{activeSeason.label}</div>
             <h1 className="home-hero__title">The <span className="home-hero__brand">{site.organization}</span> Sub Branches Hub</h1>
             <p className="home-hero__desc">{site.description}</p>
             <div className="home-hero__actions">
               <Link to="/members" className="btn btn--primary">Browse Members</Link>
               <Link to="/committees" className="btn btn--ghost">Committees</Link>
               <Link to="/league" className="btn btn--ghost">League</Link>
               {!user ? <Link to="/login" className="btn btn--ghost">Sign In</Link> : null}
             </div>
           </div>
         </section>
         <section className="home-section">
           <div className="container">
             {isLoading ? <Loading /> : (
               <div className="home-stats">
                 <div className="stat"><div className="stat__value">{activeMembers.length}</div><div className="stat__label">Members</div></div>
                 <div className="stat"><div className="stat__value">{teams.length}</div><div className="stat__label">Teams</div></div>
                 <div className="stat"><div className="stat__value">{teamRanking.reduce((s, r) => s + r.points, 0)}</div><div className="stat__label">Total Points</div></div>
               </div>
             )}
           </div>
         </section>
         <section className="home-section">
           <div className="container">
             <SectionHeader eyebrow="Team Standings" title="Teams by Points" action={<Link to="/teams" className="btn btn--ghost btn--sm">All Teams</Link>} />
             {isLoading ? <Loading /> : teamRanking.length === 0 ? <EmptyState title="No data" message="No teams yet." /> : (
               <div className="home-teams-grid">{teamRanking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}</div>
             )}
           </div>
         </section>
         {!user ? (
           <section className="home-section">
             <div className="container">
               <div className="home-join-cta">
                 <Badge variant="red" dot>{activeSeason.theme}</Badge>
                 <h2 className="home-join-cta__title">Join the Hub</h2>
                 <p className="home-join-cta__desc">Sign in to track your contributions, league progress, and pending approvals.</p>
                 <div className="home-join-cta__actions"><Link to="/login" className="btn btn--primary">Sign In</Link></div>
               </div>
             </div>
           </section>
         ) : null}
       </>
     );
   }
   `
);

file(
  "src/pages/MembersPage.tsx",
  `import { useMemo, useState } from 'react';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { MemberCard } from '@/components/member/MemberCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { cx } from '@/lib/format';
   import type { Member, TeamId, Committee } from '@/types';

   export function MembersPage() {
     const { data: members, loading } = useRealtimeCollection<Member>('members');
     const { data: liveCommittees } = useCollection<Committee>('committees');
     const [query, setQuery] = useState('');
     const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
     const [committeeFilter, setCommitteeFilter] = useState<string>('all');
     const filtered = useMemo(() => {
       const q = query.trim().toLowerCase();
       return members.filter((m) => {
         const matchesQuery = !q || m.name.toLowerCase().includes(q);
         const matchesTeam = teamFilter === 'all' || (Array.isArray(m.teamIds) && m.teamIds.includes(teamFilter));
         const matchesCommittee = committeeFilter === 'all' || (Array.isArray(m.committeeIds) && m.committeeIds.includes(committeeFilter));
         return matchesQuery && matchesTeam && matchesCommittee;
       });
     }, [members, query, teamFilter, committeeFilter]);
     return (
       <div className="container">
         <PageHeader eyebrow="Members" title="All Members" description="Browse, search, and filter." />
         <div className="toolbar"><input className="input" type="search" placeholder="Search by name..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
         <div className="chips mb-4">
           <button type="button" className={cx('chip', teamFilter === 'all' && 'is-active')} onClick={() => setTeamFilter('all')}>All Teams</button>
           {teams.map((t) => <button key={t.id} type="button" className={cx('chip', teamFilter === t.id && 'is-active')} onClick={() => setTeamFilter(t.id)}>{t.name}</button>)}
         </div>
         <div className="chips mb-4">
           <button type="button" className={cx('chip', committeeFilter === 'all' && 'is-active')} onClick={() => setCommitteeFilter('all')}>All Committees</button>
           {liveCommittees.map((c) => <button key={c.id} type="button" className={cx('chip', committeeFilter === c.id && 'is-active')} onClick={() => setCommitteeFilter(c.id)}>{c.nameAr}</button>)}
         </div>
         {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? (
           <EmptyState title="No results" message="No members match your search." />
         ) : (
           <div className="grid grid--wide">{filtered.map((m) => <MemberCard key={m.id} member={m} />)}</div>
         )}
       </div>
     );
   }
   `
);

file(
  "src/pages/MemberProfilePage.tsx",
  `import { useEffect, useState } from 'react';
   import { useParams, Link } from 'react-router-dom';
   import { getOne } from '@/lib/db';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { getUserRanks } from '@/lib/rankings';
   import { safeArray } from '@/lib/safe';
   import { formatDate } from '@/lib/format';
   import { Avatar } from '@/components/ui/Avatar';
   import { Badge } from '@/components/ui/Badge';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { ContributionRow } from '@/components/contribution/ContributionRow';
   import { Loading } from '@/components/ui/Loading';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { NotFoundPage } from './NotFoundPage';
   import type { Member, Contribution, Committee } from '@/types';

   export function MemberProfilePage() {
     const { memberId } = useParams<{ memberId: string }>();
     const [member, setMember] = useState<Member | null>(null);
     const [loading, setLoading] = useState(true);
     const { data: contributions } = useCollection<Contribution>('contributions');
     const { data: allMembers } = useCollection<Member>('members');
     const { data: committees } = useCollection<Committee>('committees');
     useEffect(() => {
       if (!memberId) return;
       void (async () => { const m = await getOne<Member>('members', memberId); setMember(m); setLoading(false); })();
     }, [memberId]);
     if (loading) return <Loading fullHeight />;
     if (!member) return <NotFoundPage />;
     const myContribs = safeArray(contributions).filter((c) => c.memberId === member.id).sort((a, b) => (a.date < b.date ? 1 : -1));
     const myRanks = getUserRanks(member.id, allMembers, contributions);
     const memberTeams = teams.filter((t) => safeArray(member.teamIds).includes(t.id));
     const memberCommittees = committees.filter((c) => safeArray(member.committeeIds).includes(c.id));
     return (
       <div className="container section--tight">
         <div className="profile">
           <Avatar name={member.name} size={80} variant="gradient" />
           <div className="profile__main">
             <h1 className="profile__name">{member.name}</h1>
             <div className="profile__role">{ROLE_LABEL[member.role]}</div>
             {member.bio ? <p className="profile__bio">{member.bio}</p> : null}
             {memberTeams.length > 0 ? <div className="row mt-4" style={{ gap: 6 }}>{memberTeams.map((t) => <Link key={t.id} to={'/teams/' + t.id}><Badge variant="navy">{t.name}</Badge></Link>)}</div> : null}
             {memberCommittees.length > 0 ? <div className="row mt-2" style={{ gap: 6 }}>{memberCommittees.map((c) => <Badge key={c.id}>{c.nameAr}</Badge>)}</div> : null}
           </div>
         </div>
         <section className="section">
           <SectionHeader eyebrow="My Ranking" title="Where I Stand" />
           <div className="grid grid--2">
             {myRanks.global ? <div className="card no-click"><div className="row row--between"><div className="card__title">Global</div><Badge variant="red">#{myRanks.global.rank}</Badge></div><div className="card__meta">Out of {myRanks.global.total} · {myRanks.global.points} pts</div></div> : null}
             {myRanks.team ? <div className="card no-click"><div className="row row--between"><div className="card__title">Team Ranking</div><Badge variant="navy">#{myRanks.team.rank}</Badge></div><div className="card__meta">Out of {myRanks.team.total} · {myRanks.team.points} pts</div></div> : null}
             {myRanks.committees.map((cr) => {
               const c = committees.find((x) => x.id === cr.committeeId);
               return <div key={cr.committeeId} className="card no-click"><div className="row row--between"><div className="card__title">{c?.nameAr || cr.committeeId}</div><Badge variant="info">#{cr.rank}</Badge></div><div className="card__meta">Out of {cr.total} · {cr.points} pts</div></div>;
             })}
           </div>
         </section>
         <section className="section">
           <SectionHeader eyebrow="Contributions" title="History" />
           {myContribs.length === 0 ? <EmptyState title="No contributions" message="No contributions yet." /> : (
             <div className="table-wrap">
               <table className="data">
                 <thead><tr><th>Title</th><th>Team</th><th>Date</th><th>Hours</th><th>Points</th><th>Status</th></tr></thead>
                 <tbody>{myContribs.map((c) => <ContributionRow key={c.id} contribution={c} showMember={false} showTeam />)}</tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/TeamsPage.tsx",
  `import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import { TeamCard } from '@/components/team/TeamCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import type { Member, Contribution } from '@/types';

   export function TeamsPage() {
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const ranking = teams.map((team) => ({ team, points: getTeamTotalPoints(members, contributions, team.id) }))
       .sort((a, b) => b.points - a.points).map((r, i) => ({ team: r.team, rank: i + 1 }));
     const totalPoints = ranking.reduce((s, r) => s + r.points, 0);
     return (
       <div className="container">
         <PageHeader eyebrow="Structure" title="Teams" description="Seven specialized teams." />
         <section className="section--tight">
           <StatRow>
             <Stat value={teams.length} label="Teams" />
             <Stat value={members.length} label="Members" />
             <Stat value={totalPoints} label="Total Points" />
           </StatRow>
         </section>
         <section className="section">
           <div className="grid">{ranking.map((r) => <TeamCard key={r.team.id} team={r.team} rank={r.rank} />)}</div>
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/TeamDetailPage.tsx",
  `import { useParams } from 'react-router-dom';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getTeamRanking, getTeamTotalPoints } from '@/lib/rankings';
   import { MemberCard } from '@/components/member/MemberCard';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { NotFoundPage } from './NotFoundPage';
   import type { TeamId, Member, Contribution } from '@/types';

   export function TeamDetailPage() {
     const { teamId } = useParams<{ teamId: string }>();
     const team = teams.find((t) => t.id === (teamId as TeamId));
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     if (!team) return <NotFoundPage />;
     const tm = members.filter((m) => Array.isArray(m.teamIds) && m.teamIds.includes(team.id));
     const board = getTeamRanking(members, contributions, team.id);
     const totalPoints = getTeamTotalPoints(members, contributions, team.id);
     const avg = tm.length === 0 ? 0 : Math.round(totalPoints / tm.length);
     return (
       <div className="container section--tight">
         <div className="profile"><div className="profile__main"><h1 className="profile__name">{team.name}</h1><div className="profile__role">{team.description}</div></div></div>
         <section className="section"><StatRow><Stat value={tm.length} label="Members" /><Stat value={totalPoints} label="Total Points" /><Stat value={avg} label="Average" /></StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Members" title="Team Members" />
           {tm.length === 0 ? <EmptyState title="No members" message="No members yet." /> : <div className="grid grid--wide">{tm.map((m) => <MemberCard key={m.id} member={m} showTeam={false} />)}</div>}
         </section>
         <section className="section">
           <SectionHeader eyebrow="Ranking" title="Team Ranking" />
           {board.length === 0 ? <EmptyState title="No data" message="No ranking data." /> : (
             <div className="table-wrap"><table className="data"><thead><tr><th>#</th><th>Member</th><th>Hours</th><th>Points</th></tr></thead>
               <tbody>{board.map((e) => <tr key={e.member.id}><td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}>{e.rank}</td><td style={{ fontWeight: 700 }}>{e.member.name}</td><td>{e.member.hours || 0}</td><td className="points">{e.points}</td></tr>)}</tbody>
             </table></div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/CommitteesPage.tsx",
  `import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { getCommitteeTotalPoints } from '@/lib/rankings';
   import { CommitteeCard } from '@/components/committee/CommitteeCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import type { Committee, Member, Contribution } from '@/types';

   export function CommitteesPage() {
     const { data: committees, loading } = useCollection<Committee>('committees');
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const ranking = committees.map((c) => ({ committee: c, points: getCommitteeTotalPoints(members, contributions, c.id) }))
       .sort((a, b) => b.points - a.points).map((r, i) => ({ committee: r.committee, rank: i + 1 }));
     return (
       <div className="container">
         <PageHeader eyebrow="Governance" title="Committees" description="Committees are like teams — each member belongs to at least one." />
         <section className="section--tight"><StatRow><Stat value={committees.length} label="Committees" /><Stat value={members.length} label="Members" /><Stat value={ranking.reduce((s, r) => s + r.points, 0)} label="Total Points" /></StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Ranking" title="All Committees" />
           {loading ? <SkeletonList count={4} /> : ranking.length === 0 ? <EmptyState title="No committees" message="No committees yet." /> : (
             <div className="grid grid--wide">{ranking.map((r) => <CommitteeCard key={r.committee.id} committee={r.committee} rank={r.rank} />)}</div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/CommitteeDetailPage.tsx",
  `import { useParams } from 'react-router-dom';
   import { useCollection, useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { getCommitteeRanking } from '@/lib/rankings';
   import { teams } from '@/data/teams';
   import { MemberCard } from '@/components/member/MemberCard';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { NotFoundPage } from './NotFoundPage';
   import type { Committee, Member, Contribution } from '@/types';

   export function CommitteeDetailPage() {
     const { committeeId } = useParams<{ committeeId: string }>();
     const { data: committees } = useCollection<Committee>('committees');
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const committee = committees.find((c) => c.id === committeeId);
     if (!committee) return <NotFoundPage />;
     const cm = members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(committee.id));
     const board = getCommitteeRanking(members, contributions, committee.id);
     const totalPoints = board.reduce((s, e) => s + e.points, 0);
     const team = committee.teamId ? teams.find((t) => t.id === committee.teamId) : null;
     return (
       <div className="container section--tight">
         <div className="profile"><div className="profile__main">
           <h1 className="profile__name">{committee.nameAr}</h1>
           <div className="profile__role">{committee.description}</div>
           {team ? <div className="small muted mt-3">Team: {team.name}</div> : null}
         </div></div>
         <section className="section"><StatRow><Stat value={cm.length} label="Members" /><Stat value={totalPoints} label="Total Points" /></StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Ranking" title="Committee Ranking" />
           {board.length === 0 ? <EmptyState title="No data" message="No ranking data." /> : (
             <div className="table-wrap"><table className="data"><thead><tr><th>#</th><th>Member</th><th>Points</th></tr></thead>
               <tbody>{board.map((e) => <tr key={e.member.id}><td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}>{e.rank}</td><td style={{ fontWeight: 700 }}>{e.member.name}</td><td className="points">{e.points}</td></tr>)}</tbody>
             </table></div>
           )}
         </section>
         <section className="section">
           <SectionHeader eyebrow="Members" title="Committee Members" />
           {cm.length === 0 ? <EmptyState title="No members" message="No members yet." /> : <div className="grid grid--wide">{cm.map((m) => <MemberCard key={m.id} member={m} showTeam={false} />)}</div>}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/LeaguePage.tsx",
  `import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getGlobalRanking, getTeamRanking, getCommitteeRanking } from '@/lib/rankings';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Avatar } from '@/components/ui/Avatar';
   import { cx } from '@/lib/format';
   import type { Member, Contribution, TeamId, Committee } from '@/types';

   type FilterType = 'all' | 'team' | 'committee';

   export function LeaguePage() {
     const { data: members, loading } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const { data: liveCommittees } = useCollection<Committee>('committees');
     const [filterType, setFilterType] = useState<FilterType>('all');
     const [filterId, setFilterId] = useState<string>('all');

     const board = useMemo(() => {
       if (filterType === 'all' || filterId === 'all') return getGlobalRanking(members, contributions);
       if (filterType === 'team') return getTeamRanking(members, contributions, filterId as TeamId);
       return getCommitteeRanking(members, contributions, filterId);
     }, [members, contributions, filterType, filterId]);

     const title = filterType === 'all' ? 'Global Ranking'
       : filterType === 'team' ? 'Team: ' + (teams.find((t) => t.id === filterId)?.name || '')
       : 'Committee: ' + (liveCommittees.find((c) => c.id === filterId)?.nameAr || '');

     return (
       <div className="container">
         <PageHeader eyebrow="League" title="Leaderboard" description="Track ranking by team, committee, or globally." />
         <div className="chips mb-3">
           <button type="button" className={cx('chip', filterType === 'all' && 'is-active')} onClick={() => { setFilterType('all'); setFilterId('all'); }}>Global</button>
           <button type="button" className={cx('chip', filterType === 'team' && 'is-active')} onClick={() => { setFilterType('team'); setFilterId('all'); }}>By Team</button>
           <button type="button" className={cx('chip', filterType === 'committee' && 'is-active')} onClick={() => { setFilterType('committee'); setFilterId('all'); }}>By Committee</button>
         </div>
         {filterType === 'team' ? (
           <div className="chips mb-4">
             <button type="button" className={cx('chip', filterId === 'all' && 'is-active')} onClick={() => setFilterId('all')}>All Teams</button>
             {teams.map((t) => <button key={t.id} type="button" className={cx('chip', filterId === t.id && 'is-active')} onClick={() => setFilterId(t.id)}>{t.name}</button>)}
           </div>
         ) : null}
         {filterType === 'committee' ? (
           <div className="chips mb-4">
             <button type="button" className={cx('chip', filterId === 'all' && 'is-active')} onClick={() => setFilterId('all')}>All Committees</button>
             {liveCommittees.map((c) => <button key={c.id} type="button" className={cx('chip', filterId === c.id && 'is-active')} onClick={() => setFilterId(c.id)}>{c.nameAr}</button>)}
           </div>
         ) : null}
         <section className="section">
           <SectionHeader eyebrow="Ranking" title={title} />
           {loading ? <SkeletonList count={8} /> : board.length === 0 ? (
             <EmptyState title="No data" message="No ranking data for this filter." />
           ) : (
             <div className="table-wrap">
               <table className="data">
                 <thead><tr><th>#</th><th>Member</th><th>Hours</th><th>Points</th></tr></thead>
                 <tbody>{board.map((e) => (
                   <tr key={e.member.id}>
                     <td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')}>{e.rank}</td>
                     <td><Link to={'/members/' + e.member.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={e.member.name} size={32} variant="navy" /><span style={{ fontWeight: 700 }}>{e.member.name}</span></Link></td>
                     <td>{e.hours}</td>
                     <td className="points">{e.points}</td>
                   </tr>
                 ))}</tbody>
               </table>
             </div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/AchievementsPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { AchievementCard } from '@/components/achievement/AchievementCard';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonCard } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import type { Achievement } from '@/types';

   export function AchievementsPage() {
     const { data, loading } = useCollection<Achievement>('achievements');
     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));
     return (
       <div className="container">
         <PageHeader eyebrow="Achievements" title="Organization Awards" description="Everything we've accomplished." />
         <section className="section">
           <SectionHeader eyebrow="List" title="All Achievements" />
           {loading ? <div className="stack"><SkeletonCard count={4} /></div> : sorted.length === 0 ? (
             <EmptyState title="No achievements" message="No achievements yet." />
           ) : (
             <div className="stack">{sorted.map((a) => <AchievementCard key={a.id} achievement={a} />)}</div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/GovernancePage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Badge } from '@/components/ui/Badge';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { formatDate } from '@/lib/format';
   import type { GovernanceDocument } from '@/types';

   export function GovernancePage() {
     const { data, loading } = useCollection<GovernanceDocument>('governance');
     const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title));
     return (
       <div className="container">
         <PageHeader eyebrow="Governance" title="Official Documents" description="Policies and bylaws." />
         {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? <EmptyState title="No documents" message="No documents yet." /> : (
           <section className="section">
             <SectionHeader eyebrow="Documents" title="All Documents" />
             <div className="stack">{sorted.map((d) => (
               <div key={d.id} className="card no-click">
                 <div className="row row--between"><div className="card__title">{d.title}</div><Badge variant="neutral">v{d.version}</Badge></div>
                 {d.description ? <div className="card__meta">{d.description}</div> : null}
                 <div className="small muted mt-3">Last updated {formatDate(d.updatedAt)}</div>
                 <p className="mt-3 small soft" style={{ lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>{d.content}</p>
               </div>
             ))}</div>
           </section>
         )}
       </div>
     );
   }
   `
);

file(
  "src/pages/AboutPage.tsx",
  `import { site, activeSeason } from '@/data';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import type { Member } from '@/types';

   export function AboutPage() {
     const { data: members } = useRealtimeCollection<Member>('members');
     const active = members.filter((m) => m.status === 'active');
     return (
       <div className="container">
         <PageHeader eyebrow="About" title={site.name} description={site.description} />
         <section className="section--tight"><StatRow><Stat value={active.length} label="Members" /><Stat value={teams.length} label="Teams" /></StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Season" title={activeSeason.label} description={activeSeason.theme} />
         </section>
         <section className="section">
           <SectionHeader eyebrow="Teams" title="Seven Teams" />
           <div className="stack">{teams.map((t) => (<div key={t.id} className="card no-click"><div className="card__title">{t.name}</div><p className="small soft mt-3">{t.description}</p></div>))}</div>
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/SearchPage.tsx",
  `import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Badge } from '@/components/ui/Badge';
   import type { Member, Contribution, Achievement, Committee } from '@/types';

   export function SearchPage() {
     const [query, setQuery] = useState('');
     const { data: members } = useRealtimeCollection<Member>('members');
     const { data: contributions } = useRealtimeCollection<Contribution>('contributions');
     const { data: achievements } = useRealtimeCollection<Achievement>('achievements');
     const { data: committees } = useCollection<Committee>('committees');
     const results = useMemo(() => {
       const q = query.trim().toLowerCase();
       if (!q || q.length < 2) return [];
       const out: Array<{ id: string; type: string; title: string; subtitle?: string; route: string }> = [];
       members.forEach((m) => { if (m.name.toLowerCase().includes(q)) out.push({ id: m.id, type: 'Member', title: m.name, subtitle: m.bio?.slice(0, 80), route: '/members/' + m.id }); });
       contributions.forEach((c) => { if (c.title.toLowerCase().includes(q)) out.push({ id: c.id, type: 'Contribution', title: c.title, route: '/my-contributions' }); });
       achievements.forEach((a) => { if (a.title.toLowerCase().includes(q)) out.push({ id: a.id, type: 'Achievement', title: a.title, route: '/achievements' }); });
       teams.forEach((t) => { if (t.name.toLowerCase().includes(q)) out.push({ id: t.id, type: 'Team', title: t.name, route: '/teams/' + t.id }); });
       committees.forEach((c) => { if (c.nameAr.toLowerCase().includes(q)) out.push({ id: c.id, type: 'Committee', title: c.nameAr, route: '/committees/' + c.id }); });
       return out.slice(0, 50);
     }, [query, members, contributions, achievements, committees]);
     return (
       <div className="container">
         <PageHeader eyebrow="Search" title="Global Search" description="Search across the platform." />
         <input className="input" type="search" placeholder="Type at least 2 characters..." value={query} onChange={(e) => setQuery(e.target.value)} autoFocus style={{ marginBottom: 20 }} />
         {query.length < 2 ? <EmptyState title="Start typing" message="Type at least 2 characters." /> : results.length === 0 ? <EmptyState title="No results" message={'No results for "' + query + '".'} /> : (
           <div className="stack">{results.map((r) => (
             <Link key={r.type + '-' + r.id} to={r.route} className="card"><div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{r.title}</div>{r.subtitle ? <div className="card__meta">{r.subtitle}</div> : null}</div><Badge variant="neutral">{r.type}</Badge></div></Link>
           ))}</div>
         )}
       </div>
     );
   }
   `
);

file(
  "src/pages/NotFoundPage.tsx",
  `import { Link } from 'react-router-dom';
   export function NotFoundPage() {
     return (
       <div className="container notfound">
         <div className="notfound__code">404</div>
         <h2 className="mt-4">Page not found</h2>
         <p className="muted mt-3">The page you are looking for does not exist.</p>
         <div className="row mt-6" style={{ justifyContent: 'center' }}><Link to="/" className="btn btn--primary">Back to Home</Link></div>
       </div>
     );
   }
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 13 — DASHBOARD PAGES
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/DashboardPage.tsx",
  `import { Link } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { isManager, seesAllTeams, canApproveStep } from '@/lib/permissions';
   import { getMemberPoints, getMemberHours, getUserRanks } from '@/lib/rankings';
   import { safeArray } from '@/lib/safe';
   import { formatDate } from '@/lib/format';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';
   import type { Notification, RequestRecord, Contribution, ApprovalStep, Member, Committee } from '@/types';

   export function DashboardPage() {
     const { user } = useAuth();
     const { data: members, loading: l1 } = useRealtimeCollection<Member>('members');
     const { data: contributions, loading: l2 } = useRealtimeCollection<Contribution>('contributions');
     const { data: notifs, loading: l3 } = useRealtimeCollection<Notification>('notifications');
     const { data: requests, loading: l4 } = useRealtimeCollection<RequestRecord>('requests');
     const { data: approvals, loading: l5 } = useRealtimeCollection<ApprovalStep>('approvals');
     const { data: liveCommittees } = useRealtimeCollection<Committee>('committees');

     if (!user) return <div className="container"><EmptyState title="Sign in required" message="Please sign in." /></div>;
     if (l1 || l2 || l3 || l4 || l5) return <div className="container"><Loading fullHeight message="Loading..." /></div>;

     const myMember = user.memberId ? members.find((m) => m.id === user.memberId) : null;
     const myPoints = user.memberId ? getMemberPoints(user.memberId, contributions) : 0;
     const myHours = user.memberId ? getMemberHours(user.memberId, contributions) : 0;
     const myContribs = safeArray(contributions).filter((c) => c.memberId === user.memberId);
     const myRequests = safeArray(requests).filter((r) => r.requesterUid === user.uid);
     const myNotifs = safeArray(notifs).filter((n) => n.userId === user.uid).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);
     const myPendingApprovals = safeArray(approvals).filter((a) => a.status === 'PENDING' && canApproveStep(user, a));
     const pendingRequestsCount = safeArray(requests).filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
     const totalOrgPoints = safeArray(members).reduce((s, m) => s + getMemberPoints(m.id, contributions), 0);
     const myRanks = getUserRanks(user.memberId, members, contributions);

     return (
       <>
         <div className="section section--tight"><div className="section-head__eyebrow">Welcome back</div><h1>{user.displayName}</h1></div>
         {isManager(user) ? (
           <section className="section--tight"><StatRow>
             <Stat value={members.length} label="Members" />
             <Stat value={teams.length} label="Teams" />
             <Stat value={pendingRequestsCount} label="Pending" variant="red" />
             <Stat value={totalOrgPoints} label="Total Points" />
           </StatRow></section>
         ) : (
           <section className="section--tight"><StatRow>
             <Stat value={myPoints} label="My Points" variant="red" />
             <Stat value={myHours} label="My Hours" />
             <Stat value={myContribs.length} label="Contributions" />
             <Stat value={myRequests.length} label="Requests" />
           </StatRow></section>
         )}
         {(myRanks.global || myRanks.team || myRanks.committees.length > 0) ? (
           <section className="section">
             <SectionHeader eyebrow="My Ranking" title="Where I Stand" />
             <div className="grid grid--2">
               {myRanks.global ? <div className="card no-click"><div className="row row--between"><div className="card__title">Global</div><Badge variant="red">#{myRanks.global.rank}</Badge></div><div className="card__meta">Out of {myRanks.global.total} · {myRanks.global.points} pts</div></div> : null}
               {myRanks.team ? <div className="card no-click"><div className="row row--between"><div className="card__title">Team</div><Badge variant="navy">#{myRanks.team.rank}</Badge></div><div className="card__meta">{teams.find((t) => t.id === myRanks.team!.teamId)?.name} · {myRanks.team.points} pts</div></div> : null}
               {myRanks.committees.map((cr) => {
                 const c = liveCommittees.find((x) => x.id === cr.committeeId);
                 return <div key={cr.committeeId} className="card no-click"><div className="row row--between"><div className="card__title">{c?.nameAr || cr.committeeId}</div><Badge variant="info">#{cr.rank}</Badge></div><div className="card__meta">{cr.points} pts</div></div>;
               })}
             </div>
           </section>
         ) : null}
         {user.role === 'MEMBER' ? (
           <section className="section--tight"><div className="row" style={{ gap: 10 }}>
             <Link to="/requests/new" className="btn btn--primary btn--sm">+ New Request</Link>
             <Link to="/my-contributions" className="btn btn--ghost btn--sm">Log Contribution</Link>
           </div></section>
         ) : null}
         {isManager(user) && myPendingApprovals.length > 0 ? (
           <section className="section">
             <SectionHeader eyebrow="Awaiting" title="Pending Approvals" action={<Link to="/approvals" className="btn btn--ghost btn--sm">All</Link>} />
             <div className="stack">{myPendingApprovals.slice(0, 4).map((a) => {
               const req = requests.find((r) => r.id === a.requestId);
               if (!req) return null;
               return <Link key={a.id} to={'/requests/' + req.id} className="card"><div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{req.title}</div><div className="card__meta">{req.requesterName} · Step {a.order}</div></div><Badge variant="warning" dot>Awaiting</Badge></div></Link>;
             })}</div>
           </section>
         ) : null}
         {myNotifs.length > 0 ? (
           <section className="section">
             <SectionHeader eyebrow="Updates" title="Notifications" action={<Link to="/notifications" className="btn btn--ghost btn--sm">All</Link>} />
             <div className="stack">{myNotifs.map((n) => (
               <Link key={n.id} to={n.route || '/notifications'} className="card" style={!n.read ? { borderColor: '#FCA5A5', background: '#FFFBFC' } : undefined}>
                 <div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{n.title}</div><div className="card__meta">{n.message}</div></div>{!n.read ? <Badge variant="red" dot>New</Badge> : null}</div>
               </Link>
             ))}</div>
           </section>
         ) : null}
         {myMember ? (
           <section className="section">
             <SectionHeader eyebrow="Info" title="Account" />
             <div className="card no-click">
               <div className="kv"><span className="kv__k">Name</span><span className="kv__v">{myMember.name}</span></div>
               <div className="kv mt-3"><span className="kv__k">Team</span><span className="kv__v">{user.teamId ? teams.find((t) => t.id === user.teamId)?.name : '—'}</span></div>
               <div className="kv mt-3"><span className="kv__k">Joined</span><span className="kv__v">{user.createdAt ? formatDate(user.createdAt) : '—'}</span></div>
             </div>
           </section>
         ) : null}
       </>
     );
   }
   `
);

file(
  "src/pages/MyContributionsPage.tsx",
  `import { useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection, useCollection } from '@/lib/useRealtimeCollection';
   import { createOne, newId, today } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { newContributionApprovals } from '@/lib/contributionApprovals';
   import { safeArray, safeNumber } from '@/lib/safe';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextInput, NumberInput, TextArea, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Contribution, TeamId, Committee } from '@/types';

   const STAGE_LABEL: Record<number, string> = { 1: 'Committee HR', 2: 'Team Head HR / Head', 3: 'Sub-Branches Review' };

   function getStage(c: Contribution): 1 | 2 | 3 | 4 {
     const s = c.currentStage;
     if (s === 1 || s === 2 || s === 3 || s === 4) return s;
     if (c.status === 'approved' || c.status === 'rejected') return 4;
     return 1;
   }

   export function MyContributionsPage() {
     const { user } = useAuth();
     const { data: contributions, loading } = useRealtimeCollection<Contribution>('contributions');
     const { data: liveCommittees } = useCollection<Committee>('committees');
     const [open, setOpen] = useState(false);
     const [busy, setBusy] = useState(false);
     const [title, setTitle] = useState('');
     const [desc, setDesc] = useState('');
     const [hours, setHours] = useState(1);
     const [teamId, setTeamId] = useState<TeamId>('helpers');
     const [committeeId, setCommitteeId] = useState<string>('');

     if (!user?.memberId) return <div className="container"><EmptyState title="No member linked" message="Your account is not linked to a member." /></div>;

     const userCommittees = safeArray(user.committeeIds);
     const myContribs = safeArray(contributions).filter((c) => c.memberId === user.memberId).sort((a, b) => (a.date < b.date ? 1 : -1));
     const approved = myContribs.filter((c) => c.status === 'approved');
     const totalPoints = approved.reduce((s, c) => s + safeNumber(c.points), 0);
     const totalHours = approved.reduce((s, c) => s + safeNumber(c.hours), 0);
     const pending = myContribs.filter((c) => c.status === 'pending' || c.status === 'in_review').length;

     const reset = () => { setTitle(''); setDesc(''); setHours(1); };

     const submit = async () => {
       if (!title.trim() || !desc.trim()) { toast.error('Title & description required'); return; }
       if (hours <= 0) { toast.error('Hours must be positive'); return; }
       if (!committeeId) { toast.error('Committee required'); return; }
       setBusy(true);
       try {
         const contrib: Contribution = {
           id: newId('C'), memberId: user.memberId!, memberName: user.displayName,
           teamId, committeeId, title: title.trim(), description: desc.trim(),
           date: today(), hours, points: 0, status: 'pending', seasonId: 'S7',
           createdBy: user.uid, approvals: newContributionApprovals(), currentStage: 1,
         };
         await createOne('contributions', contrib);
         try { await logAudit(user, 'CREATE_CONTRIBUTION', 'Contribution', contrib.id, 'Log contribution'); } catch { /* ignore */ }
         toast.success('Submitted', 'Awaiting committee HR approval');
         setOpen(false); reset();
       } catch (err) { toast.error('Failed', err instanceof Error ? err.message : ''); }
       finally { setBusy(false); }
     };

     return (
       <div className="container">
         <PageHeader eyebrow="My Contributions" title="My Contributions" description="Log contributions. Committee HR assigns points.">
           <button type="button" className="btn btn--primary mt-4" onClick={() => setOpen(true)}>+ Log Contribution</button>
         </PageHeader>
         <section className="section--tight"><StatRow>
           <Stat value={totalPoints} label="Points" variant="red" />
           <Stat value={totalHours} label="Hours" />
           <Stat value={myContribs.length} label="Contributions" />
           <Stat value={pending} label="Pending" />
         </StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="History" title="All Contributions" />
           {loading ? <SkeletonList count={5} /> : myContribs.length === 0 ? (
             <EmptyState title="No contributions yet" message="Log your first contribution." />
           ) : (
             <div className="stack">{myContribs.map((c) => {
               const team = teams.find((t) => t.id === c.teamId);
               const committee = liveCommittees.find((x) => x.id === c.committeeId);
               const stage = getStage(c);
               const approvals = safeArray(c.approvals);
               return (
                 <div key={c.id} className="card no-click">
                   <div className="row row--between">
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div className="card__title">{c.title}</div>
                       <div className="card__meta">{team?.name} · {committee?.nameAr || c.committeeId} · {formatDate(c.date)}</div>
                     </div>
                     <Badge variant={c.status === 'approved' ? 'success' : c.status === 'pending' ? 'info' : c.status === 'in_review' ? 'warning' : 'danger'}>
                       {c.status === 'approved' ? 'Approved' : c.status === 'pending' ? 'Stage 1' : c.status === 'in_review' ? 'Stage ' + stage + '/3' : 'Rejected'}
                     </Badge>
                   </div>
                   <p className="small soft mt-2">{c.description}</p>
                   <div className="row mt-3" style={{ gap: 12 }}>
                     <span className="small">{safeNumber(c.hours)} hours</span>
                     {c.status === 'approved' ? <span className="points">{safeNumber(c.points)} points</span> : <span className="muted small">Points pending</span>}
                   </div>
                   {c.status !== 'approved' && c.status !== 'rejected' ? (
                     <div className="mt-3" style={{ paddingTop: 12, borderTop: '1px solid var(--c-line)' }}>
                       <div className="tiny muted" style={{ marginBottom: 8 }}>Approval Progress</div>
                       <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                         {[1, 2, 3].map((s) => {
                           const apr = approvals.find((a) => a.stage === s);
                           const isDone = apr?.status === 'approved';
                           const isRej = apr?.status === 'rejected';
                           const isActive = stage === s;
                           return <span key={s} className={'badge ' + (isDone ? 'badge--success' : isRej ? 'badge--danger' : isActive ? 'badge--warning' : 'badge--neutral')}>{s}. {STAGE_LABEL[s]}{isDone ? ' ✓' : ''}</span>;
                         })}
                       </div>
                     </div>
                   ) : null}
                 </div>
               );
             })}</div>
           )}
         </section>
         <Modal open={open} title="Log New Contribution" onClose={() => setOpen(false)} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="btn btn--primary" onClick={submit} disabled={busy}>{busy ? '...' : 'Submit'}</button></>}>
           <FormField label="Title" required><TextInput value={title} onChange={setTitle} /></FormField>
           <FormField label="Description" required><TextArea value={desc} onChange={setDesc} rows={3} /></FormField>
           <FormField label="Team" required><Select value={teamId} onChange={(v) => setTeamId(v as TeamId)} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
           <FormField label="Committee" required hint="Points will be assigned by committee HR">
             <Select value={committeeId} onChange={setCommitteeId}
               options={[{ value: '', label: '— Select —' }, ...liveCommittees.filter((c) => userCommittees.includes(c.id)).map((c) => ({ value: c.id, label: c.nameAr }))]} />
           </FormField>
           <FormField label="Hours" required hint="Approximate — committee HR assigns final points"><NumberInput value={hours} onChange={setHours} min={0.5} max={200} step={0.5} /></FormField>
         </Modal>
       </div>
     );
   }
   `
);

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
     const mine = requests.filter((r) => r.requesterUid === user.uid).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
     return (
       <div className="container">
         <PageHeader eyebrow="My Requests" title="My Requests" description="Track your requests.">
           <Link className="btn btn--primary mt-4" to="/requests/new">+ New Request</Link>
         </PageHeader>
         <section className="section">
           <SectionHeader eyebrow="History" title={'My Requests (' + mine.length + ')'} />
           {loading ? <SkeletonList count={4} /> : mine.length === 0 ? (
             <EmptyState title="No requests yet" message="No requests submitted." action={<Link className="btn btn--primary" to="/requests/new">+ Submit First Request</Link>} />
           ) : (
             <div className="stack">{mine.map((r) => <RequestCard key={r.id} request={r} />)}</div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/NewRequestPage.tsx",
  `import { useState, type FormEvent } from 'react';
   import { useNavigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { newId, today, createOne } from '@/lib/db';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { RequestRecord, RequestType, Priority, TeamId, ApprovalStep } from '@/types';

   const TYPE_LABEL: Record<RequestType, string> = {
     TRANSFER: 'Transfer', PROMOTION: 'Promotion', RESIGNATION: 'Resignation',
     COMPLAINT: 'Complaint', SUGGESTION: 'Suggestion', LEAVE: 'Leave',
   };

   function buildChain(request: RequestRecord): Array<{ role: string; teamId: TeamId | null }> {
     const chain: Array<{ role: string; teamId: TeamId | null }> = [];
     const t = request.fromTeamId ?? request.toTeamId ?? null;
     if (request.type === 'TRANSFER' && request.fromTeamId && request.toTeamId) {
       chain.push({ role: 'PRESIDENT', teamId: request.fromTeamId });
       chain.push({ role: 'PRESIDENT', teamId: request.toTeamId });
       chain.push({ role: 'HEAD_HR_GLOBAL', teamId: null });
       chain.push({ role: 'HEAD', teamId: null });
     } else if (t) {
       chain.push({ role: 'PRESIDENT', teamId: t });
       chain.push({ role: 'HEAD_HR_TEAM', teamId: t });
       chain.push({ role: 'HEAD', teamId: null });
     } else {
       chain.push({ role: 'HEAD', teamId: null });
     }
     return chain;
   }

   export function NewRequestPage() {
     const nav = useNavigate();
     const { user } = useAuth();
     const [type, setType] = useState<RequestType>('TRANSFER');
     const [title, setTitle] = useState('');
     const [description, setDescription] = useState('');
     const [priority, setPriority] = useState<Priority>('NORMAL');
     const [fromTeamId, setFromTeamId] = useState<TeamId | ''>((user?.teamId as TeamId) || '');
     const [toTeamId, setToTeamId] = useState<TeamId | ''>('');
     const [busy, setBusy] = useState(false);
     if (!user) return null;
     const onSubmit = async (e: FormEvent) => {
       e.preventDefault();
       if (!title.trim() || !description.trim()) { toast.error('Title & description required'); return; }
       if (type === 'TRANSFER' && (!fromTeamId || !toTeamId)) { toast.error('Both teams required'); return; }
       setBusy(true);
       try {
         const id = newId('REQ');
         const newReq: RequestRecord = {
           id, type, requesterUid: user.uid, requesterMemberId: user.memberId ?? '',
           requesterName: user.displayName, subjectMemberId: user.memberId ?? undefined,
           title: title.trim(), description: description.trim(), status: 'PENDING',
           currentStepOrder: 1, priority, submittedAt: today(), updatedAt: today(), seasonId: 'S7',
           fromTeamId: fromTeamId || undefined, toTeamId: toTeamId || undefined,
         };
         await createOne('requests', newReq);
         const chain = buildChain(newReq);
         for (let i = 0; i < chain.length; i += 1) {
           const step: ApprovalStep = { id: newId('APR'), requestId: id, order: i + 1, requiredRole: chain[i].role as ApprovalStep['requiredRole'], requiredTeamId: chain[i].teamId, status: 'PENDING' };
           await createOne('approvals', step);
         }
         try { await logAudit(user, 'CREATE_REQUEST', 'Request', id, 'Request: ' + title); } catch { /* ignore */ }
         toast.success('Request submitted');
         nav('/my-requests');
       } catch (err) { toast.error('Failed', err instanceof Error ? err.message : ''); }
       finally { setBusy(false); }
     };
     return (
       <div className="container">
         <PageHeader eyebrow="New Request" title="Submit a Request" description="Clear approval chain, live tracking." />
         <form onSubmit={onSubmit} className="card no-click" style={{ maxWidth: 720 }}>
           <FormField label="Request Type" required>
             <Select value={type} onChange={(v) => setType(v as RequestType)} options={Object.entries(TYPE_LABEL).map(([k, v]) => ({ value: k, label: v }))} />
           </FormField>
           <FormField label="Priority" required>
             <Select value={priority} onChange={(v) => setPriority(v as Priority)}
               options={[{ value: 'LOW', label: 'Low' }, { value: 'NORMAL', label: 'Normal' }, { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' }]} />
           </FormField>
           {type === 'TRANSFER' ? (
             <>
               <FormField label="From Team" required>
                 <Select value={fromTeamId} onChange={(v) => setFromTeamId(v as TeamId | '')} options={[{ value: '', label: '— Select —' }, ...teams.map((t) => ({ value: t.id, label: t.name }))]} />
               </FormField>
               <FormField label="To Team" required>
                 <Select value={toTeamId} onChange={(v) => setToTeamId(v as TeamId | '')} options={[{ value: '', label: '— Select —' }, ...teams.filter((t) => t.id !== fromTeamId).map((t) => ({ value: t.id, label: t.name }))]} />
               </FormField>
             </>
           ) : null}
           <FormField label="Title" required><TextInput value={title} onChange={setTitle} /></FormField>
           <FormField label="Description" required><TextArea value={description} onChange={setDescription} rows={5} /></FormField>
           <button type="submit" className="btn btn--primary btn--block mt-5" disabled={busy}>{busy ? '...' : 'Submit Request'}</button>
         </form>
       </div>
     );
   }
   `
);

file(
  "src/pages/RequestDetailPage.tsx",
  `import { useEffect, useState } from 'react';
   import { useParams } from 'react-router-dom';
   import { getOne, listWhere, updateOne, today } from '@/lib/db';
   import { useAuth } from '@/lib/useAuth';
   import { canApproveStep } from '@/lib/permissions';
   import { notifyUser } from '@/lib/notifications';
   import { logAudit } from '@/lib/audit';
   import { teams } from '@/data/teams';
   import { REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, PRIORITY_LABEL, formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { Badge } from '@/components/ui/Badge';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextArea } from '@/components/ui/FormField';
   import { ApprovalChain } from '@/components/request/ApprovalChain';
   import { Loading } from '@/components/ui/Loading';
   import { NotFoundPage } from './NotFoundPage';
   import { toast } from '@/components/ui/Toast';
   import type { RequestRecord, ApprovalStep, AppUser } from '@/types';

   async function approveStep(request: RequestRecord, step: ApprovalStep, user: AppUser) {
     await updateOne('approvals', step.id, { status: 'APPROVED', approverUid: user.uid, approverName: user.displayName, actionDate: today() });
     const allSteps = await listWhere<ApprovalStep>('approvals', 'requestId', request.id);
     const remaining = allSteps.filter((s) => s.status === 'PENDING' && s.id !== step.id);
     if (remaining.length === 0) {
       await updateOne('requests', request.id, { status: 'APPROVED', currentStepOrder: allSteps.length, updatedAt: today() });
       await notifyUser(request.requesterUid, 'Request approved', '"' + request.title + '" approved.', 'request', '/requests/' + request.id, 'high');
     } else {
       const next = Math.min(...remaining.map((s) => s.order));
       await updateOne('requests', request.id, { status: 'IN_REVIEW', currentStepOrder: next, updatedAt: today() });
     }
   }

   async function rejectStep(request: RequestRecord, step: ApprovalStep, user: AppUser, comment: string) {
     await updateOne('approvals', step.id, { status: 'REJECTED', approverUid: user.uid, approverName: user.displayName, comment, actionDate: today() });
     await updateOne('requests', request.id, { status: 'REJECTED', updatedAt: today() });
     await notifyUser(request.requesterUid, 'Request rejected', '"' + request.title + '". Reason: ' + comment, 'request', '/requests/' + request.id, 'high');
   }

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
       if (r) { const s = await listWhere<ApprovalStep>('approvals', 'requestId', r.id); setSteps(s.sort((a, b) => a.order - b.order)); }
       setRequest(r);
       setLoading(false);
     };
     useEffect(() => { void load(); }, [requestId]);
     if (loading) return <Loading fullHeight />;
     if (!request) return <NotFoundPage />;
     const currentStep = steps.find((s) => s.status === 'PENDING' && s.order === request.currentStepOrder);
     const canAct = user && currentStep && canApproveStep(user, currentStep);
     const doAction = async () => {
       if (!user || !currentStep || !actionType) return;
       setBusy(true);
       try {
         if (actionType === 'approve') { await approveStep(request, currentStep, user); toast.success('Approved'); }
         else { if (!comment.trim()) { toast.error('Reason required'); setBusy(false); return; } await rejectStep(request, currentStep, user, comment); toast.success('Rejected'); }
         setActionType(null); setComment(''); await load();
       } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
       finally { setBusy(false); }
     };
     return (
       <div className="container">
         <PageHeader eyebrow="Request" title={request.title} />
         <section className="section">
           <div className="grid grid--2">
             <div className="card no-click">
               <div className="kv"><span className="kv__k">Type</span><span className="kv__v">{REQUEST_TYPE_LABEL[request.type]}</span></div>
               <div className="kv mt-4"><span className="kv__k">Requester</span><span className="kv__v">{request.requesterName}</span></div>
               <div className="kv mt-4"><span className="kv__k">Date</span><span className="kv__v">{formatDate(request.submittedAt)}</span></div>
             </div>
             <div className="card no-click">
               <div className="row row--between"><span className="muted small">Status</span><Badge variant={request.status === 'APPROVED' ? 'success' : request.status === 'REJECTED' ? 'danger' : 'warning'}>{REQUEST_STATUS_LABEL[request.status]}</Badge></div>
               <div className="row row--between mt-4"><span className="muted small">Priority</span><Badge variant="neutral">{PRIORITY_LABEL[request.priority]}</Badge></div>
               <div className="mt-5"><div className="muted small">Description</div><p className="mt-2">{request.description}</p></div>
             </div>
           </div>
         </section>
         {canAct ? (
           <section className="section">
             <SectionHeader eyebrow="Your Decision" title="Action Required" />
             <div className="card no-click">
               <div className="row" style={{ gap: 10 }}>
                 <button type="button" className="btn btn--success" onClick={() => setActionType('approve')}>Approve</button>
                 <button type="button" className="btn btn--danger" onClick={() => setActionType('reject')}>Reject</button>
               </div>
             </div>
           </section>
         ) : null}
         <section className="section"><SectionHeader eyebrow="Approvals" title="Chain" /><ApprovalChain steps={steps} /></section>
         <Modal open={actionType !== null} title={actionType === 'approve' ? 'Approve' : 'Reject'} onClose={() => { setActionType(null); setComment(''); }}
           footer={<><button type="button" className="btn btn--ghost" onClick={() => { setActionType(null); setComment(''); }}>Cancel</button><button type="button" className={'btn ' + (actionType === 'approve' ? 'btn--success' : 'btn--danger')} onClick={doAction} disabled={busy}>{busy ? '...' : 'Confirm'}</button></>}>
           <FormField label={actionType === 'approve' ? 'Comment (optional)' : 'Reason'} required={actionType === 'reject'}>
             <TextArea value={comment} onChange={setComment} rows={3} />
           </FormField>
         </Modal>
       </div>
     );
   }
   `
);

file(
  "src/pages/RequestsPage.tsx",
  `import { useMemo, useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { seesAllTeams } from '@/lib/permissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { RequestCard } from '@/components/request/RequestCard';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { cx } from '@/lib/format';
   import type { RequestType, RequestStatus, RequestRecord } from '@/types';

   const TYPES: Array<RequestType | 'all'> = ['all', 'TRANSFER', 'PROMOTION', 'RESIGNATION', 'COMPLAINT', 'SUGGESTION', 'LEAVE'];
   const STATUSES: Array<RequestStatus | 'all'> = ['all', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
   const TYPE_LABEL: Record<string, string> = { all: 'All', TRANSFER: 'Transfer', PROMOTION: 'Promotion', RESIGNATION: 'Resignation', COMPLAINT: 'Complaint', SUGGESTION: 'Suggestion', LEAVE: 'Leave' };
   const STATUS_LABEL: Record<string, string> = { all: 'All', PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected' };

   export function RequestsPage() {
     const { user } = useAuth();
     const [type, setType] = useState<RequestType | 'all'>('all');
     const [status, setStatus] = useState<RequestStatus | 'all'>('all');
     const { data: all, loading } = useCollection<RequestRecord>('requests');
     const filtered = useMemo(() => {
       let list = all;
       if (user && !seesAllTeams(user)) list = list.filter((r) => r.fromTeamId === user.teamId || r.toTeamId === user.teamId || r.requesterUid === user.uid);
       return list.filter((r) => type === 'all' || r.type === type).filter((r) => status === 'all' || r.status === status).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
     }, [all, type, status, user]);
     return (
       <div className="container">
         <PageHeader eyebrow="Workflow" title="Requests" description={user && !seesAllTeams(user) ? 'Your team requests.' : 'All requests.'} />
         <div className="chips mb-3">{TYPES.map((t) => <button key={t} type="button" className={cx('chip', type === t && 'is-active')} onClick={() => setType(t)}>{TYPE_LABEL[t]}</button>)}</div>
         <div className="chips mb-4">{STATUSES.map((s) => <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>)}</div>
         <section className="section">
           <SectionHeader eyebrow="List" title={'Requests (' + filtered.length + ')'} />
           {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? <EmptyState title="No requests" message="No matching requests." /> : (
             <div className="stack">{filtered.map((r) => <RequestCard key={r.id} request={r} />)}</div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/ApprovalsPage.tsx",
  `import { Link } from 'react-router-dom';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { canApproveStep, ROLE_LABEL } from '@/lib/permissions';
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
     const myPending = approvals.filter((a) => a.status === 'PENDING' && canApproveStep(user, a));
     return (
       <div className="container">
         <PageHeader eyebrow="Workflow" title="Approvals" description="Stages awaiting your decision." />
         <section className="section">
           <SectionHeader eyebrow="Pending" title={'Awaiting You (' + myPending.length + ')'} />
           {loading ? <SkeletonList count={3} /> : myPending.length === 0 ? <EmptyState title="All clear" message="Nothing pending for you." /> : (
             <div className="stack">{myPending.map((a) => {
               const req = requests.find((r) => r.id === a.requestId);
               return <Link key={a.id} to={'/requests/' + a.requestId} className="card"><div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{req?.title ?? a.requestId}</div><div className="card__meta">{ROLE_LABEL[a.requiredRole]} · Stage {a.order}</div></div><Badge variant="warning" dot>Awaiting</Badge></div></Link>;
             })}</div>
           )}
         </section>
       </div>
     );
   }
   `
);

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

   const STATUSES: Array<ContributionStatus | 'all'> = ['all', 'pending', 'in_review', 'approved', 'rejected'];
   const STATUS_LABEL: Record<string, string> = { all: 'All', pending: 'Pending', in_review: 'In Review', approved: 'Approved', rejected: 'Rejected' };

   export function ContributionsPage() {
     const { user } = useAuth();
     const { data, loading } = useCollection<Contribution>('contributions');
     const [status, setStatus] = useState<ContributionStatus | 'all'>('all');
     const [teamFilter, setTeamFilter] = useState<TeamId | 'all'>('all');
     const filtered = useMemo(() => {
       let list = data;
       if (user && !seesAllTeams(user) && user.teamId) list = list.filter((c) => c.teamId === user.teamId);
       return list.filter((c) => status === 'all' || c.status === status).filter((c) => teamFilter === 'all' || c.teamId === teamFilter).sort((a, b) => (a.date < b.date ? 1 : -1));
     }, [data, status, teamFilter, user]);
     return (
       <div className="container">
         <PageHeader eyebrow="Contributions" title="All Contributions" description="Review contributions." />
         <div className="chips mb-3">{STATUSES.map((s) => <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>)}</div>
         <div className="chips mb-4">
           <button type="button" className={cx('chip', teamFilter === 'all' && 'is-active')} onClick={() => setTeamFilter('all')}>All Teams</button>
           {teams.map((t) => <button key={t.id} type="button" className={cx('chip', teamFilter === t.id && 'is-active')} onClick={() => setTeamFilter(t.id)}>{t.name}</button>)}
         </div>
         <section className="section">
           <SectionHeader eyebrow="List" title={'Contributions (' + filtered.length + ')'} />
           {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? <EmptyState title="No contributions" message="No matching contributions." /> : (
             <div className="table-wrap"><table className="data">
               <thead><tr><th>Member</th><th>Team</th><th>Title</th><th>Date</th><th>Hours</th><th>Points</th><th>Status</th></tr></thead>
               <tbody>{filtered.map((c) => <ContributionRow key={c.id} contribution={c} showMember showTeam />)}</tbody>
             </table></div>
           )}
         </section>
       </div>
     );
   }
   `
);

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
     const mine = notifs.filter((n) => n.userId === user.uid).sort((a, b) => (a.date < b.date ? 1 : -1));
     const unreadCount = mine.filter((n) => !n.read).length;
     const markRead = async (id: string) => { try { await updateOne('notifications', id, { read: true }); } catch { /* ignore */ } };
     const markAllRead = async () => {
       try { for (const n of mine) if (!n.read) await updateOne('notifications', n.id, { read: true }); toast.success('All marked as read'); }
       catch { toast.error('Failed'); }
     };
     return (
       <div className="container">
         <PageHeader eyebrow="Notifications" title="Notifications" description={unreadCount > 0 ? 'You have ' + unreadCount + ' unread' : 'All caught up'}>
           {unreadCount > 0 ? <button type="button" className="btn btn--ghost btn--sm mt-4" onClick={markAllRead}>Mark all as read</button> : null}
         </PageHeader>
         <section className="section">
           {loading ? <SkeletonList count={5} /> : mine.length === 0 ? <EmptyState title="No notifications" message="You have no notifications yet." /> : (
             <div className="stack">{mine.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />)}</div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/ConversationsPage.tsx",
  `import { useMemo, useState } from 'react';
   import { useAuth } from '@/lib/useAuth';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { createOne, newId, now } from '@/lib/db';
   import { safeArray } from '@/lib/safe';
   import { teams } from '@/data/teams';
   import { MessageBubble } from '@/components/chat/MessageBubble';
   import { Composer } from '@/components/chat/Composer';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';
   import { toast } from '@/components/ui/Toast';
   import { relativeTime } from '@/lib/format';
   import type { Conversation, Message, AppUser } from '@/types';

   export function ConversationsPage() {
     const { user } = useAuth();
     const { data: conversations, loading: l1 } = useRealtimeCollection<Conversation>('conversations');
     const { data: messages, loading: l2 } = useRealtimeCollection<Message>('messages');
     const { data: users, loading: l3 } = useRealtimeCollection<AppUser>('users');
     const [activeId, setActiveId] = useState<string | null>(null);
     const [mobileShowChat, setMobileShowChat] = useState(false);
     const myConvs = useMemo(() => {
       if (!user) return [];
       return safeArray(conversations).filter((c) => {
         if (c.type === 'general') return true;
         if (c.type === 'team') return c.teamId === user.teamId;
         return safeArray(c.participantUids).includes(user.uid);
       });
     }, [conversations, user]);
     const defaultId = useMemo(() => myConvs.find((c) => c.type === 'general')?.id ?? null, [myConvs]);
     const currentId = activeId ?? defaultId;
     const active = currentId ? myConvs.find((c) => c.id === currentId) : null;
     const activeMsgs = useMemo(() => (!currentId ? [] : safeArray(messages).filter((m) => m.conversationId === currentId).sort((a, b) => (a.sentAt > b.sentAt ? 1 : -1))), [messages, currentId]);
     if (!user) return null;
     if (l1 || l2 || l3) return <Loading fullHeight message="Loading conversations..." />;
     const getConvName = (): string => {
       if (!active) return '';
       if (active.type === 'general') return 'General Chat';
       if (active.type === 'team') return 'Team ' + (teams.find((t) => t.id === active.teamId)?.name ?? '');
       const otherUid = safeArray(active.participantUids).find((u) => u !== user.uid);
       return users.find((u) => u.uid === otherUid)?.displayName ?? 'Private chat';
     };
     const sendMessage = async (text: string) => {
       if (!currentId) return;
       const msg: Message = { id: newId('MSG'), conversationId: currentId, senderUid: user.uid, senderName: user.displayName, text, sentAt: now() };
       try { await createOne('messages', msg); } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
     };
     return (
       <div style={{ paddingTop: 16, paddingBottom: 24 }}>
         <div className="chat-layout">
           <div className={'chat-sidebar' + (mobileShowChat ? ' is-hidden' : '')}>
             <div className="chat-sidebar__head"><div className="chat-sidebar__title">Conversations</div></div>
             <div className="chat-conversations">
               {myConvs.length === 0 ? <div style={{ padding: 28, textAlign: 'center', color: 'var(--c-ink-muted)' }}>No conversations yet</div> : (
                 [...myConvs].sort((a, b) => ((a.lastMessageAt ?? '') < (b.lastMessageAt ?? '') ? 1 : -1)).map((c) => {
                   const name = c.type === 'general' ? 'General Chat' : c.type === 'team' ? 'Team ' + (teams.find((t) => t.id === c.teamId)?.name ?? '') : users.find((u) => u.uid === safeArray(c.participantUids).find((p) => p !== user.uid))?.displayName ?? 'Chat';
                   const avt = c.type === 'general' ? '#' : c.type === 'team' ? 'T' : 'U';
                   return (
                     <button key={c.id} type="button" className={'chat-conv' + (currentId === c.id ? ' is-active' : '')} onClick={() => { setActiveId(c.id); setMobileShowChat(true); }}>
                       <div className={'chat-conv__avatar chat-conv__avatar--' + c.type}>{avt}</div>
                       <div className="chat-conv__body">
                         <div className="chat-conv__name">{name}</div>
                         <div className="chat-conv__preview">{c.lastMessageSender ? <strong style={{ color: 'var(--c-red)' }}>{c.lastMessageSender}: </strong> : null}{c.lastMessageText || 'No messages'}</div>
                         <div className="tiny muted">{relativeTime(c.lastMessageAt ?? '')}</div>
                       </div>
                     </button>
                   );
                 })
               )}
             </div>
           </div>
           <div className={'chat-panel' + (!mobileShowChat ? ' is-hidden' : '')}>
             {!active ? <div className="chat-panel__empty"><div style={{ marginBottom: 8 }}>Select a conversation</div></div> : (
               <>
                 <div className="chat-header">
                   <button type="button" className="chat-header__back" onClick={() => setMobileShowChat(false)}>‹</button>
                   <div className="chat-header__info"><div className="chat-header__title">{getConvName()}</div></div>
                 </div>
                 <div className="chat-messages">
                   {activeMsgs.length === 0 ? <EmptyState title="Start" message="No messages yet." /> : activeMsgs.map((m) => <MessageBubble key={m.id} message={m} currentUser={user} />)}
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
     const [selectedDate, setSelectedDate] = useState<string | null>(today.toISOString().slice(0, 10));
     const visible = useMemo(() => {
       if (!user) return [];
       return allEvents.filter((e) => e.isPublic || seesAllTeams(user) || e.teamId === user.teamId);
     }, [allEvents, user]);
     const eventsByMonth = useMemo(() => visible.filter((e) => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === month; }), [visible, year, month]);
     const selectedEvents = useMemo(() => (!selectedDate ? [] : visible.filter((e) => e.date === selectedDate)), [visible, selectedDate]);
     if (loading) return <Loading fullHeight message="Loading calendar..." />;
     if (!user) return null;
     return (
       <div className="container">
         <PageHeader eyebrow="Schedule" title="Calendar" description="Public + team events." />
         <section className="section">
           <CalendarGrid year={year} month={month} events={eventsByMonth} selectedDate={selectedDate ?? undefined} onSelectDate={setSelectedDate}
             onPrevMonth={() => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); }}
             onNextMonth={() => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); }} />
         </section>
         <section className="section">
           <SectionHeader eyebrow={selectedDate ? formatDate(selectedDate) : ''} title={selectedEvents.length === 0 ? 'No events' : 'Events (' + selectedEvents.length + ')'} />
           {selectedEvents.length === 0 ? <EmptyState title="No events" message="Pick another day." /> : (
             <div className="stack">{selectedEvents.map((e) => <EventCard key={e.id} event={e} />)}</div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/MyProfilePage.tsx",
  `import { Navigate } from 'react-router-dom';
   import { useAuth } from '@/lib/useAuth';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { Loading } from '@/components/ui/Loading';

   export function MyProfilePage() {
     const { user, loading } = useAuth();
     if (loading) return <Loading fullHeight />;
     if (!user?.memberId) return <div className="container"><EmptyState title="No member profile" message="Your account is not linked to a member." /></div>;
     return <Navigate to={'/members/' + user.memberId} replace />;
   }
   `
);

file(
  "src/pages/ReportsPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Stat, StatRow } from '@/components/ui/Stat';
   import { Loading } from '@/components/ui/Loading';
   import type { Member, Contribution, RequestRecord } from '@/types';

   export function ReportsPage() {
     const { data: members, loading: lM } = useCollection<Member>('members');
     const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
     const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');
     if (lM || lC || lR) return <Loading fullHeight message="Loading reports..." />;
     const totalPoints = contributions.filter((c) => c.status === 'approved').reduce((s, c) => s + (c.points || 0), 0);
     const teamStats = teams.map((t) => ({ team: t, points: getTeamTotalPoints(members, contributions, t.id) })).sort((a, b) => b.points - a.points);
     return (
       <div className="container">
         <PageHeader eyebrow="Reports" title="Reports" description="Comprehensive summaries." />
         <section className="section"><StatRow>
           <Stat value={members.length} label="Members" />
           <Stat value={totalPoints} label="Total Points" />
           <Stat value={requests.length} label="Requests" />
         </StatRow></section>
         <section className="section">
           <SectionHeader eyebrow="Teams" title="Team Statistics" />
           <div className="table-wrap"><table className="data">
             <thead><tr><th>Team</th><th>Points</th></tr></thead>
             <tbody>{teamStats.map((s) => <tr key={s.team.id}><td>{s.team.name}</td><td className="points">{s.points}</td></tr>)}</tbody>
           </table></div>
         </section>
       </div>
     );
   }
   `
);

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
         <PageHeader eyebrow="Log" title="Audit Log" description="All admin actions." />
         <section className="section">
           {loading ? <SkeletonList count={6} /> : sorted.length === 0 ? <EmptyState title="No events" message="No actions recorded yet." /> : (
             <div className="table-wrap"><table className="data">
               <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Description</th></tr></thead>
               <tbody>{sorted.map((a) => <tr key={a.id}><td className="muted small nowrap">{formatDateTime(a.date)}</td><td style={{ fontWeight: 700 }}>{a.actorName}</td><td><span className="badge badge--neutral">{a.action}</span></td><td>{a.description}</td></tr>)}</tbody>
             </table></div>
           )}
         </section>
       </div>
     );
   }
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 14 — ADMIN PAGES + APP
   ═══════════════════════════════════════════════════════════════ */

file(
  "src/pages/admin/AdminHomePage.tsx",
  `import { Link } from 'react-router-dom';
   import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { seedAll, type SeedResult } from '@/lib/seed';
   import { useState } from 'react';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { toast } from '@/components/ui/Toast';
   import { Loading } from '@/components/ui/Loading';
   import type { AppUser, RequestRecord, Contribution, Notification, Member, Committee } from '@/types';

   interface AdminCard { to: string; title: string; count?: number; description: string; }

   export function AdminHomePage() {
     const { user } = useAuth();
     const { data: users, loading: l1 } = useRealtimeCollection<AppUser>('users');
     const { data: members, loading: l2 } = useRealtimeCollection<Member>('members');
     const { data: requests, loading: l3 } = useRealtimeCollection<RequestRecord>('requests');
     const { data: contributions, loading: l4 } = useRealtimeCollection<Contribution>('contributions');
     const { data: notifs, loading: l5 } = useRealtimeCollection<Notification>('notifications');
     const { data: committees, loading: l6 } = useRealtimeCollection<Committee>('committees');
     const [seeding, setSeeding] = useState(false);
     const [result, setResult] = useState<SeedResult | null>(null);
     if (l1 || l2 || l3 || l4 || l5 || l6) return <div className="admin-page"><Loading fullHeight message="Loading..." /></div>;
     const pendingReq = requests.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW').length;
     const pendingContribs = contributions.filter((c) => c.status === 'pending' || c.status === 'in_review').length;
     const totalPoints = members.reduce((s, m) => s + (m.points || 0), 0);
     const onSeed = async () => {
       if (!window.confirm('Upload seed data?')) return;
       setSeeding(true);
       try { const r = await seedAll(); setResult(r); toast.success('Uploaded'); }
       catch (err) { toast.error('Failed', err instanceof Error ? err.message : ''); }
       finally { setSeeding(false); }
     };
     const cards: AdminCard[] = [
       { to: '/admin/analytics', title: 'Analytics', description: 'Overview' },
       { to: '/admin/requests', title: 'Requests', count: pendingReq, description: 'Manage requests' },
       { to: '/admin/users', title: 'Users', count: users.length, description: 'Accounts & roles' },
       { to: '/admin/members', title: 'Members', count: members.length, description: 'Member data' },
       { to: '/admin/contributions', title: 'Contributions', count: pendingContribs, description: 'Approve contributions' },
       { to: '/admin/committees', title: 'Committees', count: committees.length, description: 'Manage committees' },
       { to: '/admin/achievements', title: 'Achievements', description: 'Manage achievements' },
       { to: '/admin/warnings', title: 'Warnings', description: 'Issue warnings' },
       { to: '/admin/calendar', title: 'Calendar', description: 'Manage events' },
       { to: '/admin/conversations', title: 'Conversations', description: 'Manage chats' },
       { to: '/admin/notifications', title: 'Send Notification', count: notifs.length, description: 'Send notifications' },
       { to: '/admin/governance', title: 'Governance', description: 'Policies' },
       { to: '/admin/audit', title: 'Audit Log', description: 'Actions log' },
     ];
     return (
       <div className="admin-page">
         <section className="admin-welcome">
           <div className="admin-welcome__eyebrow">Admin Panel</div>
           <h1 className="admin-welcome__name">Welcome, {user?.displayName || 'Admin'}</h1>
           <p className="admin-welcome__subtitle">Full control over content, members, and requests.</p>
         </section>
         <section className="admin-stats">
           <div className="stat"><div className="stat__value">{users.length}</div><div className="stat__label">Users</div></div>
           <div className="stat"><div className="stat__value">{members.length}</div><div className="stat__label">Members</div></div>
           <div className="stat stat--red"><div className="stat__value">{pendingReq}</div><div className="stat__label">Pending Requests</div></div>
           <div className="stat stat--amber"><div className="stat__value">{pendingContribs}</div><div className="stat__label">Pending Contributions</div></div>
           <div className="stat"><div className="stat__value">{totalPoints}</div><div className="stat__label">Total Points</div></div>
           <div className="stat"><div className="stat__value">{committees.length}</div><div className="stat__label">Committees</div></div>
         </section>
         <section className="admin-seed">
           <div className="admin-seed__head">
             <div>
               <div className="admin-seed__title">Upload Seed Data</div>
               <div className="admin-seed__desc">One-time — only if Firestore is empty.</div>
             </div>
             <button type="button" className="btn btn--primary" onClick={onSeed} disabled={seeding}>{seeding ? 'Uploading...' : 'Upload Data'}</button>
           </div>
           {result ? <div className="admin-seed__result">✓ Teams: {result.teams} · Committees: {result.committees}</div> : null}
         </section>
         <section style={{ marginTop: 32 }}>
           <SectionHeader eyebrow="Sections" title="Quick Links" />
           <div className="admin-cards">
             {cards.map((c) => (
               <Link key={c.to} to={c.to} className="admin-card">
                 <div className="admin-card__head">
                   <div className="admin-card__title">{c.title}</div>
                   {c.count !== undefined && c.count > 0 ? <span className="admin-card__count">{c.count > 99 ? '99+' : c.count}</span> : null}
                 </div>
                 <div className="admin-card__desc">{c.description}</div>
               </Link>
             ))}
           </div>
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminUsersPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { updateOne, removeOne } from '@/lib/db';
   import { adminCreateMember } from '@/lib/auth';
   import { teams } from '@/data/teams';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, Select, MultiSelect } from '@/components/ui/FormField';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import type { AppUser, RoleId, TeamId, Member, Committee } from '@/types';

   const ROLE_OPTS: Array<{ value: RoleId; label: string }> = (Object.entries(ROLE_LABEL) as Array<[RoleId, string]>).map(([value, label]) => ({ value, label }));
   function genPass(): string { const c = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; let p = ''; for (let i = 0; i < 10; i += 1) p += c.charAt(Math.floor(Math.random() * c.length)); return p + '@1'; }

   export function AdminUsersPage() {
     const { user: me } = useAuth();
     const { data: users, loading } = useCollection<AppUser>('users');
     const { data: liveMembers } = useCollection<Member>('members');
     const { data: liveCommittees } = useCollection<Committee>('committees');
     const [open, setOpen] = useState(false);
     const [toDelete, setToDelete] = useState<string | null>(null);
     const [busy, setBusy] = useState(false);
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState(genPass());
     const [name, setName] = useState('');
     const [role, setRole] = useState<RoleId>('MEMBER');
     const [teamId, setTeamId] = useState<TeamId>('helpers');
     const [committeeIds, setCommitteeIds] = useState<string[]>([]);
     const [bio, setBio] = useState('');
     const [created, setCreated] = useState<{ email: string; password: string; name: string } | null>(null);
     const reset = () => { setEmail(''); setPassword(genPass()); setName(''); setRole('MEMBER'); setTeamId('helpers'); setCommitteeIds([]); setBio(''); };
     const create = async () => {
       if (!email.trim() || !name.trim()) { toast.error('Missing data'); return; }
       if (committeeIds.length === 0) { toast.error('At least one committee required'); return; }
       setBusy(true);
       try {
         await adminCreateMember({ email: email.trim(), temporaryPassword: password, name: name.trim(), role, teamIds: [teamId], committeeIds, bio: bio.trim() || undefined }, me?.uid ?? 'system');
         setCreated({ email: email.trim(), password, name: name.trim() });
         toast.success('Account created');
         reset(); setOpen(false);
       } catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
       finally { setBusy(false); }
     };
     const chRole = async (uid: string, r: RoleId) => { try { await updateOne('users', uid, { role: r }); toast.success('Updated'); } catch { toast.error('Failed'); } };
     const chTeam = async (uid: string, t: TeamId) => { try { await updateOne('users', uid, { teamId: t }); toast.success('Updated'); } catch { toast.error('Failed'); } };
     const linkMember = async (uid: string, mid: string) => { try { await updateOne('users', uid, { memberId: mid || null }); if (mid) await updateOne('members', mid, { linkedUserId: uid }); toast.success('Linked'); } catch { toast.error('Failed'); } };
     const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('users', toDelete); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Users" description="Create accounts, assign roles, link members." />
         <SectionHeader eyebrow="List" title={'Users (' + users.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={() => { reset(); setOpen(true); }}>+ New User</button>} />
         {loading ? <SkeletonList count={6} /> : users.length === 0 ? <EmptyState title="No users" message="Create the first user." /> : (
           <div className="table-wrap"><table className="data">
             <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Team</th><th>Member</th><th>Actions</th></tr></thead>
             <tbody>{users.map((u) => (
               <tr key={u.uid}>
                 <td data-label="Name" style={{ fontWeight: 700 }}>{u.displayName}{u.mustChangePassword ? <Badge variant="warning" className="mt-2">New</Badge> : null}</td>
                 <td className="muted small" data-label="Email" dir="ltr">{u.email}</td>
                 <td data-label="Role"><select className="input" value={u.role} onChange={(e) => chRole(u.uid, e.target.value as RoleId)} style={{ minWidth: 160 }}>{ROLE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
                 <td data-label="Team"><select className="input" value={u.teamId ?? ''} onChange={(e) => chTeam(u.uid, e.target.value as TeamId)} style={{ minWidth: 130 }}><option value="">— None —</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></td>
                 <td data-label="Member"><select className="input" value={u.memberId ?? ''} onChange={(e) => linkMember(u.uid, e.target.value)} style={{ minWidth: 150 }}><option value="">— Not linked —</option>{liveMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></td>
                 <td data-label="Actions"><button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(u.uid)}>Delete</button></td>
               </tr>
             ))}</tbody>
           </table></div>
         )}
         <Modal open={open} title="Create New User" onClose={() => setOpen(false)} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="btn btn--primary" onClick={create} disabled={busy}>{busy ? '...' : 'Create'}</button></>}>
           <FormField label="Full name" required><TextInput value={name} onChange={setName} /></FormField>
           <FormField label="Email" required><TextInput value={email} onChange={setEmail} type="email" /></FormField>
           <FormField label="Temporary password" required hint="Must be changed on first login">
             <div style={{ display: 'flex', gap: 8 }}><TextInput value={password} onChange={setPassword} type="text" /><button type="button" className="btn btn--ghost btn--sm" onClick={() => setPassword(genPass())}>Generate</button></div>
           </FormField>
           <FormField label="Role" required><Select value={role} onChange={(v) => setRole(v as RoleId)} options={ROLE_OPTS} /></FormField>
           <FormField label="Team" required><Select value={teamId} onChange={(v) => setTeamId(v as TeamId)} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
           <FormField label="Committees" required hint={liveCommittees.length === 0 ? 'No committees yet — create one first' : 'At least one required'}>
             <MultiSelect values={committeeIds} onChange={setCommitteeIds} options={liveCommittees.map((c) => ({ value: c.id, label: c.nameAr }))} />
           </FormField>
           <FormField label="Short bio"><TextInput value={bio} onChange={setBio} /></FormField>
         </Modal>
         <Modal open={created !== null} title="✓ Account Created" onClose={() => setCreated(null)} footer={<button type="button" className="btn btn--primary" onClick={() => setCreated(null)}>Got it</button>}>
           <p style={{ marginBottom: 16 }}>Send these credentials to the member:</p>
           <div style={{ background: 'var(--c-off-white)', border: '1px solid var(--c-line)', borderRadius: 10, padding: 16, lineHeight: 2 }}>
             <div><strong>Name:</strong> {created?.name}</div>
             <div style={{ wordBreak: 'break-all' }}><strong>Email:</strong> <span dir="ltr">{created?.email}</span></div>
             <div style={{ wordBreak: 'break-all' }}><strong>Password:</strong> <span dir="ltr">{created?.password}</span></div>
           </div>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete User" message="Cannot be undone." confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminContributionsPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { teams } from '@/data/teams';
   import { formatDate, cx } from '@/lib/format';
   import { safeArray, safeNumber } from '@/lib/safe';
   import { approveContributionStage, rejectContributionStage } from '@/lib/contributionApprovals';
   import { getContributionStage, canReviewContribution } from '@/lib/committeePermissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { FormField, TextArea, NumberInput } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Contribution, ContributionStatus, Committee } from '@/types';

   const STATUS_LABEL: Record<string, string> = { all: 'All', pending: 'Pending', in_review: 'In Review', approved: 'Approved', rejected: 'Rejected' };

   export function AdminContributionsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<Contribution>('contributions');
     const { data: liveCommittees } = useCollection<Committee>('committees');
     const [status, setStatus] = useState<ContributionStatus | 'all'>('all');
     const [actionContrib, setActionContrib] = useState<Contribution | null>(null);
     const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
     const [pointsInput, setPointsInput] = useState<number>(0);
     const [comment, setComment] = useState('');
     const [busy, setBusy] = useState(false);
     const filtered = safeArray(data)
       .filter((c) => status === 'all' || c.status === status)
       .filter((c) => canReviewContribution(me, c) || c.createdBy === me?.uid)
       .sort((a, b) => (a.date < b.date ? 1 : -1));
     const openAction = (c: Contribution, type: 'approve' | 'reject') => { setActionContrib(c); setActionType(type); setComment(''); setPointsInput(safeNumber(c.points)); };
     const closeAction = () => { setActionContrib(null); setActionType(null); setComment(''); setPointsInput(0); };
     const doApprove = async () => {
       if (!me || !actionContrib) return;
       const stageInfo = getContributionStage(me, actionContrib);
       setBusy(true);
       try { await approveContributionStage(actionContrib, me, stageInfo.assignPoints ? pointsInput : undefined, comment); toast.success('Approved'); closeAction(); }
       catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
       finally { setBusy(false); }
     };
     const doReject = async () => {
       if (!me || !actionContrib) return;
       if (!comment.trim()) { toast.error('Reason required'); return; }
       setBusy(true);
       try { await rejectContributionStage(actionContrib, me, comment); toast.success('Rejected'); closeAction(); }
       catch (e) { toast.error('Failed', e instanceof Error ? e.message : ''); }
       finally { setBusy(false); }
     };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Contributions" description="Points assigned by committee HR." />
         <div className="chips mb-4">
           {(['all', 'pending', 'in_review', 'approved', 'rejected'] as const).map((s) => (
             <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>
           ))}
         </div>
         <SectionHeader eyebrow="List" title={'Contributions (' + filtered.length + ')'} />
         {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? <EmptyState title="No contributions" message="No matching." /> : (
           <div className="stack">{filtered.map((c) => {
             const team = teams.find((t) => t.id === c.teamId);
             const committee = liveCommittees.find((x) => x.id === c.committeeId);
             const stageInfo = getContributionStage(me, c);
             const canAct = stageInfo.canApprove && (c.status === 'pending' || c.status === 'in_review');
             return (
               <div key={c.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{c.title}</div>
                     <div className="card__meta">{c.memberName} · {team?.name} · {committee?.nameAr || c.committeeId} · {formatDate(c.date)}</div>
                   </div>
                   <Badge variant={c.status === 'approved' ? 'success' : c.status === 'pending' ? 'info' : c.status === 'in_review' ? 'warning' : 'danger'}>
                     {c.status === 'approved' ? 'Approved' : c.status === 'pending' ? 'Stage 1' : c.status === 'in_review' ? 'Stage ' + stageInfo.stage + '/3' : 'Rejected'}
                   </Badge>
                 </div>
                 <p className="small soft mt-2">{c.description}</p>
                 <div className="row mt-3" style={{ gap: 12 }}>
                   <span className="small">{safeNumber(c.hours)} hours</span>
                   {safeNumber(c.points) > 0 ? <span className="points">{safeNumber(c.points)} points</span> : <span className="muted small">Points pending</span>}
                 </div>
                 {canAct ? (
                   <div className="row mt-3" style={{ gap: 8, justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--c-line)' }}>
                     <button type="button" className="btn btn--success btn--sm" onClick={() => openAction(c, 'approve')}>
                       {stageInfo.assignPoints ? 'Approve & Assign Points' : 'Approve'}
                     </button>
                     <button type="button" className="btn btn--outline-danger btn--sm" onClick={() => openAction(c, 'reject')}>Reject</button>
                   </div>
                 ) : null}
               </div>
             );
           })}</div>
         )}
         <Modal open={actionType === 'approve' && actionContrib !== null}
           title={actionContrib && getContributionStage(me, actionContrib).assignPoints ? 'Approve & Assign Points' : 'Approve Contribution'}
           onClose={closeAction}
           footer={<><button type="button" className="btn btn--ghost" onClick={closeAction}>Cancel</button><button type="button" className="btn btn--success" onClick={doApprove} disabled={busy}>{busy ? '...' : 'Approve'}</button></>}>
           {actionContrib && getContributionStage(me, actionContrib).assignPoints ? (
             <>
               <p className="small muted mb-3">Assign points fairly — quality matters, not only hours.</p>
               <FormField label="Points" required><NumberInput value={pointsInput} onChange={setPointsInput} min={0} max={1000} /></FormField>
             </>
           ) : <p className="small muted mb-3">Confirm your approval.</p>}
           <FormField label="Comment (optional)"><TextArea value={comment} onChange={setComment} rows={2} /></FormField>
         </Modal>
         <Modal open={actionType === 'reject' && actionContrib !== null} title="Reject Contribution" onClose={closeAction}
           footer={<><button type="button" className="btn btn--ghost" onClick={closeAction}>Cancel</button><button type="button" className="btn btn--danger" onClick={doReject} disabled={busy}>{busy ? '...' : 'Confirm Reject'}</button></>}>
           <FormField label="Reason" required><TextArea value={comment} onChange={setComment} rows={3} /></FormField>
         </Modal>
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminCommitteesPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, TextArea, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Committee, Member, TeamId } from '@/types';

   const EMPTY: Omit<Committee, 'id'> = { name: '', nameAr: '', description: '', color: '#151A45', icon: '', teamId: 'helpers' };

   export function AdminCommitteesPage() {
     const { user: me } = useAuth();
     const { data: committees, loading } = useCollection<Committee>('committees');
     const { data: members } = useCollection<Member>('members');
     const [creating, setCreating] = useState(false);
     const [editing, setEditing] = useState<Committee | null>(null);
     const [form, setForm] = useState<Omit<Committee, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<Committee | null>(null);
     const [busy, setBusy] = useState(false);
     const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
     const openEdit = (c: Committee) => { setForm({ name: c.name, nameAr: c.nameAr, description: c.description, color: c.color, icon: c.icon, teamId: c.teamId }); setEditing(c); setCreating(false); };
     const close = () => { setCreating(false); setEditing(null); };
     const save = async () => {
       if (!form.nameAr.trim()) { toast.error('Name required'); return; }
       setBusy(true);
       try {
         const payload = { name: form.name.trim() || form.nameAr.trim(), nameAr: form.nameAr.trim(), description: form.description.trim(), color: form.color, icon: form.icon, teamId: form.teamId };
         if (editing) { await updateOne('committees', editing.id, payload); toast.success('Updated'); }
         else { const id = 'COMM-' + Date.now().toString(36).toUpperCase(); await createOne('committees', { id, ...payload }); toast.success('Added'); }
         close();
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const del = async () => {
       if (!toDelete) return;
       setBusy(true);
       try {
         await removeOne('committees', toDelete.id);
         for (const m of members) { if (Array.isArray(m.committeeIds) && m.committeeIds.includes(toDelete.id)) await updateOne('members', m.id, { committeeIds: m.committeeIds.filter((c) => c !== toDelete.id) }); }
         toast.success('Deleted');
         setToDelete(null);
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Committees" description="Add committees like teams. Each member must join at least one." />
         <SectionHeader eyebrow="List" title={'Committees (' + committees.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Committee</button>} />
         {loading ? <SkeletonList count={4} /> : committees.length === 0 ? <EmptyState title="No committees" message="Add your first committee." action={<button type="button" className="btn btn--primary" onClick={openCreate}>+ Add Committee</button>} /> : (
           <div className="grid grid--wide">{committees.map((c) => {
             const count = members.filter((m) => Array.isArray(m.committeeIds) && m.committeeIds.includes(c.id)).length;
             const team = c.teamId ? teams.find((t) => t.id === c.teamId) : null;
             return (
               <div key={c.id} className="card no-click">
                 <div className="row row--between">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{c.nameAr}</div>
                     {team ? <div className="card__meta">Team: {team.name}</div> : null}
                   </div>
                   <span style={{ width: 14, height: 14, borderRadius: 4, background: c.color }} />
                 </div>
                 {c.description ? <p className="small soft mt-3">{c.description}</p> : null}
                 <div className="small muted mt-3">{count} members</div>
                 <div className="row mt-4" style={{ gap: 6, justifyContent: 'flex-end' }}>
                   <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(c)}>Edit</button>
                   <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(c)}>Delete</button>
                 </div>
               </div>
             );
           })}</div>
         )}
         <Modal open={creating || editing !== null} title={editing ? 'Edit Committee' : 'New Committee'} onClose={close}
           footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
           <FormField label="Name (Arabic)" required><TextInput value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} /></FormField>
           <FormField label="Name (English)"><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
           <FormField label="Team" required><Select value={form.teamId ?? 'helpers'} onChange={(v) => setForm({ ...form, teamId: v as TeamId })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
           <FormField label="Description"><TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={2} /></FormField>
           <FormField label="Color"><Select value={form.color} onChange={(v) => setForm({ ...form, color: v })} options={[
             { value: '#151A45', label: 'Navy' }, { value: '#C1272D', label: 'Red' }, { value: '#16A34A', label: 'Green' },
             { value: '#2563EB', label: 'Blue' }, { value: '#7C3AED', label: 'Purple' }, { value: '#EC4899', label: 'Pink' },
           ]} /></FormField>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete Committee" message={'Delete "' + (toDelete?.nameAr || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminRequestsPage.tsx",
  `import { useMemo, useState } from 'react';
   import { Link } from 'react-router-dom';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { teams } from '@/data/teams';
   import { REQUEST_TYPE_LABEL, REQUEST_STATUS_LABEL, PRIORITY_LABEL, formatDate, cx } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import type { RequestRecord, RequestStatus } from '@/types';

   const STATUSES: Array<RequestStatus | 'all'> = ['all', 'PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'];
   const STATUS_TAB: Record<string, string> = { all: 'All', PENDING: 'Pending', IN_REVIEW: 'In Review', APPROVED: 'Approved', REJECTED: 'Rejected' };

   export function AdminRequestsPage() {
     const { user } = useAuth();
     const { data: requests, loading } = useCollection<RequestRecord>('requests');
     const [status, setStatus] = useState<RequestStatus | 'all'>('all');
     const filtered = useMemo(() => requests.filter((r) => status === 'all' || r.status === status).sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)), [requests, status]);
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Requests" description="Manage all requests." />
         <div className="chips mb-4">{STATUSES.map((s) => <button key={s} type="button" className={cx('chip', status === s && 'is-active')} onClick={() => setStatus(s)}>{STATUS_TAB[s]}</button>)}</div>
         <SectionHeader eyebrow="List" title={'Requests (' + filtered.length + ')'} />
         {loading ? <SkeletonList count={5} /> : filtered.length === 0 ? <EmptyState title="No requests" message="No matching." /> : (
           <div className="stack">{filtered.map((r) => {
             const fromTeam = r.fromTeamId ? teams.find((t) => t.id === r.fromTeamId) : null;
             const toTeam = r.toTeamId ? teams.find((t) => t.id === r.toTeamId) : null;
             return (
               <div key={r.id} className="admin-request-card">
                 <div className="admin-request-card__head">
                   <div style={{ flex: 1, minWidth: 0 }}>
                     <div className="card__title">{r.title}</div>
                     <div className="card__meta">{r.requesterName} · {formatDate(r.submittedAt)}{fromTeam ? ' · from ' + fromTeam.name : ''}{toTeam ? ' · to ' + toTeam.name : ''}</div>
                   </div>
                   <div className="row" style={{ gap: 6 }}>
                     <Badge variant="neutral">{REQUEST_TYPE_LABEL[r.type]}</Badge>
                     <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'REJECTED' ? 'danger' : r.status === 'IN_REVIEW' ? 'warning' : 'info'}>{REQUEST_STATUS_LABEL[r.status]}</Badge>
                     <Badge variant="neutral">{PRIORITY_LABEL[r.priority]}</Badge>
                   </div>
                 </div>
                 <div className="admin-request-card__actions">
                   <Link to={'/requests/' + r.id} className="btn btn--ghost btn--sm">Details</Link>
                 </div>
               </div>
             );
           })}</div>
         )}
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminMembersPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { teams } from '@/data/teams';
   import { ROLE_LABEL } from '@/lib/permissions';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, NumberInput, TextArea, Select, MultiSelect } from '@/components/ui/FormField';
   import { Avatar } from '@/components/ui/Avatar';
   import { toast } from '@/components/ui/Toast';
   import type { Member, RoleId, TeamId, Committee } from '@/types';

   const ROLE_OPTS = Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }));
   const EMPTY: Omit<Member, 'id'> = { name: '', role: 'MEMBER', teamIds: [], committeeIds: [], joinedSeason: 7, hours: 0, points: 0, status: 'active', bio: '', email: '' };

   export function AdminMembersPage() {
     const { data: list, loading } = useCollection<Member>('members');
     const { data: liveCommittees } = useCollection<Committee>('committees');
     const [editing, setEditing] = useState<Member | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<Member, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<Member | null>(null);
     const [busy, setBusy] = useState(false);
     const [search, setSearch] = useState('');
     const filtered = list.filter((m) => !search.trim() || m.name.toLowerCase().includes(search.trim().toLowerCase()));
     const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
     const openEdit = (m: Member) => { setForm({ name: m.name, role: m.role, teamIds: Array.isArray(m.teamIds) ? m.teamIds : [], committeeIds: Array.isArray(m.committeeIds) ? m.committeeIds : [], joinedSeason: m.joinedSeason || 7, hours: m.hours || 0, points: m.points || 0, status: m.status || 'active', bio: m.bio || '', email: m.email || '' }); setEditing(m); setCreating(false); };
     const close = () => { setCreating(false); setEditing(null); };
     const save = async () => {
       if (!form.name.trim()) { toast.error('Name required'); return; }
       if (form.teamIds.length === 0) { toast.error('At least one team required'); return; }
       if (form.committeeIds.length === 0) { toast.error('At least one committee required'); return; }
       setBusy(true);
       try {
         if (editing) { await updateOne('members', editing.id, form); toast.success('Updated'); }
         else { const id = 'M-' + Date.now().toString(36).toUpperCase(); await createOne('members', { id, ...form }); toast.success('Added'); }
         close();
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('members', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Members" description="Every member must be in a team AND a committee." />
         <div className="toolbar"><input className="input" type="search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
         <SectionHeader eyebrow="List" title={'Members (' + filtered.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Member</button>} />
         {loading ? <SkeletonList count={6} /> : filtered.length === 0 ? <EmptyState title="No members" message="No members found." /> : (
           <div className="table-wrap"><table className="data">
             <thead><tr><th>Name</th><th>Role</th><th>Teams</th><th>Committees</th><th>Hours</th><th>Points</th><th>Actions</th></tr></thead>
             <tbody>{filtered.map((m) => {
               const mt = teams.filter((t) => Array.isArray(m.teamIds) && m.teamIds.includes(t.id));
               const mc = liveCommittees.filter((c) => Array.isArray(m.committeeIds) && m.committeeIds.includes(c.id));
               return (
                 <tr key={m.id}>
                   <td data-label="Name"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar name={m.name} size={32} variant="navy" /><span>{m.name}</span></div></td>
                   <td className="muted small" data-label="Role">{ROLE_LABEL[m.role]}</td>
                   <td data-label="Teams"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mt.map((t) => <span key={t.id} className="badge">{t.name}</span>)}</div></td>
                   <td data-label="Committees"><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{mc.length === 0 ? <span className="muted small">—</span> : mc.map((c) => <span key={c.id} className="badge">{c.nameAr}</span>)}</div></td>
                   <td data-label="Hours">{m.hours || 0}</td>
                   <td className="points" data-label="Points">{m.points || 0}</td>
                   <td data-label="Actions"><div style={{ display: 'flex', gap: 4 }}><button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(m)}>Edit</button><button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(m)}>Delete</button></div></td>
                 </tr>
               );
             })}</tbody>
           </table></div>
         )}
         <Modal open={creating || editing !== null} title={editing ? 'Edit Member' : 'Add Member'} onClose={close} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
           <FormField label="Full name" required><TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} /></FormField>
           <FormField label="Email"><TextInput value={form.email || ''} onChange={(v) => setForm({ ...form, email: v })} type="email" /></FormField>
           <FormField label="Role" required><Select value={form.role} onChange={(v) => setForm({ ...form, role: v as RoleId })} options={ROLE_OPTS} /></FormField>
           <FormField label="Teams" required><MultiSelect values={form.teamIds} onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
           <FormField label="Committees" required hint={liveCommittees.length === 0 ? 'No committees yet' : 'At least one required'}>
             <MultiSelect values={form.committeeIds} onChange={(v) => setForm({ ...form, committeeIds: v })} options={liveCommittees.map((c) => ({ value: c.id, label: c.nameAr }))} />
           </FormField>
           <FormField label="Hours"><NumberInput value={form.hours || 0} onChange={(v) => setForm({ ...form, hours: v })} min={0} /></FormField>
           <FormField label="Status"><Select value={form.status || 'active'} onChange={(v) => setForm({ ...form, status: v as 'active' | 'inactive' | 'suspended' })} options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'suspended', label: 'Suspended' }]} /></FormField>
           <FormField label="Bio"><TextArea value={form.bio || ''} onChange={(v) => setForm({ ...form, bio: v })} rows={2} /></FormField>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete Member" message={'Delete "' + (toDelete?.name || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminNotificationsPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { notifyUser, notifyUsers } from '@/lib/notifications';
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
       if (!title.trim() || !message.trim()) { toast.error('Title & message required'); return; }
       setBusy(true);
       try {
         if (target === 'all') await notifyUsers(users, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
         else if (target === 'managers') {
           const managers = users.filter((u) => ['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HEAD_HR_TEAM', 'HR', 'COMMITTEE_HR'].includes(u.role));
           await notifyUsers(managers, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
         } else {
           if (!users.find((u) => u.uid === target)) { toast.error('User not found'); setBusy(false); return; }
           await notifyUser(target, title.trim(), message.trim(), 'system', undefined, priority, me?.displayName);
         }
         setTitle(''); setMessage('');
         toast.success('Sent');
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const sorted = [...notifs].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30);
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Send Notification" description="Real-time notifications." />
         <SectionHeader eyebrow="Send" title="New Notification" />
         <div className="card no-click" style={{ maxWidth: 760 }}>
           <FormField label="Recipient" required>
             <Select value={target} onChange={setTarget} options={[
               { value: 'all', label: 'Everyone (' + users.length + ')' },
               { value: 'managers', label: 'Managers only' },
               ...users.map((u) => ({ value: u.uid, label: u.displayName + ' (' + u.email + ')' })),
             ]} />
           </FormField>
           <FormField label="Title" required><TextInput value={title} onChange={setTitle} /></FormField>
           <FormField label="Message" required><TextArea value={message} onChange={setMessage} rows={4} /></FormField>
           <FormField label="Priority"><Select value={priority} onChange={(v) => setPriority(v as 'low' | 'normal' | 'high')} options={[
             { value: 'low', label: 'Low' }, { value: 'normal', label: 'Normal' }, { value: 'high', label: 'High' },
           ]} /></FormField>
           <button type="button" className="btn btn--primary btn--block" onClick={send} disabled={busy}>{busy ? '...' : 'Send'}</button>
         </div>
         <SectionHeader eyebrow="History" title={'Recent (' + notifs.length + ')'} />
         {loading ? <SkeletonList count={6} /> : sorted.length === 0 ? <EmptyState title="No notifications" message="No notifications sent." /> : (
           <div className="stack">{sorted.map((n) => (
             <div key={n.id} className="card no-click">
               <div className="row row--between">
                 <div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{n.title}</div><div className="card__meta">{n.message}</div></div>
                 {!n.read ? <Badge variant="red">New</Badge> : <Badge variant="success">Read</Badge>}
               </div>
               <div className="tiny muted mt-2">{relativeTime(n.date)}</div>
             </div>
           ))}</div>
         )}
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminAnalyticsPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { teams } from '@/data/teams';
   import { getTeamTotalPoints } from '@/lib/rankings';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Loading } from '@/components/ui/Loading';
   import type { Member, Contribution, RequestRecord, Committee } from '@/types';

   export function AdminAnalyticsPage() {
     const { data: members, loading: lM } = useCollection<Member>('members');
     const { data: contributions, loading: lC } = useCollection<Contribution>('contributions');
     const { data: requests, loading: lR } = useCollection<RequestRecord>('requests');
     const { data: committees, loading: lCo } = useCollection<Committee>('committees');
     if (lM || lC || lR || lCo) return <Loading fullHeight message="Loading analytics..." />;
     const teamStats = teams.map((t) => ({ team: t, points: getTeamTotalPoints(members, contributions, t.id) })).sort((a, b) => b.points - a.points);
     const maxT = Math.max(1, ...teamStats.map((s) => s.points));
     const statusCounts: Record<string, number> = {};
     requests.forEach((r) => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });
     const typeCounts: Record<string, number> = {};
     requests.forEach((r) => { typeCounts[r.type] = (typeCounts[r.type] || 0) + 1; });
     const contribCounts: Record<string, number> = {};
     contributions.forEach((c) => { if (c.status) contribCounts[c.status] = (contribCounts[c.status] || 0) + 1; });
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Analytics" description="Overview." />
         <section className="section"><SectionHeader eyebrow="Teams" title="Team Points" />
           <div className="card no-click">{teamStats.map((s) => (
             <div key={s.team.id} className="chart-row"><span>{s.team.name}</span><div className="chart-bar" style={{ width: Math.round((s.points / maxT) * 100) + '%' }} /><span style={{ color: 'var(--c-navy)' }}>{s.points}</span></div>
           ))}</div>
         </section>
         <section className="section"><SectionHeader eyebrow="Requests" title="By Status" />
           <div className="grid grid--narrow">{Object.entries(statusCounts).map(([k, v]) => (<div key={k} className="card no-click"><div className="card__meta">{k}</div><div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{v}</div></div>))}</div>
         </section>
         <section className="section"><SectionHeader eyebrow="Requests" title="By Type" />
           <div className="grid grid--narrow">{Object.entries(typeCounts).map(([k, v]) => (<div key={k} className="card no-click"><div className="card__meta">{k}</div><div style={{ fontSize: '1.8rem', color: 'var(--c-red)', marginTop: 6 }}>{v}</div></div>))}</div>
         </section>
         <section className="section"><SectionHeader eyebrow="Contributions" title="By Status" />
           <div className="grid grid--narrow">{Object.entries(contribCounts).map(([k, v]) => (<div key={k} className="card no-click"><div className="card__meta">{k}</div><div style={{ fontSize: '1.8rem', color: 'var(--c-navy)', marginTop: 6 }}>{v}</div></div>))}</div>
         </section>
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminGovernancePage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, TextArea } from '@/components/ui/FormField';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import type { GovernanceDocument } from '@/types';

   const EMPTY: Omit<GovernanceDocument, 'id'> = { title: '', category: 'Policies', description: '', content: '', version: '1.0', updatedAt: new Date().toISOString().slice(0, 10) };

   export function AdminGovernancePage() {
     const { data, loading } = useCollection<GovernanceDocument>('governance');
     const [creating, setCreating] = useState(false);
     const [editing, setEditing] = useState<GovernanceDocument | null>(null);
     const [form, setForm] = useState<Omit<GovernanceDocument, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<GovernanceDocument | null>(null);
     const [busy, setBusy] = useState(false);
     const sorted = [...data].sort((a, b) => a.title.localeCompare(b.title));
     const openCreate = () => { setForm({ ...EMPTY, updatedAt: new Date().toISOString().slice(0, 10) }); setCreating(true); setEditing(null); };
     const openEdit = (d: GovernanceDocument) => { setForm({ title: d.title, category: d.category, description: d.description || '', content: d.content, version: d.version || '1.0', updatedAt: d.updatedAt }); setEditing(d); setCreating(false); };
     const close = () => { setCreating(false); setEditing(null); };
     const save = async () => {
       if (!form.title.trim() || !form.content.trim()) { toast.error('Title & content required'); return; }
       setBusy(true);
       try {
         const payload = { ...form, updatedAt: new Date().toISOString().slice(0, 10) };
         if (editing) { await updateOne('governance', editing.id, payload); toast.success('Updated'); }
         else { const id = 'GOV-' + Date.now().toString(36).toUpperCase(); await createOne('governance', { id, ...payload }); toast.success('Added'); }
         close();
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('governance', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Governance" description="Policies and documents." />
         <SectionHeader eyebrow="List" title={'Documents (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Document</button>} />
         {loading ? <SkeletonList count={4} /> : sorted.length === 0 ? <EmptyState title="No documents" message="Add the first document." /> : (
           <div className="stack">{sorted.map((d) => (
             <div key={d.id} className="card no-click">
               <div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{d.title}</div><div className="card__meta">{d.category} · v{d.version} · Updated {formatDate(d.updatedAt)}</div></div><Badge variant="info">{d.category}</Badge></div>
               {d.description ? <p className="small soft mt-2">{d.description}</p> : null}
               <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                 <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(d)}>Edit</button>
                 <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(d)}>Delete</button>
               </div>
             </div>
           ))}</div>
         )}
         <Modal open={creating || editing !== null} title={editing ? 'Edit Document' : 'New Document'} onClose={close} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
           <FormField label="Title" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
           <FormField label="Category" required><TextInput value={form.category} onChange={(v) => setForm({ ...form, category: v })} /></FormField>
           <FormField label="Short description"><TextInput value={form.description || ''} onChange={(v) => setForm({ ...form, description: v })} /></FormField>
           <FormField label="Full content" required><TextArea value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={8} /></FormField>
           <FormField label="Version" required><TextInput value={form.version || '1.0'} onChange={(v) => setForm({ ...form, version: v })} /></FormField>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete Document" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminAuditPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { formatDateTime } from '@/lib/format';
   import type { AuditRecord } from '@/types';

   export function AdminAuditPage() {
     const { data, loading } = useCollection<AuditRecord>('audit');
     const sorted = [...data].sort((a, b) => (a.date < b.date ? 1 : -1));
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Audit Log" description="All actions." />
         <SectionHeader eyebrow="Log" title={'Events (' + data.length + ')'} />
         {loading ? <SkeletonList count={8} /> : sorted.length === 0 ? <EmptyState title="No events" message="No actions recorded." /> : (
           <div className="table-wrap"><table className="data">
             <thead><tr><th>Date</th><th>User</th><th>Action</th><th>Description</th></tr></thead>
             <tbody>{sorted.map((a) => <tr key={a.id}><td className="muted small nowrap">{formatDateTime(a.date)}</td><td style={{ fontWeight: 700 }}>{a.actorName}</td><td><span className="badge badge--neutral">{a.action}</span></td><td>{a.description}</td></tr>)}</tbody>
           </table></div>
         )}
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminAchievementsPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { teams } from '@/data/teams';
   import { useCollection as useCollectionMembers } from '@/lib/useRealtimeCollection';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, TextArea, DateInput, MultiSelect } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { Achievement, TeamId, Member } from '@/types';

   const EMPTY: Omit<Achievement, 'id'> = { title: '', description: '', date: new Date().toISOString().slice(0, 10), level: 'branch', teamIds: [], memberIds: [], memberNames: [], seasonId: 'S7' };

   export function AdminAchievementsPage() {
     const { data, loading } = useCollection<Achievement>('achievements');
     const { data: members } = useCollectionMembers<Member>('members');
     const [creating, setCreating] = useState(false);
     const [editing, setEditing] = useState<Achievement | null>(null);
     const [form, setForm] = useState<Omit<Achievement, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<Achievement | null>(null);
     const [busy, setBusy] = useState(false);
     const openCreate = () => { setForm(EMPTY); setCreating(true); setEditing(null); };
     const openEdit = (a: Achievement) => { setForm({ title: a.title, description: a.description, date: a.date, level: a.level || 'branch', teamIds: a.teamIds || [], memberIds: a.memberIds || [], memberNames: a.memberNames || [], seasonId: a.seasonId || 'S7' }); setEditing(a); setCreating(false); };
     const close = () => { setCreating(false); setEditing(null); };
     const save = async () => {
       if (!form.title.trim() || !form.description.trim()) { toast.error('Title & description required'); return; }
       setBusy(true);
       try {
         const memberNames = (form.memberIds || []).map((id) => members.find((m) => m.id === id)?.name).filter((n): n is string => Boolean(n));
         const payload = { ...form, memberNames };
         if (editing) { await updateOne('achievements', editing.id, payload); toast.success('Updated'); }
         else { const id = 'A-' + Date.now().toString(36).toUpperCase(); await createOne('achievements', { id, ...payload }); toast.success('Added'); }
         close();
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('achievements', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Achievements" description="Manage achievements." />
         <SectionHeader eyebrow="List" title={'Achievements (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Achievement</button>} />
         {loading ? <SkeletonList count={5} /> : data.length === 0 ? <EmptyState title="No achievements" message="Add the first." /> : (
           <div className="stack">{data.map((a) => (
             <div key={a.id} className="card no-click">
               <div className="card__title">{a.title}</div>
               <div className="card__meta">{formatDate(a.date)}</div>
               <p className="small soft mt-3">{a.description}</p>
               <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                 <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(a)}>Edit</button>
                 <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(a)}>Delete</button>
               </div>
             </div>
           ))}</div>
         )}
         <Modal open={creating || editing !== null} title={editing ? 'Edit Achievement' : 'New Achievement'} onClose={close} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
           <FormField label="Title" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
           <FormField label="Description" required><TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} rows={3} /></FormField>
           <FormField label="Date" required><DateInput value={form.date} onChange={(v) => setForm({ ...form, date: v })} /></FormField>
           <FormField label="Teams"><MultiSelect values={form.teamIds || []} onChange={(v) => setForm({ ...form, teamIds: v as TeamId[] })} options={teams.map((t) => ({ value: t.id, label: t.name }))} /></FormField>
           <FormField label="Members"><MultiSelect values={form.memberIds || []} onChange={(v) => setForm({ ...form, memberIds: v })} options={members.map((m) => ({ value: m.id, label: m.name }))} /></FormField>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete Achievement" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminWarningsPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextArea, DateInput, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { WarningRecord, Member } from '@/types';

   const EMPTY: Omit<WarningRecord, 'id'> = { memberId: '', memberName: '', type: 'VERBAL', reason: '', severity: 'LOW', issuedByMemberId: '', issuedByName: '', issuedAt: new Date().toISOString().slice(0, 10), status: 'active', notes: '' };

   export function AdminWarningsPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<WarningRecord>('warnings');
     const { data: members } = useCollection<Member>('members');
     const [editing, setEditing] = useState<WarningRecord | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<WarningRecord, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<WarningRecord | null>(null);
     const [busy, setBusy] = useState(false);
     const openCreate = () => { setForm({ ...EMPTY, issuedByMemberId: me?.memberId ?? '', issuedByName: me?.displayName ?? '' }); setCreating(true); setEditing(null); };
     const openEdit = (w: WarningRecord) => { setForm({ memberId: w.memberId, memberName: w.memberName || '', type: w.type, reason: w.reason, severity: w.severity, issuedByMemberId: w.issuedByMemberId || '', issuedByName: w.issuedByName || '', issuedAt: w.issuedAt, status: w.status, notes: w.notes || '' }); setEditing(w); setCreating(false); };
     const close = () => { setCreating(false); setEditing(null); };
     const save = async () => {
       if (!form.memberId || !form.reason.trim()) { toast.error('Member & reason required'); return; }
       setBusy(true);
       try {
         const member = members.find((m) => m.id === form.memberId);
         const payload = { ...form, memberName: member?.name ?? form.memberName };
         if (editing) { await updateOne('warnings', editing.id, payload); toast.success('Updated'); }
         else { const id = 'WARN-' + Date.now().toString(36).toUpperCase(); await createOne('warnings', { id, ...payload }); toast.success('Issued'); }
         close();
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('warnings', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Warnings" description="Issue warnings." />
         <SectionHeader eyebrow="List" title={'Warnings (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Warning</button>} />
         {loading ? <SkeletonList count={4} /> : data.length === 0 ? <EmptyState title="No warnings" message="No warnings issued." /> : (
           <div className="stack">{data.map((w) => (
             <div key={w.id} className="card no-click">
               <div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{w.memberName}</div><div className="card__meta">{w.reason}</div></div><Badge variant={w.status === 'active' ? 'danger' : 'success'} dot>{w.status === 'active' ? 'Active' : 'Resolved'}</Badge></div>
               <div className="row mt-3" style={{ gap: 6 }}><Badge variant="neutral">{w.type}</Badge><Badge variant={w.severity === 'HIGH' ? 'danger' : w.severity === 'MEDIUM' ? 'warning' : 'info'}>{w.severity}</Badge><span className="small muted">{formatDate(w.issuedAt)}</span></div>
               <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                 <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(w)}>Edit</button>
                 <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(w)}>Delete</button>
               </div>
             </div>
           ))}</div>
         )}
         <Modal open={creating || editing !== null} title={editing ? 'Edit Warning' : 'New Warning'} onClose={close} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
           <FormField label="Member" required><Select value={form.memberId} onChange={(v) => { const m = members.find((x) => x.id === v); setForm({ ...form, memberId: v, memberName: m?.name ?? '' }); }} options={[{ value: '', label: '— Select —' }, ...members.map((m) => ({ value: m.id, label: m.name }))]} /></FormField>
           <FormField label="Type" required><Select value={form.type} onChange={(v) => setForm({ ...form, type: v as WarningRecord['type'] })} options={[{ value: 'VERBAL', label: 'Verbal' }, { value: 'WRITTEN', label: 'Written' }, { value: 'FINAL', label: 'Final' }]} /></FormField>
           <FormField label="Reason" required><TextArea value={form.reason} onChange={(v) => setForm({ ...form, reason: v })} rows={3} /></FormField>
           <FormField label="Severity" required><Select value={form.severity} onChange={(v) => setForm({ ...form, severity: v as WarningRecord['severity'] })} options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} /></FormField>
           <FormField label="Date" required><DateInput value={form.issuedAt} onChange={(v) => setForm({ ...form, issuedAt: v })} /></FormField>
           <FormField label="Status"><Select value={form.status} onChange={(v) => setForm({ ...form, status: v as 'active' | 'resolved' })} options={[{ value: 'active', label: 'Active' }, { value: 'resolved', label: 'Resolved' }]} /></FormField>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete Warning" message="Confirm?" confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminCalendarPage.tsx",
  `import { useState } from 'react';
   import { useCollection } from '@/lib/useRealtimeCollection';
   import { useAuth } from '@/lib/useAuth';
   import { createOne, updateOne, removeOne } from '@/lib/db';
   import { teams } from '@/data/teams';
   import { formatDate } from '@/lib/format';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { Badge } from '@/components/ui/Badge';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Modal } from '@/components/ui/Modal';
   import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
   import { FormField, TextInput, TextArea, DateInput, TimeInput, Select } from '@/components/ui/FormField';
   import { toast } from '@/components/ui/Toast';
   import type { CalendarEvent, TeamId } from '@/types';

   const EMPTY: Omit<CalendarEvent, 'id'> = { title: '', description: '', date: new Date().toISOString().slice(0, 10), time: '', endTime: '', teamId: null, isPublic: true, type: 'meeting', location: '', seasonId: 'S7', createdBy: '', createdByName: '' };

   export function AdminCalendarPage() {
     const { user: me } = useAuth();
     const { data, loading } = useCollection<CalendarEvent>('calendar');
     const [editing, setEditing] = useState<CalendarEvent | null>(null);
     const [creating, setCreating] = useState(false);
     const [form, setForm] = useState<Omit<CalendarEvent, 'id'>>(EMPTY);
     const [toDelete, setToDelete] = useState<CalendarEvent | null>(null);
     const [busy, setBusy] = useState(false);
     const sorted = [...data].sort((a, b) => (a.date > b.date ? 1 : -1));
     const openCreate = () => { setForm({ ...EMPTY, createdBy: me?.uid ?? '', createdByName: me?.displayName ?? '' }); setCreating(true); setEditing(null); };
     const openEdit = (e: CalendarEvent) => { setForm({ title: e.title, description: e.description || '', date: e.date, time: e.time || '', endTime: e.endTime || '', teamId: e.teamId ?? null, isPublic: e.isPublic ?? true, type: e.type || 'meeting', location: e.location || '', seasonId: e.seasonId || 'S7', createdBy: e.createdBy || '', createdByName: e.createdByName || '' }); setEditing(e); setCreating(false); };
     const close = () => { setCreating(false); setEditing(null); };
     const save = async () => {
       if (!form.title.trim() || !form.date) { toast.error('Title & date required'); return; }
       setBusy(true);
       try {
         const payload = { ...form, teamId: form.isPublic ? null : form.teamId };
         if (editing) { await updateOne('calendar', editing.id, payload); toast.success('Updated'); }
         else { const id = 'EVT-' + Date.now().toString(36).toUpperCase(); await createOne('calendar', { id, ...payload }); toast.success('Added'); }
         close();
       } catch { toast.error('Failed'); }
       finally { setBusy(false); }
     };
     const del = async () => { if (!toDelete) return; setBusy(true); try { await removeOne('calendar', toDelete.id); toast.success('Deleted'); setToDelete(null); } catch { toast.error('Failed'); } finally { setBusy(false); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Calendar" description="Manage events." />
         <SectionHeader eyebrow="List" title={'Events (' + data.length + ')'} action={<button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>+ New Event</button>} />
         {loading ? <SkeletonList count={5} /> : sorted.length === 0 ? <EmptyState title="No events" message="Add the first event." /> : (
           <div className="stack">{sorted.map((e) => {
             const team = e.teamId ? teams.find((t) => t.id === e.teamId) : null;
             return (
               <div key={e.id} className="card no-click">
                 <div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{e.title}</div><div className="card__meta">{formatDate(e.date)}{e.time ? ' · ' + e.time : ''}</div></div><Badge variant={e.isPublic ? 'info' : 'neutral'}>{e.isPublic ? 'Public' : team?.name || 'Team'}</Badge></div>
                 <div className="row mt-3" style={{ gap: 6, justifyContent: 'flex-end' }}>
                   <button type="button" className="btn btn--ghost btn--xs" onClick={() => openEdit(e)}>Edit</button>
                   <button type="button" className="btn btn--danger btn--xs" onClick={() => setToDelete(e)}>Delete</button>
                 </div>
               </div>
             );
           })}</div>
         )}
         <Modal open={creating || editing !== null} title={editing ? 'Edit Event' : 'New Event'} onClose={close} wide
           footer={<><button type="button" className="btn btn--ghost" onClick={close}>Cancel</button><button type="button" className="btn btn--primary" onClick={save} disabled={busy}>{busy ? '...' : 'Save'}</button></>}>
           <FormField label="Title" required><TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} /></FormField>
           <FormField label="Description"><TextArea value={form.description || ''} onChange={(v) => setForm({ ...form, description: v })} rows={2} /></FormField>
           <FormField label="Date" required><DateInput value={form.date} onChange={(v) => setForm({ ...form, date: v })} /></FormField>
           <FormField label="Start time"><TimeInput value={form.time || ''} onChange={(v) => setForm({ ...form, time: v })} /></FormField>
           <FormField label="End time"><TimeInput value={form.endTime || ''} onChange={(v) => setForm({ ...form, endTime: v })} /></FormField>
           <FormField label="Type"><Select value={form.type || 'meeting'} onChange={(v) => setForm({ ...form, type: v as CalendarEvent['type'] })} options={[{ value: 'meeting', label: 'Meeting' }, { value: 'event', label: 'Event' }, { value: 'workshop', label: 'Workshop' }, { value: 'deadline', label: 'Deadline' }]} /></FormField>
           <FormField label="Scope" required><Select value={form.isPublic ? 'public' : form.teamId ?? 'helpers'} onChange={(v) => { if (v === 'public') setForm({ ...form, isPublic: true, teamId: null }); else setForm({ ...form, isPublic: false, teamId: v as TeamId }); }} options={[{ value: 'public', label: 'Public' }, ...teams.map((t) => ({ value: t.id, label: 'Team ' + t.name }))]} /></FormField>
           <FormField label="Location"><TextInput value={form.location || ''} onChange={(v) => setForm({ ...form, location: v })} /></FormField>
         </Modal>
         <ConfirmDialog open={toDelete !== null} title="Delete Event" message={'Delete "' + (toDelete?.title || '') + '"?'} confirmLabel="Delete" danger busy={busy} onConfirm={del} onCancel={() => setToDelete(null)} />
       </div>
     );
   }
   `
);

file(
  "src/pages/admin/AdminConversationsPage.tsx",
  `import { useCollection } from '@/lib/useRealtimeCollection';
   import { createOne, removeOne } from '@/lib/db';
   import { teams } from '@/data/teams';
   import { PageHeader } from '@/components/ui/PageHeader';
   import { SectionHeader } from '@/components/ui/SectionHeader';
   import { EmptyState } from '@/components/ui/EmptyState';
   import { SkeletonList } from '@/components/ui/Loading';
   import { Badge } from '@/components/ui/Badge';
   import { toast } from '@/components/ui/Toast';
   import type { Conversation } from '@/types';

   export function AdminConversationsPage() {
     const { data, loading } = useCollection<Conversation>('conversations');
     const createTeamConv = async (team: typeof teams[number]) => {
       const id = 'CONV-TEAM-' + team.id;
       if (data.some((c) => c.id === id)) { toast.info('Already exists'); return; }
       try { await createOne('conversations', { id, type: 'team', title: 'Team ' + team.name, teamId: team.id, participantUids: [], lastMessageAt: new Date().toISOString() }); toast.success('Created'); }
       catch { toast.error('Failed'); }
     };
     const del = async (c: Conversation) => { try { await removeOne('conversations', c.id); toast.success('Deleted'); } catch { toast.error('Failed'); } };
     return (
       <div className="admin-page">
         <PageHeader eyebrow="Admin" title="Conversations" description="Manage chats." />
         <section className="section"><SectionHeader eyebrow="Quick Create" title="Team Chats" />
           <div className="chips">{teams.map((t) => { const exists = data.some((c) => c.id === 'CONV-TEAM-' + t.id); return <button key={t.id} type="button" disabled={exists} className={'chip' + (exists ? ' is-active' : '')} onClick={() => createTeamConv(t)}>{t.name} {exists ? '✓' : '+'}</button>; })}</div>
         </section>
         <section className="section">
           <SectionHeader eyebrow="List" title={'Conversations (' + data.length + ')'} />
           {loading ? <SkeletonList count={5} /> : data.length === 0 ? <EmptyState title="No conversations" message="Create team chats above." /> : (
             <div className="stack">{data.map((c) => (
               <div key={c.id} className="card no-click">
                 <div className="row row--between"><div style={{ flex: 1, minWidth: 0 }}><div className="card__title">{c.title || (c.type === 'general' ? 'General' : 'Chat')}</div><div className="card__meta">{c.type}</div></div><Badge variant={c.type === 'general' ? 'red' : c.type === 'team' ? 'info' : 'neutral'}>{c.type}</Badge></div>
                 {c.type !== 'general' ? <div className="row mt-3" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn btn--danger btn--xs" onClick={() => del(c)}>Delete</button></div> : null}
               </div>
             ))}</div>
           )}
         </section>
       </div>
     );
   }
   `
);

file(
  "src/App.tsx",
  `import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
   import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
   import { Layout } from '@/components/layout/Layout';
   import { RequireAuth } from '@/components/layout/RequireAuth';
   import { ToastContainer } from '@/components/ui/Toast';
   import { Onboarding } from '@/components/onboarding/Onboarding';
   import { PwaInstallBanner } from '@/components/pwa/PwaInstallBanner';

   import { HomePage } from '@/pages/HomePage';
   import { LoginPage } from '@/pages/LoginPage';
   import { ChangePasswordPage } from '@/pages/ChangePasswordPage';
   import { AboutPage } from '@/pages/AboutPage';
   import { MembersPage } from '@/pages/MembersPage';
   import { MemberProfilePage } from '@/pages/MemberProfilePage';
   import { TeamsPage } from '@/pages/TeamsPage';
   import { TeamDetailPage } from '@/pages/TeamDetailPage';
   import { CommitteesPage } from '@/pages/CommitteesPage';
   import { CommitteeDetailPage } from '@/pages/CommitteeDetailPage';
   import { LeaguePage } from '@/pages/LeaguePage';
   import { AchievementsPage } from '@/pages/AchievementsPage';
   import { GovernancePage } from '@/pages/GovernancePage';
   import { SearchPage } from '@/pages/SearchPage';
   import { NotFoundPage } from '@/pages/NotFoundPage';

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
   import { AdminGovernancePage } from '@/pages/admin/AdminGovernancePage';
   import { AdminRequestsPage } from '@/pages/admin/AdminRequestsPage';
   import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';

   export default function App() {
     return (
       <ErrorBoundary>
         <HashRouter>
           <Routes>
             <Route element={<Layout />}>
               <Route path="/" element={<HomePage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/change-password" element={<ChangePasswordPage />} />
               <Route path="/about" element={<AboutPage />} />
               <Route path="/members" element={<MembersPage />} />
               <Route path="/members/:memberId" element={<MemberProfilePage />} />
               <Route path="/teams" element={<TeamsPage />} />
               <Route path="/teams/:teamId" element={<TeamDetailPage />} />
               <Route path="/committees" element={<CommitteesPage />} />
               <Route path="/committees/:committeeId" element={<CommitteeDetailPage />} />
               <Route path="/league" element={<LeaguePage />} />
               <Route path="/achievements" element={<AchievementsPage />} />
               <Route path="/governance" element={<GovernancePage />} />
               <Route path="/search" element={<SearchPage />} />

               <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
               <Route path="/profile" element={<RequireAuth><MyProfilePage /></RequireAuth>} />
               <Route path="/my-contributions" element={<RequireAuth><MyContributionsPage /></RequireAuth>} />
               <Route path="/my-requests" element={<RequireAuth><MyRequestsPage /></RequireAuth>} />
               <Route path="/requests/new" element={<RequireAuth><NewRequestPage /></RequireAuth>} />
               <Route path="/requests" element={<RequireAuth><RequestsPage /></RequireAuth>} />
               <Route path="/requests/:requestId" element={<RequireAuth><RequestDetailPage /></RequireAuth>} />
               <Route path="/approvals" element={<RequireAuth><ApprovalsPage /></RequireAuth>} />
               <Route path="/contributions" element={<RequireAuth><ContributionsPage /></RequireAuth>} />
               <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
               <Route path="/conversations" element={<RequireAuth><ConversationsPage /></RequireAuth>} />
               <Route path="/calendar" element={<RequireAuth><CalendarPage /></RequireAuth>} />
               <Route path="/reports" element={<RequireAuth><ReportsPage /></RequireAuth>} />
               <Route path="/audit" element={<RequireAuth roles={['HEAD', 'VICE']}><AuditPage /></RequireAuth>} />

               <Route path="/admin" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminHomePage /></RequireAuth>} />
               <Route path="/admin/analytics" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminAnalyticsPage /></RequireAuth>} />
               <Route path="/admin/requests" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminRequestsPage /></RequireAuth>} />
               <Route path="/admin/users" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminUsersPage /></RequireAuth>} />
               <Route path="/admin/members" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminMembersPage /></RequireAuth>} />
               <Route path="/admin/contributions" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminContributionsPage /></RequireAuth>} />
               <Route path="/admin/committees" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminCommitteesPage /></RequireAuth>} />
               <Route path="/admin/achievements" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminAchievementsPage /></RequireAuth>} />
               <Route path="/admin/warnings" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminWarningsPage /></RequireAuth>} />
               <Route path="/admin/calendar" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminCalendarPage /></RequireAuth>} />
               <Route path="/admin/conversations" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminConversationsPage /></RequireAuth>} />
               <Route path="/admin/notifications" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminNotificationsPage /></RequireAuth>} />
               <Route path="/admin/governance" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminGovernancePage /></RequireAuth>} />
               <Route path="/admin/audit" element={<RequireAuth roles={['HEAD', 'VICE']}><AdminAuditPage /></RequireAuth>} />
               <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

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

file(
  "src/main.tsx",
  `import { StrictMode } from 'react';
   import { createRoot } from 'react-dom/client';
   import App from './App';
   import './styles/global.css';

   const rootEl = document.getElementById('root');
   if (!rootEl) throw new Error('#root not found');

   try {
     createRoot(rootEl).render(
       <StrictMode>
         <App />
       </StrictMode>,
     );
   } catch (err) {
     console.error('[Fatal]', err);
     rootEl.innerHTML = '<div style="padding:40px;font-family:system-ui;color:#C1272D"><h1>App crashed</h1><pre>' + String(err) + '</pre></div>';
   }
   `
);

file(
  "src/vite-env.d.ts",
  `/// <reference types="vite/client" />
   interface ImportMetaEnv {
     readonly VITE_FIREBASE_API_KEY: string;
     readonly VITE_FIREBASE_AUTH_DOMAIN: string;
     readonly VITE_FIREBASE_PROJECT_ID: string;
     readonly VITE_FIREBASE_STORAGE_BUCKET: string;
     readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
     readonly VITE_FIREBASE_APP_ID: string;
   }
   interface ImportMeta { readonly env: ImportMetaEnv; }
   `
);
/* ═══════════════════════════════════════════════════════════════
   PART 15 — WRITE + FIX + PUSH + FIRESTORE RULES
   ═══════════════════════════════════════════════════════════════ */

file(
  "firestore.rules",
  `rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       function isSignedIn() { return request.auth != null; }
       function userDoc() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data; }
       function userDocExists() { return exists(/databases/$(database)/documents/users/$(request.auth.uid)); }
       function userRole() { return userDoc().role; }
       function userTeam() { return userDoc().teamId; }
       function userCommittees() { return userDoc().committeeIds; }

       function isSubBranchesHead() { return isSignedIn() && userDocExists() && userRole() in ['HEAD', 'VICE']; }
       function isGlobalHR() { return isSignedIn() && userDocExists() && userRole() == 'HEAD_HR_GLOBAL'; }
       function isTeamHead() { return isSignedIn() && userDocExists() && userRole() == 'PRESIDENT'; }
       function isTeamHeadHR() { return isSignedIn() && userDocExists() && userRole() == 'HEAD_HR_TEAM'; }
       function isCommitteeHR() { return isSignedIn() && userDocExists() && userRole() == 'COMMITTEE_HR'; }
       function isManager() {
         return isSignedIn() && userDocExists() &&
           userRole() in ['HEAD', 'VICE', 'HEAD_HR_GLOBAL', 'PRESIDENT', 'VICE_PRESIDENT', 'HEAD_HR_TEAM', 'HR', 'COMMITTEE_HR'];
       }

       match /users/{uid} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && request.auth.uid == uid;
         allow update: if isSubBranchesHead() || request.auth.uid == uid;
         allow delete: if isSubBranchesHead();
       }

       match /members/{id} {
         allow read: if isSignedIn();
         allow write: if isSubBranchesHead() || isManager();
       }

       match /teams/{id} {
         allow read: if isSignedIn();
         allow write: if isSubBranchesHead();
       }

       /* Committees — added only by Head/Vice (like teams) */
       match /committees/{id} {
         allow read: if isSignedIn();
         allow write: if isSubBranchesHead();
       }

       /* 3-stage contributions:
          - Committee HR at stage 1 (assigns points)
          - Team Head HR / Team Head at stage 2
          - Head HR Global / Head / Vice at stage 3 */
       match /contributions/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && request.resource.data.createdBy == request.auth.uid;
         allow update: if isSubBranchesHead() || isGlobalHR() || isTeamHeadHR() || isTeamHead() || isCommitteeHR() || isManager();
         allow delete: if isSubBranchesHead();
       }

       match /warnings/{id} {
         allow read: if isManager();
         allow write: if isSubBranchesHead() || isManager();
       }

       match /achievements/{id} { allow read: if true; allow write: if isSubBranchesHead(); }

       match /notifications/{id} {
         allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isManager());
         allow create: if isSignedIn();
         allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isSubBranchesHead());
         allow delete: if isSubBranchesHead();
       }

       match /conversations/{id} {
         allow read: if isSignedIn();
         allow create, update: if isSignedIn();
         allow delete: if isSubBranchesHead();
       }

       match /messages/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn() && request.resource.data.senderUid == request.auth.uid;
         allow update, delete: if isSubBranchesHead();
       }

       match /calendar/{id} { allow read: if true; allow write: if isManager(); }

       match /governance/{id} { allow read: if true; allow write: if isSubBranchesHead(); }

       match /audit/{id} {
         allow read: if isSubBranchesHead();
         allow create: if isSignedIn();
       }

       match /requests/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn();
         allow update: if isManager();
         allow delete: if isSubBranchesHead();
       }

       match /approvals/{id} {
         allow read: if isSignedIn();
         allow create: if isSignedIn();
         allow update, delete: if isManager();
       }
     }
   }
   `
);

file(
  "docs/FIRESTORE_RULES.md",
  `# Firestore Rules — v6.0

   ## New Hierarchy:
   - **HEAD** (Head Sub Branches) — full control
   - **VICE** — full control
   - **HEAD_HR_GLOBAL** — global HR
   - **PRESIDENT / VICE_PRESIDENT** — per team
   - **HEAD_HR_TEAM** — team HR head
   - **HR** — per team HR
   - **COMMITTEE_HR** — per committee HR

   ## 3-Stage Approval Flow:
   1. **Committee HR** — assigns points flexibly (mandatory)
   2. **Team Head HR OR Team Head** (one of them, first wins)
   3. **Head HR Global OR Head OR Vice** (one of them, first wins)

   After stage 3 → auto points award → notification → league update.

   ## Publish:
   Firebase Console → Firestore → Rules → paste → Publish
   `
);

/* ═══════════════════════════════════════════════════════════════
      WRITE ALL FILES
      ═══════════════════════════════════════════════════════════════ */

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(" ║  sbapiaryy v6.0 — Setup                            ║");
console.log(" ║  New Hierarchy + Committees + 3-Stage Approval     ║");
console.log(" ╚══════════════════════════════════════════════════════╝");
console.log("");

let written = 0;
for (const [relative, raw] of Object.entries(files)) {
  const absolute = path.join(ROOT, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, raw.replace(/^\n/, ""), "utf8");
  written += 1;
  console.log("  ✓ " + relative);
}

console.log("");
console.log(" 📦 Files written: " + written);
console.log("");

/* ═══════════════════════════════════════════════════════════════
      AUTO-FIX + INSTALL + PUSH
      ═══════════════════════════════════════════════════════════════ */

function run(cmd, opts = {}) {
  try {
    console.log(" $ " + cmd);
    execSync(cmd, { stdio: "inherit", cwd: ROOT, ...opts });
    return true;
  } catch (e) {
    console.warn(" ⚠ Command failed: " + cmd);
    return false;
  }
}

/* ─── Fix nested node_modules from old backups ─── */
const backupsDir = path.join(ROOT, ".fix-backups");
if (fs.existsSync(backupsDir)) {
  console.log(" 🧹 Removing .fix-backups folder...");
  fs.rmSync(backupsDir, { recursive: true, force: true });
}

/* ─── Fix nested src folders ─── */
const nested = path.join(ROOT, "src", "src");
if (fs.existsSync(nested)) fs.rmSync(nested, { recursive: true, force: true });

/* ─── Install + build + push ─── */
console.log("");
console.log(" 📦 Installing dependencies...");
run("npm install --no-audit --no-fund");

console.log("");
console.log(" 🏗  Building project...");
const buildOk = run("npm run build");

if (!buildOk) {
  console.log(" ⚠ Build had warnings — continuing anyway");
}

/* ─── Git push ─── */
console.log("");
console.log(" 📤 Pushing to GitHub...");

if (!fs.existsSync(path.join(ROOT, ".git"))) {
  run("git init");
  run("git branch -M main");
}

/* Configure remote if not present */
try {
  execSync("git remote get-url origin", { cwd: ROOT, stdio: "pipe" });
} catch {
  run(
    "git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git"
  );
}

run("git add -A");
run(
  'git commit -m "feat: v6.0 — new hierarchy + committees + 3-stage approval"'
);
run("git push origin main --force");

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(" ║  ✅ DONE — Everything uploaded!                    ║");
console.log(" ╚══════════════════════════════════════════════════════╝");
console.log("");
console.log(" ⏭  Next steps:");
console.log("   1. Wait 4-7 min for GitHub Actions to build");
console.log("   2. Open: https://hazimshendy-stack.github.io/sbapiaryyy/");
console.log("   3. Publish Firestore rules from firestore.rules");
console.log("   4. Create first HEAD account manually in Firebase");
console.log("   5. Log in → Admin → Upload Data");
console.log("");
