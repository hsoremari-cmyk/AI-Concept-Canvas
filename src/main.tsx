import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((reg) => console.log('راوێژکار: سێرڤس وۆرکەر ب سەرکەفتیانە هاتە تۆمارکرن:', reg.scope))
      .catch((err) => console.warn('راوێژکار: تۆمارکرنا سێرڤس وۆرکەر ب سەرنەکەفت:', err));
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
