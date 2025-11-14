import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScrapingJob {
  id: string;
  job_date: string;
  status: string;
  results_count: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  created_at: string;
}

export const useScrapingJobs = (limit = 20) => {
  return useQuery({
    queryKey: ["scraping-jobs", limit],
    queryFn: async (): Promise<ScrapingJob[]> => {
      const { data, error } = await supabase
        .from("scraping_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as ScrapingJob[];
    },
    refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
  });
};

export const useLatestScrapingJob = () => {
  return useQuery({
    queryKey: ["latest-scraping-job"],
    queryFn: async (): Promise<ScrapingJob | null> => {
      const { data, error } = await supabase
        .from("scraping_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Rafraîchir toutes les 5 secondes
  });
};
