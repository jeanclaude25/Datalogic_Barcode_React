import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Vérifiez si le navigateur prend en charge les Service Workers
if ('serviceWorker' in navigator) {
  // Enregistrez et activez le Service Worker
  navigator.serviceWorker
    .register(`${process.env.PUBLIC_URL}/service-worker.js`)
    .then((registration) => {
      console.log('Service Worker enregistré avec succès :', registration);
    })
    .catch((error) => {
      console.log('Échec de l\'enregistrement du Service Worker :', error);
    });
}

// Récupérez l'élément racine et créez un ReactDOM root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendez votre application React à l'intérieur de l'élément racine
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
