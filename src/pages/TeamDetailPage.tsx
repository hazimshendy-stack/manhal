import { useParams } from 'react-router-dom';
import { teams } from '@/data/teams';
import { useRealtimeCollection } from '@/lib/useRealtimeCollection';
import { hoursToPoints } from '@/lib/format';
import { MemberCard } from '@/components/member/MemberCard';
import { Stat, StatRow } from '@/components/ui/Stat';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotFoundPage } from './NotFoundPage';
import type { Member, TeamId } from '@/types';

export function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>();
  const team = teams.find((t) => t.id === (teamId as TeamId));
  const { data: members } = useRealtimeCollection<Member>('members');

  if (!team) return <NotFoundPage />;

  const teamMembers = members.filter((m) => m.teamIds.includes(team.id));
  const totalHours = teamMembers.reduce((s, m) => s + (m.hours || 0), 0);
  const totalPoints = hoursToPoints(totalHours);
  const avgPoints = teamMembers.length === 0 ? 0 : Math.round(totalPoints / teamMembers.length);

  const board = [...teamMembers]
    .sort((a, b) => hoursToPoints(b.hours) - hoursToPoints(a.hours))
    .map((m, i) => ({ member: m, rank: i + 1, points: hoursToPoints(m.hours) }));

  return (
    <div className="container section--tight">
      <div className="profile">
        <div className="profile__main">
          <h1 className="profile__name">{team.name}</h1>
          <div className="profile__role">{team.description}</div>
        </div>
      </div>
      <section className="section">
        <StatRow>
          <Stat value={teamMembers.length} label="Members" />
          <Stat value={totalPoints} label="Total Points" />
          <Stat value={avgPoints} label="Average Points" />
        </StatRow>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Members" title="Team Members" />
        {teamMembers.length === 0 ? (
          <EmptyState title="No members" message="No members in this team yet." />
        ) : (
          <div className="grid grid--wide">
            {teamMembers.map((m) => <MemberCard key={m.id} member={m} showTeam={false} />)}
          </div>
        )}
      </section>
      <section className="section">
        <SectionHeader eyebrow="Ranking" title="Team Ranking" />
        {board.length === 0 ? (
          <EmptyState title="No data" message="No ranking data yet." />
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>#</th><th>Member</th><th>Hours</th><th>Points</th></tr></thead>
              <tbody>
                {board.map((e) => (
                  <tr key={e.member.id}>
                    <td className={'rank rank--' + (e.rank <= 3 ? e.rank : '')} data-label="Rank">{e.rank}</td>
                    <td data-label="Member" style={{ fontWeight: 700 }}>{e.member.name}</td>
                    <td style={{ fontFamily: 'var(--font-en)' }} data-label="Hours">{e.member.hours}</td>
                    <td className="points" data-label="Points">{e.points}</td>
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