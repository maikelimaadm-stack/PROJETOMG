import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const assertSupabaseAuthConfig = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase Auth não configurado (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY).");
  }
};

const isSessionMissingError = (error) => {
  const message = String(error?.message || "").toLowerCase();
  const name = String(error?.name || "").toLowerCase();
  return (
    message.includes("auth session missing") ||
    name.includes("authsessionmissingerror") ||
    error?.status === 400
  );
};

export const AuthApi = {
  isConfigured() {
    return isSupabaseConfigured;
  },

  async getCurrentUser() {
    assertSupabaseAuthConfig();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError && !isSessionMissingError(sessionError)) throw sessionError;
    if (!sessionData?.session?.access_token) return null;

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(sessionData.session.access_token);
    if (error && !isSessionMissingError(error)) throw error;
    if (error && isSessionMissingError(error)) return null;
    return user || null;
  },

  async getSession() {
    assertSupabaseAuthConfig();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  async signInWithPassword({ email, password }) {
    assertSupabaseAuthConfig();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    assertSupabaseAuthConfig();
    const { error } = await supabase.auth.signOut();
    if (error && !isSessionMissingError(error)) throw error;
    return true;
  },

  onAuthStateChange(callback) {
    assertSupabaseAuthConfig();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(_event, session);
    });
    return { unsubscribe: () => data.subscription.unsubscribe() };
  },
};
