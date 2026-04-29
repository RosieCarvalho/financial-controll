import { RequestHandler } from "express";
import { supabase } from "../supabase";
import type { Transaction, TransactionBD } from "@shared/api";

const isUuid = (v: any) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );

export const listTransactions: RequestHandler = async (_req, res) => {
  try {
    const user = (_req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("transacoes")
      .select(
        `
        *,
        categorias (
          nome,
          tipo
        )
      `,
      )
      .eq("created_by", user.id)
      .is("compra_terceiros_id", null);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(
      (data ?? []).map((r: any) => ({
        id: r.id,
        description: r.descricao,
        amount: r.valor,
        date: r.data,
        categoryId: r.categoria_id,
        categoryName: r.categorias?.nome ?? null,
        categoryType: r.categorias?.tipo ?? null,
        type: r.tipo,
        status: r.status,
        cashBoxId: r.caixa_id,
        cardId: r.cartao_id,
        thirdPartyId: r.compra_terceiros_id,
        installmentsTotal: r.parcelas_total,
        currentInstallment: r.parcela_atual,
      })),
    );
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

    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    dbPayload.created_by = user.id;

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

export const getTypesStatusTransaction: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase.rpc("get_transacao_status");
    console.log("RPC Result:", { data, error });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const deleteTransaction: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { error } = await supabase
      .from("transacoes")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id);
    console.log("err", error);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).send();
  } catch (err: any) {
    console.log("err", err);
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const updateTransactions: RequestHandler = async (req, res) => {
  const payload = req.body as Partial<TransactionBD>;
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // If payload is an array, update each owned transaction individually.
    if (Array.isArray(payload)) {
      for (const item of payload) {
        if (item.id) {
          const dbPayload: any = { ...item };
          // Prevent changing ownership
          delete dbPayload.created_by;
          const { error } = await supabase
            .from("transacoes")
            .update(dbPayload)
            .eq("id", item.id)
            .eq("created_by", user.id);
          if (error) return res.status(500).json({ error: error.message });
        } else {
          // new row: set created_by
          const { error } = await supabase
            .from("transacoes")
            .insert([{ ...item, created_by: user.id }]);
          if (error) return res.status(500).json({ error: error.message });
        }
      }
      return res.status(204).send();
    }

    // Single object
    if ((payload as any).id) {
      const id = (payload as any).id;
      const dbPayload: any = { ...(payload as any) };
      delete dbPayload.created_by;
      const { error } = await supabase
        .from("transacoes")
        .update(dbPayload)
        .eq("id", id)
        .eq("created_by", user.id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(204).send();
    }

    return res.status(400).json({ error: "Invalid payload for update" });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
