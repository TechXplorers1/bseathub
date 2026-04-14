import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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

// Initialize Firebase only if not already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const requestForToken = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  try {
    if (Notification.permission === 'denied') {
      console.warn("Notifications are blocked by the user.");
      return null;
    }

    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, {
      vapidKey: "BBnIlnz_X48mAVhRBASeCtwLz_v4vWYNJhyXWLgcgivmFY048NDLWhVI_gHXCzT5rGF0fKRSZLyUkrncmMbLlxw",
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

export const onMessageListener = (callback: (payload: any) => void) => {
  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    console.log("Real-time Message received:", payload);
    callback(payload);
  });
};
