import React from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function Loader() {
  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Inicializando app...</h2>
      <div className="spinner" />
    </div>
  );
}

function Login() {
  const handleLogin = async () => {
    // ¡Cambia esto por tu método real de login!
    // Por ejemplo, login con email y password o magic link
    const email = window.prompt("Email:");
    if (!email) return;
    const { error } = await window.supabase.auth.signInWithOtp({ email });
    if (error) alert("Error: " + error.message);
    else alert("Revisa tu email para el link de acceso.");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Inicia sesión</h2>
      <button onClick={handleLogin}>Login con Magic Link</button>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await window.supabase.auth.signOut();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "80px" }}>
      <h2>Bienvenido, {user.email}</h2>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

function MainApp() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Login />;
  return <Dashboard />;
}

function App() {
  // Para que el login funcione como ejemplo (NO HAGAS ESTO EN PROD)
  React.useEffect(() => {
    window.supabase = require("./supabaseClient").supabase;
  }, []);

  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
  
