-- ============================================================
-- KIRA — Schema Supabase
-- Ejecutar en: Supabase → SQL Editor → New query
-- ============================================================

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ─────────────────────────────────────────────────

-- Users (whitelist — admin crea los registros manualmente)
CREATE TABLE IF NOT EXISTS public.users (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email     TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'inspector'
              CHECK (role IN ('superusuario', 'inspector', 'supervisor')),
  active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assets (~360 activos entre superficie y 4 minas)
CREATE TABLE IF NOT EXISTS public.assets (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag        TEXT NOT NULL UNIQUE,
  nombre     TEXT NOT NULL,
  tipo       TEXT NOT NULL,
  categoria  TEXT,
  sector     TEXT CHECK (sector IN ('superficie', 'subterranea', 'planta_caf', 'truckshop')),
  mina       TEXT CHECK (mina IN ('mariana_central', 'mariana_norte', 'emilia', 'san_marcos', 'superficie')),
  lat        DOUBLE PRECISION,
  lng        DOUBLE PRECISION,
  ug_x       DOUBLE PRECISION,   -- abscisa en plano subterráneo (píxeles)
  ug_y       DOUBLE PRECISION,   -- elevación en plano subterráneo (píxeles)
  status     TEXT NOT NULL DEFAULT 'operativo'
               CHECK (status IN ('operativo', 'mantenimiento', 'fuera_de_servicio')),
  estado     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inspections
CREATE TABLE IF NOT EXISTS public.inspections (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id       UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  tipo           TEXT NOT NULL
                   CHECK (tipo IN ('rutina', 'preventiva', 'correctiva', 'predictiva', 'emergencia')),
  inspector_id   UUID REFERENCES public.users(id) ON DELETE SET NULL,
  fecha          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  estado_general TEXT,
  score          INTEGER CHECK (score BETWEEN 0 AND 125),
  notas          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklist items
CREATE TABLE IF NOT EXISTS public.checklist_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
  asset_id      UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  descripcion   TEXT NOT NULL,
  resultado     TEXT CHECK (resultado IN ('ok', 'observacion', 'falla')),
  nota          TEXT,
  foto_url      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Visual analyses (Module 3)
CREATE TABLE IF NOT EXISTS public.visual_analyses (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id         UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  inspector_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  fecha            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  severidad        TEXT CHECK (severidad IN ('ALTA', 'MEDIA', 'BAJA')),
  diagnostico      TEXT,
  base_metodologica TEXT,
  recomendaciones  TEXT,
  foto_url         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audio analyses / Sonomat (Module 4)
CREATE TABLE IF NOT EXISTS public.audio_analyses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id     UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  inspector_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rms          DOUBLE PRECISION,
  kurtosis     DOUBLE PRECISION,
  peak_freq    DOUBLE PRECISION,
  falla_prob   DOUBLE PRECISION,   -- probabilidad de falla (%)
  rul          TEXT,                -- Remaining Useful Life
  diagnostico  TEXT,
  tipo_equipo  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SKF QuickCollect measurements (Module 5)
CREATE TABLE IF NOT EXISTS public.skf_measurements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id     UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  inspector_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  velocity_rms DOUBLE PRECISION,   -- mm/s
  envelope_ge  DOUBLE PRECISION,   -- gE
  temperatura  DOUBLE PRECISION,   -- °C
  iso_class    TEXT CHECK (iso_class IN ('I', 'II', 'III', 'IV')),
  estado       TEXT CHECK (estado IN ('verde', 'amarillo', 'rojo')),
  diagnostico  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Work Orders (Module 8)
CREATE TABLE IF NOT EXISTS public.work_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ot_number       TEXT NOT NULL UNIQUE,    -- 8 dígitos SAP
  asset_id        UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  descripcion     TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'en_proceso'
                    CHECK (status IN ('en_proceso', 'cumplida', 'anulada', 'reprogramada')),
  hh_programadas  DOUBLE PRECISION DEFAULT 0,
  hhr_reales      DOUBLE PRECISION DEFAULT 0,
  fecha_ejecucion TIMESTAMPTZ,
  semana_iso      INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maintenance Notices / Avisos (Module 9)
CREATE TABLE IF NOT EXISTS public.notices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id        UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  prioridad       TEXT NOT NULL CHECK (prioridad IN ('MN', 'MI', 'BKL', 'PP')),
  titulo          TEXT NOT NULL,
  descripcion     TEXT,
  equipo_asignado TEXT CHECK (equipo_asignado IN ('equipos_fijos', 'soldadura', 'electricos', 'dek')),
  generado_sap    BOOLEAN DEFAULT FALSE,
  fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Research sessions (Module 2)
CREATE TABLE IF NOT EXISTS public.research_sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  titulo     TEXT NOT NULL DEFAULT 'Nueva sesión',
  messages   JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Manuals library (Module 10)
CREATE TABLE IF NOT EXISTS public.manuals (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre           TEXT NOT NULL,
  tipo             TEXT CHECK (tipo IN ('oem', 'pauta_mantenimiento')),
  categoria_equipo TEXT,
  oem              TEXT,
  file_url         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs (Module 12 — tamper-proof: no UPDATE/DELETE policies)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  accion      TEXT NOT NULL,
  tabla       TEXT NOT NULL,
  registro_id UUID,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_assets_tag           ON public.assets(tag);
CREATE INDEX IF NOT EXISTS idx_assets_mina          ON public.assets(mina);
CREATE INDEX IF NOT EXISTS idx_assets_status        ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_inspections_asset    ON public.inspections(asset_id);
CREATE INDEX IF NOT EXISTS idx_inspections_fecha    ON public.inspections(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_visual_asset         ON public.visual_analyses(asset_id);
CREATE INDEX IF NOT EXISTS idx_audio_asset          ON public.audio_analyses(asset_id);
CREATE INDEX IF NOT EXISTS idx_skf_asset            ON public.skf_measurements(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_ot       ON public.work_orders(ot_number);
CREATE INDEX IF NOT EXISTS idx_work_orders_status   ON public.work_orders(status);
CREATE INDEX IF NOT EXISTS idx_notices_asset        ON public.notices(asset_id);
CREATE INDEX IF NOT EXISTS idx_notices_prioridad    ON public.notices(prioridad);
CREATE INDEX IF NOT EXISTS idx_research_user        ON public.research_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user           ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created        ON public.audit_logs(created_at DESC);

-- ─── TRIGGERS ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_research_sessions_updated_at
  BEFORE UPDATE ON public.research_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────

ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visual_analyses   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_analyses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skf_measurements  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;

-- Helper: is caller a staff member? (superusuario | inspector)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('superusuario', 'inspector') AND active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper: is caller superusuario?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'superusuario' AND active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- USERS
CREATE POLICY "users_own_select"   ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "users_admin_select" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "users_admin_insert" ON public.users FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "users_admin_update" ON public.users FOR UPDATE USING (public.is_admin());

-- ASSETS (all authenticated can read; staff can write)
CREATE POLICY "assets_read"   ON public.assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "assets_insert" ON public.assets FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "assets_update" ON public.assets FOR UPDATE USING (public.is_staff());

-- INSPECTIONS
CREATE POLICY "inspections_read"   ON public.inspections FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "inspections_insert" ON public.inspections FOR INSERT WITH CHECK (public.is_staff());

-- CHECKLIST ITEMS
CREATE POLICY "checklist_read"   ON public.checklist_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "checklist_insert" ON public.checklist_items FOR INSERT WITH CHECK (public.is_staff());

-- VISUAL ANALYSES
CREATE POLICY "visual_read"   ON public.visual_analyses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "visual_insert" ON public.visual_analyses FOR INSERT WITH CHECK (public.is_staff());

-- AUDIO ANALYSES
CREATE POLICY "audio_read"   ON public.audio_analyses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "audio_insert" ON public.audio_analyses FOR INSERT WITH CHECK (public.is_staff());

-- SKF MEASUREMENTS
CREATE POLICY "skf_read"   ON public.skf_measurements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "skf_insert" ON public.skf_measurements FOR INSERT WITH CHECK (public.is_staff());

-- WORK ORDERS
CREATE POLICY "wo_read"   ON public.work_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "wo_insert" ON public.work_orders FOR INSERT WITH CHECK (public.is_staff());
CREATE POLICY "wo_update" ON public.work_orders FOR UPDATE USING (public.is_staff());

-- NOTICES
CREATE POLICY "notices_read"   ON public.notices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "notices_insert" ON public.notices FOR INSERT WITH CHECK (public.is_staff());

-- RESEARCH SESSIONS (usuarios solo ven las propias)
CREATE POLICY "research_own" ON public.research_sessions FOR ALL USING (user_id = auth.uid());

-- MANUALS
CREATE POLICY "manuals_read"   ON public.manuals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "manuals_insert" ON public.manuals FOR INSERT WITH CHECK (public.is_admin());

-- AUDIT LOGS (solo insert desde backend; solo admin puede leer; nadie puede actualizar/borrar)
CREATE POLICY "audit_read"   ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT WITH CHECK (public.is_staff());

-- ─── STORAGE BUCKETS ────────────────────────────────────────
-- Ejecutar por separado en Supabase Dashboard → Storage si preferís la UI,
-- o descomentar las siguientes líneas:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('inspections', 'inspections', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('visual-analyses', 'visual-analyses', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('manuals', 'manuals', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', false);
