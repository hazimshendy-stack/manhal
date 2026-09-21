# استبدال الملفات على GitHub بضغطة واحدة

## طريقة 1: GitHub Web UI (يدويًا — 5 دقائق)

لكل ملف:
1. افتح `https://github.com/hazimshendy-stack/sbapiaryyy/blob/main/<path>`
2. اضغط أيقونة **القلم** (Edit)
3. **Ctrl + A** ثم **Delete**
4. الصق المحتوى الجديد
5. **Commit changes**

للملفات الجديدة:
1. افتح `https://github.com/hazimshendy-stack/sbapiaryyy/new/main/<folder>`
2. اكتب اسم الملف
3. الصق المحتوى
4. **Commit changes**

## طريقة 2: Git Push (10 دقائق)

على جهازك:
```bash
cd C:\Users\Shendyy\sssb
# انسخ الملفات الجديدة من setup.js إليها
git add .
git commit -m "feat: v5.1 complete rebuild"
git push origin main --force
```

## طريقة 3: GitHub Desktop (5 دقائق)

1. افتح GitHub Desktop
2. اختر Repository: sbapiaryyy
3. انسخ الملفات إلى مجلد المشروع
4. سيظهر كل ملف معدّل
5. اكتب رسالة: `v5.1 rebuild`
6. **Commit to main**
7. **Push origin**

## طريقة 4: السكربت التلقائي

شغّل:
```bash
node setup.js
git add .
git commit -m "v5.1"
git push origin main --force
```

## ملاحظة مهمة
- بعد كل push، GitHub Actions يبني تلقائيًا
- انتظر 4-7 دقائق
- افتح Actions للمراقبة
