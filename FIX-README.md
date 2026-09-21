# sbapiaryy — fix.cjs (v5.2)

## طريقة التشغيل

```bash
node fix.cjs              # تطبيق التعديلات + نسخة احتياطية
node fix.cjs --dry        # معاينة فقط بدون تطبيق
node fix.cjs --no-backup  # بدون نسخة احتياطية
```

## الملفات المعدّلة

### Layout & Spacing
- `src/styles/layout.css` — padding أفضل لكل الصفحات
- `src/styles/v52-fix.css` — تصحيحات نهائية شاملة

### Avatar & Members
- `src/components/ui/Avatar.tsx` — بدون initials، Placeholder احترافي
- `src/components/member/MemberCard.tsx` — الاسم كامل + تنسيق منظم
- `src/styles/member-card.css` — أنماط العضو الجديدة

### Admin (بدون أيقونات)
- `src/pages/admin/AdminHomePage.tsx`
- `src/pages/admin/AdminAnalyticsPage.tsx`
- `src/pages/admin/AdminContributionsPage.tsx`
- `src/pages/admin/AdminRequestsPage.tsx` (جديد)
- `src/pages/admin/AdminGovernancePage.tsx` (جديد)
- `src/components/layout/Sidebar.tsx` — بدون أيقونات

### Governance
- `src/pages/GovernancePage.tsx` — يعرض من الداتا فقط
- `src/data/governance.ts` — فاضي (الأدمن يضيف)

### Onboarding
- `src/components/onboarding/Onboarding.tsx` — خلفية بيضا
- `src/styles/onboarding.css` — Flash Cards
- `src/data/onboarding.ts` — بدون أيقونات

### PWA
- `src/components/pwa/PwaInstallBanner.tsx` — احترافي
- `src/styles/pwa.css` — تصميم محسّن

### Chat
- `src/pages/ConversationsPage.tsx` — إضافة محادثة جديدة
- `src/styles/chat-additions.css` — زر جديد + موبايل

### Search & Notifications
- `src/pages/SearchPage.tsx` — بدون أيقونات
- `src/components/notification/NotificationItem.tsx` — بدون أيقونات

### Data
- `src/data/teams.ts` — إنجليزي فقط
- `src/pages/HomePage.tsx` — داتا حقيقية
- `src/components/team/TeamCard.tsx` — داتا حقيقية

### GitHub
- `.github/workflows/auto-fix.yml` — يشتغل تلقائيًا

## ⚠️ Patch يدوي صغير
راجع `src/App.tsx.patch.md` — إضافة مساري:
- `/admin/requests`
- `/admin/governance`

## النسخ الاحتياطية
كل تعديل بينسخ الملف الأصلي في `.fix-backups/<timestamp>/`
