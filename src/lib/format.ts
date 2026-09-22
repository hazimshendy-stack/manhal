export function cx(...p: Array<string | false | null | undefined>): string {
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
     const parts = name.trim().split(/\s+/).filter(Boolean);
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
   