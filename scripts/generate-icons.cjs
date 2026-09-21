// يستخدم هذا السكربت لتوليد أيقونات PNG من SVG
// يمكن تجاهله إذا كانت الأيقونات موجودة
const fs = require('fs');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#151A45"/>
  <text x="256" y="360" font-family="Space Grotesk, sans-serif" font-size="300" font-weight="800" fill="#C1272D" text-anchor="middle">S</text>
</svg>`;

console.log('');
console.log('  ℹ️  لتوليد أيقونات PWA حقيقية:');
console.log('');
console.log('  1. اذهب إلى: https://realfavicongenerator.net');
console.log('  2. ارفع favicon.svg');
console.log('  3. حمّل الحزمة');
console.log('  4. انسخ icon-192.png و icon-512.png إلى مجلد public/');
console.log('');
console.log('  أو استخدم أي أداة تحويل SVG → PNG.');
console.log('');
console.log('  SVG المستخدم:');
console.log(svg);
