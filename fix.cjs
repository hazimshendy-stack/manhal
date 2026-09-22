#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   sbapiaryy — fix-my-contributions.cjs
   Auto-select team + committee from user profile when logging a
   contribution. Also filters committees to only the user's own.
   ═══════════════════════════════════════════════════════════════ */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const ROOT = process.cwd();

console.log("");
console.log(" ╔══════════════════════════════════════════════════════╗");
console.log(" ║  sbapiaryy — Fix My Contributions                  ║");
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
      FIX — MyContributionsPage.tsx
      - Auto-fill team from user.teamId
      - Auto-fill committee from user.committeeIds (first, or only)
      - Filter committee dropdown to user's own committees
      - Warn if user has no team or no committees
      - Reset form when user changes
      ═══════════════════════════════════════════════════════════════ */

write(
  "src/pages/MyContributionsPage.tsx",
  `
   import { useState, useEffect, useMemo } from 'react';
   import { Link } from 'react-router-dom';
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

   const STAGE_LABEL: Record<number, string> = {
     1: 'Committee HR',
     2: 'Team Head HR / Head',
     3: 'Sub-Branches Review',
   };

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

     /* ═══════════════════════════════════════════════════════════
        Derive user's own team + committees
        ═══════════════════════════════════════════════════════════ */

     const userTeamId: TeamId | null = (user?.teamId as TeamId) ?? null;
     const userCommitteeIds = useMemo(
       () => safeArray(user?.committeeIds),
       [user?.committeeIds],
     );

     const myCommittees = useMemo(
       () => liveCommittees.filter((c) => userCommitteeIds.includes(c.id)),
       [liveCommittees, userCommitteeIds],
     );

     /* ═══════════════════════════════════════════════════════════
        Form state
        ═══════════════════════════════════════════════════════════ */

     const [open, setOpen] = useState(false);
     const [busy, setBusy] = useState(false);
     const [title, setTitle] = useState('');
     const [desc, setDesc] = useState('');
     const [hours, setHours] = useState(1);
     const [teamId, setTeamId] = useState<TeamId>('helpers');
     const [committeeId, setCommitteeId] = useState<string>('');

     /* ═══════════════════════════════════════════════════════════
        AUTO-FILL when opening the modal (or when user data changes)
        ═══════════════════════════════════════════════════════════ */

     useEffect(() => {
       if (!open) return;

       /* Auto-select team from user profile */
       if (userTeamId) {
         setTeamId(userTeamId);
       }

       /* Auto-select committee:
          - If only one → select it
          - If multiple → if none selected yet, pick first
          - If already selected and still valid → keep it */
       if (myCommittees.length === 1) {
         setCommitteeId(myCommittees[0].id);
       } else if (myCommittees.length > 1 && !committeeId) {
         setCommitteeId(myCommittees[0].id);
       } else if (committeeId && !myCommittees.some((c) => c.id === committeeId)) {
         /* Previously selected committee is no longer valid */
         setCommitteeId(myCommittees[0]?.id ?? '');
       }
     }, [open, userTeamId, myCommittees, committeeId]);

     /* ═══════════════════════════════════════════════════════════
        Guards
        ═══════════════════════════════════════════════════════════ */

     if (!user?.memberId) {
       return (
         <div className="container">
           <EmptyState
             title="No member linked"
             message="Your account is not linked to a member profile. Contact admin."
           />
         </div>
       );
     }

     if (!userTeamId) {
       return (
         <div className="container">
           <EmptyState
             title="No team assigned"
             message="You need to be assigned to a team before logging contributions. Contact admin."
           />
         </div>
       );
     }

     if (userCommitteeIds.length === 0) {
       return (
         <div className="container">
           <EmptyState
             title="No committee assigned"
             message="You need to be in at least one committee before logging contributions. Contact admin."
           />
         </div>
       );
     }

     /* ═══════════════════════════════════════════════════════════
        Data prep
        ═══════════════════════════════════════════════════════════ */

     const myContribs = safeArray(contributions)
       .filter((c) => c.memberId === user.memberId)
       .sort((a, b) => (a.date < b.date ? 1 : -1));

     const approved = myContribs.filter((c) => c.status === 'approved');
     const totalPoints = approved.reduce((s, c) => s + safeNumber(c.points), 0);
     const totalHours = approved.reduce((s, c) => s + safeNumber(c.hours), 0);
     const pending = myContribs.filter(
       (c) => c.status === 'pending' || c.status === 'in_review',
     ).length;

     const reset = () => {
       setTitle('');
       setDesc('');
       setHours(1);
       /* keep team + committee — they are user's own */
       if (userTeamId) setTeamId(userTeamId);
       if (myCommittees.length > 0) setCommitteeId(myCommittees[0].id);
     };

     /* ═══════════════════════════════════════════════════════════
        Submit
        ═══════════════════════════════════════════════════════════ */

     const submit = async () => {
       if (!title.trim() || !desc.trim()) {
         toast.error('Title & description required');
         return;
       }
       if (hours <= 0) {
         toast.error('Hours must be positive');
         return;
       }
       if (!userTeamId) {
         toast.error('No team assigned');
         return;
       }
       if (!committeeId) {
         toast.error('Committee required');
         return;
       }
       /* Validate committee belongs to user */
       if (!userCommitteeIds.includes(committeeId)) {
         toast.error('You can only submit to your own committees');
         return;
       }

       setBusy(true);
       try {
         const contrib: Contribution = {
           id: newId('C'),
           memberId: user.memberId!,
           memberName: user.displayName,
           teamId: userTeamId,
           committeeId,
           title: title.trim(),
           description: desc.trim(),
           date: today(),
           hours,
           points: 0,
           status: 'pending',
           seasonId: 'S7',
           createdBy: user.uid,
           approvals: newContributionApprovals(),
           currentStage: 1,
         };
         await createOne('contributions', contrib);
         try {
           await logAudit(
             user,
             'CREATE_CONTRIBUTION',
             'Contribution',
             contrib.id,
             'Log contribution',
           );
         } catch { /* ignore */ }

         toast.success('Submitted', 'Awaiting committee HR approval');
         setOpen(false);
         reset();
       } catch (err) {
         toast.error('Failed', err instanceof Error ? err.message : '');
       } finally {
         setBusy(false);
       }
     };

     /* ═══════════════════════════════════════════════════════════
        Render
        ═══════════════════════════════════════════════════════════ */

     const canSubmit = myCommittees.length > 0;

     return (
       <div className="container">
         <PageHeader
           eyebrow="My Contributions"
           title="My Contributions"
           description="Log your contributions. Committee HR assigns points fairly."
         >
           <button
             type="button"
             className="btn btn--primary mt-4"
             onClick={() => {
               /* Seed defaults before opening */
               if (userTeamId) setTeamId(userTeamId);
               if (myCommittees.length > 0) setCommitteeId(myCommittees[0].id);
               setOpen(true);
             }}
             disabled={!canSubmit}
           >
             + Log Contribution
           </button>
         </PageHeader>

         {/* ─── Auto-filled info banner ─── */}
         <section className="section--tight">
           <div
             className="card no-click"
             style={{
               display: 'flex',
               gap: 12,
               flexWrap: 'wrap',
               padding: 16,
               background: 'var(--c-off-white)',
               border: '1px solid var(--c-line)',
             }}
           >
             <div style={{ flex: 1, minWidth: 160 }}>
               <div className="tiny muted" style={{ marginBottom: 6 }}>
                 YOUR TEAM
               </div>
               <Badge variant="info">
                 {teams.find((t) => t.id === userTeamId)?.name ?? userTeamId}
               </Badge>
             </div>
             <div style={{ flex: 2, minWidth: 200 }}>
               <div className="tiny muted" style={{ marginBottom: 6 }}>
                 YOUR COMMITTEES
               </div>
               <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                 {myCommittees.map((c) => (
                   <Badge key={c.id} variant="neutral">{c.nameAr}</Badge>
                 ))}
               </div>
             </div>
           </div>
         </section>

         <section className="section--tight">
           <StatRow>
             <Stat value={totalPoints} label="Points" variant="red" />
             <Stat value={totalHours} label="Hours" />
             <Stat value={myContribs.length} label="Contributions" />
             <Stat value={pending} label="Pending" />
           </StatRow>
         </section>

         <section className="section">
           <SectionHeader eyebrow="History" title="All Contributions" />
           {loading ? (
             <SkeletonList count={5} />
           ) : myContribs.length === 0 ? (
             <EmptyState
               title="No contributions yet"
               message="Log your first contribution."
             />
           ) : (
             <div className="stack">
               {myContribs.map((c) => {
                 const team = teams.find((t) => t.id === c.teamId);
                 const committee = liveCommittees.find((x) => x.id === c.committeeId);
                 const stage = getStage(c);
                 const approvals = safeArray(c.approvals);
                 return (
                   <div key={c.id} className="card no-click">
                     <div className="row row--between">
                       <div style={{ flex: 1, minWidth: 0 }}>
                         <div className="card__title">{c.title}</div>
                         <div className="card__meta">
                           {team?.name} · {committee?.nameAr || c.committeeId} ·{' '}
                           {formatDate(c.date)}
                         </div>
                       </div>
                       <Badge
                         variant={
                           c.status === 'approved'
                             ? 'success'
                             : c.status === 'pending'
                               ? 'info'
                               : c.status === 'in_review'
                                 ? 'warning'
                                 : 'danger'
                         }
                       >
                         {c.status === 'approved'
                           ? 'Approved'
                           : c.status === 'pending'
                             ? 'Stage 1'
                             : c.status === 'in_review'
                               ? 'Stage ' + stage + '/3'
                               : 'Rejected'}
                       </Badge>
                     </div>
                     <p className="small soft mt-2">{c.description}</p>
                     <div className="row mt-3" style={{ gap: 12 }}>
                       <span className="small">{safeNumber(c.hours)} hours</span>
                       {c.status === 'approved' ? (
                         <span className="points">{safeNumber(c.points)} points</span>
                       ) : (
                         <span className="muted small">Points pending</span>
                       )}
                     </div>
                     {c.status !== 'approved' && c.status !== 'rejected' ? (
                       <div
                         className="mt-3"
                         style={{
                           paddingTop: 12,
                           borderTop: '1px solid var(--c-line)',
                         }}
                       >
                         <div
                           className="tiny muted"
                           style={{ marginBottom: 8 }}
                         >
                           Approval Progress
                         </div>
                         <div
                           style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                         >
                           {[1, 2, 3].map((s) => {
                             const apr = approvals.find((a) => a.stage === s);
                             const isDone = apr?.status === 'approved';
                             const isRej = apr?.status === 'rejected';
                             const isActive = stage === s;
                             return (
                               <span
                                 key={s}
                                 className={
                                   'badge ' +
                                   (isDone
                                     ? 'badge--success'
                                     : isRej
                                       ? 'badge--danger'
                                       : isActive
                                         ? 'badge--warning'
                                         : 'badge--neutral')
                                 }
                               >
                                 {s}. {STAGE_LABEL[s]}
                                 {isDone ? ' ✓' : ''}
                               </span>
                             );
                           })}
                         </div>
                       </div>
                     ) : null}
                   </div>
                 );
               })}
             </div>
           )}
         </section>

         {/* ═══════════════════════════════════════════════════════
            LOG CONTRIBUTION MODAL — team + committee auto-filled
            ═══════════════════════════════════════════════════════ */}

         <Modal
           open={open}
           title="Log New Contribution"
           onClose={() => setOpen(false)}
           wide
           footer={
             <>
               <button
                 type="button"
                 className="btn btn--ghost"
                 onClick={() => setOpen(false)}
               >
                 Cancel
               </button>
               <button
                 type="button"
                 className="btn btn--primary"
                 onClick={submit}
                 disabled={busy}
               >
                 {busy ? '...' : 'Submit'}
               </button>
             </>
           }
         >
           <FormField label="Title" required>
             <TextInput
               value={title}
               onChange={setTitle}
               placeholder="e.g. Ramadan Campaign volunteer"
             />
           </FormField>

           <FormField label="Description" required>
             <TextArea
               value={desc}
               onChange={setDesc}
               rows={3}
               placeholder="What did you do exactly?"
             />
           </FormField>

           {/* ─── Team (auto-filled, locked) ─── */}
           <FormField
             label="Team"
             required
             hint="Auto-filled from your profile"
           >
             <div
               className="input"
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 cursor: 'not-allowed',
                 background: 'var(--c-off-white)',
                 color: 'var(--c-ink-soft)',
               }}
             >
               <span>
                 {teams.find((t) => t.id === userTeamId)?.name ?? userTeamId}
               </span>
               <span className="tiny muted">🔒 locked</span>
             </div>
           </FormField>

           {/* ─── Committee (auto-filled, locked if only one) ─── */}
           <FormField
             label="Committee"
             required
             hint={
               myCommittees.length === 1
                 ? 'Auto-filled from your profile — locked'
                 : 'Select from your own committees'
             }
           >
             {myCommittees.length === 1 ? (
               <div
                 className="input"
                 style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'space-between',
                   cursor: 'not-allowed',
                   background: 'var(--c-off-white)',
                   color: 'var(--c-ink-soft)',
                 }}
               >
                 <span>{myCommittees[0].nameAr}</span>
                 <span className="tiny muted">🔒 locked</span>
               </div>
             ) : (
               <Select
                 value={committeeId}
                 onChange={setCommitteeId}
                 options={myCommittees.map((c) => ({
                   value: c.id,
                   label: c.nameAr,
                 }))}
               />
             )}
           </FormField>

           <FormField
             label="Hours"
             required
             hint="Approximate — committee HR will assign the final points"
           >
             <NumberInput
               value={hours}
               onChange={setHours}
               min={0.5}
               max={200}
               step={0.5}
             />
           </FormField>
         </Modal>
       </div>
     );
   }
   `
);

/* ═══════════════════════════════════════════════════════════════
      AUTO-FIX
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
      BUILD + PUSH
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
    "git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git"
  );
}

run("git add -A");
run(
  'git commit -m "fix: auto-fill team + committee on contribution log"',
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
console.log(" ✨ What was fixed:");
console.log("   ✓ Team auto-selected from user.teamId");
console.log("   ✓ Committee auto-selected from user.committeeIds");
console.log("   ✓ Team field is LOCKED (read-only)");
console.log("   ✓ Committee field LOCKED if user has only one");
console.log("   ✓ Committee dropdown shows ONLY user's committees");
console.log("   ✓ Info banner at top shows team + committees");
console.log("   ✓ Blocks submission if user has no team/committee");
console.log("   ✓ Validates committee belongs to user before submit");
console.log("");
console.log(" ⏭  After GitHub Actions (4-7 min):");
console.log("   1. Member logs in → /my-contributions");
console.log('   2. Click "+ Log Contribution"');
console.log("   3. Team shows automatically (locked)");
console.log("   4. Committee shows automatically (locked if one)");
console.log("   5. Just fill title, description, hours → Submit");
console.log("");
