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
      if (!isCancelled) {
        await setupChannel();
      }
    };

    initialize();

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
