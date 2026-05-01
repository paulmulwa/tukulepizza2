import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Only create real client if valid URL provided
const isConfigured =
  supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://');

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

export const isSupabaseConfigured = isConfigured;

export type Pizza = {
  id: number;
  name: string;
  slug: string;
  category: 'Classic' | 'Spicy' | 'Meat Lovers' | 'Veggie' | "Chef's Special";
  description: string;
  ingredients: string[];
  tags: string[];
  thumbnail_url: string;
  model_path: string;
  price_small: number;
  price_medium: number;
  price_large: number;
  created_at: string;
};
