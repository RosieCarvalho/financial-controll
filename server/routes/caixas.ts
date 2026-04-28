import { RequestHandler } from "express";
import { supabase } from "../supabase";
import type { CashBox } from "@shared/api";

export const listCaixas: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase.from("caixas").select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const getCaixa: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("caixas")
      .select("*")
      .eq("id", id)
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
    const { data, error } = await supabase
      .from("caixas")
      .insert([payload])
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
    const query = supabase.from("historico_caixa").select("*");
    if (caixaId) query.eq("caixa_id", String(caixaId));
    const { data, error } = await query;
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
    // Get current caixa saldo
    const { data: caixaData, error: caixaError } = await supabase
      .from("caixas")
      .select("*")
      .eq("id", caixaId)
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

    return res
      .status(201)
      .json({
        historico: historicoData,
        caixa: caixaWithHistory ?? updatedCaixa,
      });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
