import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useAdminRole = (userId: string | undefined) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!userId) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        if (error) throw error;
        setIsAdmin(data?.role === "admin" || data?.role === "super_admin");
      } catch (error) {
        console.error("Error checking admin role:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [userId]);

  return { isAdmin, loading };
};
