import { RequestHandler } from "express";
import { supabase } from "../supabase";
import type { FuturePlan } from "@shared/api";

export const listPlanosFuturos: RequestHandler = async (_req, res) => {
  try {
    const { data, error } = await supabase.from("planos_futuros").select("*");
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const createPlanoFuturo: RequestHandler = async (req, res) => {
  const payload = req.body as Partial<FuturePlan>;
  try {
    const { data, error } = await supabase
      .from("planos_futuros")
      .insert([payload])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
