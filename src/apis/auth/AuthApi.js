import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const GUEST_USER = {
  id: "guest-local",
  email: "guest@local",
  role: "admin",
};

export const AuthApi = {
  isConfigured() {
    return isSupabaseConfigured;
  },

  async getCurrentUser() {
    if (!isSupabaseConfigured || !supabase) return GUEST_USER;
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user || null;
  },

  async getSession() {
    if (!isSupabaseConfigured || !supabase) return { session: null };
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  },

  async signInWithPassword({ email, password }) {
    if (!isSupabaseConfigured || !supabase) {
      return { user: GUEST_USER };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async logout() {
    if (!isSupabaseConfigured || !supabase) return true;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  onAuthStateChange(callback) {
    if (!isSupabaseConfigured || !supabase) {
      callback("SIGNED_IN", { user: GUEST_USER });
      return { unsubscribe: () => {} };
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(_event, session);
    });
    return { unsubscribe: () => data.subscription.unsubscribe() };
  },
};
