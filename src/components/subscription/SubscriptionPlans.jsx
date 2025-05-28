
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { CheckCircle, Star } from 'lucide-react';
    import { useLanguage } from '@/contexts/LanguageContext';

    const plansData = [
      {
        nameKey: "subscription_monthly_name",
        priceKey: "subscription_monthly_price",
        priceNum: 29.99,
        durationKey: "subscription_monthly_duration",
        featuresKeys: [
          "subscription_monthly_feature1",
          "subscription_monthly_feature2",
          "subscription_monthly_feature3",
          "subscription_monthly_feature4"
        ],
        bgColor: "from-sky-500 to-blue-600",
        borderColor: "border-sky-500",
        id: "monthly"
      },
      {
        nameKey: "subscription_annual_name",
        priceKey: "subscription_annual_price",
        priceNum: 299.99,
        durationKey: "subscription_annual_duration",
        featuresKeys: [
          "subscription_annual_feature1",
          "subscription_annual_feature2",
          "subscription_annual_feature3",
          "subscription_annual_feature4"
        ],
        bgColor: "from-purple-500 to-indigo-600",
        borderColor: "border-purple-500",
        id: "annual"
      }
    ];

    const SubscriptionPlans = ({ onSelectPlan }) => {
      const { t } = useLanguage();

      return (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plansData.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className={`bg-slate-800/70 border-2 ${plan.borderColor} shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full`}>
                <CardHeader className={`text-center rounded-t-lg bg-gradient-to-br ${plan.bgColor} py-8`}>
                  <Star className={`w-12 h-12 mx-auto mb-4 ${plan.id === 'annual' ? 'text-yellow-300' : 'text-white'}`} />
                  <CardTitle className="text-3xl font-bold text-white">{t(plan.nameKey)}</CardTitle>
                  <CardDescription className="text-4xl font-extrabold text-white mt-2">{t(plan.priceKey)}</CardDescription>
                  <p className="text-sm text-white/80">{t('general_na')} {t(plan.durationKey)}</p>
                </CardHeader>
                <CardContent className="pt-8 pb-6 space-y-4 flex-grow">
                  <ul className="space-y-3">
                    {plan.featuresKeys.map((featureKey, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                        <span className="text-slate-200">{t(featureKey)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto p-6">
                  <Button 
                    onClick={() => onSelectPlan(plan)} 
                    className={`w-full text-lg py-3 bg-gradient-to-r ${plan.bgColor} hover:opacity-90 transition-opacity duration-300 text-white`}
                  >
                    {t('subscription_select_plan_button')}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      );
    };

    export default SubscriptionPlans;
  