import { RequestHandler } from "express";
import { supabase } from "../supabase";
import type { Category } from "@shared/api";

export const listCategorias: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase.from("categorias").select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
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
    return res.json(data as Category);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const createCategoria: RequestHandler = async (req, res) => {
  const payload = req.body as Partial<Category>;
  try {
    const { data, error } = await supabase
      .from("categorias")
      .insert([payload])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const updateCategoria: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const payload = req.body as Partial<Category>;
  try {
    const { data, error } = await supabase
      .from("categorias")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data)
      return res.status(404).json({ error: "Categoria não encontrada" });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const deleteCategoria: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
