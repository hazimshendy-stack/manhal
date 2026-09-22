import { Link } from 'react-router-dom';
   import { site, activeSeason } from '@/data';
import { Footer } from '@/components/layout/Footer';
import { login } from '@/lib/auth';
import { site } from '@/data/site';
import { activeSeason } from '@/data/site';
import { teams } from '@/data/teams';
import { committees } from '@/data/committees';
import { members } from '@/data/members';
import { achievements } from '@/data/achievements';

   export function Footer() {
     const year = new Date().getFullYear();

     return (
       <footer className="footer no-print">
         <div className="container">
           <div className="footer__inner">
             <div className="footer__brand-col">
               <img
                 src="./logo.png"
                 alt={site.name}
                 className="footer__logo"
                 onError={(e) => {
                   const img = e.currentTarget as HTMLImageElement;
                   img.style.display = 'none';
                 }}
               />
               <p className="footer__tagline">{site.description}</p>
               <div className="footer__copyright">
                 © {year} {site.organization} — {activeSeason.label}
               </div>
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
   