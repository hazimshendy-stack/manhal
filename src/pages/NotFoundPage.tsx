import { Link } from 'react-router-dom';

   export function NotFoundPage() {
     return (
       <div className="container notfound">
         <div className="notfound__code">404</div>
         <h2 className="mt-4">الصفحة غير موجودة</h2>
         <p
           className="muted mt-3"
           style={{ maxWidth: '40ch', lineHeight: 1.7 }}
         >
           الرابط الذي فتحته غير صحيح أو تم نقل الصفحة.
         </p>
         <div className="row mt-6" style={{ justifyContent: 'center' }}>
           <Link to="/" className="btn btn--primary">
             العودة للرئيسية
           </Link>
         </div>
       </div>
     );
   }
   