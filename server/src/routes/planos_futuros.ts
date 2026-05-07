import { RequestHandler } from "express";
import { supabase } from "../supabase";

export const listPlanosFuturos: RequestHandler = async (_req, res) => {
  try {
    const user = (_req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabase
      .from("planos_futuros")
      .select("*")
      .eq("created_by", user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

export const createPlanoFuturo: RequestHandler = async (req, res) => {
  const payload = req.body;
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    const dbPayload = { ...payload, created_by: user.id };

    const { data, error } = await supabase
      .from("planos_futuros")
      .insert([dbPayload])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};
