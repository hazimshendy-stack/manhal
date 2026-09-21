import { useEffect, useState } from 'react';
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
   