-- =============================================
-- Pizza In — Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Create pizzas table
CREATE TABLE IF NOT EXISTS pizzas (
  id           BIGSERIAL PRIMARY KEY,
  name         TEXT        NOT NULL,
  slug         TEXT        NOT NULL UNIQUE,
  category     TEXT        NOT NULL CHECK (category IN ('Classic', 'Spicy', 'Meat Lovers', 'Veggie', 'Chef''s Special')),
  description  TEXT        NOT NULL,
  ingredients  TEXT[]      NOT NULL DEFAULT '{}',
  tags         TEXT[]               DEFAULT '{}',
  thumbnail_url TEXT       NOT NULL DEFAULT '',
  model_path   TEXT        NOT NULL DEFAULT '',
  price_small  NUMERIC     NOT NULL,
  price_medium NUMERIC     NOT NULL,
  price_large  NUMERIC     NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pizzas ENABLE ROW LEVEL SECURITY;

-- Allow public read access (menu is public)
CREATE POLICY "Public can read pizzas"
  ON pizzas
  FOR SELECT
  USING (true);

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_pizzas_slug ON pizzas(slug);
CREATE INDEX IF NOT EXISTS idx_pizzas_category ON pizzas(category);

-- =============================================
-- Supabase Storage — Run in Dashboard UI
-- =============================================
-- 1. Go to Storage → New Bucket
-- 2. Name: pizza-images
-- 3. Toggle "Public bucket" ON
-- 4. Click Create
-- =============================================
-- Then run: npm run seed
-- (after filling in .env.local with your keys)
-- =============================================
