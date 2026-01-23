"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Vérifier la session au chargement (F5)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/login/me");
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email, password) => {
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    setUser(data.user);

    // La redirection est maintenant gérée intelligemment ici ou via le router.push
    if (data.user.role === 'ADMIN') router.push('/dashboard/home');
    else if (data.user.role === 'FINANCIER') router.push('/financial/home');
    else if (data.user.role === 'EDITEUR') router.push('/editor/home');
    else router.push('/agent/home');
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    router.push("/auth/login");
    router.refresh(); // Rafraîchir pour que le middleware reprenne la main
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      isAdmin: user?.role === 'ADMIN',
      isFinancial: user?.role === 'FINANCIER',
      isAgent: user?.role === 'AGENT',
      isEditor: user?.role === 'EDITEUR',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};