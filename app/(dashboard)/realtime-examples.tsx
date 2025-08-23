"use client";

import { useEffect } from "react";
import { useRealtime } from "./realtime-provider";

// Example: Component that listens to payment events
export function PaymentListener() {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const handlePayment = (payload: any) => {
      console.log("Payment received:", payload);
      // Handle payment logic here
      // e.g., show notification, update UI, etc.
    };

    const unsubscribePayment = subscribe("PAYMENT_RECEIVED", handlePayment);

    return () => {
      unsubscribePayment();
    };
  }, [subscribe, unsubscribe]);

  return null; // This component doesn't render anything
}

// Example: Component that listens to vote events
export function VoteListener() {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const handleVoteCreated = (payload: any) => {
      console.log("Vote created:", payload);
      // Handle vote creation logic
    };

    const handleVoteCreator = (payload: any) => {
      console.log("Vote creator event:", payload);
      // Handle vote creator logic
    };

    const unsubscribeVoteCreated = subscribe("VOTE_CREATED", handleVoteCreated);
    const unsubscribeVoteCreator = subscribe("VOTE_CREATOR", handleVoteCreator);

    return () => {
      unsubscribeVoteCreated();
      unsubscribeVoteCreator();
    };
  }, [subscribe, unsubscribe]);

  return null;
}

// Example: Component that listens to user events
export function UserActivityListener() {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const handleUserJoined = (payload: any) => {
      console.log("User joined:", payload);
      // Handle user joined logic
    };

    const handleUserLeft = (payload: any) => {
      console.log("User left:", payload);
      // Handle user left logic
    };

    const unsubscribeUserJoined = subscribe("USER_JOINED", handleUserJoined);
    const unsubscribeUserLeft = subscribe("USER_LEFT", handleUserLeft);

    return () => {
      unsubscribeUserJoined();
      unsubscribeUserLeft();
    };
  }, [subscribe, unsubscribe]);

  return null;
}

// Example: Component that listens to system announcements
export function SystemAnnouncementListener() {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const handleSystemAnnouncement = (payload: any) => {
      console.log("System announcement:", payload);
      // Handle system announcement logic
      // e.g., show toast notification, update banner, etc.
    };

    const unsubscribeSystemAnnouncement = subscribe(
      "SYSTEM_ANNOUNCEMENT",
      handleSystemAnnouncement
    );

    return () => {
      unsubscribeSystemAnnouncement();
    };
  }, [subscribe, unsubscribe]);

  return null;
}

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
