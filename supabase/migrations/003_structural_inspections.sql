-- Migration 003: Extend inspections and checklist_items for Module 6 (Structural)
-- Run this in the Supabase SQL Editor

ALTER TABLE public.inspections
  ADD COLUMN IF NOT EXISTS asset_tag        TEXT,
  ADD COLUMN IF NOT EXISTS sector           TEXT,
  ADD COLUMN IF NOT EXISTS tipo_estructura  TEXT,
  ADD COLUMN IF NOT EXISTS tipo_inspeccion  TEXT,
  ADD COLUMN IF NOT EXISTS ot_sap           TEXT,
  ADD COLUMN IF NOT EXISTS score_pct        DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS estado_global    TEXT CHECK (estado_global IN ('bueno', 'regular', 'malo', 'critico')),
  ADD COLUMN IF NOT EXISTS estado           TEXT CHECK (estado IN ('aprobada', 'observada', 'rechazada')),
  ADD COLUMN IF NOT EXISTS criticidad       INTEGER CHECK (criticidad BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS frecuencia       INTEGER CHECK (frecuencia BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS impacto          INTEGER CHECK (impacto BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS risk_score       INTEGER,
  ADD COLUMN IF NOT EXISTS findings         TEXT,
  ADD COLUMN IF NOT EXISTS herramientas_ndt TEXT,   -- JSON array stored as text
  ADD COLUMN IF NOT EXISTS frm_risks        TEXT,   -- JSON array stored as text
  ADD COLUMN IF NOT EXISTS photos           TEXT,   -- JSON array of URLs
  ADD COLUMN IF NOT EXISTS diagnostico      TEXT,
  ADD COLUMN IF NOT EXISTS recomendaciones  TEXT,
  ADD COLUMN IF NOT EXISTS falla_prob       DOUBLE PRECISION;

ALTER TABLE public.checklist_items
  ADD COLUMN IF NOT EXISTS categoria   TEXT,
  ADD COLUMN IF NOT EXISTS score_item  INTEGER CHECK (score_item BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS observacion TEXT;

CREATE INDEX IF NOT EXISTS idx_insp_tag    ON public.inspections(asset_tag);
CREATE INDEX IF NOT EXISTS idx_insp_sector ON public.inspections(sector);
CREATE INDEX IF NOT EXISTS idx_insp_fecha  ON public.inspections(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_chk_insp    ON public.checklist_items(inspection_id);
