-- supabase/functions/refresh_algorithm_rankings.sql

CREATE OR REPLACE FUNCTION refresh_algorithm_rankings()
RETURNS void AS $$
BEGIN
  -- Supprimer et recréer la vue matérialisée
  DROP MATERIALIZED VIEW IF EXISTS algorithm_rankings;
  
  CREATE MATERIALIZED VIEW algorithm_rankings AS
  SELECT 
    model_used,
    draw_name,
    COUNT(*) as total_predictions,
    AVG(accuracy_score) as avg_accuracy,
    SUM(matches_count) as total_matches,
    COUNT(CASE WHEN matches_count >= 3 THEN 1 END) as good_predictions,
    COUNT(CASE WHEN matches_count >= 4 THEN 1 END) as excellent_predictions,
    COUNT(CASE WHEN matches_count = 5 THEN 1 END) as perfect_predictions,
    MAX(matches_count) as best_match,
    MIN(prediction_date) as first_prediction,
    MAX(prediction_date) as last_prediction,
    AVG(confidence_score) as avg_confidence,
    AVG(precision_score) as avg_precision,
    AVG(recall_score) as avg_recall,
    AVG(f1_score) as avg_f1_score
  FROM algorithm_performance
  GROUP BY model_used, draw_name;
  
  -- Créer les index
  CREATE INDEX IF NOT EXISTS idx_algorithm_rankings_model 
  ON algorithm_rankings(model_used);
  
  CREATE INDEX IF NOT EXISTS idx_algorithm_rankings_draw 
  ON algorithm_rankings(draw_name);
  
  CREATE INDEX IF NOT EXISTS idx_algorithm_rankings_accuracy 
  ON algorithm_rankings(avg_accuracy DESC);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les tendances
CREATE OR REPLACE FUNCTION get_algorithm_trends(p_draw_name TEXT DEFAULT NULL)
RETURNS TABLE(
    model_used TEXT,
    date TIMESTAMP WITH TIME ZONE,
    accuracy_score NUMERIC,
    matches_count INTEGER,
    confidence_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.model_used,
        ap.created_at as date,
        ap.accuracy_score,
        ap.matches_count,
        ap.confidence_score
    FROM algorithm_performance ap
    WHERE (p_draw_name IS NULL OR ap.draw_name = p_draw_name)
    ORDER BY ap.created_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;