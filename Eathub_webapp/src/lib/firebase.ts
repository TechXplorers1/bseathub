import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase only if not already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const requestForToken = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  try {
    if (Notification.permission === 'denied') {
      console.warn("Notifications are blocked by the user.");
      return null;
    }

    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY",
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.log("No registration token available. Request permission to generate one.");
      return null;
    }
  } catch (err: any) {
    if (err.code === 'messaging/permission-blocked') {
      console.warn("Notification permission was blocked. Messaging is disabled.");
    } else {
      console.error("An error occurred while retrieving token. ", err);
    }
    return null;
  }
};

export const onMessageListener = () => {
  const messaging = getMessaging(app);
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("OnMessage payload:", payload);
      resolve(payload);
    });
  });
};
