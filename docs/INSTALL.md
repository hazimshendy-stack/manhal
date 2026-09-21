# دليل التثبيت — sbapiaryy v5.1

   ## قبل البدء

   1. حساب GitHub
   2. حساب Firebase
   3. Node.js 18+ مثبت على جهازك
   4. Git مثبت

   ## ═══════════ 1. استبدال الملفات على GitHub ═══════════

   ### الطريقة الأسرع — من GitHub Web

   #### أ) احفظ setup.js

   انسخ الكود من الأجزاء 1-10 إلى ملف واحد باسم `setup.js`.

   #### ب) شغّله محليًا

   ```bash
   mkdir sbapiaryy-v51
   cd sbapiaryy-v51
   # انسخ setup.js هنا
   node setup.js
   ```

   سيكوّن المشروع كاملًا.

   #### ج) ارفع إلى GitHub

   ```bash
   git init
   git branch -M main
   git remote add origin https://github.com/hazimshendy-stack/sbapiaryyy.git
   git add .
   git commit -m "feat: v5.1 complete rebuild"
   git push origin main --force
   ```

   ### الطريقة اليدوية — على GitHub Web

   **8 ملفات فقط تحتاج تعديل:**

   1. `src/components/layout/Navbar.tsx` — Navbar مبسّط
   2. `src/components/layout/Sidebar.tsx` — Drawer على الجوال
   3. `src/pages/LoginPage.tsx` — بدون demo accounts
   4. `src/pages/NotificationsPage.tsx` — تصميم جديد
   5. `src/pages/ConversationsPage.tsx` — Messenger style
   6. `src/pages/CalendarPage.tsx` — تقويم حقيقي
   7. `src/App.tsx` — routing محدث
   8. `src/main.tsx` — إعادة توجيه CSS

   **ملفات جديدة تحتاج إنشاء:**

   1. `src/styles/*.css` (24 ملف CSS)
   2. `src/components/onboarding/Onboarding.tsx`
   3. `src/components/pwa/PwaInstallBanner.tsx`
   4. `src/components/layout/BottomNav.tsx`
   5. `src/components/chat/*.tsx` (3 ملفات)
   6. `src/components/calendar/CalendarGrid.tsx`
   7. `public/manifest.json`
   8. `public/sw.js`

   ## ═══════════ 2. Firebase Setup ═══════════

   ### أ) مشروع Firebase

   1. https://console.firebase.google.com
   2. Add project → sbapiaryy
   3. Disable Analytics

   ### ب) Authentication

   - Build → Authentication → Get started
   - Sign-in method → **Email/Password** → Enable → Save

   ### ج) Firestore

   - Build → Firestore Database → Create
   - **Production mode**
   - Location: `me-central1`
   - Enable

   ### د) Firestore Rules

   - Firestore → Rules
   - انسخ من `docs/FIRESTORE_RULES.md`
   - Publish

   ### هـ) Firebase Config

   - Project Settings → General → Your apps → Web
   - انسخ `firebaseConfig`

   ## ═══════════ 3. ملف .env ═══════════

   أنشئ ملف `.env` في جذر المشروع:

   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=sbapiaryy.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=sbapiaryy
   VITE_FIREBASE_STORAGE_BUCKET=sbapiaryy.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc...
   ```

   ## ═══════════ 4. GitHub Secrets ═══════════

   - GitHub repo → Settings → Secrets and variables → Actions
   - أضف 6 أسرار بنفس الأسماء أعلاه

   ## ═══════════ 5. GitHub Pages ═══════════

   - Settings → Pages
   - Source: **GitHub Actions**

   ## ═══════════ 6. Firebase Authorized Domains ═══════════

   - Firebase → Authentication → Settings → Authorized domains
   - Add: `hazimshendy-stack.github.io`

   ## ═══════════ 7. أول حساب Head ═══════════

   1. انتظر GitHub Actions (5-7 دقائق)
   2. افتح `https://hazimshendy-stack.github.io/sbapiaryyy/#/login`
   3. **لا يمكن التسجيل من الواجهة** (حسابات تُنشأ من الأدمن فقط)
   4. أنشئ أول حساب يدويًا:

   ### أ) من Firebase Console → Authentication → Users

   - Add user → email + password
   - انسخ الـ UID

   ### ب) من Firestore → users

   - Add document → ID = UID
   - أضف الحقول:
     ```
     uid: "UID"
     email: "your@email.com"
     displayName: "اسمك"
     role: "HEAD"
     teamId: null
     committeeIds: []
     memberId: null
     createdAt: "2026-01-01T00:00:00.000Z"
     emailVerified: true
     mustChangePassword: false
     ```

   ### ج) سجّل دخول

   - افتح الموقع
   - البريد + كلمة المرور
   - اذهب إلى `/admin`
   - اضغط **رفع البيانات**

   ## ═══════════ 8. تثبيت التطبيق على الجوال ═══════════

   ### Android (Chrome)

   1. افتح الموقع في Chrome
   2. ⋮ → **Install app**
   3. ستظهر أيقونة sbapiaryy على الشاشة

   ### iPhone (Safari)

   1. افتح الموقع في **Safari** (ليس Chrome)
   2. Share → **Add to Home Screen**
   3. **Add**

   ## ═══════════ 9. إنشاء أول عضو من الأدمن ═══════════

   1. `/admin/users` → **+ مستخدم جديد**
   2. املأ:
      - الاسم
      - البريد
      - كلمة مرور مؤقتة (توليد تلقائي متاح)
      - الدور
      - الفريق
      - اللجان
   3. **إنشاء**
   4. سترى كلمة المرور في نافذة
   5. أرسلها للعضو

   العضو يسجّل دخول → يُطلب منه تغيير كلمة المرور → يبدأ.

   ## ═══════════ إعادة الرفع بعد التعديل ═══════════

   ```bash
   cd sbapiaryy-v51
   git add .
   git commit -m "update"
   git push origin main
   ```

   GitHub Actions يبني وينشر تلقائيًا.
   