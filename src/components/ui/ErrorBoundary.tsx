import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; info?: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info);
    this.setState({ info: info.componentStack });
  }

  handleClear = () => {
    if ('caches' in window) {
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))));
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    }
    localStorage.clear();
    sessionStorage.clear();
    setTimeout(() => window.location.reload(), 500);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#151A45', color: '#fff', padding: 40, fontFamily: 'system-ui, sans-serif' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ color: '#DC2626', fontSize: '1.8rem', marginBottom: 16 }}>⚠️ Application Error</h1>
            <p style={{ marginBottom: 24, opacity: 0.8 }}>Something went wrong. Below is the error:</p>
            <div style={{ background: '#0a0a0a', padding: 20, borderRadius: 8, marginBottom: 20, overflow: 'auto' }}>
              <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: 8 }}>{this.state.error?.message || 'Unknown'}</div>
              <pre style={{ fontSize: 12, color: '#999', overflow: 'auto', maxHeight: 300 }}>{this.state.error?.stack}</pre>
              {this.state.info ? <pre style={{ fontSize: 11, color: '#666', marginTop: 12 }}>{this.state.info}</pre> : null}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={this.handleClear} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                Clear Cache & Reload
              </button>
              <button type="button" onClick={() => window.location.reload()} style={{ background: '#C1272D', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
