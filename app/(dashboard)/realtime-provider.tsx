"use client";

import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  RealtimeChannel,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";

// Event types for the website
export type WebsiteEvent =
  | { type: "CHAT_MESSAGE"; payload: any }
  | { type: "PAYMENT_RECEIVED"; payload: any }
  | { type: "VOTE_CREATOR"; payload: any }
  | { type: "PAYMENT_RECEIVED"; payload: any }
  | { type: "VOTE_CREATED"; payload: any }
  | { type: "USER_JOINED"; payload: any }
  | { type: "USER_LEFT"; payload: any }
  | { type: "SYSTEM_ANNOUNCEMENT"; payload: any };

// export interface ChatMessage {
//     author_avatar_url: string | null;
//     author_color: string;
//     author_user_id: string;
//     author_username: string;
//     created_at: string;
//     deleted_at: string | null;
//     deleted_by: string | null;
//     id: number;
//     message: string;
//     message_source: string;
//     updated_at: string;
// }

interface RealtimeContextType {
  supabase: SupabaseClient;
  user: User | null;
  isConnected: boolean;
  subscribe: (
    eventType: WebsiteEvent["type"],
    callback: (payload: any) => void
  ) => () => void;
  unsubscribe: (
    eventType: WebsiteEvent["type"],
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
  const [isConnected, setIsConnected] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Event subscribers - map of event type to array of callbacks
  const subscribers = useMemo(
    () => new Map<string, Set<(payload: any) => void>>(),
    []
  );

  // Subscribe to an event type
  const subscribe = (
    eventType: WebsiteEvent["type"],
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
    eventType: WebsiteEvent["type"],
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
        setUser(session.data.session?.user || null);
        if (!session.data.session?.access_token) {
          console.error("No access token found");
          return;
        }
        await supabase.realtime.setAuth(session.data.session?.access_token);

        if (isCancelled) return;

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
          //   .on("broadcast", { event: "CHAT_MESSAGE" }, (payload) => {
          //     console.log("CHAT_MESSAGE received:", payload);
          //     handleEvent("CHAT_MESSAGE", payload);
          //   })
          //   .on("broadcast", { event: "PAYMENT_RECEIVED" }, (payload) => {
          //     console.log("PAYMENT_RECEIVED received:", payload);
          //     handleEvent("PAYMENT_RECEIVED", payload);
          //   })
          //   .on("broadcast", { event: "VOTE_CREATOR" }, (payload) => {
          //     console.log("VOTE_CREATOR received:", payload);
          //     handleEvent("VOTE_CREATOR", payload);
          //   })
          //   .on("broadcast", { event: "VOTE_CREATED" }, (payload) => {
          //     console.log("VOTE_CREATED received:", payload);
          //     handleEvent("VOTE_CREATED", payload);
          //   })
          //   .on("broadcast", { event: "USER_JOINED" }, (payload) => {
          //     console.log("USER_JOINED received:", payload);
          //     handleEvent("USER_JOINED", payload);
          //   })
          //   .on("broadcast", { event: "USER_LEFT" }, (payload) => {
          //     console.log("USER_LEFT received:", payload);
          //     handleEvent("USER_LEFT", payload);
          //   })
          //   .on("broadcast", { event: "SYSTEM_ANNOUNCEMENT" }, (payload) => {
          //     console.log("SYSTEM_ANNOUNCEMENT received:", payload);
          //     handleEvent("SYSTEM_ANNOUNCEMENT", payload);
          //   })
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

    return () => {
      isCancelled = true;
      setIsConnected(false);
      if (channel) {
        console.log("Removing realtime channel");
        supabase.removeChannel(channel);
        setChannel(null);
      }
    };
  }, [supabase]);

  const contextValue: RealtimeContextType = useMemo(
    () => ({
      supabase,
      user,
      isConnected,
      subscribe,
      unsubscribe,
    }),
    [isConnected]
  );

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
}
