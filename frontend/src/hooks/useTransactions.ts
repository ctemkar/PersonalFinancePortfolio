import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  name: string;
  recipient: string;
  type: string;
  bank_source: string;
}

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('all_finance_transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw new Error(error.message);

      return (data || []).map((t: any) => ({
        ...t,
        amount: parseFloat(t.amount) || 0,
        // Ensure we always have a string for the name to avoid blank columns
        name: t.name || t.recipient || 'Unknown Recipient'
      })) as Transaction[];
    },
  });
};
