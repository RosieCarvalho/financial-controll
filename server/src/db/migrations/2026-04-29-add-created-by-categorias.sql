-- Migration: add created_by to categorias for per-user ownership
BEGIN;

ALTER TABLE categorias ADD COLUMN IF NOT EXISTS created_by uuid;

COMMIT;
