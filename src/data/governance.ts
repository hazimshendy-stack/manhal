import type { GovernanceDocument } from '@/types';

/**
 * لا توجد وثائق افتراضية.
 * الأدمن يضيف السياسات من /admin/governance.
 * المستخدم العادي يرى فقط ما أضافه الأدمن.
 */
export const governanceDocuments: GovernanceDocument[] = [];
