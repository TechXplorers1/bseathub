"use client";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";

// ================================
// Firebase Configuration
// ================================
const firebaseConfig = {
  apiKey: "AIzaSyB_ymS3eqrmTDxnrlLeb1Dr56eQq0hSGPc",
  authDomain: "eathub-635ea.firebaseapp.com",
  projectId: "eathub-635ea",
  storageBucket: "eathub-635ea.firebasestorage.app",
  messagingSenderId: "727506428128",
  appId: "1:727506428128:web:683b279b8ac57527a9f085",
  measurementId: "G-PP277TB8Q2",
};

// ================================
// Initialize Firebase
// ================================
const app = initializeApp(firebaseConfig);
getAnalytics(app); // optional analytics
export const auth = getAuth(app);

// ================================
// React Context for Firebase Auth
// ================================
const FirebaseContext = createContext(null);

export function FirebaseClientProvider({ children }) {
  return (
    <FirebaseContext.Provider value={{ auth }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase() {
  return useContext(FirebaseContext);
}

// ================================
// useUser hook → Get current auth user
// ================================
export function useUser() {
  const { auth } = useFirebase();
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsUserLoading(false);
    });
    return () => unsub();
  }, [auth]);

  return { user, isUserLoading };
}

// ================================
// Logout helper
// ================================
export function signOutUser() {
  return signOut(auth);
}

export function useAuth() {
  const [auth, setAuth] = useState(() => getAuth());

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  return auth;
}
