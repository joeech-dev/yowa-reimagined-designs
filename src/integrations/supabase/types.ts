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
      blog_posts: {
        Row: {
          auto_posted_to_social: boolean | null
          category: string
          content: string | null
          created_at: string | null
          daily_post_order: number | null
          excerpt: string | null
          id: string
          image: string | null
          published_at: string
          slug: string
          source_name: string
          source_url: string
          title: string
        }
        Insert: {
          auto_posted_to_social?: boolean | null
          category: string
          content?: string | null
          created_at?: string | null
          daily_post_order?: number | null
          excerpt?: string | null
          id?: string
          image?: string | null
          published_at?: string
          slug: string
          source_name: string
          source_url: string
          title: string
        }
        Update: {
          auto_posted_to_social?: boolean | null
          category?: string
          content?: string | null
          created_at?: string | null
          daily_post_order?: number | null
          excerpt?: string | null
          id?: string
          image?: string | null
          published_at?: string
          slug?: string
          source_name?: string
          source_url?: string
          title?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          created_at: string
          created_by: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      expense_requisitions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          finance_approved_at: string | null
          finance_approved_by: string | null
          id: string
          project_id: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          requester_id: string
          status: string
          super_admin_approved_at: string | null
          super_admin_approved_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          finance_approved_at?: string | null
          finance_approved_by?: string | null
          id?: string
          project_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requester_id: string
          status?: string
          super_admin_approved_at?: string | null
          super_admin_approved_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          finance_approved_at?: string | null
          finance_approved_by?: string | null
          id?: string
          project_id?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requester_id?: string
          status?: string
          super_admin_approved_at?: string | null
          super_admin_approved_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_requisitions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string
          id: string
          project_id: string | null
          transaction_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description: string
          id?: string
          project_id?: string | null
          transaction_date?: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string
          id?: string
          project_id?: string | null
          transaction_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_sequences: {
        Row: {
          auto_assign_new_leads: boolean
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          auto_assign_new_leads?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          auto_assign_new_leads?: boolean
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_sequence_assignments: {
        Row: {
          completed_at: string | null
          current_step_order: number
          id: string
          last_step_executed_at: string | null
          lead_id: string
          next_step_due_at: string | null
          sequence_id: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          current_step_order?: number
          id?: string
          last_step_executed_at?: string | null
          lead_id: string
          next_step_due_at?: string | null
          sequence_id: string
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          current_step_order?: number
          id?: string
          last_step_executed_at?: string | null
          lead_id?: string
          next_step_due_at?: string | null
          sequence_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sequence_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_sequence_assignments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "followup_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget: number | null
          budget_range: string | null
          created_at: string | null
          cv_url: string | null
          email: string
          geographic_location: string | null
          id: string
          industry_type: string | null
          last_contact_date: string | null
          name: string
          national_id_url: string | null
          next_followup_date: string | null
          phone: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          budget_range?: string | null
          created_at?: string | null
          cv_url?: string | null
          email: string
          geographic_location?: string | null
          id?: string
          industry_type?: string | null
          last_contact_date?: string | null
          name: string
          national_id_url?: string | null
          next_followup_date?: string | null
          phone: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          budget_range?: string | null
          created_at?: string | null
          cv_url?: string | null
          email?: string
          geographic_location?: string | null
          id?: string
          industry_type?: string | null
          last_contact_date?: string | null
          name?: string
          national_id_url?: string | null
          next_followup_date?: string | null
          phone?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_log: {
        Row: {
          channel: string
          id: string
          lead_id: string
          message_content: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          channel: string
          id?: string
          lead_id: string
          message_content?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          channel?: string
          id?: string
          lead_id?: string
          message_content?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_log_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_brands: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          logo_url: string
          name: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url: string
          name: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          logo_url?: string
          name?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          category: string
          client: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
          video_url: string
          year: string | null
        }
        Insert: {
          category: string
          client?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
          video_url: string
          year?: string | null
        }
        Update: {
          category?: string
          client?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
          video_url?: string
          year?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_profile_complete: boolean
          position: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_profile_complete?: boolean
          position?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_profile_complete?: boolean
          position?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_team_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          project_id: string
          role: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          project_id: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          lead_id: string | null
          show_on_website: boolean
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          budget?: number | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          show_on_website?: boolean
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          budget?: number | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          show_on_website?: boolean
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_steps: {
        Row: {
          created_at: string
          delay_days: number
          description: string | null
          email_subject: string | null
          id: string
          sequence_id: string
          step_order: number
          tag_name: string
        }
        Insert: {
          created_at?: string
          delay_days?: number
          description?: string | null
          email_subject?: string | null
          id?: string
          sequence_id: string
          step_order?: number
          tag_name: string
        }
        Update: {
          created_at?: string
          delay_days?: number
          description?: string | null
          email_subject?: string | null
          id?: string
          sequence_id?: string
          step_order?: number
          tag_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "followup_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_webhooks: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          category: Database["public"]["Enums"]["team_member_category"]
          created_at: string
          display_order: number | null
          full_name: string
          id: string
          is_active: boolean | null
          linkedin_url: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          category: Database["public"]["Enums"]["team_member_category"]
          created_at?: string
          display_order?: number | null
          full_name: string
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          category?: Database["public"]["Enums"]["team_member_category"]
          created_at?: string
          display_order?: number | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          linkedin_url?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          display_name: string | null
          email: string | null
          id: string
          is_online: boolean
          last_seen_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          display_name?: string | null
          email?: string | null
          id?: string
          is_online?: boolean
          last_seen_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          display_name?: string | null
          email?: string | null
          id?: string
          is_online?: boolean
          last_seen_at?: string
          role?: string | null
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
      website_messages: {
        Row: {
          created_at: string
          id: string
          is_converted_to_lead: boolean
          message: string
          service_interest: string | null
          visitor_email: string
          visitor_name: string
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_converted_to_lead?: boolean
          message: string
          service_interest?: string | null
          visitor_email: string
          visitor_name: string
          visitor_phone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_converted_to_lead?: boolean
          message?: string
          service_interest?: string | null
          visitor_email?: string
          visitor_name?: string
          visitor_phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "user"
        | "finance"
        | "project_team"
        | "sales_marketing"
        | "super_admin"
      project_status: "lead" | "in_progress" | "completed" | "cancelled"
      team_member_category: "employee" | "freelancer" | "trainee"
      transaction_type: "income" | "expense"
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
      app_role: [
        "admin",
        "user",
        "finance",
        "project_team",
        "sales_marketing",
        "super_admin",
      ],
      project_status: ["lead", "in_progress", "completed", "cancelled"],
      team_member_category: ["employee", "freelancer", "trainee"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
