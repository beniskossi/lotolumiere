-- supabase/migrations/20250101000000_add_performance_metrics.sql

ALTER TABLE algorithm_performance 
ADD COLUMN IF NOT EXISTS precision_score DECIMAL(5,3),
ADD COLUMN IF NOT EXISTS recall_score DECIMAL(5,3),
ADD COLUMN IF NOT EXISTS f1_score DECIMAL(5,3),
ADD COLUMN IF NOT EXISTS execution_time INTEGER,
ADD COLUMN IF NOT EXISTS data_points_used INTEGER,
ADD COLUMN IF NOT EXISTS prediction_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS factors TEXT[],
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,3);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_algorithm_performance_model_date 
ON algorithm_performance(model_used, draw_date DESC);

CREATE INDEX IF NOT EXISTS idx_algorithm_performance_draw_name 
ON algorithm_performance(draw_name);

CREATE INDEX IF NOT EXISTS idx_algorithm_performance_accuracy 
ON algorithm_performance(accuracy_score DESC);