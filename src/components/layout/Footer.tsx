import { Link } from 'react-router-dom';
   import { site, activeSeason } from '@/data';

   export function Footer() {
     const year = new Date().getFullYear();

     return (
       <footer className="footer no-print">
         <div className="container">
           <div className="footer__inner">
             <div className="footer__brand-col">
               <div className="footer__brand">{site.name}</div>
               <p className="footer__tagline">
                 {site.description}
               </p>
               <div className="footer__copyright">
                 © {year} {site.organization} — {activeSeason.label}
               </div>
             </div>

             <div className="footer__links-col">
               <div>
                 <div className="footer__group-title">التصفح</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/">الرئيسية</Link>
                   <Link className="footer__link" to="/members">الأعضاء</Link>
                   <Link className="footer__link" to="/teams">الفرق</Link>
                   <Link className="footer__link" to="/league">الليج</Link>
                 </div>
               </div>

               <div>
                 <div className="footer__group-title">المنصة</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/committees">اللجان</Link>
                   <Link className="footer__link" to="/achievements">الإنجازات</Link>
                   <Link className="footer__link" to="/calendar">التقويم</Link>
                   <Link className="footer__link" to="/search">بحث</Link>
                 </div>
               </div>

               <div>
                 <div className="footer__group-title">عن المنظمة</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/about">عن المنحل</Link>
                   <Link className="footer__link" to="/governance">الحوكمة</Link>
                   <Link className="footer__link" to="/login">تسجيل الدخول</Link>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </footer>
     );
   }
   