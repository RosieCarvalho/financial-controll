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
