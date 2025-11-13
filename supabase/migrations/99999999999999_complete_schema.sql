-- ============================================================================
-- LOTO LUMIERE - COMPLETE DATABASE SCHEMA
-- Toutes les tables, fonctions, triggers et policies pour Supabase
-- ============================================================================

-- ============================================================================
-- 1. VALIDATION FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validate_numbers_array(numbers integer[])
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF numbers IS NULL THEN RETURN true; END IF;
  IF array_length(numbers, 1) IS NULL OR array_length(numbers, 1) != 5 THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM unnest(numbers) AS num WHERE num < 1 OR num > 90) THEN RETURN false; END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. DRAW RESULTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.draw_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_name text NOT NULL,
  draw_day text NOT NULL,
  draw_time text NOT NULL,
  draw_date date NOT NULL,
  winning_numbers integer[] NOT NULL,
  machine_numbers integer[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_draw_results_draw_name ON public.draw_results(draw_name);
CREATE INDEX IF NOT EXISTS idx_draw_results_draw_date ON public.draw_results(draw_date DESC);
CREATE INDEX IF NOT EXISTS idx_draw_results_combined ON public.draw_results(draw_name, draw_date DESC);

ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view draw results" ON public.draw_results;
CREATE POLICY "Anyone can view draw results" ON public.draw_results FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.validate_draw_results()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT validate_numbers_array(NEW.winning_numbers) THEN
    RAISE EXCEPTION 'winning_numbers must contain exactly 5 numbers between 1 and 90';
  END IF;
  IF NEW.machine_numbers IS NOT NULL AND NOT validate_numbers_array(NEW.machine_numbers) THEN
    RAISE EXCEPTION 'machine_numbers must contain exactly 5 numbers between 1 and 90';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_draw_results_trigger ON public.draw_results;
CREATE TRIGGER validate_draw_results_trigger
  BEFORE INSERT OR UPDATE ON public.draw_results
  FOR EACH ROW EXECUTE FUNCTION public.validate_draw_results();

DROP TRIGGER IF EXISTS update_draw_results_updated_at ON public.draw_results;
CREATE TRIGGER update_draw_results_updated_at
  BEFORE UPDATE ON public.draw_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 3. NUMBER STATISTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.number_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_name text NOT NULL,
  number integer NOT NULL CHECK (number >= 1 AND number <= 90),
  frequency integer DEFAULT 0,
  last_appearance date,
  days_since_last integer DEFAULT 0,
  associated_numbers jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(draw_name, number)
);

CREATE INDEX IF NOT EXISTS idx_number_statistics_draw_name ON public.number_statistics(draw_name);
CREATE INDEX IF NOT EXISTS idx_number_statistics_frequency ON public.number_statistics(frequency DESC);

ALTER TABLE public.number_statistics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view statistics" ON public.number_statistics;
CREATE POLICY "Anyone can view statistics" ON public.number_statistics FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.update_number_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  num integer;
BEGIN
  FOREACH num IN ARRAY NEW.winning_numbers
  LOOP
    INSERT INTO public.number_statistics (draw_name, number, frequency, last_appearance, days_since_last)
    VALUES (NEW.draw_name, num, 1, NEW.draw_date, 0)
    ON CONFLICT (draw_name, number)
    DO UPDATE SET
      frequency = number_statistics.frequency + 1,
      last_appearance = NEW.draw_date,
      days_since_last = 0,
      updated_at = now();
  END LOOP;
  
  UPDATE public.number_statistics
  SET days_since_last = days_since_last + 1
  WHERE draw_name = NEW.draw_name AND number <> ALL(NEW.winning_numbers);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_statistics_on_draw_insert ON public.draw_results;
CREATE TRIGGER update_statistics_on_draw_insert
  AFTER INSERT ON public.draw_results
  FOR EACH ROW EXECUTE FUNCTION public.update_number_statistics();

-- ============================================================================
-- 4. PREDICTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_name text NOT NULL,
  prediction_date date NOT NULL,
  predicted_numbers integer[] NOT NULL,
  confidence_score numeric(5,2),
  model_used text NOT NULL,
  model_metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_prediction_per_draw_date UNIQUE(draw_name, prediction_date, model_used)
);

CREATE INDEX IF NOT EXISTS idx_predictions_draw_name ON public.predictions(draw_name, prediction_date DESC);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view predictions" ON public.predictions;
CREATE POLICY "Anyone can view predictions" ON public.predictions FOR SELECT USING (true);

-- ============================================================================
-- 5. ALGORITHM PERFORMANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.algorithm_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_name text NOT NULL,
  draw_date date NOT NULL,
  model_used text NOT NULL,
  predicted_numbers integer[] NOT NULL,
  winning_numbers integer[] NOT NULL,
  matches_count integer NOT NULL,
  accuracy_score numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_algorithm_performance_model ON public.algorithm_performance(model_used, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_algorithm_performance_draw ON public.algorithm_performance(draw_name, created_at DESC);

ALTER TABLE public.algorithm_performance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view algorithm performance" ON public.algorithm_performance;
CREATE POLICY "Anyone can view algorithm performance" ON public.algorithm_performance FOR SELECT USING (true);

-- ============================================================================
-- 6. USER PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  bio text,
  level integer DEFAULT 1,
  experience_points integer DEFAULT 0,
  total_predictions integer DEFAULT 0,
  successful_predictions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON public.user_profiles(level DESC);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- 7. USER PREFERENCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_draw_name text DEFAULT 'Midi',
  notification_enabled boolean DEFAULT true,
  notification_time time DEFAULT '09:00:00',
  theme text DEFAULT 'system',
  has_completed_onboarding boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 8. USER FAVORITE NUMBERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_favorite_numbers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  favorite_numbers integer[] NOT NULL,
  name text,
  category text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_favorite_numbers_user_id ON public.user_favorite_numbers(user_id);

ALTER TABLE public.user_favorite_numbers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorite_numbers;
CREATE POLICY "Users can view own favorites" ON public.user_favorite_numbers FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorite_numbers;
CREATE POLICY "Users can insert own favorites" ON public.user_favorite_numbers FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own favorites" ON public.user_favorite_numbers;
CREATE POLICY "Users can update own favorites" ON public.user_favorite_numbers FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorite_numbers;
CREATE POLICY "Users can delete own favorites" ON public.user_favorite_numbers FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 9. PREDICTION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.prediction_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  draw_name text NOT NULL,
  predicted_numbers integer[] NOT NULL,
  actual_numbers integer[],
  matches integer DEFAULT 0,
  prediction_date date NOT NULL,
  draw_date date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prediction_tracking_user_id ON public.prediction_tracking(user_id, created_at DESC);

ALTER TABLE public.prediction_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tracking" ON public.prediction_tracking;
CREATE POLICY "Users can view own tracking" ON public.prediction_tracking FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tracking" ON public.prediction_tracking;
CREATE POLICY "Users can insert own tracking" ON public.prediction_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 10. USER PREDICTION FEEDBACK
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_prediction_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_id uuid NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  matches integer CHECK (matches >= 0 AND matches <= 5),
  comments text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.user_prediction_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_prediction ON public.user_prediction_feedback(prediction_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.user_prediction_feedback(rating);

ALTER TABLE public.user_prediction_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_prediction_feedback;
CREATE POLICY "Users can view own feedback" ON public.user_prediction_feedback FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own feedback" ON public.user_prediction_feedback;
CREATE POLICY "Users can insert own feedback" ON public.user_prediction_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 11. ACHIEVEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text,
  category text NOT NULL,
  points integer DEFAULT 0,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view achievements" ON public.achievements;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- ============================================================================
-- 12. USER ACHIEVEMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own achievements" ON public.user_achievements;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 13. SCRAPING JOBS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.scraping_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  results_count integer DEFAULT 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scraping_jobs_date ON public.scraping_jobs(job_date DESC);

ALTER TABLE public.scraping_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view scraping jobs" ON public.scraping_jobs;
CREATE POLICY "Anyone can view scraping jobs" ON public.scraping_jobs FOR SELECT USING (true);

-- ============================================================================
-- 14. ADMIN ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON public.admin_roles(user_id);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own admin role" ON public.admin_roles;
CREATE POLICY "Users can view own admin role" ON public.admin_roles FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 15. ALGORITHM CONFIGURATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.algorithm_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  algorithm_name text NOT NULL UNIQUE,
  is_enabled boolean DEFAULT true,
  weight numeric(3,2) DEFAULT 1.0,
  parameters jsonb DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.algorithm_configurations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view algorithm configs" ON public.algorithm_configurations;
CREATE POLICY "Anyone can view algorithm configs" ON public.algorithm_configurations FOR SELECT USING (true);

-- ============================================================================
-- SEED DATA - ACHIEVEMENTS
-- ============================================================================

INSERT INTO public.achievements (name, description, icon, category, points, requirement_type, requirement_value)
VALUES
  ('Premier Pas', 'Faire votre première prédiction', '🎯', 'predictions', 10, 'predictions_count', 1),
  ('Débutant', 'Faire 10 prédictions', '🌟', 'predictions', 50, 'predictions_count', 10),
  ('Expert', 'Faire 100 prédictions', '🏆', 'predictions', 500, 'predictions_count', 100),
  ('Chance Débutante', 'Trouver 3 numéros corrects', '🍀', 'accuracy', 100, 'matches_count', 3),
  ('Bonne Fortune', 'Trouver 4 numéros corrects', '✨', 'accuracy', 250, 'matches_count', 4),
  ('Jackpot', 'Trouver 5 numéros corrects', '💎', 'accuracy', 1000, 'matches_count', 5)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED DATA - ALGORITHM CONFIGURATIONS
-- ============================================================================

INSERT INTO public.algorithm_configurations (algorithm_name, is_enabled, weight, parameters)
VALUES
  ('Analyse Fréquentielle', true, 1.0, '{"threshold": 0.15, "recency_boost": 1.2}'::jsonb),
  ('ML K-means', true, 0.9, '{"n_clusters": 5, "max_iter": 100}'::jsonb),
  ('Inférence Bayésienne', true, 0.95, '{"prior_weight": 0.3}'::jsonb),
  ('Neural Network', true, 0.85, '{"hidden_layers": [64, 32], "epochs": 50}'::jsonb),
  ('Analyse Variance', true, 0.8, '{"window_size": 20}'::jsonb),
  ('LightGBM', true, 0.9, '{"num_leaves": 31, "learning_rate": 0.05}'::jsonb),
  ('CatBoost', true, 0.9, '{"iterations": 100, "depth": 6}'::jsonb),
  ('Transformer', true, 0.85, '{"num_heads": 4, "num_layers": 2}'::jsonb),
  ('ARIMA', true, 0.8, '{"p": 2, "d": 1, "q": 2}'::jsonb)
ON CONFLICT (algorithm_name) DO NOTHING;

-- ============================================================================
-- COMPLETE SCHEMA READY
-- ============================================================================
