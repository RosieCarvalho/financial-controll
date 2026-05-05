import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  realtime: {
    transport: ws, // 🔥 ESSA LINHA RESOLVE
  },
});

export default supabase;
