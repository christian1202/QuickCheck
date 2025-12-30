import { createContext, useContext, useEffect, useState, useMemo } from "react";
// FIX 1: Use 'import type' (Satisfies verbatimModuleSyntax)
import type { ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
// FIX 2: Use 'import type' for the User interface
import type { User } from "firebase/auth"; 
import { auth } from "../lib/firebase";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// FIX 3: Add 'Readonly' to props (Satisfies SonarQube)
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

  // FIX 4: Wrap value in useMemo (Prevents unnecessary re-renders)
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

// FIX 5: Disable the fast-refresh warning for this specific hook pattern
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}