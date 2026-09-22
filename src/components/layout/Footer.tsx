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
               <p className="footer__tagline">{site.description}</p>
               <div className="footer__copyright">© {year} {site.organization} — {activeSeason.label}</div>
             </div>
             <div className="footer__links-col">
               <div>
                 <div className="footer__group-title">Browse</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/">Home</Link>
                   <Link className="footer__link" to="/members">Members</Link>
                   <Link className="footer__link" to="/teams">Teams</Link>
                   <Link className="footer__link" to="/committees">Committees</Link>
                   <Link className="footer__link" to="/league">League</Link>
                 </div>
               </div>
               <div>
                 <div className="footer__group-title">Platform</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/achievements">Achievements</Link>
                   <Link className="footer__link" to="/calendar">Calendar</Link>
                   <Link className="footer__link" to="/search">Search</Link>
                 </div>
               </div>
               <div>
                 <div className="footer__group-title">About</div>
                 <div className="footer__links">
                   <Link className="footer__link" to="/about">About</Link>
                   <Link className="footer__link" to="/governance">Governance</Link>
                   <Link className="footer__link" to="/login">Login</Link>
                 </div>
               </div>
             </div>
           </div>
         </div>
       </footer>
     );
   }
   