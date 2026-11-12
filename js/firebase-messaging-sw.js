importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCw0Xsjqp20oT2PoxSyHojk5r5r58vQ1o",
  authDomain: "pixoro-75927.firebaseapp.com",
  projectId: "pixoro-75927",
  storageBucket: "pixoro-75927.firebasestorage.app",
  messagingSenderId: "814840120295",
  appId: "1:814840120295:web:6c02c613df5a17209bf342",
  measurementId: "G-H3NR8P270D"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const title = payload.notification?.title || 'Pixoro';
  const options = {
    body: payload.notification?.body || 'New notification da',
    icon: '/icon.png',
    badge: '/icon.png'
  };
  self.registration.showNotification(title, options);
});
