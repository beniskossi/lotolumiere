import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const demoDraws = [
      { name: "Reveil", day: "Lundi", time: "10:00" },
      { name: "Prestige", day: "Dimanche", time: "13:00" },
      { name: "National", day: "Samedi", time: "18:15" },
      { name: "Fortune", day: "Mercredi", time: "13:00" },
      { name: "Etoile", day: "Lundi", time: "13:00" },
    ];

    const results = [];
    const today = new Date();

    for (const draw of demoDraws) {
      // Generate 12 historical draws for each
      for (let i = 4; i < 16; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i * 7); // Weekly draws
        
        const winningNumbers = Array.from({ length: 5 }, () => 
          Math.floor(Math.random() * 90) + 1
        );

        const { error } = await supabase.from("draw_results").insert({
          draw_name: draw.name,
          draw_day: draw.day,
          draw_time: draw.time,
          draw_date: date.toISOString().split('T')[0],
          winning_numbers: winningNumbers,
        });

        if (!error) {
          results.push({ draw: draw.name, date: date.toISOString().split('T')[0] });
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
