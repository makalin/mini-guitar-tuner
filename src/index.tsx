import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { SettingsProvider } from './context/SettingsContext';
import GuitarTuner from './guitar-tuner';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <SettingsProvider>
      <GuitarTuner />
    </SettingsProvider>
  </React.StrictMode>
); 