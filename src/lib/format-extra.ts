/* تسميات عربية إضافية */

export const REQUEST_TYPE_LABEL_FULL: Record<string, string> = {
  TRANSFER: 'نقل بين الفرق',
  PROMOTION: 'ترقية',
  RESIGNATION: 'استقالة',
  COMPLAINT: 'شكوى',
  SUGGESTION: 'اقتراح',
  LEAVE: 'إجازة',
};

export const REQUEST_STATUS_LABEL_FULL: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  IN_REVIEW: 'قيد المراجعة',
  APPROVED: 'معتمد',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغى',
  COMPLETED: 'مكتمل',
};

export const PRIORITY_LABEL_FULL: Record<string, string> = {
  LOW: 'منخفضة',
  NORMAL: 'عادية',
  HIGH: 'مرتفعة',
  URGENT: 'عاجلة',
};

export const WARNING_TYPE_LABEL: Record<string, string> = {
  VERBAL: 'تحذير شفهي',
  WRITTEN: 'تحذير كتابي',
  FINAL: 'تحذير نهائي',
};

export const WARNING_SEVERITY_LABEL: Record<string, string> = {
  LOW: 'منخفضة',
  MEDIUM: 'متوسطة',
  HIGH: 'مرتفعة',
};

export const CONTRIB_STATUS_LABEL: Record<string, string> = {
  pending: 'معلّقة',
  approved: 'معتمدة',
  rejected: 'مرفوضة',
};
