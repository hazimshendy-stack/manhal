

import App from './App';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root was not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

/* Auto-Update — start after render */
initAutoUpdate().catch((err) => {
  console.warn('[AutoUpdate] Failed:', err);
});
