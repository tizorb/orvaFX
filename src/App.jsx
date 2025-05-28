import './i18n'; // Esto debe estar arriba de todo
    import React from 'react';
    import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
    import { Home } from '@/pages/Home';
    import AdminDashboardPage from '@/pages/AdminDashboardPage';
    import { Projections } from '@/pages/Projections';
    import { Calculators } from '@/pages/Calculators';
    import { Subscription } from '@/pages/Subscription';
    import { Login } from '@/pages/Login';
    import { Register } from '@/pages/Register';
    import { ProfileWallet } from '@/pages/ProfileWallet';
    import { Navbar } from '@/components/Navbar';
    import { Toaster } from '@/components/ui/toaster';
    import { AuthProvider, useAuth } from '@/contexts/AuthContext';
    import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
    import { motion } from 'framer-motion';
    import SupportChatWidget from '@/components/support/SupportChatWidget';
    import MfaChallengePage from '@/pages/MfaChallengePage';
    import LoadingSpinner from '@/components/ui/LoadingSpinner';

    const ProtectedRoute = ({ children }) => {
      const { user, mfaChallenge, loading } = useAuth();
      if (loading) return <AppLoadingScreen />;
      if (mfaChallenge) return <Navigate to="/mfa-challenge" />;
      if (!user) return <Navigate to="/login" />;
      return children;
    };

    const AdminRoute = ({ children }) => {
      const { user, mfaChallenge, loading } = useAuth();
      if (loading) return <AppLoadingScreen />;
      if (mfaChallenge) return <Navigate to="/mfa-challenge" />;
      if (!user || user.role !== 'admin') return <Navigate to="/" />;
      return children;
    };

    const AppLoadingScreen = () => {
      const { t } = useLanguage();
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-lg text-slate-300">{t('loading_app')}</p>
        </div>
      );
    };
    
    const AppRoutes = () => {
      const { user, mfaChallenge } = useAuth();
      return (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={user ? <Navigate to="/profile" /> : (mfaChallenge ? <Navigate to="/mfa-challenge" /> : <Login />)} />
          <Route path="/register" element={user ? <Navigate to="/profile" /> : <Register />} />
          <Route path="/mfa-challenge" element={mfaChallenge ? <MfaChallengePage /> : <Navigate to="/login" />} />
          
          <Route path="/projections" element={<ProtectedRoute><Projections /></ProtectedRoute>} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileWallet /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      );
    };

    const AppContent = () => {
      const { loading: authLoading, mfaChallenge, user } = useAuth();
      const { t } = useLanguage();

      if (authLoading) {
        return <AppLoadingScreen />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-slate-900 text-foreground flex flex-col">
          {!mfaChallenge && <Navbar />}
          <main className={`flex-grow container mx-auto px-4 py-8 ${mfaChallenge ? 'flex items-center justify-center' : ''}`}>
            <AppRoutes />
          </main>
          <Toaster />
          {user?.role !== 'admin' && !mfaChallenge && <SupportChatWidget />}
          {!mfaChallenge && (
            <footer className="text-center py-6 border-t border-border bg-slate-900/50">
              <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} {t('footer_rights')}</p>
            </footer>
          )}
        </div>
      );
    };
    
    function App() {
      return (
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <AppContent />
            </Router>
          </AuthProvider>
        </LanguageProvider>
      );
    }
    
    export default App;
  
