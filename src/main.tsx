import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  document.body.innerHTML = '<div style="padding:40px;font-family:system-ui;color:#C1272D"><h1>Fatal: #root not found</h1></div>';
  throw new Error('#root not found');
}

try {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (err) {
  console.error('[Fatal] Render failed:', err);
  rootEl.innerHTML = '<div style="padding:40px;font-family:system-ui;color:#C1272D"><h1>App crashed</h1><pre>' + String(err) + '</pre></div>';
}
