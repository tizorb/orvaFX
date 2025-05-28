
    import React, { useState, useEffect } from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { motion } from 'framer-motion';
    import { Newspaper, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';
    import { useLanguage } from '@/contexts/LanguageContext';
    import { Button } from '@/components/ui/button';
    import { useNavigate } from 'react-router-dom';

    const sampleProjection = {
      id: 'sample_proj_gbpjpy_1',
      currencyPair: 'GBP/JPY',
      entryPrice: '198.500',
      stopLoss: '197.800',
      takeProfit: '200.000',
      analysis: 'Se observa una posible continuación alcista para el par GBP/JPY debido a la fortaleza reciente de la libra esterlina y datos económicos favorables del Reino Unido. El nivel de 198.000 ha actuado como un soporte clave. Buscamos una entrada cerca de 198.500 con un objetivo en la zona psicológica de 200.000. El stop loss se coloca por debajo del soporte inmediato para gestionar el riesgo.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), 
    };

    const sampleNews = {
      id: 'sample_news_1',
      title: 'Análisis Semanal del Mercado Forex: Perspectivas y Niveles Clave',
      content: 'Esta semana, los mercados de divisas estarán atentos a las decisiones de política monetaria de varios bancos centrales importantes, incluyendo el Banco Central Europeo y el Banco de Inglaterra. Se espera volatilidad en pares como EUR/USD y GBP/USD. Además, los datos de inflación de EE. UU. serán cruciales para determinar la dirección del dólar. Los traders deben prestar atención a los niveles de soporte y resistencia en los principales pares y gestionar el riesgo adecuadamente ante posibles movimientos bruscos del mercado.',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    };

    export function Projections() {
      const [projections, setProjections] = useState([]);
      const [newsItems, setNewsItems] = useState([]);
      const { user } = useAuth();
      const { t } = useLanguage();
      const navigate = useNavigate();

      useEffect(() => {
        let storedProjections = JSON.parse(localStorage.getItem('orvafx_projections_v2'));
        if (!storedProjections || storedProjections.length === 0) {
          storedProjections = [sampleProjection];
          localStorage.setItem('orvafx_projections_v2', JSON.stringify(storedProjections));
        }
        setProjections(storedProjections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        
        let storedNews = JSON.parse(localStorage.getItem('orvafx_newsItems_v2'));
        if (!storedNews || storedNews.length === 0) {
          storedNews = [sampleNews];
          localStorage.setItem('orvafx_newsItems_v2', JSON.stringify(storedNews));
        }
        setNewsItems(storedNews.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }, []);

      if (!user || (!user.is_subscribed && user.role !== 'admin')) {
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8"
          >
            <AlertTriangle className="w-24 h-24 text-amber-400 mb-6" />
            <h2 className="text-3xl font-bold text-slate-100 mb-4">{t('projections_restricted_title')}</h2>
            <p className="text-slate-300 mb-8 max-w-md">
              {t('projections_restricted_desc')}
            </p>
            <Button onClick={() => navigate('/subscription')} className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-lg px-8 py-3">
              {t('projections_view_subscription_button')}
            </Button>
          </motion.div>
        );
      }

      const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
      };

      const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
      };
      
      const getProjectionStatusText = (analysisText) => {
        if (!analysisText) return t('projections_status_neutral');
        const lowerAnalysis = analysisText.toLowerCase();
        if (lowerAnalysis.includes('compra') || lowerAnalysis.includes('alcista') || lowerAnalysis.includes('buy') || lowerAnalysis.includes('bullish')) {
          return t('projections_status_bullish');
        }
        if (lowerAnalysis.includes('venta') || lowerAnalysis.includes('bajista') || lowerAnalysis.includes('sell') || lowerAnalysis.includes('bearish')) {
          return t('projections_status_bearish');
        }
        return t('projections_status_neutral');
      };

      return (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto p-4 md:p-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-center bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-transparent bg-clip-text pb-2">{t('projections_page_title')}</h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 p-4 bg-sky-900/30 border border-sky-700/50 rounded-lg shadow-lg flex items-start"
          >
            <ShieldCheck className="w-8 h-8 text-sky-400 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-sky-300 mb-1">{t('projections_risk_warning_title')}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t('projections_risk_warning_message')}
              </p>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-10">
            <section>
              <h2 className="text-3xl font-semibold mb-6 text-slate-100 flex items-center">
                <TrendingUp className="mr-3 w-8 h-8 text-sky-400" /> {t('projections_operations_title')}
              </h2>
              {projections.length === 0 ? (
                <Card className="bg-slate-800/50 border-slate-700 p-6 rounded-lg shadow-md text-center">
                    <CardContent>
                        <p className="text-slate-400">{t('projections_no_projections_message')}</p>
                    </CardContent>
                </Card>
              ) : (
                <motion.ul variants={cardVariants} initial="hidden" animate="visible" className="space-y-6">
                  {projections.map(p => (
                    <motion.li key={p.id} variants={itemVariants}>
                      <Card className="bg-gradient-to-br from-slate-800 to-slate-800/70 border border-slate-700 shadow-xl hover:shadow-sky-500/30 transition-all duration-300 rounded-xl overflow-hidden">
                        <CardHeader className="bg-slate-700/50 p-5">
                          <CardTitle className="text-2xl font-bold text-sky-300 flex justify-between items-center">
                            <span>{p.currencyPair}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${ (p.analysis || '').toLowerCase().includes('compra') || (p.analysis || '').toLowerCase().includes('alcista') || (p.analysis || '').toLowerCase().includes('buy') || (p.analysis || '').toLowerCase().includes('bullish') ? 'bg-green-500/20 text-green-300' : ((p.analysis || '').toLowerCase().includes('venta') || (p.analysis || '').toLowerCase().includes('bajista') || (p.analysis || '').toLowerCase().includes('sell') || (p.analysis || '').toLowerCase().includes('bearish') ? 'bg-red-500/20 text-red-300' : 'bg-slate-600 text-slate-300' ) }`}>
                              {getProjectionStatusText(p.analysis)}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-xs text-slate-400 pt-1">{t('projections_published_label')}: {new Date(p.timestamp).toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 text-slate-200 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-center">
                            <div className="bg-slate-700/60 p-3 rounded-lg">
                                <p className="font-semibold text-slate-400 mb-1">{t('projections_entry_label')}</p>
                                <p className="text-lg font-bold text-sky-400">{p.entryPrice}</p>
                            </div>
                            <div className="bg-slate-700/60 p-3 rounded-lg">
                                <p className="font-semibold text-slate-400 mb-1">{t('projections_stop_loss_label')}</p> 
                                <p className="text-lg font-bold text-red-400">{p.stopLoss}</p>
                            </div>
                            <div className="bg-slate-700/60 p-3 rounded-lg">
                                <p className="font-semibold text-slate-400 mb-1">{t('projections_take_profit_label')}</p>
                                <p className="text-lg font-bold text-green-400">{p.takeProfit}</p>
                            </div>
                          </div>
                          <div className="pt-3">
                            <h4 className="font-semibold text-slate-300 mb-1">{t('projections_detailed_analysis_label')}:</h4>
                            <p className="text-sm text-slate-300/90 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar pr-2">{p.analysis}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </section>

            <section>
              <h2 className="text-3xl font-semibold mb-6 text-slate-100 flex items-center">
                <Newspaper className="mr-3 w-8 h-8 text-amber-400" /> {t('projections_market_news_title')}
              </h2>
              {newsItems.length === 0 ? (
                 <Card className="bg-slate-800/50 border-slate-700 p-6 rounded-lg shadow-md text-center">
                    <CardContent>
                        <p className="text-slate-400">{t('projections_no_news_message')}</p>
                    </CardContent>
                </Card>
              ) : (
                <motion.ul variants={cardVariants} initial="hidden" animate="visible" className="space-y-6">
                  {newsItems.map(n => (
                    <motion.li key={n.id} variants={itemVariants}>
                      <Card className="bg-gradient-to-br from-slate-800 to-slate-800/70 border-slate-700 shadow-xl hover:shadow-amber-500/30 transition-all duration-300 rounded-xl overflow-hidden">
                        <CardHeader className="bg-slate-700/50 p-5">
                          <CardTitle className="text-2xl font-bold text-amber-300">{n.title}</CardTitle>
                          <CardDescription className="text-xs text-slate-400 pt-1">{t('projections_published_label')}: {new Date(n.timestamp).toLocaleString()}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-5 text-slate-300/90 leading-relaxed">
                          <p>{n.content}</p>
                        </CardContent>
                      </Card>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </section>
          </div>
        </motion.div>
      );
    }
  