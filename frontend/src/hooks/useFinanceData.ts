import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  recipient: string;
  name: string;
  bank_source: string;
  type: string;
}

export const useFinanceData = () => {
  return useQuery({
    queryKey: ['financeData'],
    queryFn: async () => {
      // Fetch from the ONE unified view. No more 404s.
      const { data, error } = await supabase
        .from('all_finance_transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      // DATA FIX: Ensure amount is a number so math works in the Dashboard
      return (data || []).map((item: any) => ({
        ...item,
        amount: Number(item.amount) || 0,
        name: item.name || item.recipient || 'Unknown',
        date: item.date
      })) as Transaction[];
    }
  });
};