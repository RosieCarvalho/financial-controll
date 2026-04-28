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
    // Normalização dos campos (Suporta camelCase da UI e snake_case do banco)
    const dbPayload: any = {
      nome_pessoa:
        payload.personName ?? payload["nome_pessoa"] ?? payload["person"],
      descricao:
        payload.description ??
        payload["descricao"] ??
        payload["desc"] ??
        "Compra de Terceiro",
      valor: payload.amount ?? payload["valor"],
      data:
        payload.date ??
        payload["data"] ??
        new Date().toISOString().split("T")[0],
      cartao_id: payload.cardId ?? payload["cartao_id"],
      parcelas: payload.installments ?? payload["parcelas"] ?? 1,
      parcelas_pagas:
        payload.paidInstallments ?? payload["parcelas_pagas"] ?? 0,
    };

    // Validação básica de UUID para o cartao_id
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

export const receiveCompraTerceiro: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(400).json({ error: "ID de compra inválido" });
  }

  try {
    // 1. Buscar a compra de terceiro atual
    const { data: tp, error: fetchError } = await supabase
      .from("compras_terceiros")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !tp) {
      return res.status(404).json({ error: "Compra não encontrada" });
    }

    if (tp.parcelas_pagas >= tp.parcelas) {
      return res
        .status(400)
        .json({ error: "Esta compra já foi totalmente liquidada" });
    }

    const novaParcelaPaga = (tp.parcelas_pagas || 0) + 1;

    // 2. Atualizar parcelas_pagas na tabela compras_terceiros
    const { data: updatedTp, error: updateError } = await supabase
      .from("compras_terceiros")
      .update({ parcelas_pagas: novaParcelaPaga })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Sincronização Manual: Atualizar a transação vinculada
    // Procuramos a transação que pertence a esta compra de terceiro
    const { error: transacaoError } = await supabase
      .from("transacoes")
      .update({
        parcela_atual: novaParcelaPaga,
        status: novaParcelaPaga >= tp.parcelas ? "paid" : "pending",
      })
      .eq("compra_terceiros_id", id);

    if (transacaoError) {
      // Opcional: Reverter o update da compra se a transação falhar
      console.error("Erro ao sincronizar transação:", transacaoError);
      return res.status(500).json({
        error: "Compra atualizada, mas falha ao sincronizar transação.",
      });
    }

    return res.json(updatedTp);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const updateCompraTerceiro: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const payload = req.body as any;
  if (!isUuid(id)) return res.status(400).json({ error: "ID inválido" });
  try {
    const dbPayload: any = {
      nome_pessoa: payload.personName ?? payload.nome_pessoa ?? payload.person,
      descricao: payload.description ?? payload.descricao ?? payload.desc,
      valor: payload.amount ?? payload.valor,
      data: payload.date ?? payload.data,
      cartao_id: payload.cardId ?? payload.cartao_id,
      parcelas: payload.installments ?? payload.parcelas,
      parcelas_pagas: payload.paidInstallments ?? payload.parcelas_pagas,
    };

    const { data, error } = await supabase
      .from("compras_terceiros")
      .update(dbPayload)
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const deleteCompraTerceiro: RequestHandler = async (req, res) => {
  const { id } = req.params;
  if (!isUuid(id)) return res.status(400).json({ error: "ID inválido" });
  try {
    const { error } = await supabase
      .from("compras_terceiros")
      .delete()
      .eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
