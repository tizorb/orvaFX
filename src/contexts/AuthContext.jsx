import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🚩 [AuthContext] useEffect iniciado");

    const loadInitialSession = async () => {
      console.log("🚩 [AuthContext] Cargando sesión inicial...");
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("❌ [AuthContext] Error obteniendo usuario:", error);
      }
      if (data?.user) {
        setUser(data.user);
        console.log("🚩 [AuthContext] Usuario logueado:", data.user.email);
      } else {
        setUser(null);
        console.log("🚩 [AuthContext] No hay usuario logueado");
      }
      setLoading(false);
      console.log("🚩 [AuthContext] setLoading(false)");
    };

    loadInitialSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🚩 [AuthContext] Cambio de auth:", event, session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
      console.log("🚩 [AuthContext] Listener desuscrito");
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

