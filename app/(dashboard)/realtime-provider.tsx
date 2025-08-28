"use client";

import { useRealtimeStore } from "@/lib/stores/realtime-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { supabase, setupChannel, cleanup, setUser } = useRealtimeStore();
  const router = useRouter();

  useEffect(() => {
    let isCancelled = false;

    const initialize = async () => {
      if (isCancelled) return;

      try {
        console.log("RealtimeProvider: Initializing...");
        await setupChannel();
      } catch (error) {
        console.error("RealtimeProvider: Error during initialization:", error);
      }
    };

    // Wait a bit for auth to be ready
    const timer = setTimeout(() => {
      if (!isCancelled) {
        initialize();
      }
    }, 100);

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("RealtimeProvider: Auth state change:", event);

      if (event === "SIGNED_IN" && session) {
        console.log("RealtimeProvider: User signed in, setting up channel...");
        if (!isCancelled) {
          await initialize();
        }
      } else if (event === "SIGNED_OUT") {
        console.log("RealtimeProvider: User signed out");
        setUser(null);
        router.push("/");
      } else if (event === "TOKEN_REFRESHED" && session) {
        console.log("RealtimeProvider: Token refreshed, reconnecting...");
        if (!isCancelled) {
          await initialize();
        }
      }
    });

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      cleanup();
      authSubscription.unsubscribe();
    };
  }, [supabase, setupChannel, cleanup, setUser, router]);

  // Handle balance updates from realtime events
  useEffect(() => {
    const { user, subscribe, setUser } = useRealtimeStore.getState();

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
  }, []);

  return <>{children}</>;
}
