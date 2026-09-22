import { Link } from 'react-router-dom';
   export function NotFoundPage() {
     return (
       <div className="container notfound">
         <div className="notfound__code">404</div>
         <h2 className="mt-4">Page not found</h2>
         <p className="muted mt-3">The page you are looking for does not exist.</p>
         <div className="row mt-6" style={{ justifyContent: 'center' }}><Link to="/" className="btn btn--primary">Back to Home</Link></div>
       </div>
     );
   }
   