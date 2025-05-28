
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { motion } from 'framer-motion';
    import { Calculator, TrendingUp, Clock, Percent } from 'lucide-react';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { MarketClock } from '@/components/MarketClock';
    import { useLanguage } from '@/contexts/LanguageContext';

    const commonCurrencyPairs = [
      "EUR/USD", "USD/JPY", "GBP/USD", "USD/CHF", "AUD/USD", "USD/CAD",
      "NZD/USD", "EUR/GBP", "EUR/JPY", "GBP/JPY", "AUD/JPY", "CHF/JPY",
      "EUR/AUD", "EUR/CAD", "EUR/CHF", "GBP/AUD", "GBP/CAD", "GBP/CHF",
      "AUD/CAD", "AUD/CHF", "AUD/NZD", "CAD/CHF", "CAD/JPY", "NZD/CAD",
      "NZD/CHF", "NZD/JPY", "USD/SGD", "USD/HKD", "USD/NOK", "USD/SEK",
      "XAU/USD" 
    ];

    export function Calculators() {
      const { t } = useLanguage();
      const [lotSizeParams, setLotSizeParams] = useState({
        accountBalance: 10000,
        riskPercentage: 1,
        stopLossPips: 20,
        selectedPair: "EUR/USD",
        pairPrice: 1.12000, 
      });
      const [lotSizeResult, setLotSizeResult] = useState(null);

      const [compoundInterestParams, setCompoundInterestParams] = useState({
        principal: 1000,
        monthlyContribution: 100,
        interestRate: 5,
        years: 10,
      });
      const [compoundInterestResult, setCompoundInterestResult] = useState(null);

      const handleLotSizeChange = (e) => {
        const { name, value } = e.target;
        let parsedValue = parseFloat(value);
        if (name === "pairPrice") {
          const decimalPart = value.split('.')[1];
          if (decimalPart && decimalPart.length > 5) {
            parsedValue = parseFloat(parseFloat(value).toFixed(5));
          }
        }
        setLotSizeParams(prev => ({ ...prev, [name]: parsedValue }));
      };

      const handlePairChange = (value) => {
        setLotSizeParams(prev => ({ ...prev, selectedPair: value }));
      };

      const calculateLotSize = () => {
        const { accountBalance, riskPercentage, stopLossPips, pairPrice } = lotSizeParams;
        if (accountBalance <= 0 || riskPercentage <= 0 || stopLossPips <= 0 || pairPrice <= 0) {
          setLotSizeResult({ error: t('calculators_error_positive_values') });
          return;
        }
        const riskAmount = accountBalance * (riskPercentage / 100);
        
        let pipValuePerLot = 10;
        if (lotSizeParams.selectedPair.includes("JPY")) {
           pipValuePerLot = (1000 / pairPrice); 
        } else if (lotSizeParams.selectedPair.startsWith("XAU")) {
           pipValuePerLot = 10; 
        } else if (lotSizeParams.selectedPair.endsWith("USD")) {
           pipValuePerLot = 10;
        } else {
            const quoteCurrency = lotSizeParams.selectedPair.split('/')[1];
            if (quoteCurrency) {
                 pipValuePerLot = 10 / pairPrice; 
            }
        }


        const lotSize = riskAmount / (stopLossPips * pipValuePerLot);

        setLotSizeResult({
          riskAmount: riskAmount.toFixed(2),
          lotSize: lotSize.toFixed(2),
          pipValue: pipValuePerLot.toFixed(5)
        });
      };

      const handleCompoundInterestChange = (e) => {
        setCompoundInterestParams({ ...compoundInterestParams, [e.target.name]: parseFloat(e.target.value) });
      };

      const calculateCompoundInterest = () => {
        let { principal, monthlyContribution, interestRate, years } = compoundInterestParams;
        if (principal < 0 || monthlyContribution < 0 || interestRate < 0 || years <= 0) {
          setCompoundInterestResult({ error: t('calculators_error_compound_inputs') });
          return;
        }

        const monthlyRate = (interestRate / 100) / 12;
        const months = years * 12;
        let futureValue = principal;

        for (let i = 0; i < months; i++) {
          futureValue = (futureValue + monthlyContribution) * (1 + monthlyRate);
        }
        
        const totalContributions = principal + (monthlyContribution * months);
        const totalInterest = futureValue - totalContributions;

        setCompoundInterestResult({
          futureValue: futureValue.toFixed(2),
          totalContributions: totalContributions.toFixed(2),
          totalInterest: totalInterest.toFixed(2),
        });
      };
      
      useEffect(() => {
        calculateLotSize();
        calculateCompoundInterest();
      }, [t]);


      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto p-4 md:p-8"
        >
          <h1 className="text-4xl font-bold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
            {t('calculators_page_title')}
          </h1>

          <Tabs defaultValue="lotSize" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-800 border-slate-700">
              <TabsTrigger value="lotSize" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white py-3"><Calculator className="inline mr-2 h-5 w-5" />{t('calculators_tab_lot_size')}</TabsTrigger>
              <TabsTrigger value="compoundInterest" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white py-3"><Percent className="inline mr-2 h-5 w-5" />{t('calculators_tab_compound_interest')}</TabsTrigger>
              <TabsTrigger value="marketClock" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white py-3"><Clock className="inline mr-2 h-5 w-5" />{t('calculators_tab_market_clock')}</TabsTrigger>
            </TabsList>

            <TabsContent value="lotSize">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Card className="bg-slate-800/70 border-slate-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-sky-400 flex items-center"><Calculator className="mr-2"/>{t('calculators_lot_size_card_title')}</CardTitle>
                    <CardDescription className="text-slate-400">{t('calculators_lot_size_card_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="accountBalance" className="text-slate-300">{t('calculators_account_balance_label')}</Label>
                        <Input type="number" id="accountBalance" name="accountBalance" value={lotSizeParams.accountBalance} onChange={handleLotSizeChange} className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500" placeholder={t('calculators_account_balance_placeholder')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="riskPercentage" className="text-slate-300">{t('calculators_risk_percentage_label')}</Label>
                        <Input type="number" id="riskPercentage" name="riskPercentage" value={lotSizeParams.riskPercentage} onChange={handleLotSizeChange} className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500" placeholder={t('calculators_risk_percentage_placeholder')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stopLossPips" className="text-slate-300">{t('calculators_stop_loss_pips_label')}</Label>
                        <Input type="number" id="stopLossPips" name="stopLossPips" value={lotSizeParams.stopLossPips} onChange={handleLotSizeChange} className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500" placeholder={t('calculators_stop_loss_pips_placeholder')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="selectedPair" className="text-slate-300">{t('calculators_select_pair_label')}</Label>
                        <Select name="selectedPair" value={lotSizeParams.selectedPair} onValueChange={handlePairChange}>
                          <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500">
                            <SelectValue placeholder={t('calculators_select_pair_placeholder')} />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 text-slate-50 border-slate-600 max-h-60 overflow-y-auto">
                            {commonCurrencyPairs.map(pair => (
                              <SelectItem key={pair} value={pair} className="hover:bg-sky-600 focus:bg-sky-600">
                                {pair}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="pairPrice" className="text-slate-300">{t('calculators_current_price_for_pair_label', { pair: lotSizeParams.selectedPair })}</Label>
                        <Input type="number" step="0.00001" id="pairPrice" name="pairPrice" value={lotSizeParams.pairPrice} onChange={handleLotSizeChange} className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500" placeholder={t('calculators_pair_price_placeholder')} />
                      </div>
                    </div>
                    <Button onClick={calculateLotSize} className="w-full bg-sky-500 hover:bg-sky-600 text-lg py-3">{t('calculators_calculate_lot_size_button')}</Button>
                    {lotSizeResult && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="mt-6 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                        {lotSizeResult.error ? (
                          <p className="text-red-400 text-center">{lotSizeResult.error}</p>
                        ) : (
                          <>
                            <h3 className="text-xl font-semibold text-sky-300 mb-3 text-center">{t('calculators_lot_size_result_title')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-slate-600/50 rounded-md">
                                    <p className="text-sm text-slate-400">{t('calculators_lot_size_risk_amount_label')}</p>
                                    <p className="text-2xl font-bold text-green-400">${lotSizeResult.riskAmount}</p>
                                </div>
                                <div className="p-4 bg-slate-600/50 rounded-md">
                                    <p className="text-sm text-slate-400">{t('calculators_lot_size_suggested_label')}</p>
                                    <p className="text-2xl font-bold text-green-400">{lotSizeResult.lotSize} {t('calculators_lot_size_unit')}</p>
                                </div>
                                <div className="p-4 bg-slate-600/50 rounded-md">
                                    <p className="text-sm text-slate-400">{t('calculators_pip_value_label')}</p>
                                    <p className="text-2xl font-bold text-sky-400">${lotSizeResult.pipValue}</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-4 text-center">{t('calculators_lot_size_note')}</p>
                          </>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="compoundInterest">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Card className="bg-slate-800/70 border-slate-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-sky-400 flex items-center"><Percent className="mr-2"/>{t('calculators_compound_card_title')}</CardTitle>
                    <CardDescription className="text-slate-400">{t('calculators_compound_card_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="principal" className="text-slate-300">{t('calculators_principal_label')}</Label>
                        <Input type="number" id="principal" name="principal" value={compoundInterestParams.principal} onChange={handleCompoundInterestChange} className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500" placeholder={t('calculators_principal_placeholder')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthlyContribution" className="text-slate-300">{t('calculators_monthly_contribution_label')}</Label>
                        <Input type="number" id="monthlyContribution" name="monthlyContribution" value={compoundInterestParams.monthlyContribution} onChange={handleCompoundInterestChange} className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500" placeholder={t('calculators_monthly_contribution_placeholder')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="interestRate" className="text-slate-300">{t('calculators_annual_interest_rate_label')}</Label>
                        <Input type="number" id="interestRate" name="interestRate" value={compoundInterestParams.interestRate} onChange={handleCompoundInterestChange} className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500" placeholder={t('calculators_annual_interest_rate_placeholder')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="years" className="text-slate-300">{t('calculators_investment_years_label')}</Label>
                        <Input type="number" id="years" name="years" value={compoundInterestParams.years} onChange={handleCompoundInterestChange} className="bg-slate-700 border-slate-600 text-slate-50 focus:ring-sky-500" placeholder={t('calculators_investment_years_placeholder')} />
                      </div>
                    </div>
                    <Button onClick={calculateCompoundInterest} className="w-full bg-sky-500 hover:bg-sky-600 text-lg py-3">{t('calculators_calculate_compound_button')}</Button>
                    {compoundInterestResult && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }} className="mt-6 p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                        {compoundInterestResult.error ? (
                          <p className="text-red-400 text-center">{compoundInterestResult.error}</p>
                        ) : (
                          <>
                            <h3 className="text-xl font-semibold text-sky-300 mb-4 text-center">{t('calculators_compound_result_title')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-slate-600/50 rounded-md">
                                    <p className="text-sm text-slate-400">{t('calculators_future_value_label')}</p>
                                    <p className="text-2xl font-bold text-green-400">${compoundInterestResult.futureValue}</p>
                                </div>
                                <div className="p-4 bg-slate-600/50 rounded-md">
                                    <p className="text-sm text-slate-400">{t('calculators_total_contributions_label')}</p>
                                    <p className="text-2xl font-bold text-slate-200">${compoundInterestResult.totalContributions}</p>
                                </div>
                                <div className="p-4 bg-slate-600/50 rounded-md">
                                    <p className="text-sm text-slate-400">{t('calculators_total_interest_earned_label')}</p>
                                    <p className="text-2xl font-bold text-emerald-400">${compoundInterestResult.totalInterest}</p>
                                </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="marketClock">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <Card className="bg-slate-800/70 border-slate-700 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-2xl text-sky-400 flex items-center"><Clock className="mr-2"/>{t('calculators_market_clock_card_title')}</CardTitle>
                    <CardDescription className="text-slate-400">{t('calculators_market_clock_card_desc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-w-5xl mx-auto">
                        <MarketClock />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      );
    }
  