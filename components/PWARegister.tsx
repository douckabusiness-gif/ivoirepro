'use client';

import { useEffect } from 'react';

export const PWARegister = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // In development, unregister service worker and clear caches to guarantee fresh client updates
      if (process.env.NODE_ENV === 'development') {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
        if ('caches' in window) {
          caches.keys().then((names) => {
            for (const name of names) {
              caches.delete(name);
            }
          });
        }
        return;
      }

      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('⚡ [PWA] Service Worker registered successfully with scope:', registration.scope);

            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker == null) return;

              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('⚡ [PWA] New content is available; please refresh.');
                  } else {
                    console.log('⚡ [PWA] Content is cached for offline use.');
                  }
                }
              };
            };
          })
          .catch((error) => {
            console.error('❌ [PWA] Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
};
