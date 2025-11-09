-- supabase/functions/get_algorithm_trends.sql
CREATE OR REPLACE FUNCTION get_algorithm_trends(p_draw_name TEXT DEFAULT NULL)
RETURNS TABLE(
    model_used TEXT,
    date TIMESTAMP WITH TIME ZONE,
    accuracy_score NUMERIC,
    matches_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ap.model_used,
        ap.created_at as date,
        ap.accuracy_score,
        ap.matches_count
    FROM algorithm_performance ap
    WHERE (p_draw_name IS NULL OR ap.draw_name = p_draw_name)
    ORDER BY ap.created_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql;