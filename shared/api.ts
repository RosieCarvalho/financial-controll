/**
 * Shared types for the Financial Control System
 */

export type FinancialRule = '50' | '30' | '20';

export interface Category {
  id: string;
  name: string;
  rule: FinancialRule;
  type: 'income' | 'expense';
  color?: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  type: 'fixed' | 'one-time';
  status: 'pending' | 'paid';
  cashBoxId?: string; // If coming from a specific box
  cardId?: string; // If paid via card
  thirdPartyId?: string; // If it's a third party purchase
}

export interface CashBox {
  id: string;
  name: string;
  balance: number;
  description: string;
  history: {
    id: string;
    amount: number;
    date: string;
    type: 'deposit' | 'withdrawal';
    description: string;
  }[];
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  currentInvoice: number;
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

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  ruleStats: {
    rule50: { current: number; limit: number };
    rule30: { current: number; limit: number };
    rule20: { current: number; limit: number };
  };
  upcomingCardDues: {
    cardName: string;
    dueDate: string;
    amount: number;
  }[];
}
