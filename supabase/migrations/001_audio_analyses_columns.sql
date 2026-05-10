-- Migration 001: Add missing columns to audio_analyses (Module 4 - Sonomat)
-- Run this in the Supabase SQL Editor

ALTER TABLE public.audio_analyses
  ADD COLUMN IF NOT EXISTS asset_tag           TEXT,
  ADD COLUMN IF NOT EXISTS crest_factor        DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS aea_level           DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS sample_rate         INTEGER,
  ADD COLUMN IF NOT EXISTS duration_s          DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS patron_falla        TEXT,
  ADD COLUMN IF NOT EXISTS frecuencias_caracteristicas TEXT,
  ADD COLUMN IF NOT EXISTS recomendaciones     TEXT;

-- Index for fast TAG lookups
CREATE INDEX IF NOT EXISTS idx_audio_tag ON public.audio_analyses(asset_tag);
