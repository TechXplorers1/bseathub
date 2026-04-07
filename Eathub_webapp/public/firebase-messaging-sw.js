importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyB_ymS3eqrmTDxnrlLeb1Dr56eQq0hSGPc",
  authDomain: "eathub-635ea.firebaseapp.com",
  databaseURL: "https://eathub-635ea-default-rtdb.firebaseio.com",
  projectId: "eathub-635ea",
  storageBucket: "eathub-635ea.firebasestorage.app",
  messagingSenderId: "727506428128",
  appId: "1:727506428128:web:683b279b8ac57527a9f085",
  measurementId: "G-PP277TB8Q2"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // Ensure this image exists in your public folder
    badge: '/badge.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
