import { useMemo, useState } from 'react';
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

  const visibleEvents = useMemo(() => {
    if (!user) return [];
    return allEvents.filter((e) => {
      if (e.isPublic) return true;
      if (seesAllTeams(user)) return true;
      return e.teamId === user.teamId;
    });
  }, [allEvents, user]);

  const eventsByMonth = useMemo(() => visibleEvents.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }), [visibleEvents, year, month]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return visibleEvents.filter((e) => e.date === selectedDate).sort((a, b) => (a.time || '') > (b.time || '') ? 1 : -1);
  }, [visibleEvents, selectedDate]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1); };

  if (loading) return <Loading fullHeight message="Loading calendar..." />;
  if (!user) return null;

  return (
    <div className="container">
      <PageHeader eyebrow="Schedule" title="Calendar" description="Public events and your team's events." />
      <section className="section">
        <CalendarGrid year={year} month={month} events={eventsByMonth} selectedDate={selectedDate ?? undefined} onSelectDate={setSelectedDate} onPrevMonth={prevMonth} onNextMonth={nextMonth} />
      </section>
      <section className="section">
        <SectionHeader eyebrow={selectedDate ? formatDate(selectedDate) : ''} title={selectedEvents.length === 0 ? 'No events' : 'Events (' + selectedEvents.length + ')'} />
        {selectedEvents.length === 0 ? (
          <EmptyState title="No events" message="Pick another day from the calendar." />
        ) : (
          <div className="stack">
            {selectedEvents.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>
    </div>
  );
}