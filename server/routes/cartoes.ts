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
    const { data, error } = await supabase.from("cartoes_credito").select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const getCartao: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("cartoes_credito")
      .select("*")
      .eq("id", id)
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
