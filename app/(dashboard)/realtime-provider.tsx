"use client";

import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

interface RealtimeContextType {
  supabase: SupabaseClient;
  user: DbUserOverview | null;
  currentWeekId: number;
  isConnected: boolean;

  refreshUserBalance: () => Promise<void>;
  setCurrentWeekId: (weekId: number) => void;
  subscribe: (
    eventType: WebsiteEvent["event"],
    callback: (payload: any) => void
  ) => () => void;
  unsubscribe: (
    eventType: WebsiteEvent["event"],
    callback: (payload: any) => void
  ) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<DbUserOverview | null>(null);
  const [currentWeekId, setCurrentWeekId] = useState<number>(1);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Event subscribers - map of event type to array of callbacks
  const subscribers = useMemo(
    () => new Map<string, Set<(payload: any) => void>>(),
    []
  );

  // Subscribe to an event type
  const subscribe = (
    eventType: WebsiteEvent["event"],
    callback: (payload: any) => void
  ) => {
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
  };

  // Unsubscribe from an event type
  const unsubscribe = (
    eventType: WebsiteEvent["event"],
    callback: (payload: any) => void
  ) => {
    const callbacks = subscribers.get(eventType);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        subscribers.delete(eventType);
      }
    }
  };

  // Handle incoming events and dispatch to subscribers
  const handleEvent = (eventType: string, payload: any) => {
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
  };

  useEffect(() => {
    let isCancelled = false;

    const setupChannel = async () => {
      try {
        // Wait for auth to be ready
        const session = await supabase.auth.getSession();
        if (session.error) {
          console.error("Error getting session:", session.error);
          return;
        }

        const { data: userData, error: userError } = await supabase.rpc(
          "get_self_overview"
        );
        if (userError) {
          console.error("Error loading user data:", userError);
          return;
        }

        if (userData) {
          setUser(userData);
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
          return;
        }
        await supabase.realtime.setAuth(session.data.session?.access_token);

        if (isCancelled) {
          console.log("setupChannel cancelled");
          return;
        }

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
            if (status === "SUBSCRIBED" && !isCancelled) {
              setIsConnected(true);
            }
          });

        setChannel(newChannel);
        console.log("Realtime channel setup complete");
      } catch (error) {
        console.error("Error setting up realtime channel:", error);
      }
    };

    setupChannel();

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        router.push("/");
      }
    });

    return () => {
      isCancelled = true;
      setIsConnected(false);
      if (channel) {
        console.log("Removing realtime channel");
        supabase.removeChannel(channel);
        setChannel(null);
      }
      authSubscription.unsubscribe();
    };
  }, [supabase]);

  const refreshUserBalance = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("user_coin_balances")
      .select("balance")
      .eq("user_id", user.id)
      .single<{ balance: number }>();
    if (error) {
      console.error("Error refreshing user balance:", error);
    }
    if (data) {
      setUser({
        ...user,
        balance: data.balance,
      });
    }
  };

  // Separate useEffect to handle balance updates from realtime events
  useEffect(() => {
    if (!user) return;

    const handlePaymentConfirmed = (payload: any) => {
      if (payload.user_id === user.id) {
        console.log(
          "Updating userBalance in realtime provider (payment):",
          payload.new_balance
        );
        setUser({
          ...user,
          balance: payload.new_balance || 0,
        });
      }
    };

    const unsubscribePayment = subscribe(
      "PAYMENT_CONFIRMED",
      handlePaymentConfirmed
    );

    return () => {
      unsubscribePayment();
    };
  }, [user, subscribe, supabase]);

  const contextValue: RealtimeContextType = useMemo(
    () => ({
      supabase,
      user,
      currentWeekId,
      isConnected,

      refreshUserBalance,
      setCurrentWeekId,
      subscribe,
      unsubscribe,
    }),
    [
      supabase,
      user,
      currentWeekId,
      isConnected,

      refreshUserBalance,
      setCurrentWeekId,
      subscribe,
      unsubscribe,
    ]
  );

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}
