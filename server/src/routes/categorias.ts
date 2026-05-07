import { RequestHandler } from "express";
import { supabase } from "../supabase";

// Helper: map DB row (Portuguese columns) to API shape (English)
const dbToApi = (row: any) => ({
  id: row.id,
  name: row.nome ?? row.name,
  rule: row.regra ?? row.rule,
  type: row.tipo ?? row.type,
  color: row.cor ?? row.color,
});

// Helper: map API payload to DB columns
const apiToDb = (payload: any) => {
  const db: any = {};
  if (payload.name !== undefined) db.nome = payload.name;
  if (payload.rule !== undefined) db.regra = payload.rule;
  if (payload.type !== undefined) db.tipo = payload.type;
  if (payload.color !== undefined) db.cor = payload.color;
  return db;
};

export const listCategorias: RequestHandler = async (_req, res) => {
  try {
    const user = (_req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("created_by", user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json((data ?? []).map(dbToApi));
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const getCategoria: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data)
      return res.status(404).json({ error: "Categoria não encontrada" });
    return res.json(dbToApi(data as any));
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const createCategoria: RequestHandler = async (req, res) => {
  const payload = req.body;
  try {
    const dbPayload = apiToDb(payload);
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    dbPayload.created_by = user.id;
    const { data, error } = await supabase
      .from("categorias")
      .insert([dbPayload])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(dbToApi(data as any));
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const updateCategoria: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const payload = req.body;
  try {
    const dbPayload = apiToDb(payload);
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { data, error } = await supabase
      .from("categorias")
      .update(dbPayload)
      .eq("id", id)
      .eq("created_by", user.id)
      .select()
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data)
      return res.status(404).json({ error: "Categoria não encontrada" });
    return res.json(dbToApi(data as any));
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const deleteCategoria: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const { error } = await supabase
      .from("categorias")
      .delete()
      .eq("id", id)
      .eq("created_by", user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
