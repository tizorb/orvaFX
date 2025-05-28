
    import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { BarChart3, Newspaper, Calculator, Clock, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
    import { useNavigate } from 'react-router-dom';
    import { MarketClock } from '@/components/MarketClock';
    import { useLanguage } from '@/contexts/LanguageContext';

    export function Home() {
      const navigate = useNavigate();
      const { t } = useLanguage();

      const featureCards = [
        { titleKey: "home_feature_market_projections_title", descriptionKey: "home_feature_market_projections_desc", icon: <Newspaper className="w-12 h-12 text-sky-400 mb-4" />, link: "/projections" },
        { titleKey: "home_feature_forex_calculators_title", descriptionKey: "home_feature_forex_calculators_desc", icon: <Calculator className="w-12 h-12 text-green-400 mb-4" />, link: "/calculators" },
        { titleKey: "home_feature_session_clock_title", descriptionKey: "home_feature_session_clock_desc", icon: <Clock className="w-12 h-12 text-amber-400 mb-4" />, link: "/calculators" },
        { titleKey: "home_feature_flexible_subscriptions_title", descriptionKey: "home_feature_flexible_subscriptions_desc", icon: <TrendingUp className="w-12 h-12 text-purple-400 mb-4" />, link: "/subscription" },
      ];

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-12"
        >
          <section className="text-center py-16 bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            >
              <BarChart3 className="w-24 h-24 text-sky-500 mx-auto mb-6" />
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
                {t('home_welcome_title')}
              </h1>
              <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                {t('home_welcome_subtitle')}
              </p>
              <div className="space-x-4">
                <Button size="lg" onClick={() => navigate('/register')} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-lg px-8 py-3 transition-all duration-300 transform hover:scale-105">
                  <Zap size={20} className="mr-2" /> {t('home_start_now_button')}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/projections')} className="border-sky-500 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 text-lg px-8 py-3 transition-colors transform hover:scale-105">
                  {t('home_view_projections_button')}
                </Button>
              </div>
            </motion.div>
          </section>

          <section>
            <h2 className="text-4xl font-semibold text-center mb-12 text-slate-100">{t('home_main_features_title')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featureCards.map((card, index) => (
                <motion.div
                  key={card.titleKey}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index, duration: 0.5 }}
                >
                  <Card className="bg-slate-800/70 border-slate-700 hover:shadow-xl hover:border-sky-500/50 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                    <CardHeader className="items-center text-center">
                      {card.icon}
                      <CardTitle className="text-2xl text-sky-400">{t(card.titleKey)}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-slate-300 text-center flex-grow">
                      <p>{t(card.descriptionKey)}</p>
                    </CardContent>
                    <CardFooter className="justify-center">
                      <Button variant="link" onClick={() => navigate(card.link)} className="text-sky-400 hover:text-sky-300">
                        {t('home_learn_more')} <TrendingUp size={16} className="ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
          
          <section className="py-12">
             <h2 className="text-4xl font-semibold text-center mb-12 text-slate-100">{t('home_market_session_clock_title')}</h2>
             <div className="max-w-5xl mx-auto">
                <MarketClock />
             </div>
          </section>

          <section className="text-center py-12">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h2 className="text-3xl font-semibold mb-6 text-slate-100">{t('home_ready_next_level_title')}</h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                {t('home_ready_next_level_desc')}
              </p>
              <Button size="lg" onClick={() => navigate('/subscription')} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-lg px-10 py-3 transition-all duration-300 transform hover:scale-105">
                {t('home_view_subscription_plans_button')}
              </Button>
            </motion.div>
          </section>
        </motion.div>
      );
    }
  