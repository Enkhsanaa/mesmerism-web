"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import CoinIcon from "./icons/coin";
import MesmerismIcon from "./icons/mesmerism";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { formatAmount } from "@/lib/utils";
import Link from "next/link";

interface User {
  id: string;
  username: string | null;
  avatarUrl: string | null;
}

export default function HeaderClient() {
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user
        const {
          data: { user: supabaseUser },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !supabaseUser) {
          setIsLoading(false);
          return;
        }

        // Get user profile
        const { data: userData, error: profileError } = await supabase
          .from("users")
          .select("id, username, avatar_url")
          .eq("id", supabaseUser.id)
          .single();

        if (profileError) {
          console.error("Error loading user profile:", profileError);
        } else if (userData) {
          setUser({
            id: userData.id,
            username: userData.username,
            avatarUrl: userData.avatar_url,
          });
        }

        // Get user balance
        const { data: balanceData, error: balanceError } = await supabase
          .from("user_coin_balances")
          .select("balance")
          .eq("user_id", supabaseUser.id)
          .single();

        if (balanceError) {
          console.error("Error loading user balance:", balanceError);
        } else if (balanceData) {
          setBalance(balanceData.balance || 0);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        loadUserData();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setBalance(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Listen for realtime payment events to update balance
  useEffect(() => {
    if (!user?.id) return;

    const handlePaymentReceived = (payload: any) => {
      console.log("Payment received in header:", payload);
      // Update balance if the payment is for the current user
      if (payload.user_id === user.id) {
        setBalance((prevBalance) => prevBalance + (payload.amount || 0));
      }
    };

    const unsubscribePayment = subscribe(
      "PAYMENT_RECEIVED",
      handlePaymentReceived
    );

    return () => {
      unsubscribePayment();
    };
  }, [subscribe, unsubscribe, user?.id]);

  return (
    <header className="bg-dark-background">
      <nav
        aria-label="Global"
        className="flex w-full items-center justify-between p-6 lg:px-8"
      >
        <div className="flex items-center gap-x-4">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Mesmerism</span>
            <MesmerismIcon className="h-9 w-auto" />
          </a>
          <Badge variant="secondary">beta</Badge>
        </div>
        <div className="flex gap-x-4">
          <Button
            variant="secondary"
            className="font-extrabold text-base gap-x-2"
          >
            <CoinIcon className="size-6" />
            {formatAmount(balance)}
          </Button>
          <Link href="/profile">
            <Avatar className="size-10">
              <AvatarImage src={user?.avatarUrl ?? ""} />
              <AvatarFallback>
                {user?.username?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </nav>
    </header>
  );
}
