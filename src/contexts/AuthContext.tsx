import { createContext, useContext, useEffect, useState, useMemo } from "react";
// FIX 1: Use 'import type' for types (TS Error 1484)
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
// FIX 1: Use 'import type' for Firebase User (TS Error 1484)
import type { User } from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// FIX 2: Mark props as Readonly (SonarQube Warning)
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

  // FIX 3: Wrap value in useMemo (SonarQube Performance Warning)
  // This prevents the whole app from re-rendering just because the object reference changed.
  const value = useMemo(() => ({ 
    currentUser, 
    loading 
  }), [currentUser, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// FIX 4: Add ESLint exception for Fast Refresh
// Vite warns about exporting components and functions in the same file.
// For Context/Hooks pairs, it is standard practice to suppress this specific warning 
// rather than creating a separate file for a 5-line hook.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}