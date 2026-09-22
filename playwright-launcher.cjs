#!/usr/bin/env node
   /* ═══════════════════════════════════════════════════════════════════════
      playwright-launcher.cjs
      ─────────────────────────────────────────────────────────────────────
      يفتح متصفح Chromium بذكاء:
        1. يجرّب Chrome المثبتين على الجهاز
        2. لو فشلوا → يستخدم Playwright Chromium
        3. يطلع خطأ واضح لو كل حاجة فشلت
      ═══════════════════════════════════════════════════════════════════════ */

   const PW = require('playwright');

   async function launchBrowser(opts = {}) {
     const channels = ["chrome"];
     const errors = [];

     /* ─── جرّب المتصفحات المثبتة أولاً ─── */
     for (const ch of channels) {
       try {
         console.log('   🔵 trying channel: ' + ch + '...');
         const browser = await PW.chromium.launch({
           headless: true,
           channel: ch,
           args: ['--no-sandbox', '--disable-dev-shm-usage'],
           ...opts,
         });
         console.log('   ✅ launched with ' + ch);
         return browser;
       } catch (e) {
         errors.push({ channel: ch, error: e.message.split('\n')[0] });
         console.log('   ⚠ ' + ch + ' failed: ' + e.message.split('\n')[0]);
       }
     }

     /* ─── جرّب Playwright Chromium الافتراضي ─── */
     try {
       console.log('   🔵 trying default playwright chromium...');
       const browser = await PW.chromium.launch({
         headless: true,
         args: ['--no-sandbox', '--disable-dev-shm-usage'],
         ...opts,
       });
       console.log('   ✅ launched with default chromium');
       return browser;
     } catch (e) {
       errors.push({ channel: 'default', error: e.message.split('\n')[0] });
       console.log('   ⚠ default chromium failed: ' + e.message.split('\n')[0]);
     }

     /* ─── كل حاجة فشلت ─── */
     console.error('');
     console.error('   ❌ Could not launch any browser.');
     console.error('');
     errors.forEach((e) => console.error('      · ' + e.channel + ': ' + e.error));
     console.error('');
     throw new Error('No browser could be launched. Try: npx playwright install chromium --force');
   }

   module.exports = { launchBrowser };

   /* ─── اختبار سريع لو شُغّل مباشرة ─── */
   if (require.main === module) {
     (async () => {
       try {
         const b = await launchBrowser();
         const page = await b.newPage();
         await page.goto('about:blank');
         await b.close();
         console.log('');
         console.log('   🎉 Launcher works!');
         process.exit(0);
       } catch (e) {
         console.error('');
         console.error('   ❌ Launcher failed:', e.message);
         process.exit(1);
       }
     })();
   }
   