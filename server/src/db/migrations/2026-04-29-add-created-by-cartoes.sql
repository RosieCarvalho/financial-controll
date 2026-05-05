-- Migration: add created_by to cartoes_credito
BEGIN;

ALTER TABLE cartoes_credito ADD COLUMN IF NOT EXISTS created_by uuid;

COMMIT;
