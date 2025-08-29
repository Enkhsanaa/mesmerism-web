import type { SupabaseClient } from "@supabase/supabase-js";
import { create } from "zustand";

interface UserStore {
  userOverview: DbUserOverview | null;
  setUserOverview: (user: DbUserOverview | null) => void;
  setUserBalance: (balance: number) => void;
  refreshUserOverview: (supabase: SupabaseClient) => Promise<void>;
  initializeUserStore: (supabase: SupabaseClient) => Promise<void>;
  isInitialized: boolean;
}

export const useUserStore = create<UserStore>((set, get) => ({
  userOverview: null,
  isInitialized: false,
  setUserOverview: (userOverview) => set({ userOverview }),
  setUserBalance: (balance) => {
    const { userOverview } = get();
    if (!userOverview) return;
    set({
      userOverview: {
        ...userOverview,
        balance,
      },
    });
  },
  refreshUserOverview: async (supabase) => {
    const { data, error } = await supabase.rpc("get_self_overview");
    if (error) {
      console.error("Error fetching user:", error);
      return;
    }
    set({ userOverview: data || null });
  },
  initializeUserStore: async (supabase) => {
    // Only initialize once
    if (get().isInitialized) return;

    const { data, error } = await supabase.rpc("get_self_overview");

    if (error) {
      console.error("Error fetching user:", error);
      return;
    }

    set({ userOverview: data || null, isInitialized: true });
  },
}));

// Auto-initialization function - call this once in your app root
export function initializeUserStore(supabase: SupabaseClient) {
  const store = useUserStore.getState();
  if (!store.isInitialized) {
    store.initializeUserStore(supabase);
  }
}
