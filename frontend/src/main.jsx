import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';

// Apply saved theme before first render to prevent flash
(function applyThemeEarly() {
  try {
    const t = localStorage.getItem('joeailabs_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.background = t === 'dark' ? '#020508' : '#f0f4f8';
  } catch {}
})();

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>
);
