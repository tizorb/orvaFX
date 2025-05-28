import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Para depuración: logs visuales de cada paso
  useEffect(() => {
    console.log("🚩 [AuthContext] useEffect iniciado");

    const loadInitialSession = async () => {
      try {
        console.log("🚩 [AuthContext] Antes de cargar la sesión inicial");
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("❌ [AuthContext] Error obteniendo usuario:", error);
        } else if (!data.user) {
          console.log("🚩 [AuthContext] No hay usuario logueado");
        } else {
          console.log("🚩 [AuthContext] Usuario recuperado:", data.user);
        }
        setUser(data?.user ?? null);
        setLoading(false);
        console.log("🚩 [AuthContext] setLoading(false) (fin carga inicial)");
      } catch (err) {
        console.error("❌ [AuthContext] Error inesperado:", err);
        setUser(null);
        setLoading(false);
      }
    };

    loadInitialSession();

    // Escuchar cambios en autenticación
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🚩 [AuthContext] onAuthStateChange:", event, session);
      setUser(session?.user ?? null);
      setLoading(false);
      console.log("🚩 [AuthContext] setLoading(false) (onAuthStateChange)");
    });

    // Limpieza al desmontar
    return () => {
      listener?.subscription.unsubscribe();
      console.log("🚩 [AuthContext] Listener de auth eliminado");
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);
