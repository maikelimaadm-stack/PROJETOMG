export const registerAuthRoutes = async (app) => {
  app.get("/api/auth/session", async () => {
    return {
      provider: "supabase",
      configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      status: "ok",
    };
  });
};
