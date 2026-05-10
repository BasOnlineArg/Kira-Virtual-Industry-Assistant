-- Migration 002: Add missing columns to skf_measurements (Module 5 - SKF QuickCollect)
-- Run this in the Supabase SQL Editor

ALTER TABLE public.skf_measurements
  ADD COLUMN IF NOT EXISTS asset_tag              TEXT,
  ADD COLUMN IF NOT EXISTS tipo_equipo            TEXT,
  ADD COLUMN IF NOT EXISTS punto_medicion         TEXT,
  ADD COLUMN IF NOT EXISTS rpm                    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS falla_prob             DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS rul                    TEXT,
  ADD COLUMN IF NOT EXISTS patron_falla           TEXT,
  ADD COLUMN IF NOT EXISTS recomendaciones        TEXT,
  ADD COLUMN IF NOT EXISTS observaciones          TEXT;

CREATE INDEX IF NOT EXISTS idx_skf_tag   ON public.skf_measurements(asset_tag);
CREATE INDEX IF NOT EXISTS idx_skf_fecha ON public.skf_measurements(fecha DESC);
