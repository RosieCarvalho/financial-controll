/**
 * Shared types for the Financial Control System
 */

export type FinancialRule = "50" | "30" | "10p" | "10a";

export interface Category {
  id: string;
  name: string;
  rule: FinancialRule;
  type: "income" | "expense";
  color?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  type: "fixed" | "one-time" | "installment";
  status: "pending" | "paid";
  cashBoxId?: string; // If coming from a specific box
  cardId?: string; // If paid via card
  thirdPartyId?: string; // If it's a third party purchase
  installmentsTotal?: number;
  currentInstallment?: number;
}

export interface TransactionBD {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoria_id: string;
  tipo: "fixed" | "one-time" | "installment";
  status: "pending" | "paid" | "received";
  caixa_id?: string; // If coming from a specific box
  cartao_id?: string; // If paid via card
  compra_terceiros_id?: string; // If it's a third party purchase
  parcelas_total?: number;
  parcela_atual?: number;
}

export interface CashBox {
  id: string;
  nome: string;
  saldo: number;
  descricao?: string;
  history?: {
    id: string;
    valor: number;
    data: string;
    tipo: "deposit" | "withdrawal";
    descricao?: string;
  }[];
}

export interface AccountCard {
  caixa_id?: null;
  cartao_id?: string;
  categoria_id?: null;
  compra_terceiros_id?: null;
  created_at?: string;
  data?: string;
  descricao?: string;
  id?: string;
  parcela_atual?: number;
  parcelas_total?: number;
  status?: "pending";
  tipo?: "installment";
  updated_at?: string;
  valor?: number;
}

export interface AccountThirdParty {
  cartao_id: string;
  created_at: string;
  data: string;
  descricao: string;
  id: string;
  nome_pessoa: string;
  parcelas: number;
  parcelas_pagas: number | null;
  updated_at: string;
  valor: number;
}
export interface Card {
  cor: string;
  created_at: string;
  dia_fechamento: number;
  dia_vencimento: number;
  fatura_atual: number;
  id: string;
  limite: number;
  nome: string;
  total_transacoes: number;
  updated_at: string;
}
export interface ThirdPartyPurchase {
  id: string;
  personName: string;
  description: string;
  amount: number;
  date: string;
  cardId: string;
  installments: number;
  paidInstallments: number;
}

export interface FuturePlan {
  id: string;
  itemName: string;
  totalValue: number;
  installments: number;
  plannedMonth: number; // 0-11 for month index
  plannedYear: number;
  status: "pending" | "completed";
}

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  ruleStats: {
    rule50: { current: number; limit: number };
    rule30: { current: number; limit: number };
    rule10Pendencias: { current: number; limit: number };
    rule10Ajuda: { current: number; limit: number };
  };
  upcomingCardDues: {
    cardName: string;
    dueDate: string;
    amount: number;
  }[];
}
