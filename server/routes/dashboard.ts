import { RequestHandler } from "express";
import { supabase } from "../supabase";

// Build a basic dashboard summary using transactions and categories
export const getDashboard: RequestHandler = async (_req, res) => {
  try {
    const [
      { data: transacoes, error: errT },
      { data: categorias, error: errC },
      { data: cartoes, error: errCard },
    ] = await Promise.all([
      supabase.from("transacoes").select("*"),
      supabase.from("categorias").select("*"),
      supabase.from("cartoes_credito").select("*"),
    ]);

    if (errT) return res.status(500).json({ error: errT.message });
    if (errC) return res.status(500).json({ error: errC.message });
    if (errCard) return res.status(500).json({ error: errCard.message });

    const catMap = new Map<string, any>();
    (categorias ?? []).forEach((c: any) => catMap.set(String(c.id), c));

    let totalIncome = 0;
    let totalExpenses = 0;

    (transacoes ?? []).forEach((t: any) => {
      const cat = catMap.get(String(t.categoria_id));
      if (cat?.tipo === "income") totalIncome += Number(t.valor ?? 0);
      else totalExpenses += Number(t.valor ?? 0);
    });

    const balance = totalIncome - totalExpenses;

    // upcoming card dues: for each card, sum pending transactions
    const upcomingCardDues = (cartoes ?? []).map((card: any) => {
      const amount = (transacoes ?? [])
        .filter(
          (t: any) =>
            String(t.cartao_id) === String(card.id) && t.status === "pending",
        )
        .reduce((s: number, x: any) => s + Number(x.valor ?? 0), 0);
      return {
        cardName: card.nome,
        dueDate: card.dia_vencimento ?? null,
        amount,
      };
    });

    // Simple rule stats placeholders (could be computed from categories) — keeping limits empty for now
    const ruleStats = {
      rule50: { current: 0, limit: 0 },
      rule30: { current: 0, limit: 0 },
      rule20: { current: 0, limit: 0 },
    };

    return res.json({
      totalIncome,
      totalExpenses,
      balance,
      ruleStats,
      upcomingCardDues,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
