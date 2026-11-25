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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          added_by: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          is_active: boolean
          role: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          display_name?: string
          email: string
          id?: string
          is_active?: boolean
          role?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_active?: boolean
          role?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          enabled: boolean
          expires_at: string | null
          id: string
          link_label: string
          link_url: string
          message: string
          updated_at: string
          variant: string
        }
        Insert: {
          enabled?: boolean
          expires_at?: string | null
          id?: string
          link_label?: string
          link_url?: string
          message?: string
          updated_at?: string
          variant?: string
        }
        Update: {
          enabled?: boolean
          expires_at?: string | null
          id?: string
          link_label?: string
          link_url?: string
          message?: string
          updated_at?: string
          variant?: string
        }
        Relationships: []
      }
      commission_enquiries: {
        Row: {
          admin_notes: string
          created_at: string
          email: string
          enquiry_type: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string
        }
        Insert: {
          admin_notes?: string
          created_at?: string
          email: string
          enquiry_type: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string
          created_at?: string
          email?: string
          enquiry_type?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      friends_of_shed: {
        Row: {
          description: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          description?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          description?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      gallery_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          category_id: string
          created_at: string
          for_sale: boolean
          id: string
          image_url: string
          is_featured: boolean
          is_visible: boolean
          price_label: string
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          for_sale?: boolean
          id?: string
          image_url: string
          is_featured?: boolean
          is_visible?: boolean
          price_label?: string
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          for_sale?: boolean
          id?: string
          image_url?: string
          is_featured?: boolean
          is_visible?: boolean
          price_label?: string
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "gallery_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      opening_hours: {
        Row: {
          close_time: string
          day_name: string
          day_order: number
          hours_display: string
          id: string
          is_open: boolean
          note: string
          open_time: string
          updated_at: string
        }
        Insert: {
          close_time?: string
          day_name: string
          day_order: number
          hours_display?: string
          id?: string
          is_open?: boolean
          note?: string
          open_time?: string
          updated_at?: string
        }
        Update: {
          close_time?: string
          day_name?: string
          day_order?: number
          hours_display?: string
          id?: string
          is_open?: boolean
          note?: string
          open_time?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_content: {
        Row: {
          content_key: string
          label: string
          page_group: string
          updated_at: string
          value_text: string
        }
        Insert: {
          content_key: string
          label: string
          page_group: string
          updated_at?: string
          value_text: string
        }
        Update: {
          content_key?: string
          label?: string
          page_group?: string
          updated_at?: string
          value_text?: string
        }
        Relationships: []
      }
      site_images: {
        Row: {
          alt_text: string
          caption: string
          focal_point: string
          image_url: string
          label: string
          page_group: string
          slot_key: string
          updated_at: string
        }
        Insert: {
          alt_text?: string
          caption?: string
          focal_point?: string
          image_url: string
          label: string
          page_group: string
          slot_key: string
          updated_at?: string
        }
        Update: {
          alt_text?: string
          caption?: string
          focal_point?: string
          image_url?: string
          label?: string
          page_group?: string
          slot_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address_lines: Json
          donate_url: string
          email: string
          facebook_url: string
          id: string
          joining_fee: string
          phone: string
          sales_email: string
          session_fee: string
          session_fee_note: string
          session_fee_short: string
          updated_at: string
        }
        Insert: {
          address_lines?: Json
          donate_url?: string
          email?: string
          facebook_url?: string
          id?: string
          joining_fee?: string
          phone?: string
          sales_email?: string
          session_fee?: string
          session_fee_note?: string
          session_fee_short?: string
          updated_at?: string
        }
        Update: {
          address_lines?: Json
          donate_url?: string
          email?: string
          facebook_url?: string
          id?: string
          joining_fee?: string
          phone?: string
          sales_email?: string
          session_fee?: string
          session_fee_note?: string
          session_fee_short?: string
          updated_at?: string
        }
        Relationships: []
      }
      supporters: {
        Row: {
          description: string
          id: string
          logo_url: string
          name: string
          show_in_footer: boolean
          show_on_about: boolean
          sort_order: number
        }
        Insert: {
          description?: string
          id?: string
          logo_url: string
          name: string
          show_in_footer?: boolean
          show_on_about?: boolean
          sort_order?: number
        }
        Update: {
          description?: string
          id?: string
          logo_url?: string
          name?: string
          show_in_footer?: boolean
          show_on_about?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      trustees: {
        Row: {
          id: string
          name: string
          role: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          role: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          role?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_shed_admin: { Args: never; Returns: boolean }
      is_shed_owner: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
