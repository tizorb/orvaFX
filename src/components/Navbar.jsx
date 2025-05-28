
    import React from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { Button } from '@/components/ui/button';
    import { useAuth } from '@/contexts/AuthContext';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { DollarSign, LogOut, User, Settings, BarChart3, Newspaper, Calculator, Clock, ShieldCheck, Wallet, Users, Globe } from 'lucide-react';
    import { motion } from 'framer-motion';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
    } from "@/components/ui/dropdown-menu";


    export function Navbar() {
      const { user, logout } = useAuth();
      const { t, language, setLanguage } = useLanguage();
      const navigate = useNavigate();

      const handleLogout = () => {
        logout();
        navigate('/login');
      };

      return (
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="bg-background/80 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-border"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent hover:opacity-80 transition-opacity duration-300">
                ORVAFX
              </Link>
              <div className="flex items-center space-x-1 md:space-x-2">
                <NavLink to="/" icon={<BarChart3 size={18}/>}>{t('navbar_home')}</NavLink>
                {user && <NavLink to="/projections" icon={<Newspaper size={18}/>}>{t('navbar_projections')}</NavLink>}
                <NavLink to="/calculators" icon={<Calculator size={18}/>}>{t('navbar_calculators')}</NavLink>
                {user && <NavLink to="/subscription" icon={<DollarSign size={18}/>}>{t('navbar_subscription')}</NavLink>}
                {user && <NavLink to="/profile" icon={<Wallet size={18}/>}>{t('navbar_profile')}</NavLink>}
                {user && user.role === 'admin' && <NavLink to="/admin" icon={<ShieldCheck size={18}/>}>{t('navbar_admin')}</NavLink>}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-secondary/50">
                      <Globe size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border text-popover-foreground">
                    <DropdownMenuItem onClick={() => setLanguage('en')} className={`hover:bg-secondary focus:bg-secondary ${language === 'en' ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90' : ''}`}>
                      {t('language_switcher_en')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('es')} className={`hover:bg-secondary focus:bg-secondary ${language === 'es' ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90' : ''}`}>
                      {t('language_switcher_es')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {user ? (
                  <>
                    <span className="text-muted-foreground text-xs md:text-sm hidden md:block">{t('navbar_greeting_user', { username: user.username })}</span>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive-foreground bg-destructive/80 hover:bg-destructive hover:text-destructive-foreground transition-colors">
                      <LogOut size={20} />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => navigate('/login')} className="border-primary text-primary hover:bg-primary/10 hover:text-primary/90 transition-colors px-2 md:px-4 text-xs md:text-sm">
                      <User size={16} className="mr-0 md:mr-2"/> <span className="hidden md:inline">{t('navbar_login')}</span>
                    </Button>
                    <Button onClick={() => navigate('/register')} className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 px-2 md:px-4 text-xs md:text-sm">
                      <Users size={16} className="mr-0 md:mr-2" /> <span className="hidden md:inline">{t('navbar_register')}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.nav>
      );
    }

    const NavLink = ({ to, children, icon }) => (
      <Link to={to} className="flex items-center px-1.5 md:px-3 py-2 text-muted-foreground hover:text-foreground rounded-md transition-colors duration-200 text-xs md:text-sm font-medium">
        {icon && <span className="mr-0.5 md:mr-2">{icon}</span>}
        <span className="hidden sm:inline">{children}</span>
      </Link>
    );
  