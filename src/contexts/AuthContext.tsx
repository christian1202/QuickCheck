import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { ReactNode } from "react";
// 1. Add 'signOut' to imports
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth"; 
import { auth } from "../lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  // 2. Add the alias 'user' so Sidebar works
  user: User | null; 
  loading: boolean;
  // 3. Add 'logout' function type
  logout: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 4. Create the logout function
  const logout = async () => {
    await signOut(auth);
  };

  const value = useMemo(() => ({
    currentUser,
    // 5. Map 'user' to 'currentUser' so both names work
    user: currentUser, 
    loading,
    logout
  }), [currentUser, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}