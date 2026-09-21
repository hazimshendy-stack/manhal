import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';
import { initAutoUpdate } from './lib/autoUpdate';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/* ═══════════════════════════════════════════════════════════════
   Auto-Update — كل ما ترفع نسخة جديدة، المستخدمين هيستقبلوها
   ═══════════════════════════════════════════════════════════════ */
initAutoUpdate().catch((err) => {
  console.warn('[AutoUpdate] Failed to initialize:', err);
});
