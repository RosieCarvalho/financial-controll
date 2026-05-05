-- Migration: Add new enum values for financial_rule and remap existing '20' categories
BEGIN;

-- Add the new enum values (if they don't already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'financial_rule') THEN
    RAISE NOTICE 'financial_rule type not found';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- ignore
  NULL;
END$$;

-- Add new values safely
ALTER TYPE financial_rule ADD VALUE IF NOT EXISTS '10p';
ALTER TYPE financial_rule ADD VALUE IF NOT EXISTS '10a';

-- Remap existing categories that used '20' to '10p' by default (Pendências)
UPDATE categorias SET regra = '10p' WHERE regra = '20';

COMMIT;
