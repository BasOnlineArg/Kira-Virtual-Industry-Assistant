-- Migration 008: Manuals Library with RAG via Full-Text Search (Module 10)
-- Uses PostgreSQL native FTS (tsvector/GIN) — no external embedding API required.
-- Run in Supabase SQL Editor

-- ── Manuals metadata ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.manuals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre        TEXT NOT NULL,
  tipo_activo   TEXT NOT NULL,
  fabricante    TEXT NOT NULL,
  tipo_doc      TEXT NOT NULL CHECK (tipo_doc IN ('manual', 'pauta')),
  formato       TEXT NOT NULL CHECK (formato IN ('pdf', 'imagen', 'txt')),
  storage_path  TEXT NOT NULL,
  url           TEXT NOT NULL,
  tamano_bytes  BIGINT NOT NULL DEFAULT 0,
  procesado     BOOLEAN NOT NULL DEFAULT FALSE,
  chunk_count   INTEGER NOT NULL DEFAULT 0,
  uploaded_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chunks with Contextual Retrieval + FTS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.manual_chunks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manual_id     UUID NOT NULL REFERENCES public.manuals(id) ON DELETE CASCADE,
  section_path  TEXT NOT NULL DEFAULT '',
  page_start    INTEGER,
  page_end      INTEGER,
  chunk_index   INTEGER NOT NULL,
  content       TEXT NOT NULL,  -- texto original del chunk
  context       TEXT NOT NULL,  -- chunk enriquecido con índice (lo que se muestra como cita)

  -- Full-text search vector: incluye contenido + sección + fabricante + nombre del manual
  -- Se genera automáticamente al insertar/actualizar
  tsv           TSVECTOR GENERATED ALWAYS AS (
                  to_tsvector('spanish',
                    coalesce(content, '') || ' ' || coalesce(section_path, '')
                  )
                ) STORED,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GIN index for fast full-text search
CREATE INDEX IF NOT EXISTS idx_manual_chunks_tsv
  ON public.manual_chunks USING GIN (tsv);

CREATE INDEX IF NOT EXISTS idx_manual_chunks_manual_id
  ON public.manual_chunks(manual_id);

-- ── Chat sessions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.manual_chat_sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo      TEXT NOT NULL DEFAULT 'Nueva consulta',
  manual_ids  UUID[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Chat messages ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.manual_chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID NOT NULL REFERENCES public.manual_chat_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  chunks_used JSONB,  -- [{chunkId, manualId, manualNombre, sectionPath, pageStart, rank}]
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_manuals_tipo_activo   ON public.manuals(tipo_activo);
CREATE INDEX IF NOT EXISTS idx_manuals_tipo_doc      ON public.manuals(tipo_doc);
CREATE INDEX IF NOT EXISTS idx_manuals_procesado     ON public.manuals(procesado);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user    ON public.manual_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated ON public.manual_chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON public.manual_chat_messages(session_id, created_at);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.manuals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_chunks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "manuals_read"   ON public.manuals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "manuals_insert" ON public.manuals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "manuals_update" ON public.manuals FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "manuals_delete" ON public.manuals FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "chunks_read"    ON public.manual_chunks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "chunks_insert"  ON public.manual_chunks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "chunks_delete"  ON public.manual_chunks FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "sessions_all"   ON public.manual_chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "messages_all"   ON public.manual_chat_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM public.manual_chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
);

-- ── FTS search RPC ────────────────────────────────────────────────────────────
-- Uses websearch_to_tsquery: handles natural language + quoted phrases + minus exclusions
-- Falls back to plainto_tsquery if the query can't be parsed.
CREATE OR REPLACE FUNCTION public.search_manual_chunks(
  query_text        TEXT,
  match_count       INTEGER DEFAULT 6,
  filter_manual_ids UUID[]  DEFAULT NULL
)
RETURNS TABLE (
  id            UUID,
  manual_id     UUID,
  section_path  TEXT,
  page_start    INTEGER,
  chunk_index   INTEGER,
  content       TEXT,
  context       TEXT,
  rank          FLOAT
)
LANGUAGE plpgsql AS $$
DECLARE
  ts_query tsquery;
BEGIN
  -- websearch_to_tsquery handles: multi-word AND, "exact phrase", -exclusion
  BEGIN
    ts_query := websearch_to_tsquery('spanish', query_text);
  EXCEPTION WHEN OTHERS THEN
    ts_query := plainto_tsquery('spanish', query_text);
  END;

  -- If query is empty/invalid, return nothing
  IF ts_query IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    mc.id,
    mc.manual_id,
    mc.section_path,
    mc.page_start,
    mc.chunk_index,
    mc.content,
    mc.context,
    ts_rank_cd(mc.tsv, ts_query, 32)::FLOAT AS rank  -- 32 = normalize by doc length
  FROM public.manual_chunks mc
  WHERE
    mc.tsv @@ ts_query
    AND (filter_manual_ids IS NULL OR mc.manual_id = ANY(filter_manual_ids))
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
