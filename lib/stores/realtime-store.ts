import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { create } from "zustand";

export type WebsiteEvent =
  | { type: "broadcast"; event: "CHAT_MESSAGE"; payload: any }
  | { type: "broadcast"; event: "PAYMENT_CONFIRMED"; payload: any }
  | { type: "broadcast"; event: "VOTE_CREATOR"; payload: any }
  | {
      type: "broadcast";
      event: "USER_SUSPENSION";
      payload: {
        data: UserSuspension;
        id: string;
        cleared_suspension?: boolean;
      };
    }
  | { type: "broadcast"; event: "SYSTEM_ANNOUNCEMENT"; payload: any };

interface RealtimeState {
  supabase: SupabaseClient;
  user: DbUserOverview | null;
  currentWeekId: number;
  isConnected: boolean;
  channel: RealtimeChannel | null;

  // Event subscribers - map of event type to array of callbacks
  subscribers: Map<string, Set<(payload: any) => void>>;

  // Actions
  setUser: (user: DbUserOverview | null) => void;
  setCurrentWeekId: (weekId: number) => void;
  setIsConnected: (connected: boolean) => void;
  setChannel: (channel: RealtimeChannel | null) => void;

  refreshUserBalance: () => Promise<void>;

  subscribe: (
    eventType: WebsiteEvent["event"],
    callback: (payload: any) => void
  ) => () => void;

  unsubscribe: (
    eventType: WebsiteEvent["event"],
    callback: (payload: any) => void
  ) => void;

  handleEvent: (eventType: string, payload: any) => void;

  // Setup and cleanup
  setupChannel: () => Promise<void>;
  cleanup: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  supabase: createClient(),
  user: null,
  currentWeekId: 1,
  isConnected: false,
  channel: null,
  subscribers: new Map(),

  setUser: (user) => set({ user }),
  setCurrentWeekId: (currentWeekId) => set({ currentWeekId }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setChannel: (channel) => set({ channel }),

  refreshUserBalance: async () => {
    const { user, supabase } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from("user_coin_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single<{ balance: number }>();

    if (error) {
      console.error("Error refreshing user balance:", error);
      return;
    }

    if (data) {
      set({ user: { ...user, balance: data.balance } });
    }
  },

  subscribe: (eventType, callback) => {
    const { subscribers } = get();

    if (!subscribers.has(eventType)) {
      subscribers.set(eventType, new Set());
    }
    subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          subscribers.delete(eventType);
        }
      }
    };
  },

  unsubscribe: (eventType, callback) => {
    const { subscribers } = get();
    const callbacks = subscribers.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        subscribers.delete(eventType);
      }
    }
  },

  handleEvent: (eventType, payload) => {
    const { subscribers } = get();
    const callbacks = subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }
  },

  setupChannel: async () => {
    const {
      supabase,
      setUser,
      setCurrentWeekId,
      setIsConnected,
      setChannel,
      handleEvent,
    } = get();

    try {
      console.log("Setting up realtime channel...");

      // Wait for auth to be ready
      const session = await supabase.auth.getSession();
      if (session.error) {
        console.error("Error getting session:", session.error);
        setIsConnected(false);
        return;
      }

      console.log(
        "Session status:",
        session.data.session ? "Authenticated" : "Not authenticated"
      );

      const { data: userData, error: userError } = await supabase.rpc(
        "get_self_overview"
      );
      if (userError) {
        console.error("Error loading user data:", userError);
        return;
      }

      if (userData) {
        console.log("User data loaded:", userData.username);
        setUser(userData);
      } else {
        console.log("No user data found");
        setIsConnected(false);
        return;
      }

      const { data: currentWeekId } = await supabase
        .from("competition_weeks")
        .select("id")
        .eq("is_active", true)
        .lte("starts_at", new Date().toISOString())
        .gte("ends_at", new Date().toISOString())
        .order("starts_at", { ascending: false, nullsFirst: true })
        .limit(1)
        .maybeSingle();

      if (currentWeekId) {
        setCurrentWeekId(currentWeekId.id);
      }

      if (!session.data.session?.access_token) {
        console.error("No access token found");
        setIsConnected(false);
        return;
      }

      console.log("Setting realtime auth...");
      await supabase.realtime.setAuth(session.data.session?.access_token);

      console.log("Creating realtime channel...");
      const newChannel = supabase
        .channel("LIVE_EVENTS", {
          config: {
            private: false,
            broadcast: {
              self: true,
            },
          },
        })
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "chat_messages",
          },
          (payload) => {
            console.log("Postgres change received:", payload);
            handleEvent("CHAT_MESSAGE", payload);
          }
        )
        .on("broadcast", { event: "*" }, (payload) => {
          const { event, payload: eventPayload } = payload as WebsiteEvent;
          console.log(event, " received:", eventPayload);
          handleEvent(event, eventPayload);
        })

        .subscribe((status) => {
          console.log("Realtime subscription status:", status);
          if (status === "SUBSCRIBED") {
            console.log("Realtime channel subscribed successfully");
            setIsConnected(true);
          } else if (status === "CHANNEL_ERROR") {
            console.error("Realtime channel error");
            setIsConnected(false);
          } else if (status === "TIMED_OUT") {
            console.error("Realtime channel timed out");
            setIsConnected(false);
          } else if (status === "CLOSED") {
            console.log("Realtime channel closed");
            setIsConnected(false);
          }
        });

      setChannel(newChannel);
      console.log("Realtime channel setup complete");
    } catch (error) {
      console.error("Error setting up realtime channel:", error);
      setIsConnected(false);
    }
  },

  cleanup: () => {
    const { supabase, channel, setIsConnected, setChannel } = get();

    setIsConnected(false);
    if (channel) {
      console.log("Removing realtime channel");
      supabase.removeChannel(channel);
      setChannel(null);
    }
  },
}));
