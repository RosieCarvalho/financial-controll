import { RequestHandler } from "express";
import { supabase } from "../../supabase";

// Build a basic dashboard summary using transactions and categories
export const getDashboard: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const [
      { data: transacoes, error: errT },
      { data: categorias, error: errC },
      { data: cartoes, error: errCard },
    ] = await Promise.all([
      supabase.from("transacoes").select("*").eq("created_by", user.id),
      supabase.from("categorias").select("*").eq("created_by", user.id),
      supabase.from("cartoes_credito").select("*").eq("created_by", user.id),
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

    // Compute rule stats based on category.rule (regra)
    // Map existing category 'regra' values (50,30,20) to our new buckets:
    // - '50' -> Essenciais (50%)
    // - '30' -> Desejos Pessoais (30%)
    // - '20' -> split between Pendências Financeiras (10%) and Ajuda ao Próximo (10%)

    let current50 = 0;
    let current30 = 0;
    let current10p = 0;
    let current10a = 0;

    (transacoes ?? []).forEach((t: any) => {
      const cat = catMap.get(String(t.categoria_id));
      const valor = Number(t.valor ?? 0);
      if (!cat) return;
      if (cat.regra === "50") current50 += valor;
      else if (cat.regra === "30") current30 += valor;
      else if (cat.regra === "10p") current10p += valor;
      else if (cat.regra === "10a") current10a += valor;
    });

    const ruleStats = {
      rule50: { current: current50, limit: totalIncome * 0.5 },
      rule30: { current: current30, limit: totalIncome * 0.3 },
      rule10Pendencias: { current: current10p, limit: totalIncome * 0.1 },
      rule10Ajuda: { current: current10a, limit: totalIncome * 0.1 },
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
