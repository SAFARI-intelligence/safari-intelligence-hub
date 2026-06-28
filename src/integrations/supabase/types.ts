export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      animal_locations: {
        Row: {
          id: string;
          latitude: number;
          longitude: number;
          recorded_at: string;
          story_id: string;
        };
        Insert: {
          id?: string;
          latitude: number;
          longitude: number;
          recorded_at?: string;
          story_id: string;
        };
        Update: {
          id?: string;
          latitude?: number;
          longitude?: number;
          recorded_at?: string;
          story_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "animal_locations_story_id_fkey";
            columns: ["story_id"];
            isOneToOne: false;
            referencedRelation: "animal_stories";
            referencedColumns: ["id"];
          },
        ];
      };
      animal_stories: {
        Row: {
          behavior_insights: string[];
          created_at: string;
          cultural_relevance: string | null;
          fun_facts: string[];
          gallery: string[];
          hero_image: string | null;
          hero_narrative: string | null;
          id: string;
          image: string | null;
          key_facts: Json;
          name: string;
          parks: string[];
          short_story: string;
          slug: string;
          swahili_name: string | null;
          title: string;
        };
        Insert: {
          behavior_insights?: string[];
          created_at?: string;
          cultural_relevance?: string | null;
          fun_facts?: string[];
          gallery?: string[];
          hero_image?: string | null;
          hero_narrative?: string | null;
          id?: string;
          image?: string | null;
          key_facts?: Json;
          name: string;
          parks?: string[];
          short_story: string;
          slug: string;
          swahili_name?: string | null;
          title: string;
        };
        Update: {
          behavior_insights?: string[];
          created_at?: string;
          cultural_relevance?: string | null;
          fun_facts?: string[];
          gallery?: string[];
          hero_image?: string | null;
          hero_narrative?: string | null;
          id?: string;
          image?: string | null;
          key_facts?: Json;
          name?: string;
          parks?: string[];
          short_story?: string;
          slug?: string;
          swahili_name?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      animal_zones: {
        Row: {
          color: string;
          created_at: string;
          geojson: Json;
          id: string;
          name: string;
        };
        Insert: {
          color?: string;
          created_at?: string;
          geojson: Json;
          id?: string;
          name: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          geojson?: Json;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          check_in: string;
          check_out: string;
          created_at: string;
          guests: number;
          hotel_id: string;
          hotel_name: string;
          id: string;
          status: Database["public"]["Enums"]["booking_status"];
          total_price: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          check_in: string;
          check_out: string;
          created_at?: string;
          guests?: number;
          hotel_id: string;
          hotel_name: string;
          id?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          total_price?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          check_in?: string;
          check_out?: string;
          created_at?: string;
          guests?: number;
          hotel_id?: string;
          hotel_name?: string;
          id?: string;
          status?: Database["public"]["Enums"]["booking_status"];
          total_price?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          },
        ];
      };
      experiences: {
        Row: {
          country: string;
          created_at: string;
          description: string | null;
          duration_days: number | null;
          duration_nights: number | null;
          features: string[];
          id: string;
          image: string | null;
          is_published: boolean;
          price_amount: number;
          price_currency: string;
          slug: string;
          tax_amount: number;
          tax_currency: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          country?: string;
          created_at?: string;
          description?: string | null;
          duration_days?: number | null;
          duration_nights?: number | null;
          features?: string[];
          id?: string;
          image?: string | null;
          is_published?: boolean;
          price_amount?: number;
          price_currency?: string;
          slug: string;
          tax_amount?: number;
          tax_currency?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          country?: string;
          created_at?: string;
          description?: string | null;
          duration_days?: number | null;
          duration_nights?: number | null;
          features?: string[];
          id?: string;
          image?: string | null;
          is_published?: boolean;
          price_amount?: number;
          price_currency?: string;
          slug?: string;
          tax_amount?: number;
          tax_currency?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      hotels: {
        Row: {
          amenities: string[];
          country: string;
          created_at: string;
          description: string | null;
          id: string;
          images: string[];
          is_published: boolean;
          latitude: number | null;
          longitude: number | null;
          name: string;
          owner_id: string;
          park: string | null;
          price_max: number;
          price_min: number;
          rating: number;
          region: string | null;
          type: Database["public"]["Enums"]["hotel_type"];
          updated_at: string;
        };
        Insert: {
          amenities?: string[];
          country: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          images?: string[];
          is_published?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          owner_id: string;
          park?: string | null;
          price_max?: number;
          price_min?: number;
          rating?: number;
          region?: string | null;
          type?: Database["public"]["Enums"]["hotel_type"];
          updated_at?: string;
        };
        Update: {
          amenities?: string[];
          country?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          images?: string[];
          is_published?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          owner_id?: string;
          park?: string | null;
          price_max?: number;
          price_min?: number;
          rating?: number;
          region?: string | null;
          type?: Database["public"]["Enums"]["hotel_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      itineraries: {
        Row: {
          budget_tier: string | null;
          created_at: string;
          currency: string;
          days: Json;
          destinations: string[];
          duration_days: number;
          group_size: number;
          id: string;
          interests: string[];
          title: string;
          total_cost: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          budget_tier?: string | null;
          created_at?: string;
          currency?: string;
          days?: Json;
          destinations?: string[];
          duration_days?: number;
          group_size?: number;
          id?: string;
          interests?: string[];
          title: string;
          total_cost?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          budget_tier?: string | null;
          created_at?: string;
          currency?: string;
          days?: Json;
          destinations?: string[];
          duration_days?: number;
          group_size?: number;
          id?: string;
          interests?: string[];
          title?: string;
          total_cost?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      pay_bookings: {
        Row: {
          capacity_slot_id: string | null;
          created_at: string;
          currency: string;
          guests: number;
          id: string;
          status: Database["public"]["Enums"]["pay_booking_status"];
          total_amount: number;
          trip_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          capacity_slot_id?: string | null;
          created_at?: string;
          currency?: string;
          guests?: number;
          id?: string;
          status?: Database["public"]["Enums"]["pay_booking_status"];
          total_amount: number;
          trip_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          capacity_slot_id?: string | null;
          created_at?: string;
          currency?: string;
          guests?: number;
          id?: string;
          status?: Database["public"]["Enums"]["pay_booking_status"];
          total_amount?: number;
          trip_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pay_bookings_trip_id_fkey";
            columns: ["trip_id"];
            isOneToOne: false;
            referencedRelation: "pay_trips";
            referencedColumns: ["id"];
          },
        ];
      };
      pay_escrows: {
        Row: {
          amount: number;
          booking_id: string;
          created_at: string;
          currency: string;
          id: string;
          released_at: string | null;
          status: Database["public"]["Enums"]["pay_escrow_status"];
        };
        Insert: {
          amount: number;
          booking_id: string;
          created_at?: string;
          currency?: string;
          id?: string;
          released_at?: string | null;
          status?: Database["public"]["Enums"]["pay_escrow_status"];
        };
        Update: {
          amount?: number;
          booking_id?: string;
          created_at?: string;
          currency?: string;
          id?: string;
          released_at?: string | null;
          status?: Database["public"]["Enums"]["pay_escrow_status"];
        };
        Relationships: [
          {
            foreignKeyName: "pay_escrows_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: true;
            referencedRelation: "pay_bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      pay_fx_rates: {
        Row: {
          base: string;
          fetched_at: string;
          id: string;
          quote: string;
          rate: number;
        };
        Insert: {
          base: string;
          fetched_at?: string;
          id?: string;
          quote: string;
          rate: number;
        };
        Update: {
          base?: string;
          fetched_at?: string;
          id?: string;
          quote?: string;
          rate?: number;
        };
        Relationships: [];
      };
      pay_lock_events: {
        Row: {
          created_at: string;
          event: string;
          id: string;
          trip_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          event: string;
          id?: string;
          trip_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          event?: string;
          id?: string;
          trip_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      pay_transactions: {
        Row: {
          amount: number;
          booking_id: string | null;
          created_at: string;
          currency: string;
          id: string;
          idempotency_key: string | null;
          metadata: Json;
          provider: Database["public"]["Enums"]["pay_provider"];
          provider_ref: string;
          status: Database["public"]["Enums"]["pay_tx_status"];
          type: Database["public"]["Enums"]["pay_tx_type"];
          user_id: string;
          wallet_id: string;
        };
        Insert: {
          amount: number;
          booking_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          idempotency_key?: string | null;
          metadata?: Json;
          provider: Database["public"]["Enums"]["pay_provider"];
          provider_ref: string;
          status?: Database["public"]["Enums"]["pay_tx_status"];
          type: Database["public"]["Enums"]["pay_tx_type"];
          user_id: string;
          wallet_id: string;
        };
        Update: {
          amount?: number;
          booking_id?: string | null;
          created_at?: string;
          currency?: string;
          id?: string;
          idempotency_key?: string | null;
          metadata?: Json;
          provider?: Database["public"]["Enums"]["pay_provider"];
          provider_ref?: string;
          status?: Database["public"]["Enums"]["pay_tx_status"];
          type?: Database["public"]["Enums"]["pay_tx_type"];
          user_id?: string;
          wallet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pay_transactions_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "pay_bookings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pay_transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "pay_wallets";
            referencedColumns: ["id"];
          },
        ];
      };
      pay_trips: {
        Row: {
          base_price: number;
          booked: number;
          capacity: number;
          created_at: string;
          currency: string;
          description: string | null;
          end_date: string;
          id: string;
          image: string | null;
          operator_id: string;
          start_date: string;
          status: Database["public"]["Enums"]["pay_trip_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          base_price: number;
          booked?: number;
          capacity?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          end_date: string;
          id?: string;
          image?: string | null;
          operator_id: string;
          start_date: string;
          status?: Database["public"]["Enums"]["pay_trip_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          base_price?: number;
          booked?: number;
          capacity?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          end_date?: string;
          id?: string;
          image?: string | null;
          operator_id?: string;
          start_date?: string;
          status?: Database["public"]["Enums"]["pay_trip_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      pay_wallets: {
        Row: {
          created_at: string;
          currency: string;
          flex_balance: number;
          id: string;
          trip_balance: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          flex_balance?: number;
          id?: string;
          trip_balance?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          flex_balance?: number;
          id?: string;
          trip_balance?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          id: string;
          name: string | null;
          preferences: Json;
          profile_image: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          id: string;
          name?: string | null;
          preferences?: Json;
          profile_image?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string | null;
          preferences?: Json;
          profile_image?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          hotel_id: string;
          id: string;
          rating: number;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          hotel_id: string;
          id?: string;
          rating: number;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          hotel_id?: string;
          id?: string;
          rating?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_hotel_id_fkey";
            columns: ["hotel_id"];
            isOneToOne: false;
            referencedRelation: "hotels";
            referencedColumns: ["id"];
          },
        ];
      };
      support_tickets: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          priority: Database["public"]["Enums"]["ticket_priority"];
          status: Database["public"]["Enums"]["ticket_status"];
          subject: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          priority?: Database["public"]["Enums"]["ticket_priority"];
          status?: Database["public"]["Enums"]["ticket_status"];
          subject: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          priority?: Database["public"]["Enums"]["ticket_priority"];
          status?: Database["public"]["Enums"]["ticket_status"];
          subject?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      wis_journal_entries: {
        Row: {
          behavior_tag: string | null;
          booking_id: string | null;
          created_at: string;
          id: string;
          note: string;
          observed_at: string;
          park: string;
          photo_url: string | null;
          species: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          behavior_tag?: string | null;
          booking_id?: string | null;
          created_at?: string;
          id?: string;
          note: string;
          observed_at?: string;
          park: string;
          photo_url?: string | null;
          species: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          behavior_tag?: string | null;
          booking_id?: string | null;
          created_at?: string;
          id?: string;
          note?: string;
          observed_at?: string;
          park?: string;
          photo_url?: string | null;
          species?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wis_journal_entries_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "pay_bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      wis_narratives: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          model: string;
          prompt_hash: string;
          ref_id: string;
          scope: string;
          tokens_in: number | null;
          tokens_out: number | null;
          user_id: string | null;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          model: string;
          prompt_hash: string;
          ref_id: string;
          scope: string;
          tokens_in?: number | null;
          tokens_out?: number | null;
          user_id?: string | null;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          model?: string;
          prompt_hash?: string;
          ref_id?: string;
          scope?: string;
          tokens_in?: number | null;
          tokens_out?: number | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      wis_species_rarity: {
        Row: {
          notes: string | null;
          rarity_score: number;
          region: string | null;
          species: string;
        };
        Insert: {
          notes?: string | null;
          rarity_score: number;
          region?: string | null;
          species: string;
        };
        Update: {
          notes?: string | null;
          rarity_score?: number;
          region?: string | null;
          species?: string;
        };
        Relationships: [];
      };
      wis_trip_summaries: {
        Row: {
          booking_id: string;
          created_at: string;
          id: string;
          narrative: string;
          top_moments: Json;
          user_id: string;
        };
        Insert: {
          booking_id: string;
          created_at?: string;
          id?: string;
          narrative: string;
          top_moments?: Json;
          user_id: string;
        };
        Update: {
          booking_id?: string;
          created_at?: string;
          id?: string;
          narrative?: string;
          top_moments?: Json;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wis_trip_summaries_booking_id_fkey";
            columns: ["booking_id"];
            isOneToOne: false;
            referencedRelation: "pay_bookings";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      profiles_public: {
        Row: {
          created_at: string | null;
          id: string | null;
          name: string | null;
          profile_image: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string | null;
          name?: string | null;
          profile_image?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string | null;
          name?: string | null;
          profile_image?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_user_roles: {
        Args: { _user_id: string };
        Returns: Database["public"]["Enums"]["app_role"][];
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      pay_cancel_booking: {
        Args: { p_booking_id: string };
        Returns: {
          capacity_slot_id: string | null;
          created_at: string;
          currency: string;
          guests: number;
          id: string;
          status: Database["public"]["Enums"]["pay_booking_status"];
          total_amount: number;
          trip_id: string;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_bookings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      pay_checkout: {
        Args: {
          p_display_amount?: number;
          p_display_currency?: string;
          p_guests: number;
          p_idempotency_key: string;
          p_provider: Database["public"]["Enums"]["pay_provider"];
          p_provider_ref: string;
          p_trip_id: string;
        };
        Returns: {
          capacity_slot_id: string | null;
          created_at: string;
          currency: string;
          guests: number;
          id: string;
          status: Database["public"]["Enums"]["pay_booking_status"];
          total_amount: number;
          trip_id: string;
          updated_at: string;
          user_id: string;
        };
        SetofOptions: {
          from: "*";
          to: "pay_bookings";
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      app_role: "user" | "hotel" | "support";
      booking_status: "pending" | "confirmed" | "cancelled";
      hotel_type: "hotel" | "villa" | "lodge" | "camp";
      pay_booking_status: "pending" | "confirmed" | "cancelled" | "completed";
      pay_escrow_status: "held" | "released" | "refunded";
      pay_provider: "stripe" | "mpesa" | "mock" | "wallet";
      pay_trip_status: "active" | "completed" | "cancelled";
      pay_tx_status: "pending" | "success" | "failed";
      pay_tx_type: "payment" | "refund" | "payout" | "add_on" | "topup" | "transfer";
      ticket_priority: "low" | "normal" | "high" | "urgent";
      ticket_status: "open" | "in_progress" | "closed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "hotel", "support"],
      booking_status: ["pending", "confirmed", "cancelled"],
      hotel_type: ["hotel", "villa", "lodge", "camp"],
      pay_booking_status: ["pending", "confirmed", "cancelled", "completed"],
      pay_escrow_status: ["held", "released", "refunded"],
      pay_provider: ["stripe", "mpesa", "mock", "wallet"],
      pay_trip_status: ["active", "completed", "cancelled"],
      pay_tx_status: ["pending", "success", "failed"],
      pay_tx_type: ["payment", "refund", "payout", "add_on", "topup", "transfer"],
      ticket_priority: ["low", "normal", "high", "urgent"],
      ticket_status: ["open", "in_progress", "closed"],
    },
  },
} as const;
