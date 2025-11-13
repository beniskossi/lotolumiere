import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import type { DrawResult } from "../_shared/types.ts";
import { backtestAlgorithm } from "../_shared/backtesting.ts";
import {
  weightedFrequencyAlgorithm,
  bayesianInferenceAlgorithm,
  neuralNetworkAlgorithm,
  randomForestAlgorithm,
  gradientBoostingAlgorithm,
  lstmAlgorithm,
  arimaAlgorithm,
} from "../_shared/algorithms.ts";
import { ensemblePrediction } from "../_shared/ensemble.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { drawName } = await req.json();

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

    if (!results || results.length < 50) {
      return new Response(JSON.stringify({ 
        error: "Données insuffisantes pour backtesting" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const algorithms = [
      { name: "Ensemble", fn: ensemblePrediction },
      { name: "Weighted Frequency", fn: weightedFrequencyAlgorithm },
      { name: "Bayesian", fn: bayesianInferenceAlgorithm },
      { name: "Neural Network", fn: neuralNetworkAlgorithm },
      { name: "Random Forest", fn: randomForestAlgorithm },
      { name: "Gradient Boosting", fn: gradientBoostingAlgorithm },
      { name: "LSTM", fn: lstmAlgorithm },
      { name: "ARIMA", fn: arimaAlgorithm },
    ];

    const evaluations = await Promise.all(
      algorithms.map(algo => 
        backtestAlgorithm(algo.fn, algo.name, results as DrawResult[], 30)
      )
    );

    return new Response(JSON.stringify({ 
      drawName,
      evaluations: evaluations.sort((a, b) => b.accuracy - a.accuracy)
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
