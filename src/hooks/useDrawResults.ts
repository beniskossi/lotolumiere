import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DrawResult {
  id: string;
  draw_name: string;
  draw_day: string;
  draw_time: string;
  draw_date: string;
  winning_numbers: number[];
  machine_numbers: number[] | null;
  created_at: string;
}

export const useDrawResults = (drawName?: string, limit = 10) => {
  return useQuery({
    queryKey: ["draw-results", drawName, limit],
    queryFn: async () => {
      let query = supabase
        .from("draw_results")
        .select("*")
        .order("draw_date", { ascending: false })
        .limit(limit);

      if (drawName) {
        query = query.eq("draw_name", drawName);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as DrawResult[];
    },
  });
};

export const useRefreshResults = () => {
  return async () => {
    const { data, error } = await supabase.functions.invoke("scrape-results");
    
    if (error) {
      console.error("Error refreshing results:", error);
      throw error;
    }
    
    return data;
  };
};
