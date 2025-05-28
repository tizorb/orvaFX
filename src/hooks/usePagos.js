
    import { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';

    export const usePagos = () => {
      const [pagos, setPagos] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);

      const fetchPagosData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error: fetchError } = await supabase
            .from('vista_pagos_admin')
            .select(`
              id, 
              username,
              email,
              monto,
              moneda,
              metodo_pago,
              estado,
              fecha_pago,
              comprobante,
              hash_transaccion,
              notas,
              nivel,
              fecha_actualizacion
            `)
            .order('fecha_pago', { ascending: false });

          if (fetchError) {
            console.error('Error fetching payments from view:', fetchError);
            throw fetchError;
          }
          
          const formattedData = data.map(pago => ({
            ...pago,
            id: pago.id, 
            username: pago.username || pago.email,
            email: pago.email,
            status: pago.estado, 
            transaction_id: pago.hash_transaccion || pago.comprobante, 
            fecha_local: pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : 'N/A',
            fechaFormateada: pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit'}) : 'N/A',
            tronscan_link: pago.comprobante ? `https://tronscan.org/#/transaction/${pago.comprobante}` : (pago.hash_transaccion ? `https://tronscan.org/#/transaction/${pago.hash_transaccion}` : null),
          }));
          setPagos(formattedData);

        } catch (err) {
          console.error('Error in fetchPagosData:', err.message);
          setError(err);
          setPagos([]);
        } finally {
          setLoading(false);
        }
      }, []);

      useEffect(() => {
        fetchPagosData();
      }, [fetchPagosData]);

      return { pagos, loading, error, refetchPagos: fetchPagosData };
    };
  