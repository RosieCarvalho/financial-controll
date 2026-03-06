import { RequestHandler } from "express";
import { supabase } from "../supabase";
import type { ThirdPartyPurchase } from "@shared/api";

const isUuid = (v: any) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );

export const listComprasTerceiros: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("compras_terceiros")
      .select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const createCompraTerceiro: RequestHandler = async (req, res) => {
  const payload = req.body as Partial<ThirdPartyPurchase>;
  try {
    const dbPayload: any = {
      nome_pessoa:
        payload.personName ??
        payload["nome_pessoa"] ??
        payload["person"] ??
        payload["personName"],
      descricao: payload.description ?? payload["descricao"] ?? payload["desc"],
      valor: payload.amount ?? payload["valor"],
      data: payload.date ?? payload["data"],
      cartao_id: payload.cardId ?? payload["cardId"] ?? payload["cartao_id"],
      parcelas:
        payload.installments ?? payload["installments"] ?? payload["parcelas"],
      parcelas_pagas:
        payload.paidInstallments ??
        payload["paidInstallments"] ??
        payload["parcelas_pagas"],
    };

    if (dbPayload.cartao_id && !isUuid(dbPayload.cartao_id))
      dbPayload.cartao_id = null;

    const { data, error } = await supabase
      .from("compras_terceiros")
      .insert([dbPayload])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
