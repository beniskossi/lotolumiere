export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      algorithm_config: {
        Row: {
          algorithm_name: string
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          parameters: Json | null
          updated_at: string
          weight: number
        }
        Insert: {
          algorithm_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          parameters?: Json | null
          updated_at?: string
          weight?: number
        }
        Update: {
          algorithm_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          parameters?: Json | null
          updated_at?: string
          weight?: number
        }
        Relationships: []
      }
      algorithm_performance: {
        Row: {
          accuracy_score: number
          created_at: string
          draw_date: string
          draw_name: string
          id: string
          matches_count: number
          model_used: string
          predicted_numbers: number[]
          prediction_date: string
          winning_numbers: number[]
        }
        Insert: {
          accuracy_score?: number
          created_at?: string
          draw_date: string
          draw_name: string
          id?: string
          matches_count?: number
          model_used: string
          predicted_numbers: number[]
          prediction_date: string
          winning_numbers: number[]
        }
        Update: {
          accuracy_score?: number
          created_at?: string
          draw_date?: string
          draw_name?: string
          id?: string
          matches_count?: number
          model_used?: string
          predicted_numbers?: number[]
          prediction_date?: string
          winning_numbers?: number[]
        }
        Relationships: []
      }
      algorithm_training_history: {
        Row: {
          algorithm_name: string
          created_at: string
          id: string
          new_parameters: Json | null
          new_weight: number
          performance_improvement: number | null
          previous_parameters: Json | null
          previous_weight: number
          training_date: string
          training_metrics: Json | null
        }
        Insert: {
          algorithm_name: string
          created_at?: string
          id?: string
          new_parameters?: Json | null
          new_weight: number
          performance_improvement?: number | null
          previous_parameters?: Json | null
          previous_weight: number
          training_date?: string
          training_metrics?: Json | null
        }
        Update: {
          algorithm_name?: string
          created_at?: string
          id?: string
          new_parameters?: Json | null
          new_weight?: number
          performance_improvement?: number | null
          previous_parameters?: Json | null
          previous_weight?: number
          training_date?: string
          training_metrics?: Json | null
        }
        Relationships: []
      }
      draw_results: {
        Row: {
          created_at: string | null
          draw_date: string
          draw_day: string
          draw_name: string
          draw_time: string
          id: string
          machine_numbers: number[] | null
          updated_at: string | null
          winning_numbers: number[]
        }
        Insert: {
          created_at?: string | null
          draw_date: string
          draw_day: string
          draw_name: string
          draw_time: string
          id?: string
          machine_numbers?: number[] | null
          updated_at?: string | null
          winning_numbers: number[]
        }
        Update: {
          created_at?: string | null
          draw_date?: string
          draw_day?: string
          draw_name?: string
          draw_time?: string
          id?: string
          machine_numbers?: number[] | null
          updated_at?: string | null
          winning_numbers?: number[]
        }
        Relationships: []
      }
      number_statistics: {
        Row: {
          associated_numbers: Json | null
          days_since_last: number | null
          draw_name: string
          frequency: number | null
          id: string
          last_appearance: string | null
          number: number
          updated_at: string | null
        }
        Insert: {
          associated_numbers?: Json | null
          days_since_last?: number | null
          draw_name: string
          frequency?: number | null
          id?: string
          last_appearance?: string | null
          number: number
          updated_at?: string | null
        }
        Update: {
          associated_numbers?: Json | null
          days_since_last?: number | null
          draw_name?: string
          frequency?: number | null
          id?: string
          last_appearance?: string | null
          number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      prediction_shares: {
        Row: {
          id: string
          prediction_id: string
          share_platform: string
          shared_at: string
          user_id: string
        }
        Insert: {
          id?: string
          prediction_id: string
          share_platform: string
          shared_at?: string
          user_id: string
        }
        Update: {
          id?: string
          prediction_id?: string
          share_platform?: string
          shared_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_shares_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      predictions: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          draw_name: string
          id: string
          model_metadata: Json | null
          model_used: string
          predicted_numbers: number[]
          prediction_date: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          draw_name: string
          id?: string
          model_metadata?: Json | null
          model_used: string
          predicted_numbers: number[]
          prediction_date: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          draw_name?: string
          id?: string
          model_metadata?: Json | null
          model_used?: string
          predicted_numbers?: number[]
          prediction_date?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      scraping_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          job_date: string
          results_count: number | null
          started_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_date: string
          results_count?: number | null
          started_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_date?: string
          results_count?: number | null
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          draw_name: string
          favorite_numbers: number[]
          id: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          draw_name: string
          favorite_numbers: number[]
          id?: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          draw_name?: string
          favorite_numbers?: number[]
          id?: string
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_prediction_tracking: {
        Row: {
          id: string
          marked_at: string
          notes: string | null
          prediction_id: string
          user_id: string
        }
        Insert: {
          id?: string
          marked_at?: string
          notes?: string | null
          prediction_id: string
          user_id: string
        }
        Update: {
          id?: string
          marked_at?: string
          notes?: string | null
          prediction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_prediction_tracking_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          custom_layout: Json | null
          has_completed_onboarding: boolean
          id: string
          notification_enabled: boolean
          preferred_algorithm: string | null
          preferred_draw_name: string | null
          theme_accent_color: string | null
          theme_primary_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_layout?: Json | null
          has_completed_onboarding?: boolean
          id?: string
          notification_enabled?: boolean
          preferred_algorithm?: string | null
          preferred_draw_name?: string | null
          theme_accent_color?: string | null
          theme_primary_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_layout?: Json | null
          has_completed_onboarding?: boolean
          id?: string
          notification_enabled?: boolean
          preferred_algorithm?: string | null
          preferred_draw_name?: string | null
          theme_accent_color?: string | null
          theme_primary_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      algorithm_rankings: {
        Row: {
          avg_accuracy: number | null
          best_match: number | null
          draw_name: string | null
          excellent_predictions: number | null
          first_prediction: string | null
          good_predictions: number | null
          last_prediction: string | null
          model_used: string | null
          perfect_predictions: number | null
          total_matches: number | null
          total_predictions: number | null
        }
        Relationships: []
      }
      algorithm_rankings_detailed: {
        Row: {
          accuracy_stddev: number | null
          avg_accuracy: number | null
          best_match: number | null
          consistency_score: number | null
          draw_name: string | null
          excellent_predictions: number | null
          f1_score: number | null
          first_prediction: string | null
          good_predictions: number | null
          last_prediction: string | null
          model_used: string | null
          outstanding_predictions: number | null
          overall_score: number | null
          perfect_predictions: number | null
          precision_rate: number | null
          recall_rate: number | null
          total_matches: number | null
          total_predictions: number | null
          worst_match: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      count_array_matches: {
        Args: { arr1: number[]; arr2: number[] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      refresh_algorithm_rankings: { Args: never; Returns: undefined }
      validate_numbers_array: { Args: { numbers: number[] }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
