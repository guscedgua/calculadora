import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'

import { AuthProvider } from './context/AuthContext'; // Asegúrate de importar

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider> {/* Envuelve la app con el proveedor */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);