import { Component, type ReactNode } from 'react';

   interface Props {
     children: ReactNode;
   }

   interface State {
     hasError: boolean;
     error?: Error;
   }

   export class ErrorBoundary extends Component<Props, State> {
     state: State = { hasError: false };

     static getDerivedStateFromError(error: Error): State {
       return { hasError: true, error };
     }

     componentDidCatch(error: Error) {
       console.error('[sbapiaryy] Error:', error);
     }

     render() {
       if (this.state.hasError) {
         return (
           <div className="notfound">
             <div className="notfound__code">⚠</div>
             <h2 className="mt-4">حدث خطأ غير متوقع</h2>
             <p className="muted mt-3" style={{ maxWidth: '40ch' }}>
               {this.state.error?.message ?? 'حدثت مشكلة. يرجى إعادة المحاولة.'}
             </p>
             <button
               type="button"
               className="btn btn--primary mt-6"
               onClick={() => window.location.reload()}
             >
               إعادة التحميل
             </button>
           </div>
         );
       }
       return this.props.children;
     }
   }
   