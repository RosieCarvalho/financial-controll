-- Migration: add created_by to transacoes
BEGIN;

ALTER TABLE transacoes ADD COLUMN IF NOT EXISTS created_by uuid;

COMMIT;
