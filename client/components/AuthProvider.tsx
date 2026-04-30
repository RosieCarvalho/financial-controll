import React, { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";

type User = {
  id: string;
  email?: string | null;
  name?: string | null;
};

type AuthContextValue = {
  user: User | null;
  initializing: boolean;
  signInWithPassword: (email: string, password: string) => Promise<any>;
  signUpWithPassword: (email: string, password: string) => Promise<any>;
  signInWithOAuth: (provider: string) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabaseBrowser.auth.getUser();
        if (currentUser)
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name:
              (currentUser.user_metadata &&
                (currentUser.user_metadata.name ||
                  currentUser.user_metadata.full_name)) ||
              (currentUser?.app_metadata &&
                currentUser.app_metadata.user_name) ||
              currentUser.email ||
              null,
          });
      } finally {
        setInitializing(false);
      }
    };
    init();

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
            name:
              (session.user.user_metadata &&
                (session.user.user_metadata.name ||
                  session.user.user_metadata.full_name)) ||
              (session.user?.app_metadata &&
                session.user.app_metadata.user_name) ||
              session.user.email ||
              null,
          });
        } else {
          setUser(null);
        }
        setInitializing(false);
      },
    );

    return () => listener?.subscription.unsubscribe();
  }, []);

  const signInWithPassword = (email: string, password: string) => {
    return supabaseBrowser.auth.signInWithPassword({ email, password });
  };

  const signUpWithPassword = (email: string, password: string) => {
    return supabaseBrowser.auth.signUp({ email, password });
  };

  const signInWithOAuth = (provider: string) => {
    return supabaseBrowser.auth.signInWithOAuth({ provider: provider as any });
  };

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        signInWithPassword,
        signUpWithPassword,
        signInWithOAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, initializing } = useAuth();
  if (initializing) return null; // or a loader
  if (!user) {
    // client-side redirect to /login
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }
  return <>{children}</>;
};

export default AuthProvider;
