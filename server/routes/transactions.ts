import { RequestHandler } from "express";
import { supabase } from "../supabase";
import type { Transaction } from "@shared/api";

const isUuid = (v: any) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );

export const listTransactions: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase.from("transacoes").select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const createTransaction: RequestHandler = async (req, res) => {
  const payload = req.body as Partial<Transaction>;
  try {
    // Map client payload keys to DB column names
    const dbPayload: any = {
      descricao: payload.description ?? payload["descricao"],
      valor: payload.amount ?? payload["valor"],
      data: payload.date ?? payload["data"],
      categoria_id: payload.categoryId ?? payload["categoria_id"],
      tipo: payload.type ?? payload["tipo"],
      status: payload.status ?? payload["status"],
      caixa_id: payload.cashBoxId ?? payload["caixa_id"],
      cartao_id: payload.cardId ?? payload["cartao_id"],
      compra_terceiros_id:
        payload.thirdPartyId ?? payload["compra_terceiros_id"],
      parcelas_total: payload.installmentsTotal ?? payload["parcelas_total"],
      parcela_atual: payload.currentInstallment ?? payload["parcela_atual"],
    };

    // sanitize UUID fields: if not a valid uuid, set null so DB won't attempt wrong cast
    if (dbPayload.categoria_id && !isUuid(dbPayload.categoria_id))
      dbPayload.categoria_id = null;
    if (dbPayload.caixa_id && !isUuid(dbPayload.caixa_id))
      dbPayload.caixa_id = null;
    if (dbPayload.cartao_id && !isUuid(dbPayload.cartao_id))
      dbPayload.cartao_id = null;
    if (dbPayload.compra_terceiros_id && !isUuid(dbPayload.compra_terceiros_id))
      dbPayload.compra_terceiros_id = null;

    const { data, error } = await supabase
      .from("transacoes")
      .insert([dbPayload])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
