-- Migration 005: Assets table with geolocation support (Module 7)
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.assets (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag                  TEXT NOT NULL UNIQUE,
  nombre               TEXT NOT NULL,
  tipo                 TEXT NOT NULL,
  capa                 TEXT NOT NULL CHECK (capa IN ('superficie', 'subterraneo')),
  sector               TEXT,
  mina                 TEXT,            -- 'mariana_central' | 'mariana_norte' | 'emilia' | 'san_marcos'

  -- GPS (superficie)
  lat                  DOUBLE PRECISION,
  lng                  DOUBLE PRECISION,

  -- Underground grid (subterráneo)
  ug_x                 DOUBLE PRECISION, -- abscisa (ej: 581)
  ug_y                 DOUBLE PRECISION, -- nivel MC (ej: 455)

  status               TEXT DEFAULT 'Operativo'
                         CHECK (status IN ('Operativo', 'En mantenimiento', 'Fuera de servicio')),
  estado               TEXT,
  ubicacion            TEXT,
  inspector_asignado   TEXT,
  ultima_inspeccion    DATE,
  proxima_inspeccion   DATE,
  notas                TEXT,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS assets_updated_at ON public.assets;
CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_capa   ON public.assets(capa);
CREATE INDEX IF NOT EXISTS idx_assets_mina   ON public.assets(mina);
CREATE INDEX IF NOT EXISTS idx_assets_tag    ON public.assets(tag);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);

-- RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets_read"   ON public.assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "assets_insert" ON public.assets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "assets_update" ON public.assets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "assets_delete" ON public.assets FOR DELETE USING (auth.role() = 'authenticated');
