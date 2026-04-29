import { RequestHandler } from "express";
import { supabase } from "../supabase";
import type { CashBox } from "@shared/api";

export const listCaixas: RequestHandler = async (_req, res) => {
  try {
    const user = (_req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("caixas")
      .select("*")
      .eq("created_by", user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const getCaixa: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("caixas")
      .select("*")
      .eq("id", id)
      .eq("created_by", user.id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Caixa não encontrado" });
    return res.json(data as CashBox);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const createCaixa: RequestHandler = async (req, res) => {
  const payload = req.body as Partial<CashBox>;
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const dbPayload = { ...payload, created_by: user.id };

    const { data, error } = await supabase
      .from("caixas")
      .insert([dbPayload])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const listHistoricoCaixa: RequestHandler = async (req, res) => {
  const { caixaId } = req.query;
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    if (caixaId) {
      // verify ownership
      const { data: caixaData, error: caixaError } = await supabase
        .from("caixas")
        .select("id")
        .eq("id", String(caixaId))
        .eq("created_by", user.id)
        .maybeSingle();
      if (caixaError)
        return res.status(500).json({ error: caixaError.message });
      if (!caixaData)
        return res.status(404).json({ error: "Caixa não encontrado" });

      const { data, error } = await supabase
        .from("historico_caixa")
        .select("*")
        .eq("caixa_id", String(caixaId));
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    // no caixaId: return historico for all user's caixas
    const { data: caixasData, error: caixasError } = await supabase
      .from("caixas")
      .select("id")
      .eq("created_by", user.id);
    if (caixasError)
      return res.status(500).json({ error: caixasError.message });
    const caixaIds = (caixasData ?? []).map((c: any) => c.id);
    const { data, error } = await supabase
      .from("historico_caixa")
      .select("*")
      .in("caixa_id", caixaIds.length ? caixaIds : ["__none__"]);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const createHistoricoCaixa: RequestHandler = async (req, res) => {
  const { id: caixaId } = req.params;
  const { valor, descricao, tipo, data } = req.body as {
    valor: number;
    descricao?: string;
    tipo: "deposit" | "withdrawal";
    data?: string;
  };

  if (!caixaId || typeof valor !== "number" || !tipo) {
    return res.status(400).json({ error: "Parâmetros inválidos" });
  }

  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Get current caixa saldo
    const { data: caixaData, error: caixaError } = await supabase
      .from("caixas")
      .select("*")
      .eq("id", caixaId)
      .eq("created_by", user.id)
      .maybeSingle();

    if (caixaError) return res.status(500).json({ error: caixaError.message });
    if (!caixaData)
      return res.status(404).json({ error: "Caixa não encontrado" });

    const currentSaldo = parseFloat(caixaData.saldo ?? 0);
    const newSaldo =
      tipo === "deposit" ? currentSaldo + valor : currentSaldo - valor;

    // Insert historico
    const historicoPayload = {
      caixa_id: caixaId,
      valor,
      data: data ?? new Date().toISOString(),
      tipo,
      descricao,
    };

    const { data: historicoData, error: histError } = await supabase
      .from("historico_caixa")
      .insert([historicoPayload])
      .select()
      .single();

    if (histError) return res.status(500).json({ error: histError.message });

    // Update caixa saldo
    const { data: updatedCaixa, error: updError } = await supabase
      .from("caixas")
      .update({ saldo: newSaldo })
      .eq("id", caixaId)
      .select()
      .single();

    if (updError) return res.status(500).json({ error: updError.message });

    // Return updated caixa and historico
    const { data: caixaWithHistory, error: joinError } = await supabase
      .from("caixas")
      .select("*, historico_caixa(*)")
      .eq("id", caixaId)
      .maybeSingle();

    if (joinError) return res.status(500).json({ error: joinError.message });

    return res.status(201).json({
      historico: historicoData,
      caixa: caixaWithHistory ?? updatedCaixa,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
