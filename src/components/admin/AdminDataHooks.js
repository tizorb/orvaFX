
    import { useState, useEffect, useCallback } from 'react';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase, checkSupabaseConnection } from '@/lib/supabaseClient';
    import { STORAGE_KEYS } from '@/lib/authConstants';
    import { loadFromLocalStorage, saveToLocalStorage } from '@/lib/localStorageUtils'; 


    const sampleProjection = {
      id: 'sample_proj_gbpjpy_1_v2_supabase',
      user_id: null, 
      pair: 'GBP/JPY',
      direction: 'long',
      entry_price: 198.500,
      stop_loss: 197.800,
      take_profit1: 200.000,
      analysis: 'Se observa una posible continuación alcista para el par GBP/JPY debido a la fortaleza reciente de la libra esterlina y datos económicos favorables del Reino Unido. El nivel de 198.000 ha actuado como un soporte clave. Buscamos una entrada cerca de 198.500 con un objetivo en la zona psicológica de 200.000. El stop loss se coloca por debajo del soporte inmediato para gestionar el riesgo. Compra sugerida.',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'active'
    };

    const sampleNews = {
      id: 'sample_news_1_v2_supabase',
      user_id: null, 
      title: 'Análisis Semanal del Mercado Forex: Perspectivas y Niveles Clave',
      content: 'Esta semana, los mercados de divisas estarán atentos a las decisiones de política monetaria de varios bancos centrales importantes, incluyendo el Banco Central Europeo y el Banco de Inglaterra. Se espera volatilidad en pares como EUR/USD y GBP/USD. Además, los datos de inflación de EE. UU. serán cruciales para determinar la dirección del dólar. Los traders deben prestar atención a los niveles de soporte y resistencia en los principales pares y gestionar el riesgo adecuadamente ante posibles movimientos bruscos del mercado.',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      published_at: new Date(Date.now() - 3600000 * 5).toISOString()
    };
        
    export const useAdminData = () => {
      const { user: adminUser, updateUserSubscription } = useAuth();
      const [users, setUsersState] = useState([]);
      const [projections, setProjections] = useState([]);
      const [newsItems, setNewsItems] = useState([]);
      const [payments, setPayments] = useState([]);
      const [withdrawals, setWithdrawals] = useState([]); 
      const [supportMessages, setSupportMessages] = useState([]);

      const fetchData = useCallback(async (tableName, setter, sampleData, localStorageKey) => {
        if (!await checkSupabaseConnection()) {
          console.warn(`Supabase not connected. Loading ${tableName} from localStorage or using sample.`);
          const localData = loadFromLocalStorage(localStorageKey, []);
          setter(localData.length > 0 ? localData : (sampleData ? [sampleData] : []));
          return;
        }
        try {
          const { data, error } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
          if (error) throw error;
          if (data) {
            setter(data);
            if (data.length === 0 && sampleData) {
               const { error: insertError } = await supabase.from(tableName).insert(sampleData);
               if(insertError) console.error(`Error inserting sample ${tableName}: `, insertError);
               else setter([sampleData]);
            }
          } else if (sampleData){
            setter([sampleData]);
          }
        } catch (error) {
          console.error(`Error fetching ${tableName}:`, error);
          const localData = loadFromLocalStorage(localStorageKey, []);
          setter(localData.length > 0 ? localData : (sampleData ? [sampleData] : []));
        }
      }, []);

      useEffect(() => {
        fetchData('users', setUsersState, null, STORAGE_KEYS.USERS);
        fetchData('projections', setProjections, sampleProjection, STORAGE_KEYS.PROJECTIONS);
        fetchData('news_items', setNewsItems, sampleNews, STORAGE_KEYS.NEWS_ITEMS);
        fetchData('payments', setPayments, null, STORAGE_KEYS.PAYMENTS);
        fetchData('withdrawal_requests', setWithdrawals, null, 'orvafx_withdrawal_requests_v1'); // Using a distinct key for withdrawals
        fetchData('support_messages', setSupportMessages, null, 'orvafx_support_messages_v1');
      }, [fetchData]);


      const setUsers = useCallback(async (updatedUsersOrFn) => {
        if (typeof updatedUsersOrFn === 'function') {
          setUsersState(prevUsers => {
            const newUsers = updatedUsersOrFn(prevUsers);
            // Here you might want to sync individual user changes to Supabase if not handled by the caller
            return newUsers;
          });
        } else {
          setUsersState(updatedUsersOrFn);
          // Sync all users to Supabase - potentially heavy, prefer individual updates
          // For now, assume UserManagers handles individual user updates to Supabase
        }
      }, []);

      const updateProjections = useCallback(async (newProjectionsOrFn) => {
        let finalProjections;
        if (typeof newProjectionsOrFn === 'function') {
          setProjections(prev => {
            finalProjections = newProjectionsOrFn(prev);
            return finalProjections;
          });
        } else {
          finalProjections = newProjectionsOrFn;
          setProjections(finalProjections);
        }
      
        if (finalProjections && supabase) {
          // This is a simplification. In a real app, you'd diff and update/insert/delete.
          // For now, if it's a manual update, let the component handle Supabase interaction.
        }
      }, []);
      
      const updateNews = useCallback(async (newNewsItemsOrFn) => {
        let finalNewsItems;
        if (typeof newNewsItemsOrFn === 'function') {
          setNewsItems(prev => {
            finalNewsItems = newNewsItemsOrFn(prev);
            return finalNewsItems;
          });
        } else {
          finalNewsItems = newNewsItemsOrFn;
          setNewsItems(finalNewsItems);
        }
      }, []);


      const handleApprovePayment = useCallback(async (paymentId) => {
        if(!supabase) return;
        try {
          const { data: updatedPayment, error: updateError } = await supabase
            .from('payments')
            .update({ status: 'approved', approved_by: adminUser?.id })
            .eq('id', paymentId)
            .select()
            .single();

          if (updateError) throw updateError;

          if (updatedPayment) {
            setPayments(prev => prev.map(p => p.id === paymentId ? updatedPayment : p));
            let durationDays = 30; 
            const planLower = updatedPayment.tier.toLowerCase();
            if (planLower.includes('trimestral')) durationDays = 90;
            if (planLower.includes('anual') || planLower.includes('annual')) durationDays = 365;
            
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + durationDays);
            await updateUserSubscription(updatedPayment.user_id, updatedPayment.tier, true, endDate.toISOString());
          }
        } catch (error) {
          console.error("Error approving payment:", error);
        }
      }, [adminUser, updateUserSubscription]);

      const handleRejectPayment = useCallback(async (paymentId) => {
        if(!supabase) return;
        try {
          const { data: updatedPayment, error } = await supabase
            .from('payments')
            .update({ status: 'rejected', approved_by: adminUser?.id })
            .eq('id', paymentId)
            .select()
            .single();
          
          if (error) throw error;
          if (updatedPayment) {
            setPayments(prev => prev.map(p => p.id === paymentId ? updatedPayment : p));
          }
        } catch (error) {
          console.error("Error rejecting payment:", error);
        }
      }, [adminUser]);
      
      const updateWithdrawalStatusInUsers = useCallback(async (userId, withdrawalId, status) => {
        if (!supabase) return;
        try {
          const { data: updatedWithdrawal, error: updateError } = await supabase
            .from('withdrawal_requests')
            .update({ status: status, processed_by: adminUser?.id })
            .eq('id', withdrawalId)
            .select()
            .single();

          if (updateError) throw updateError;

          if (updatedWithdrawal) {
             setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? updatedWithdrawal : w));
            
            if (status === 'rejected_insufficient_funds' || status === 'rejected_insufficient_funds_by_admin') {
              const { data: userToRefund, error: userError } = await supabase
                .from('users')
                .select('wallet_balance_usdt')
                .eq('id', userId)
                .single();

              if (userError) throw userError;
              
              const newBalance = (parseFloat(userToRefund.wallet_balance_usdt) || 0) + parseFloat(updatedWithdrawal.amount);
              const { error: refundError } = await supabase
                .from('users')
                .update({ wallet_balance_usdt: newBalance, last_withdrawal_date: null })
                .eq('id', userId);
              if (refundError) throw refundError;
              
              // Refresh local users state if current admin is also the user being updated (edge case)
              // Or more broadly, ensure the users list is eventually consistent.
              // For simplicity, we can refetch users list or update specific user locally.
              setUsersState(prevUsers => prevUsers.map(u => u.id === userId ? {...u, wallet_balance_usdt: newBalance, last_withdrawal_date: null } : u));
            }
          }
        } catch (error) {
          console.error("Error updating withdrawal status:", error);
        }
      }, [adminUser]);


      return { 
        users, projections, newsItems, payments, withdrawals, supportMessages,
        setUsers, updateProjections, updateNews, setPayments, setWithdrawals, setSupportMessages,
        handleApprovePayment, handleRejectPayment,
        updateWithdrawalStatusInUsers,
        fetchAdminData: () => { // expose a function to refetch all admin data if needed
          fetchData('users', setUsersState, null, STORAGE_KEYS.USERS);
          fetchData('projections', setProjections, sampleProjection, STORAGE_KEYS.PROJECTIONS);
          fetchData('news_items', setNewsItems, sampleNews, STORAGE_KEYS.NEWS_ITEMS);
          fetchData('payments', setPayments, null, STORAGE_KEYS.PAYMENTS);
          fetchData('withdrawal_requests', setWithdrawals, null, 'orvafx_withdrawal_requests_v1');
          fetchData('support_messages', setSupportMessages, null, 'orvafx_support_messages_v1');
        }
      };
    };
  