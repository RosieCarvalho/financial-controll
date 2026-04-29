import { RequestHandler } from "express";
import { supabase } from "../supabase";
import type { CreditCard } from "@shared/api";

const isUuid = (v: any) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );

export const listCartoes: RequestHandler = async (_req, res) => {
  try {
    const user = (_req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("cartoes_com_fatura_total")
      .select("*")
      .eq("created_by", user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const getCartao: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("cartoes_com_fatura_total")
      .select("*")
      .eq("id", id)
      .eq("created_by", user.id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Cartão não encontrado" });
    return res.json(data as CreditCard);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const createCartao: RequestHandler = async (req, res) => {
  const payload = req.body as Partial<CreditCard>;
  try {
    const dbPayload: any = {
      nome: payload.name ?? payload["nome"],
      limite: payload.limit ?? payload["limite"],
      dia_fechamento: payload.closingDay ?? payload["dia_fechamento"],
      dia_vencimento: payload.dueDay ?? payload["dia_vencimento"],
      fatura_atual: payload.currentInvoice ?? payload["fatura_atual"],
      cor: payload.color ?? payload["cor"],
    };

    // if an invalid id was provided for some reason, let DB generate it by not sending it
    if (payload && (payload as any).id && !isUuid((payload as any).id))
      delete (payload as any).id;

    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    dbPayload.created_by = user.id;

    const { data, error } = await supabase
      .from("cartoes_credito")
      .insert([dbPayload])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

/**
 * Returns a list of all transactions for a given credit card
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} - A promise that resolves to an Express response object
 */
export const listarFaturaCartao: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("transacoes")
      .select("*")
      .eq("cartao_id", id)
      .eq("status", "pending")
      .eq("created_by", user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const updateCartao: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const payload = req.body as any;
  if (!isUuid(id)) return res.status(400).json({ error: "ID inválido" });
  try {
    const dbPayload: any = {
      nome: payload.name ?? payload.nome,
      limite: payload.limit ?? payload.limite,
      dia_fechamento: payload.closingDay ?? payload.dia_fechamento,
      dia_vencimento: payload.dueDay ?? payload.dia_vencimento,
      cor: payload.color ?? payload.cor,
    };

    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("cartoes_credito")
      .update(dbPayload)
      .eq("id", id)
      .eq("created_by", user.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const deleteCartao: RequestHandler = async (req, res) => {
  const { id } = req.params;
  if (!isUuid(id)) return res.status(400).json({ error: "ID inválido" });
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { error } = await supabase
      .from("cartoes_credito")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
