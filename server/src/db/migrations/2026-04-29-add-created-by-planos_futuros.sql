-- Migration: add created_by to planos_futuros
BEGIN;

ALTER TABLE planos_futuros ADD COLUMN IF NOT EXISTS created_by uuid;

COMMIT;
