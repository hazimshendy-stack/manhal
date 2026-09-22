import { Link } from 'react-router-dom';
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
   