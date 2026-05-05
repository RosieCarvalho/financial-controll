-- Migration: add created_by to caixas
BEGIN;

ALTER TABLE caixas ADD COLUMN IF NOT EXISTS created_by uuid;

COMMIT;
