export function cx(...p: Array<string | false | null | undefined>): string { return p.filter(Boolean).join(' '); }
export function formatDate(iso: string): string { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return iso; return d.toLocaleDateString('ar-EG', { day: '2-digit', month: 'long', year: 'numeric' }); }
export function formatDateTime(iso: string): string { if (!iso) return '—'; const d = new Date(iso); if (isNaN(d.getTime())) return iso; return d.toLocaleString('ar-EG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
export function formatTime(iso: string): string { if (!iso) return ''; const d = new Date(iso); if (isNaN(d.getTime())) return ''; return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }); }
export function relativeTime(iso: string): string { if (!iso) return ''; const d = new Date(iso).getTime(); const m = Math.floor((Date.now() - d) / 60000); const h = Math.floor(m / 60); const dy = Math.floor(h / 24); if (m < 1) return 'الآن'; if (m < 60) return 'قبل ' + m + ' دقيقة'; if (h < 24) return 'قبل ' + h + ' ساعة'; if (dy < 30) return 'قبل ' + dy + ' يوم'; return formatDate(iso); }
export function initials(name: string): string { const t = name.trim(); const parts: string[] = []; let c = ''; for (let i = 0; i < t.length; i++) { const ch = t[i]; if (ch === ' ') { if (c) { parts.push(c); c = ''; } } else c += ch; } if (c) parts.push(c); if (!parts.length) return '?'; if (parts.length === 1) return parts[0].slice(0, 2); return (parts[0][0] + parts[parts.length - 1][0]).trim(); }
export function hoursToPoints(h: number): number { return Math.round(h * 5); }
export function truncate(t: string, l = 90): string { return t.length <= l ? t : t.slice(0, l) + '...'; }
export function today(): string { return new Date().toISOString().slice(0, 10); }
const AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
export function getArabicMonth(m: number): string { return AR[m]; }
export function getDaysInMonth(y: number, m: number): number { return new Date(y, m + 1, 0).getDate(); }
export function getFirstWeekdayOfMonth(y: number, m: number): number { return new Date(y, m, 1).getDay(); }
export const REQUEST_TYPE_LABEL: Record<string, string> = { TRANSFER: 'نقل', PROMOTION: 'ترقية', RESIGNATION: 'استقالة', COMPLAINT: 'شكوى', SUGGESTION: 'اقتراح', LEAVE: 'إجازة' };
export const REQUEST_STATUS_LABEL: Record<string, string> = { PENDING: 'قيد الانتظار', IN_REVIEW: 'قيد المراجعة', APPROVED: 'معتمد', REJECTED: 'مرفوض', CANCELLED: 'ملغى', COMPLETED: 'مكتمل' };
export const PRIORITY_LABEL: Record<string, string> = { LOW: 'منخفضة', NORMAL: 'عادية', HIGH: 'مرتفعة', URGENT: 'عاجلة' };
export const APPROVAL_STATUS_LABEL: Record<string, string> = { PENDING: 'بانتظار', APPROVED: 'موافق', REJECTED: 'مرفوض', SKIPPED: 'تم تخطيه' };
