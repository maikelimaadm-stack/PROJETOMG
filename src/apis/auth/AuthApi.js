import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const assertSupabaseAuthConfig = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase Auth não configurado (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY).");
  }
};

export const AuthApi = {
  isConfigured() {
    return isSupabaseConfigured;
  },

  async getCurrentUser() {
    assertSupabaseAuthConfig();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
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
    if (error) throw error;
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
