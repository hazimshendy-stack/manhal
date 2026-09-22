import { Component, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
   interface Props { children: ReactNode; }
   interface State { hasError: boolean; error?: Error; }
   export class ErrorBoundary extends Component<Props, State> {
     state: State = { hasError: false };
     static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
     componentDidCatch(error: Error) { console.error('[ErrorBoundary]', error); }
     render() {
       if (this.state.hasError) {
         return (
           <div style={{ minHeight: '100vh', background: '#151A45', color: '#fff', padding: 40, fontFamily: 'system-ui' }}>
             <div style={{ maxWidth: 800, margin: '0 auto' }}>
               <h1 style={{ color: '#DC2626' }}>Application Error</h1>
               <p>{this.state.error?.message || 'Unknown'}</p>
               <pre style={{ fontSize: 12, color: '#999', overflow: 'auto', maxHeight: 300 }}>{this.state.error?.stack}</pre>
               <button onClick={() => { localStorage.clear(); if ('caches' in window) caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))); setTimeout(() => window.location.reload(), 500); }} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer' }}>
                 Clear Cache & Reload
               </button>
             </div>
           </div>
         );
       }
       return this.props.children;
     }
   }
   