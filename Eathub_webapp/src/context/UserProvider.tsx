// 'use client';

// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
// } from 'react';

// type User = {
//   id: string;
//   displayName: string | null;
//   email: string | null;
//   photoURL: string | null;
// };

// type UserContextType = {
//   user: User | null;
//   isUserLoading: boolean;
//   login: (user: User) => void;
//   logout: () => void;
// };

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export function UserProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [isUserLoading, setIsUserLoading] = useState(true);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const saved = window.localStorage.getItem('dummyUser');
//     if (saved) {
//       try {
//         setUser(JSON.parse(saved));
//       } catch {
//         // ignore bad data
//         window.localStorage.removeItem('dummyUser');
//       }
//     }
//     setIsUserLoading(false);
//   }, []);

//   const login = (u: User) => {
//     setUser(u);
//     if (typeof window !== 'undefined') {
//       window.localStorage.setItem('dummyUser', JSON.stringify(u));
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     if (typeof window !== 'undefined') {
//       window.localStorage.removeItem('dummyUser');
//     }
//   };

//   return (
//     <UserContext.Provider value={{ user, isUserLoading, login, logout }}>
//       {children}
//     </UserContext.Provider>
//   );
// }

// export function useUser() {
//   const ctx = useContext(UserContext);
//   if (!ctx) {
//     throw new Error('useUser must be used inside <UserProvider>');
//   }
//   return ctx;
// }
