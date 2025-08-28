"use client";

import { useRealtimeStore } from "@/lib/stores/realtime-store";
import { useCallback, useEffect, useState } from "react";

export function useBannerUrl() {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase } = useRealtimeStore();

  const fetchBannerUrl = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("app_public_settings")
        .select("*")
        .eq("key", "home_banner_image_url")
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "no rows returned"
        console.error("Error fetching banner URL:", error);
      }

      setBannerUrl(data?.text_value || null);
    } catch (error) {
      console.error("Error fetching banner URL:", error);
      setBannerUrl(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBannerUrl();
  }, [fetchBannerUrl]);

  const refreshBannerUrl = useCallback(() => {
    setLoading(true);
    fetchBannerUrl();
  }, [fetchBannerUrl]);

  return {
    bannerUrl,
    loading,
    refreshBannerUrl,
  };
}
