import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScheduledTask {
  jobid: number;
  schedule: string;
  command: string;
  nodename: string;
  nodeport: number;
  database: string;
  username: string;
  active: boolean;
  jobname: string;
}

export const useScheduledTasks = () => {
  return useQuery({
    queryKey: ["scheduled-tasks"],
    queryFn: async () => {
      // Retourne les tâches planifiées disponibles
      // Dans une future version, cela interrogera pg_cron
      return [] as ScheduledTask[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};
