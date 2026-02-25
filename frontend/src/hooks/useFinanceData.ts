import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../src/lib/supabaseClient.js';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  recipient: string;
  name: string;
  bank_source: string;
}

export const useFinanceData = () => {
  return useQuery({
    queryKey: ['financeData'],
    queryFn: async () => {
      // Fetch from the ONE master view
      const { data, error } = await supabase
        .from('all_finance_transactions')
        .select('*');

      if (error) throw error;

      // If this shows 38 in the console now, we have won.
      console.log("Supabase returned rows:", data?.length);

      return (data || []).map((t: any) => ({
        ...t,
        amount: Number(t.amount) || 0,
        name: t.name || t.recipient || 'Unknown',
        date: t.date
      })) as Transaction[];
    }
  });
};