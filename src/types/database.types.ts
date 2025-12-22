/**
 * Supabase Database Types
 * Generated from schema migrations
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bids: {
        Row: {
          id: string;
          source_id: string;
          source_notice_id: string;
          title: string;
          organization: string;
          country: string;
          deadline: string | null;
          estimated_price: number | null;
          currency: string | null;
          description: string | null;
          category: string | null;
          region: string | null;
          raw_data: Json | null;
          content_hash: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          source_notice_id: string;
          title: string;
          organization: string;
          country?: string;
          deadline?: string | null;
          estimated_price?: number | null;
          currency?: string | null;
          description?: string | null;
          category?: string | null;
          region?: string | null;
          raw_data?: Json | null;
          content_hash: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          source_notice_id?: string;
          title?: string;
          organization?: string;
          country?: string;
          deadline?: string | null;
          estimated_price?: number | null;
          currency?: string | null;
          description?: string | null;
          category?: string | null;
          region?: string | null;
          raw_data?: Json | null;
          content_hash?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          model: string;
          category: string;
          description: string | null;
          specs: Json | null;
          price_range: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          model: string;
          category: string;
          description?: string | null;
          specs?: Json | null;
          price_range?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          model?: string;
          category?: string;
          description?: string | null;
          specs?: Json | null;
          price_range?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          bid_id: string;
          product_id: string;
          score: number;
          confidence: string;
          reasons: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          bid_id: string;
          product_id: string;
          score: number;
          confidence: string;
          reasons?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          bid_id?: string;
          product_id?: string;
          score?: number;
          confidence?: string;
          reasons?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      sources: {
        Row: {
          id: string;
          name: string;
          type: string;
          country: string;
          enabled: boolean;
          config: Json | null;
          last_crawled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          type: string;
          country?: string;
          enabled?: boolean;
          config?: Json | null;
          last_crawled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          country?: string;
          enabled?: boolean;
          config?: Json | null;
          last_crawled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      organization_scores: {
        Row: {
          id: string;
          organization: string;
          score: number;
          tier: string;
          factors: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization: string;
          score: number;
          tier: string;
          factors?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization?: string;
          score?: number;
          tier?: string;
          factors?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      alerts: {
        Row: {
          id: string;
          bid_id: string;
          type: string;
          priority: string;
          message: string;
          acknowledged: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          bid_id: string;
          type: string;
          priority: string;
          message: string;
          acknowledged?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          bid_id?: string;
          type?: string;
          priority?: string;
          message?: string;
          acknowledged?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          table_name: string;
          action: string;
          record_id: string;
          old_data: Json | null;
          new_data: Json | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          table_name: string;
          action: string;
          record_id: string;
          old_data?: Json | null;
          new_data?: Json | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          table_name?: string;
          action?: string;
          record_id?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          company: string | null;
          message: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          company?: string | null;
          message: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          company?: string | null;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
