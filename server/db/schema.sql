-- Schema SQL para Supabase / PostgreSQL
-- Execute este script no editor SQL do Supabase (ou via psql conectado ao DB)

/* Extensões */
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

/* Tipos enumerados */
CREATE TYPE financial_rule AS ENUM ('50','30','10p','10a');
CREATE TYPE categoria_tipo AS ENUM ('income','expense');
CREATE TYPE transacao_tipo AS ENUM ('fixed','one-time','installment');
CREATE TYPE transacao_status AS ENUM ('pending','paid');
CREATE TYPE historico_tipo AS ENUM ('deposit','withdrawal');
CREATE TYPE plano_status AS ENUM ('pending','completed');

/* Tabelas */
CREATE TABLE categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  regra financial_rule NOT NULL,
  created_by uuid,
  tipo categoria_tipo NOT NULL,
  cor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE caixas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  nome text NOT NULL,
  saldo numeric(14,2) NOT NULL DEFAULT 0,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE historico_caixa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  caixa_id uuid NOT NULL REFERENCES caixas(id) ON DELETE CASCADE,
  valor numeric(14,2) NOT NULL,
  data timestamptz NOT NULL,
  tipo historico_tipo NOT NULL,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cartoes_credito (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  nome text NOT NULL,
  limite numeric(14,2) NOT NULL DEFAULT 0,
  dia_fechamento smallint,
  dia_vencimento smallint,
  fatura_atual numeric(14,2) DEFAULT 0,
  cor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE compras_terceiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  nome_pessoa text NOT NULL,
  descricao text,
  valor numeric(14,2) NOT NULL,
  data timestamptz NOT NULL,
  cartao_id uuid REFERENCES cartoes_credito(id) ON DELETE SET NULL,
  parcelas int DEFAULT 1,
  parcelas_pagas int DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  descricao text,
  valor numeric(14,2) NOT NULL,
  data timestamptz NOT NULL,
  categoria_id uuid REFERENCES categorias(id) ON DELETE RESTRICT,
  tipo transacao_tipo NOT NULL,
  status transacao_status NOT NULL DEFAULT 'pending',
  caixa_id uuid REFERENCES caixas(id) ON DELETE SET NULL,
  cartao_id uuid REFERENCES cartoes_credito(id) ON DELETE SET NULL,
  compra_terceiros_id uuid REFERENCES compras_terceiros(id) ON DELETE SET NULL,
  parcelas_total int,
  parcela_atual int,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE planos_futuros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid,
  nome_item text NOT NULL,
  valor_total numeric(14,2) NOT NULL,
  parcelas int DEFAULT 1,
  mes_planejado smallint,
  ano_planejado smallint,
  status plano_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

/* Índices úteis */
CREATE INDEX idx_transacoes_categoria ON transacoes(categoria_id);
CREATE INDEX idx_transacoes_data ON transacoes(data);
CREATE INDEX idx_transacoes_cartao ON transacoes(cartao_id);
CREATE INDEX idx_transacoes_caixa ON transacoes(caixa_id);
CREATE INDEX idx_compras_cartao ON compras_terceiros(cartao_id);

/* Trigger para atualizar updated_at automaticamente */
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_timestamp_categorias
BEFORE UPDATE ON categorias
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_update_timestamp_caixas
BEFORE UPDATE ON caixas
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_update_timestamp_cartoes
BEFORE UPDATE ON cartoes_credito
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_update_timestamp_compras
BEFORE UPDATE ON compras_terceiros
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_update_timestamp_transacoes
BEFORE UPDATE ON transacoes
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trg_update_timestamp_planos
BEFORE UPDATE ON planos_futuros
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- Fim do schema
