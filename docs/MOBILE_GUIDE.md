# دليل PWA v5.1

   ## ما هو PWA؟

   Progressive Web App — تطبيق ويب يمكن تثبيته على الجوال ويعمل مثل التطبيق الأصلي.

   ## الفوائد

   - ✅ بدون شريط المتصفح
   - ✅ أيقونة على الشاشة الرئيسية
   - ✅ يعمل offline (جزئيًا)
   - ✅ يحفظ الجلسة
   - ✅ أسرع من المتصفح
   - ✅ Push notifications (قريبًا)

   ## التثبيت

   ### Android (Chrome / Edge / Samsung Internet)

   1. افتح الموقع
   2. بعد 30 ثانية سيظهر بانر "ثبّت sbapiaryy"
   3. اضغط **تثبيت**
   4. أو يدويًا: ⋮ → **Install app**

   ### iPhone (Safari فقط)

   1. افتح الموقع في Safari
   2. اضغط زر **Share** (مربع + سهم)
   3. اسحب لأسفل → **Add to Home Screen**
   4. **Add**
   5. ستظهر الأيقونة

   **ملاحظة:** iPhone لا يدعم البانر التلقائي. استخدم الطريقة اليدوية.

   ## بعد التثبيت

   - التطبيق يظهر مع التطبيقات الأخرى
   - يفتح بدون شريط المتصفح
   - يمكن إغلاقه كأي تطبيق
   - يعمل بدون إنترنت (البيانات المحفوظة)

   ## إلغاء التثبيت

   ### Android
   - اضغط مطولًا على أيقونة التطبيق → **Uninstall**

   ### iPhone
   - اضغط مطولًا على الأيقونة → **Remove App** → **Delete**

   ## تقنيات

   - **Manifest:** `public/manifest.json`
   - **Service Worker:** `public/sw.js`
   - **Icons:** `public/icon-192.png` و `public/icon-512.png`

   ## توليد أيقونات حقيقية

   1. اذهب إلى: https://realfavicongenerator.net
   2. ارفع `public/favicon.svg`
   3. حمّل الحزمة
   4. انسخ `icon-192.png` و `icon-512.png` إلى `public/`
   