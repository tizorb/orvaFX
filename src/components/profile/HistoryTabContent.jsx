
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { ScrollArea } from '@/components/ui/scroll-area'; 
    import { motion } from 'framer-motion';
    import { ArrowDownCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react';

    const HistoryItem = ({ type, item, t }) => {
      const isWithdrawal = type === 'withdrawal';
      const statusColor = 
        item.status === 'approved' || item.status === 'completed' ? 'text-green-400' :
        item.status === 'pending' || item.status === 'pending_approval' || item.status === 'pending_admin_approval' ? 'text-yellow-400' :
        'text-red-400';

      const Icon = isWithdrawal ? ArrowUpCircle : ArrowDownCircle;
      const title = isWithdrawal ? t('profile_history_withdrawal_title') : t('profile_history_payment_title');
      
      let displayStatus = item.status;
      if (t(`status_${item.status}`)) {
        displayStatus = t(`status_${item.status}`);
      }


      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-slate-700/50 rounded-lg shadow-md mb-3 border-l-4"
          style={{ borderColor: isWithdrawal ? '#f59e0b' : '#22c55e' }} 
        >
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-sky-300 flex items-center">
              <Icon size={18} className={`mr-2 ${isWithdrawal ? 'text-amber-400' : 'text-green-400'}`} />
              {title} - ${item.amount ? item.amount.toFixed(2) : '0.00'}
            </h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor} bg-opacity-20 ${
              item.status === 'approved' || item.status === 'completed' ? 'bg-green-500/20' :
              item.status === 'pending' || item.status === 'pending_approval' || item.status === 'pending_admin_approval' ? 'bg-yellow-500/20' :
              'bg-red-500/20'
            }`}>
              {displayStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {t('profile_history_date_label')}: {new Date(item.created_at).toLocaleString()}
          </p>
          {isWithdrawal && item.wallet_address && (
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {t('profile_history_wallet_label')}: {item.wallet_address}
            </p>
          )}
          {!isWithdrawal && item.tier && (
            <p className="text-xs text-slate-500 mt-0.5">
              {t('profile_history_plan_label')}: {item.tier}
            </p>
          )}
           {!isWithdrawal && item.transaction_id && (
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {t('profile_history_transaction_id_label')}: {item.transaction_id}
            </p>
          )}
          {isWithdrawal && item.transaction_id && (
             <p className="text-xs text-slate-500 truncate mt-0.5">
              {t('profile_history_transaction_id_label')}: {item.transaction_id}
            </p>
          )}
        </motion.div>
      );
    };

    const HistoryTabContent = ({ withdrawalHistory = [], paymentHistory = [], t }) => {
      const combinedHistory = [
        ...(Array.isArray(withdrawalHistory) ? withdrawalHistory.map(item => ({ ...item, type: 'withdrawal' })) : []),
        ...(Array.isArray(paymentHistory) ? paymentHistory.map(item => ({ ...item, type: 'payment' })) : [])
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return (
        <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl mt-2">
          <CardHeader>
            <CardTitle className="text-2xl text-sky-400">{t('profile_history_tab_title')}</CardTitle>
            <CardDescription className="text-slate-400">{t('profile_history_tab_desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {combinedHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <AlertTriangle size={48} className="mx-auto mb-4 text-slate-600" />
                <p>{t('profile_history_no_transactions')}</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-3">
                {combinedHistory.map((item) => (
                  <HistoryItem key={`${item.type}-${item.id}`} type={item.type} item={item} t={t} />
                ))}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      );
    };

    export default HistoryTabContent;
  