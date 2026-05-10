-- Migration 007: Avisos SAP Intake table (Module 9)
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.avisos (
  id           TEXT PRIMARY KEY,
  fecha        DATE NOT NULL,
  iso_week     INTEGER NOT NULL,
  iso_year     INTEGER NOT NULL,
  prioridad    TEXT NOT NULL CHECK (prioridad IN ('MN','MI','BKL','PP')),
  tag          TEXT NOT NULL DEFAULT '',
  especialidad TEXT NOT NULL
                 CHECK (especialidad IN ('equipos_fijos','soldadura','electricos','dek')),
  descripcion  TEXT NOT NULL,
  generado_sap BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avisos_prioridad    ON public.avisos(prioridad);
CREATE INDEX IF NOT EXISTS idx_avisos_generado_sap ON public.avisos(generado_sap);
CREATE INDEX IF NOT EXISTS idx_avisos_fecha        ON public.avisos(fecha DESC);

ALTER TABLE public.avisos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "avisos_read"   ON public.avisos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "avisos_insert" ON public.avisos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "avisos_update" ON public.avisos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "avisos_delete" ON public.avisos FOR DELETE USING (auth.role() = 'authenticated');
