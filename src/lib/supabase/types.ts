/**
 * @module supabase/types
 * @description Supabase 데이터베이스 타입 정의
 */

export interface Database {
  public: {
    Tables: {
      bids: {
        Row: {
          id: string;
          source: string;
          external_id: string;
          title: string;
          organization: string;
          deadline: string;
          estimated_amount: number | null;
          status: string;
          priority: string;
          type: string;
          keywords: string[];
          url: string | null;
          match_score: number | null;
          ai_summary: string | null;
          raw_data: Record<string, unknown>;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['bids']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bids']['Insert']>;
      };
      prompt_templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          prompt: string;
          variables: PromptVariable[];
          is_system: boolean;
          created_by: string | null;
          team_id: string | null;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['prompt_templates']['Row'], 'id' | 'created_at' | 'updated_at' | 'usage_count'>;
        Update: Partial<Database['public']['Tables']['prompt_templates']['Insert']>;
      };
      bid_pipeline: {
        Row: {
          id: string;
          bid_id: string;
          stage: string;
          assigned_to: string | null;
          notes: string | null;
          due_date: string | null;
          match_score: number | null;
          matched_products: string[];
          ai_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bid_pipeline']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bid_pipeline']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: 'admin' | 'user' | 'viewer';
          team_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

// ============================================================================
// 헬퍼 타입
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// 프롬프트 변수 타입
export interface PromptVariable {
  name: string;
  description: string;
  type?: 'string' | 'number' | 'date' | 'boolean';
  required?: boolean;
  default?: string;
}

// 실시간 이벤트 타입
export interface RealtimePayload<T> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T | null;
  old: T | null;
}
