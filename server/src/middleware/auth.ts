import { RequestHandler } from "express";
import { supabase } from "../supabase";

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ error: "Missing Authorization" });

    const token = auth.split(" ")[1];

    // Validate token with Supabase. Try both shapes depending on SDK version.
    let userData: any = null;
    try {
      // newer SDK: pass token directly
      const result = await (supabase.auth as any).getUser(token as any);
      userData = result?.data?.user ?? result?.user ?? null;
    } catch (e) {
      try {
        // alternate call signature: object with access_token
        const result = await (supabase.auth as any).getUser({
          access_token: token,
        });
        userData = result?.data?.user ?? result?.user ?? null;
      } catch (e2) {
        userData = null;
      }
    }

    if (!userData) return res.status(401).json({ error: "Invalid token" });

    // attach user
    (req as any).user = userData;
    next();
  } catch (err: any) {
    return res.status(401).json({ error: err?.message ?? String(err) });
  }
};

export default authMiddleware;
