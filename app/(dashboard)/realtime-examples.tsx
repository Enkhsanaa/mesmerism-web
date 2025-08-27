"use client";

import { useEffect } from "react";
import { useRealtime, WebsiteEvent } from "./realtime-provider";

// Example: Hook for custom event handling
export function useRealtimeEvent(
  eventType: string,
  callback: (payload: any) => void
) {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const unsubscribeEvent = subscribe(eventType as any, callback);

    return () => {
      unsubscribeEvent();
    };
  }, [subscribe, unsubscribe, eventType, callback]);
}

// Example: Hook for multiple events
export function useRealtimeEvents(
  events: Array<{ type: string; callback: (payload: any) => void }>
) {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const unsubscribers = events.map(({ type, callback }) =>
      subscribe(type as any, callback)
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [subscribe, unsubscribe, events]);
}
