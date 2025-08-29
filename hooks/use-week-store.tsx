import type { SupabaseClient } from "@supabase/supabase-js";
import { create } from "zustand";

interface WeekStore {
  currentWeekId: number;
  isInitialized: boolean;
  weeks: any[];
  setWeeks: (weeks: any[]) => void;
  setCurrentWeekId: (weekId: number) => void;
  initializeWeekStore: (supabase: SupabaseClient) => Promise<void>;
}

export const useWeekStore = create<WeekStore>((set, get) => ({
  currentWeekId: 1,
  isInitialized: false,
  weeks: [],
  setWeeks: (weeks) => set({ weeks }),
  setCurrentWeekId: (weekId) => set({ currentWeekId: weekId }),
  initializeWeekStore: async (supabase) => {
    // Only initialize once
    if (get().isInitialized) return;

    const { data, error } = await supabase
      .from("competition_weeks")
      .select(
        "id, week_number, title, starts_at, ends_at, is_active, created_at"
      )
      .order("week_number", { ascending: true });

    if (error) {
      console.error("Error fetching weeks:", error);
      return;
    }
    const now = new Date();
    const currentWeek = data?.find(
      (week) =>
        week.is_active &&
        week.starts_at &&
        week.ends_at &&
        new Date(week.starts_at) <= now &&
        new Date(week.ends_at) >= now
    );

    set({
      weeks: data || [],
      currentWeekId: currentWeek?.id ?? 1,
      isInitialized: true,
    });
  },
}));

// Auto-initialization function - call this once in your app root
export function initializeWeekStore(supabase: SupabaseClient) {
  const store = useWeekStore.getState();
  if (!store.isInitialized) {
    store.initializeWeekStore(supabase);
  }
}
