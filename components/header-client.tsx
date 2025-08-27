"use client";

import { useModal } from "@/app/(dashboard)/modal-provider";
import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { createClient } from "@/lib/supabase/client";
import { formatAmount } from "@/lib/utils";
import { ChevronDown, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CoinIcon from "./icons/coin";
import MesmerismIcon from "./icons/mesmerism";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

interface User {
  id: string;
  username: string | null;
  avatarUrl: string | null;
}

export default function HeaderClient() {
  const { setCoinModalOpen } = useModal();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { userRole, userBalance } = useRealtime();

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
        // const { data: balanceData, error: balanceError } = await supabase
        //   .from("user_coin_balances")
        //   .select("balance")
        //   .eq("user_id", supabaseUser.id)
        //   .single();

        // if (balanceError) {
        //   console.error("Error loading user balance:", balanceError);
        // } else if (balanceData) {
        //   setBalance(balanceData.balance || 0);
        // }
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
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

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
        <div className="flex gap-x-4 items-center">
          {/* Admin Menu */}
          {userRole === "admin" && (
            <ContextMenu>
              <ContextMenuTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                >
                  <Settings className="size-4 mr-2" />
                  Admin
                  <ChevronDown className="size-3 ml-1" />
                </Button>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-[#2B2D31] border-[#404249]">
                <Link href="/users">
                  <ContextMenuItem className="text-white hover:bg-[#404249] cursor-pointer">
                    User Management
                  </ContextMenuItem>
                </Link>
                <Link href="/weeks">
                  <ContextMenuItem className="text-white hover:bg-[#404249] cursor-pointer">
                    Week Management
                  </ContextMenuItem>
                </Link>
                <Link href="/topups">
                  <ContextMenuItem className="text-white hover:bg-[#404249] cursor-pointer">
                    Topup Management
                  </ContextMenuItem>
                </Link>
              </ContextMenuContent>
            </ContextMenu>
          )}

          <div className="relative isolate h-9">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 z-50 bg-[#FAD02C] rounded-full text-black p-1">
              <Plus className="size-4" />
            </div>
            <div className="-inset-[1px] absolute rounded-[6px] bg-linear-to-r from-[#FAD02C] to-white/20 -z-20"></div>
            <div className="inset-0 absolute rounded-[6px] bg-[#202225] -z-10"></div>
            <Button
              className="rounded-[6px] !px-6 bg-white/10 text-white font-extrabold hover:bg-white/20"
              onClick={() => setCoinModalOpen(true)}
            >
              <CoinIcon className="size-6" />
              {formatAmount(userBalance ?? 0)}
            </Button>
          </div>
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
