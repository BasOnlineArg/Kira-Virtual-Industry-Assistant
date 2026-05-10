-- Migration 006: Work Orders table (Module 8)
-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.work_orders (
  id           TEXT PRIMARY KEY,
  ot_number    TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  fecha        DATE NOT NULL,
  iso_week     INTEGER NOT NULL,
  iso_year     INTEGER NOT NULL,
  hh_prog      NUMERIC(8,2) NOT NULL DEFAULT 0,
  hhr          NUMERIC(8,2) NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'en_proceso'
                 CHECK (status IN ('en_proceso','cumplida','anulada','reprogramada')),
  observations TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_orders_status   ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_fecha    ON public.work_orders(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_work_orders_iso_week ON public.work_orders(iso_year, iso_week);

ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wo_read"   ON public.work_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "wo_insert" ON public.work_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "wo_update" ON public.work_orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "wo_delete" ON public.work_orders FOR DELETE USING (auth.role() = 'authenticated');
