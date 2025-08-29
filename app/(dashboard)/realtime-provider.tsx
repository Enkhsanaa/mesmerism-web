"use client";

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSupabase } from "../supabase-provider";
import { initializeWeekStore } from "@/hooks/use-week-store";
import { initializeUserStore } from "@/hooks/use-user-store";

export type WebsiteEvent =
  | { type: "broadcast"; event: "CHAT_MESSAGE"; payload: any }
  | { type: "broadcast"; event: "PAYMENT_EVENT"; payload: any }
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
  isConnected: boolean;

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
  const { supabase } = useSupabase();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
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
    console.log("Subscribing to", eventType, subscribers);
    if (!subscribers.has(eventType)) {
      subscribers.set(eventType, new Set());
    }
    subscribers.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      console.log("Unsubscribing from", eventType, subscribers);
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
    console.log("handleEvent", eventType, callbacks, payload);
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
    if (!supabase) return;

    let isCancelled = false;

    const setupChannel = async () => {
      try {
        // Wait for auth to be ready
        const session = await supabase.auth.getSession();
        if (session.error) {
          console.error("Error getting session:", session.error);
          return;
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
            handleEvent(event, eventPayload);
          })
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);
            if (status === "SUBSCRIBED") {
              setIsConnected(true);
            } else {
              setIsConnected(false);
            }
          });

        setChannel(newChannel);
        console.log("Realtime channel setup complete");
      } catch (error) {
        console.error("Error setting up realtime channel:", error);
      }
    };

    setupChannel();
    initializeWeekStore(supabase);
    initializeUserStore(supabase);

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, _session) => {
      console.log("authStateChange", event, _session);
      if (event === "SIGNED_OUT") {
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
        authSubscription.unsubscribe();
      }
    };
  }, [supabase]);

  const contextValue: RealtimeContextType = useMemo(
    () => ({
      supabase,
      isConnected,

      subscribe,
      unsubscribe,
    }),
    [supabase, isConnected, subscribe, unsubscribe]
  );

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}
