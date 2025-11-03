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
    console.log("Received data structure:", JSON.stringify(data).substring(0, 500));

    // Map draw names from API to our standardized names
    const drawNameMap: Record<string, string> = {
      // Handle various name formats from API
      "digital reveil": "Reveil",
      "reveil": "Reveil",
      "etoile": "Etoile",
      "digital etoile": "Etoile",
      "akwaba": "Akwaba",
      "monday special": "Monday Special",
      "la matinale": "La Matinale",
      "matinale": "La Matinale",
      "emergence": "Emergence",
      "sika": "Sika",
      "lucky tuesday": "Lucky Tuesday",
      "premiere heure": "Premiere Heure",
      "fortune": "Fortune",
      "baraka": "Baraka",
      "midweek": "Midweek",
      "kado": "Kado",
      "privilege": "Privilege",
      "monni": "Monni",
      "fortune thursday": "Fortune Thursday",
      "cash": "Cash",
      "solution": "Solution",
      "wari": "Wari",
      "friday bonanza": "Friday Bonanza",
      "soutra": "Soutra",
      "diamant": "Diamant",
      "moaye": "Moaye",
      "national": "National",
      "benediction": "Benediction",
      "prestige": "Prestige",
      "awale": "Awale",
      "espoir": "Espoir",
    };

    const results: LotoBonheurResult[] = [];
    
    // Parse API response - handle the nested structure
    if (data && data.drawsResultsWeekly && Array.isArray(data.drawsResultsWeekly)) {
      console.log("Processing weekly draws...");
      
      for (const week of data.drawsResultsWeekly) {
        if (!week.drawResultsDaily || !Array.isArray(week.drawResultsDaily)) continue;
        
        for (const dailyDraw of week.drawResultsDaily) {
          const dateStr = dailyDraw.date; // Format: "lundi 03/11"
          
          // Parse date
          let drawDate = new Date().toISOString().split("T")[0];
          if (dateStr) {
            const match = dateStr.match(/(\d{2})\/(\d{2})/);
            if (match) {
              const [_, day, month] = match;
              const year = new Date().getFullYear();
              drawDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
          }
          
          // Process all draw categories
          const drawResults = dailyDraw.drawResults || {};
          const allDraws = [
            ...(drawResults.morningDraws || []),
            ...(drawResults.afternoonDraws || []),
            ...(drawResults.eveningDraws || []),
            ...(drawResults.nightDraws || []),
          ];
          
          for (const draw of allDraws) {
            if (!draw.drawName || !draw.winningNumbers) continue;
            
            // Clean and match draw name
            const cleanName = draw.drawName
              .toLowerCase()
              .replace(/digital\s+/gi, '')
              .replace(/\s+\d+h$/i, '')
              .trim();
            
            const mappedName = drawNameMap[cleanName];
            if (!mappedName) {
              console.log(`Unknown draw name: ${draw.drawName} (cleaned: ${cleanName})`);
              continue;
            }
            
            // Parse winning numbers
            let winningNumbers: number[] = [];
            if (typeof draw.winningNumbers === 'string') {
              winningNumbers = draw.winningNumbers
                .split(/[\s,;-]+/)
                .map((n: string) => parseInt(n.trim()))
                .filter((n: number) => !isNaN(n) && n >= 1 && n <= 90)
                .slice(0, 5);
            } else if (Array.isArray(draw.winningNumbers)) {
              winningNumbers = draw.winningNumbers
                .map((n: any) => typeof n === 'number' ? n : parseInt(String(n)))
                .filter((n: number) => !isNaN(n) && n >= 1 && n <= 90)
                .slice(0, 5);
            }
            
            if (winningNumbers.length === 5) {
              results.push({
                game: mappedName,
                date: drawDate,
                winningNumbers,
                machineNumbers: undefined, // API doesn't seem to provide machine numbers
              });
            } else {
              console.log(`Invalid numbers for ${draw.drawName}: got ${winningNumbers.length} numbers`);
            }
          }
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
