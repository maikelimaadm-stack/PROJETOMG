import { createClient } from "@supabase/supabase-js";

const hasAuthConfig = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

const testSupabaseAuthConnection = async () => {
  if (!hasAuthConfig()) return { configured: false, connected: false };
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { error } = await client.auth.getSession();
  return { configured: true, connected: !error, error: error?.message || null };
};

export const registerAuthRoutes = async (app) => {
  app.get("/api/auth/session", async () => {
    const status = await testSupabaseAuthConnection();
    return {
      provider: "supabase",
      configured: status.configured,
      connected: status.connected,
      error: status.error,
      status: status.connected ? "ok" : "degraded",
    };
  });
};
