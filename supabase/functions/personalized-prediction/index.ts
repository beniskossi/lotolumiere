import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { DrawResult } from "../_shared/types.ts";
import { ensemblePrediction } from "../_shared/ensemble.ts";
import { generatePersonalizedPrediction, analyzeUserPatterns } from "../_shared/personalized.ts";
import { detectPatterns } from "../_shared/pattern-detection.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawName, userId } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: results } = await supabase
      .from('draw_results')
      .select('*')
      .eq('draw_name', drawName)
      .order('draw_date', { ascending: false })
      .limit(100);

    if (!results || results.length < 10) {
      return new Response(JSON.stringify({ 
        error: "Données insuffisantes" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const basePrediction = ensemblePrediction(results as DrawResult[]);
    
    if (!userId) {
      return new Response(JSON.stringify({ prediction: basePrediction }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: favorites } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId);

    const { data: tracked } = await supabase
      .from('user_prediction_tracking')
      .select('*, predictions(*)')
      .eq('user_id', userId);

    const userPrefs = analyzeUserPatterns(favorites || [], tracked || []);
    const personalizedPrediction = generatePersonalizedPrediction(
      basePrediction,
      userPrefs,
      0.7
    );

    const patterns = detectPatterns(results as DrawResult[]);

    return new Response(JSON.stringify({ 
      prediction: personalizedPrediction,
      patterns: patterns.slice(0, 5),
      userPrefs: {
        favoritesCount: userPrefs.favoriteNumbers.length,
        trackedCount: userPrefs.trackedPatterns.length,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
