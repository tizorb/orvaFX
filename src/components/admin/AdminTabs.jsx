
    import React from 'react';
    import { motion } from 'framer-motion';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
    import { Users, BarChart2, Newspaper, CreditCard, SendToBack, MessageSquare } from 'lucide-react';

    const AdminTabs = ({ t, tabComponents }) => {
      const tabItems = [
        { value: "users", labelKey: 'admin_tab_users', icon: Users, component: tabComponents.users },
        { value: "projections", labelKey: 'admin_tab_projections', icon: BarChart2, component: tabComponents.projections },
        { value: "news", labelKey: 'admin_tab_news', icon: Newspaper, component: tabComponents.news },
        { value: "payments", labelKey: 'admin_tab_payments', icon: CreditCard, component: tabComponents.payments },
        { value: "withdrawals", labelKey: 'admin_tab_withdrawals', icon: SendToBack, component: tabComponents.withdrawals },
        { value: "support", labelKey: 'admin_tab_support', icon: MessageSquare, component: tabComponents.support },
      ];

      return (
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2 mb-6 sm:mb-8 bg-slate-800/60 border border-slate-700 rounded-lg p-1.5 sm:p-2 h-auto">
            {tabItems.map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="py-2.5 sm:py-3 text-xs sm:text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-md transition-all duration-300 flex items-center justify-center flex-col sm:flex-row group"
              >
                <tab.icon className="w-4 h-4 mb-1 sm:mb-0 sm:mr-1.5 text-slate-400 group-data-[state=active]:text-white transition-colors" /> 
                <span className="text-center sm:text-left text-slate-300 group-data-[state=active]:text-white transition-colors">{t(tab.labelKey)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            {tabItems.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="outline-none ring-0">
                {tab.component}
              </TabsContent>
            ))}
          </motion.div>
        </Tabs>
      );
    };

    export default AdminTabs;
  