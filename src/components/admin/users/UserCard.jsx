
    import React from 'react';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
    import { Button } from "@/components/ui/button";
    import { Badge } from "@/components/ui/badge";
    import { User, Mail, Shield, DollarSign, Tag, CalendarDays, Edit3, Trash2, Briefcase, Link as LinkIcon, CheckCircle, XCircle, Clock } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { format } from 'date-fns';
    import { es } from 'date-fns/locale';
    import { useLanguage } from '@/contexts/LanguageContext';

    const UserCard = ({ user, onEdit, onDelete, t: parentT }) => {
      const { language } = useLanguage();
      const t = parentT || ((key) => key);

      const formatDate = (dateString) => {
        if (!dateString) return t('user_details_not_available', 'N/A');
        try {
          return format(new Date(dateString), 'PPpp', { locale: language === 'es' ? es : undefined });
        } catch (error) {
          return dateString; 
        }
      };

      const formatCurrency = (amount) => {
        if (amount === null || typeof amount === 'undefined') return t('user_details_not_available', 'N/A');
        return `$${parseFloat(amount).toFixed(2)} USDT`;
      };

      const getRoleBadgeVariant = (role) => {
        switch (role?.toLowerCase()) {
          case 'admin':
          case 'superadmin':
            return 'destructive';
          case 'manager':
            return 'secondary';
          default:
            return 'default';
        }
      };

      const DetailItem = ({ icon: Icon, labelKey, value, valueClass = "text-slate-300" }) => (
        <div className="flex items-start space-x-2 text-sm">
          <Icon className="w-4 h-4 mt-0.5 text-sky-400 flex-shrink-0" />
          <span className="font-semibold text-slate-400">{t(labelKey, labelKey.split('_').pop())}:</span>
          <span className={`break-all ${valueClass}`}>{value || t('user_details_not_available', 'N/A')}</span>
        </div>
      );

      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Card className="bg-slate-800/80 border border-slate-700 shadow-lg hover:shadow-sky-500/20 transition-shadow duration-300 rounded-xl overflow-hidden">
            <CardHeader className="p-4 bg-slate-700/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-sky-300 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {user.username || t('user_details_not_available', 'N/A')}
                </CardTitle>
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs px-2 py-0.5">
                  {t(`roles_${user.role?.toLowerCase()}`, user.role || t('status_unknown', 'Unknown'))}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <DetailItem icon={Mail} labelKey="user_details_email" value={user.email} />
              <DetailItem icon={DollarSign} labelKey="user_details_wallet_balance" value={formatCurrency(user.wallet_balance_usdt)} />
              <DetailItem icon={DollarSign} labelKey="user_details_referral_earnings" value={formatCurrency(user.referral_earnings_usdt)} />
              <div className="flex items-start space-x-2 text-sm">
                <CheckCircle className="w-4 h-4 mt-0.5 text-sky-400 flex-shrink-0" />
                <span className="font-semibold text-slate-400">{t('user_details_is_subscribed')}:</span>
                {user.is_subscribed ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-slate-300">
                  {user.is_subscribed ? t('user_details_true', 'Yes') : t('user_details_false', 'No')}
                </span>
              </div>
              {user.is_subscribed && (
                <DetailItem icon={Briefcase} labelKey="user_details_subscription_tier" value={user.subscription_tier} />
              )}
              {user.is_subscribed && user.subscription_end_date && (
                <DetailItem icon={CalendarDays} labelKey="user_details_subscription_end_date" value={formatDate(user.subscription_end_date)} />
              )}
              <DetailItem icon={Tag} labelKey="user_details_referral_code" value={user.referral_code} />
              {user.referred_by && <DetailItem icon={LinkIcon} labelKey="user_details_referred_by" value={user.referred_by} />}
              <DetailItem icon={CalendarDays} labelKey="user_details_created_at" value={formatDate(user.created_at)} />
              <DetailItem icon={Clock} labelKey="user_details_last_withdrawal_date" value={formatDate(user.last_withdrawal_date)} />
              <DetailItem icon={Shield} labelKey="user_details_id" value={user.id} valueClass="text-xs text-slate-400" />
              <DetailItem icon={Shield} labelKey="user_details_auth_id" value={user.auth_user_id} valueClass="text-xs text-slate-400" />
            </CardContent>
            <CardFooter className="p-4 bg-slate-700/30 flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(user)} className="text-sky-300 border-sky-400 hover:bg-sky-400/10 hover:text-sky-200">
                <Edit3 className="w-3.5 h-3.5 mr-1.5" />{t('action_edit', 'Edit')}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default UserCard;
  