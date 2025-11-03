import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LotoBonheurResult {
  game: string;
  date: string;
  winningNumbers: number[];
  machineNumbers?: number[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting scraping job...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create scraping job record
    const { data: job, error: jobError } = await supabase
      .from("scraping_jobs")
      .insert({
        job_date: new Date().toISOString().split("T")[0],
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (jobError) {
      console.error("Error creating job:", jobError);
      throw jobError;
    }

    console.log("Job created:", job.id);

    // Fetch data from Loto Bonheur API
    const apiUrl = "https://lotobonheur.ci/api/results";
    console.log("Fetching from:", apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API returned status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Received data:", JSON.stringify(data).substring(0, 200));

    // Map draw names (adjust based on actual API response structure)
    const drawNameMap: Record<string, string> = {
      // Lundi
      "reveil": "Reveil",
      "etoile": "Etoile",
      "akwaba": "Akwaba",
      "monday_special": "Monday Special",
      // Mardi
      "la_matinale": "La Matinale",
      "emergence": "Emergence",
      "sika": "Sika",
      "lucky_tuesday": "Lucky Tuesday",
      // Mercredi
      "premiere_heure": "Premiere Heure",
      "fortune": "Fortune",
      "baraka": "Baraka",
      "midweek": "Midweek",
      // Jeudi
      "kado": "Kado",
      "privilege": "Privilege",
      "monni": "Monni",
      "fortune_thursday": "Fortune Thursday",
      // Vendredi
      "cash": "Cash",
      "solution": "Solution",
      "wari": "Wari",
      "friday_bonanza": "Friday Bonanza",
      // Samedi
      "soutra": "Soutra",
      "diamant": "Diamant",
      "moaye": "Moaye",
      "national": "National",
      // Dimanche
      "benediction": "Benediction",
      "prestige": "Prestige",
      "awale": "Awale",
      "espoir": "Espoir",
    };

    const results: LotoBonheurResult[] = [];
    
    // Parse API response (adjust based on actual structure)
    if (Array.isArray(data)) {
      for (const item of data) {
        const drawName = drawNameMap[item.game?.toLowerCase().replace(/\s+/g, "_")] || item.game;
        
        if (drawName && item.numbers && Array.isArray(item.numbers)) {
          results.push({
            game: drawName,
            date: item.date || new Date().toISOString().split("T")[0],
            winningNumbers: item.numbers.slice(0, 5),
            machineNumbers: item.machineNumbers?.slice(0, 5),
          });
        }
      }
    }

    console.log(`Parsed ${results.length} results`);

    // Insert results into database
    let insertedCount = 0;
    const errors: string[] = [];

    for (const result of results) {
      try {
        // Check if result already exists
        const { data: existing } = await supabase
          .from("draw_results")
          .select("id")
          .eq("draw_name", result.game)
          .eq("draw_date", result.date)
          .maybeSingle();

        if (existing) {
          console.log(`Skipping duplicate: ${result.game} - ${result.date}`);
          continue;
        }

        // Get draw schedule info
        const scheduleInfo = getDrawScheduleInfo(result.game);
        
        const { error: insertError } = await supabase
          .from("draw_results")
          .insert({
            draw_name: result.game,
            draw_day: scheduleInfo.day,
            draw_time: scheduleInfo.time,
            draw_date: result.date,
            winning_numbers: result.winningNumbers,
            machine_numbers: result.machineNumbers || null,
          });

        if (insertError) {
          console.error(`Error inserting ${result.game}:`, insertError);
          errors.push(`${result.game}: ${insertError.message}`);
        } else {
          insertedCount++;
        }
      } catch (error) {
        console.error(`Error processing ${result.game}:`, error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push(`${result.game}: ${errorMessage}`);
      }
    }

    // Update job status
    const { error: updateError } = await supabase
      .from("scraping_jobs")
      .update({
        status: errors.length > 0 ? "failed" : "completed",
        results_count: insertedCount,
        error_message: errors.length > 0 ? errors.join("; ") : null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    if (updateError) {
      console.error("Error updating job:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        resultsFound: results.length,
        resultsInserted: insertedCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scraping error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

function getDrawScheduleInfo(drawName: string): { day: string; time: string } {
  const schedule: Record<string, { day: string; time: string }> = {
    "Reveil": { day: "Lundi", time: "10:00" },
    "Etoile": { day: "Lundi", time: "13:00" },
    "Akwaba": { day: "Lundi", time: "16:00" },
    "Monday Special": { day: "Lundi", time: "18:15" },
    "La Matinale": { day: "Mardi", time: "10:00" },
    "Emergence": { day: "Mardi", time: "13:00" },
    "Sika": { day: "Mardi", time: "16:00" },
    "Lucky Tuesday": { day: "Mardi", time: "18:15" },
    "Premiere Heure": { day: "Mercredi", time: "10:00" },
    "Fortune": { day: "Mercredi", time: "13:00" },
    "Baraka": { day: "Mercredi", time: "16:00" },
    "Midweek": { day: "Mercredi", time: "18:15" },
    "Kado": { day: "Jeudi", time: "10:00" },
    "Privilege": { day: "Jeudi", time: "13:00" },
    "Monni": { day: "Jeudi", time: "16:00" },
    "Fortune Thursday": { day: "Jeudi", time: "18:15" },
    "Cash": { day: "Vendredi", time: "10:00" },
    "Solution": { day: "Vendredi", time: "13:00" },
    "Wari": { day: "Vendredi", time: "16:00" },
    "Friday Bonanza": { day: "Vendredi", time: "18:15" },
    "Soutra": { day: "Samedi", time: "10:00" },
    "Diamant": { day: "Samedi", time: "13:00" },
    "Moaye": { day: "Samedi", time: "16:00" },
    "National": { day: "Samedi", time: "18:15" },
    "Benediction": { day: "Dimanche", time: "10:00" },
    "Prestige": { day: "Dimanche", time: "13:00" },
    "Awale": { day: "Dimanche", time: "16:00" },
    "Espoir": { day: "Dimanche", time: "18:15" },
  };

  return schedule[drawName] || { day: "Unknown", time: "00:00" };
}
