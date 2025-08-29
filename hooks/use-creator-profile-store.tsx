import type { SupabaseClient } from "@supabase/supabase-js";
import { create } from "zustand";

interface CreatorProfileStore {
  profiles: Map<string, DbProfile>;
  getProfile: (userId: string) => DbProfile | null;
  initializeCreatorProfileStore: (supabase: SupabaseClient) => Promise<void>;
  isInitialized: boolean;
}

export const useCreatorProfileStore = create<CreatorProfileStore>(
  (set, get) => ({
    profiles: new Map(),
    isInitialized: false,
    getProfile: (userId) => {
      return get().profiles.get(userId) || null;
    },
    initializeCreatorProfileStore: async (supabase) => {
      // Only initialize once
      if (get().isInitialized) return;

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "user_id, created_at, updated_at, bubble_text, title, short_intro, description, cover_image_url, avatar_url, intro_video_url, social_links, subscriber_count"
        );

      if (error) {
        console.error("Error fetching user:", error);
        return;
      }

      set({
        profiles: new Map(data?.map((p) => [p.user_id, p]) || []),
        isInitialized: true,
      });
    },
  })
);
// Auto-initialization function - call this once in your app root
export function initializeCreatorProfileStore(supabase: SupabaseClient) {
  const store = useCreatorProfileStore.getState();
  if (!store.isInitialized) {
    store.initializeCreatorProfileStore(supabase);
  }
}
