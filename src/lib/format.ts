export function cx(...parts: Array<string | false | null | undefined>): string {
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
   