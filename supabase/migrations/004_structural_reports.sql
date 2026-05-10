-- Migration 004: Biblioteca de Informes Estructurales (Pillar 2)
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.structural_reports (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspector_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nombre       TEXT NOT NULL,
  tipo         TEXT CHECK (tipo IN ('pdf', 'imagen')),
  url          TEXT NOT NULL,
  asset_tag    TEXT,
  descripcion  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.structural_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_read"   ON public.structural_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "reports_insert" ON public.structural_reports FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "reports_delete" ON public.structural_reports FOR DELETE USING (public.is_staff());

CREATE INDEX IF NOT EXISTS idx_reports_tag   ON public.structural_reports(asset_tag);
CREATE INDEX IF NOT EXISTS idx_reports_fecha ON public.structural_reports(fecha DESC);

-- Storage bucket for structural reports and field photos
-- Run this separately in Supabase Storage dashboard:
-- 1. Create bucket "structural-reports" (public: true)
-- 2. Create bucket "inspection-photos" (public: true)
