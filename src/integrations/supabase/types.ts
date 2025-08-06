export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      credit_plans: {
        Row: {
          created_at: string
          credits_amount: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          payment_link: string | null
          plan_type: string
          price: number
          recurrence: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_amount: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          payment_link?: string | null
          plan_type: string
          price: number
          recurrence?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_amount?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          payment_link?: string | null
          plan_type?: string
          price?: number
          recurrence?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      credit_purchases: {
        Row: {
          admin_notes: string | null
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string
          credits_amount: number
          id: string
          payment_reference: string | null
          plan_id: string
          provider_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          credits_amount: number
          id?: string
          payment_reference?: string | null
          plan_id: string
          provider_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          credits_amount?: number
          id?: string
          payment_reference?: string | null
          plan_id?: string
          provider_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "credit_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          provider_id: string
          service_request_id: string | null
          stripe_payment_id: string | null
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          provider_id: string
          service_request_id?: string | null
          stripe_payment_id?: string | null
          transaction_type: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          provider_id?: string
          service_request_id?: string | null
          stripe_payment_id?: string | null
          transaction_type?: Database["public"]["Enums"]["credit_transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "credit_transactions_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      credits: {
        Row: {
          balance: number | null
          id: string
          provider_id: string
          total_purchased: number | null
          total_used: number | null
          updated_at: string
        }
        Insert: {
          balance?: number | null
          id?: string
          provider_id: string
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
        }
        Update: {
          balance?: number | null
          id?: string
          provider_id?: string
          total_purchased?: number | null
          total_used?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "credits_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lead_unlocks: {
        Row: {
          credits_used: number
          id: string
          provider_id: string
          service_request_id: string
          unlocked_at: string
        }
        Insert: {
          credits_used?: number
          id?: string
          provider_id: string
          service_request_id: string
          unlocked_at?: string
        }
        Update: {
          credits_used?: number
          id?: string
          provider_id?: string
          service_request_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_unlocks_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lead_unlocks_service_request_id_fkey"
            columns: ["service_request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          related_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          related_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          related_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          company_name: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          profile_image_url: string | null
          state: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          city?: string | null
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          city?: string | null
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          profile_image_url?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      provider_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          provider_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          provider_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_categories_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          additional_info: Json | null
          budget_max: number | null
          budget_min: number | null
          category_id: string
          city: string
          client_id: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          state: string
          status: Database["public"]["Enums"]["service_request_status"] | null
          title: string
          updated_at: string
          urgency: string | null
        }
        Insert: {
          additional_info?: Json | null
          budget_max?: number | null
          budget_min?: number | null
          category_id: string
          city: string
          client_id: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          state: string
          status?: Database["public"]["Enums"]["service_request_status"] | null
          title: string
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          additional_info?: Json | null
          budget_max?: number | null
          budget_min?: number | null
          category_id?: string
          city?: string
          client_id?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          state?: string
          status?: Database["public"]["Enums"]["service_request_status"] | null
          title?: string
          updated_at?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_clients: number
          total_providers: number
          total_requests: number
          total_credits_purchased: number
          total_credits_used: number
          total_credits_available: number
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      unlock_lead: {
        Args: {
          p_provider_id: string
          p_service_request_id: string
          p_credits_used?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      credit_transaction_type: "purchase" | "use" | "refund" | "bonus"
      service_request_status: "active" | "paused" | "completed" | "cancelled"
      user_type: "client" | "provider" | "admin"
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
      credit_transaction_type: ["purchase", "use", "refund", "bonus"],
      service_request_status: ["active", "paused", "completed", "cancelled"],
      user_type: ["client", "provider", "admin"],
    },
  },
} as const
