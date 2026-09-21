import type { CalendarEvent } from '@/types';
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
   