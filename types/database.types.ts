/**
 * @module types/database.types
 * @description Re-export of Supabase Database types for convenience
 *
 * This file re-exports the main Database type from src/lib/supabase/types
 * to allow imports from @/types/database.types path alias.
 */

export type { Database, Tables, InsertTables, UpdateTables, PromptVariable, RealtimePayload } from '@/lib/supabase/types';
