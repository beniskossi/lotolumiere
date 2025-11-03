import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NumberStatistic {
  id: string;
  draw_name: string;
  number: number;
  frequency: number;
  last_appearance: string | null;
  days_since_last: number;
  associated_numbers: number[];
  updated_at: string;
}

export const useNumberStatistics = (drawName: string) => {
  return useQuery({
    queryKey: ["number-statistics", drawName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("number_statistics")
        .select("*")
        .eq("draw_name", drawName)
        .order("frequency", { ascending: false });

      if (error) throw error;
      return data as NumberStatistic[];
    },
  });
};

export const useMostFrequentNumbers = (drawName: string, limit = 10) => {
  return useQuery({
    queryKey: ["most-frequent-numbers", drawName, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("number_statistics")
        .select("*")
        .eq("draw_name", drawName)
        .order("frequency", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as NumberStatistic[];
    },
  });
};

export const useLeastFrequentNumbers = (drawName: string, limit = 10) => {
  return useQuery({
    queryKey: ["least-frequent-numbers", drawName, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("number_statistics")
        .select("*")
        .eq("draw_name", drawName)
        .gt("frequency", 0)
        .order("frequency", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as NumberStatistic[];
    },
  });
};
