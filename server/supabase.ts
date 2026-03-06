import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  // It's OK in dev to not have these set yet; caller should handle errors.
  console.warn(
    "Supabase environment variables are not set: SUPABASE_URL or SUPABASE_SERVICE_KEY/SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_KEY ?? "", {
  auth: { persistSession: false },
});

export default supabase;
