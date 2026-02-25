"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"; // Added missing Auth imports
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics"; // Added missing Analytics imports
import { createContext, useContext, useEffect, useState } from "react"; // Added missing React imports

const firebaseConfig = {
  apiKey: "AIzaSyB_ymS3eqrmTDxnrlLeb1Dr56eQq0hSGPc",
  authDomain: "eathub-635ea.firebaseapp.com",
  databaseURL: "https://eathub-635ea-default-rtdb.firebaseio.com",
  projectId: "eathub-635ea",
  storageBucket: "eathub-635ea.firebasestorage.app",
  messagingSenderId: "727506428128",
  appId: "1:727506428128:web:683b279b8ac57527a9f085",
  measurementId: "G-PP277TB8Q2",
};

// Initialize Firebase (Singleton Pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = getDatabase(app); 

// Initialize Analytics (Safe for Next.js Server Side)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.error("Analytics not supported:", err);
  });
}

// ================================
// React Context for Firebase Auth
// ================================
const FirebaseContext = createContext(null);

export function FirebaseClientProvider({ children }) {
  return (
    <FirebaseContext.Provider value={{ auth, db }}>
      {children}
    </FirebaseContext.Provider>
  );
}

// ================================
// Custom Hooks
// ================================

// Hook to access Firebase instance from Context
export function useFirebase() {
  return useContext(FirebaseContext);
}

// Hook to get the current user object
export function useUser() {
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsUserLoading(false);
    });
    return () => unsub();
  }, []);

  return { user, isUserLoading };
}

// Simple hook to return the auth instance
export function useAuth() {
  return auth;
}

// ================================
// Logout helper
// ================================
export function signOutUser() {
  return signOut(auth);
}