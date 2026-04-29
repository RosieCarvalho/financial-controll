-- Migration: add created_by to compras_terceiros
BEGIN;

ALTER TABLE compras_terceiros ADD COLUMN IF NOT EXISTS created_by uuid;

COMMIT;
