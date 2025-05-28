
    import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { motion } from 'framer-motion';
    import { User, CalendarDays, Hash, CheckCircle, XCircle, Edit, Trash2, DollarSign, Tag, Info } from 'lucide-react';
    import { Badge } from '@/components/ui/badge';

    const ManualPaymentCard = ({ payment, onUpdateStatus, onDelete, t }) => {
      const getStatusVariant = (status) => {
        switch (status?.toLowerCase()) {
          case 'completado': return 'success';
          case 'pendiente': return 'warning';
          case 'rechazado': return 'destructive';
          default: return 'secondary';
        }
      };

      const handleUpdateStatus = (newStatus) => {
        console.log(`Update status for ${payment.id} to ${newStatus}`);
        if(onUpdateStatus) onUpdateStatus(payment.id, newStatus);
      };
      
      const handleDelete = () => {
        console.log(`Delete payment ${payment.id}`);
        if(onDelete) onDelete(payment.id);
      };

      return (
        <motion.li
          key={payment.id} // Assuming 'id' comes from vista_pagos_admin
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 150, damping: 20 }}
        >
          <Card className="bg-slate-700/60 border-slate-600 rounded-lg shadow-md hover:shadow-cyan-500/20 transition-shadow duration-300">
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-md sm:text-lg text-cyan-300 flex items-center">
                    <User className="w-4 h-4 mr-1.5"/>{payment.username || payment.email || payment.user_id || 'N/A'}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">
                    {t('admin_manual_payments_id_label')}: {payment.id || 'N/A'}
                  </CardDescription>
                </div>
                <Badge variant={getStatusVariant(payment.status)} className="text-xs">
                  {payment.status || t('status_unknown')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm text-slate-300 space-y-1.5 px-4 pb-3">
              <p className="flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1.5 text-cyan-400"/>{t('admin_manual_payments_amount_label')}: {payment.monto} {payment.moneda || 'USDT'}</p>
              <p className="flex items-center"><Tag className="w-3.5 h-3.5 mr-1.5 text-cyan-400"/>{t('admin_manual_payments_method_label')}: {payment.metodo_pago}</p>
              <p className="flex items-center break-all"><Hash className="w-3.5 h-3.5 mr-1.5 text-cyan-400"/>{t('admin_manual_payments_tx_hash_label')}: 
                {payment.tronscan_link ? ( // Use tronscan_link from useAdminData
                  <a href={payment.tronscan_link} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline ml-1">
                    {payment.comprobante?.slice(0, 12)}...
                  </a>
                ) : (
                  <span className="ml-1">{payment.comprobante || 'N/A'}</span>
                )}
              </p>
              <p className="flex items-center"><CalendarDays className="w-3.5 h-3.5 mr-1.5 text-cyan-400"/>{t('admin_manual_payments_date_label')}: {payment.fecha_local || payment.fechaFormateada || 'N/A'}</p>
              {payment.fecha_verificacion && (
                <p className="flex items-center"><CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-400"/>{t('admin_manual_payments_verification_date_label')}: {new Date(payment.fecha_verificacion).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}</p>
              )}
            </CardContent>
          </Card>
        </motion.li>
      );
    };

    export default ManualPaymentCard;
  