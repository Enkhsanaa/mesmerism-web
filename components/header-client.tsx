"use client";

import { useModal } from "@/app/(dashboard)/modal-provider";
import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { useUserStore } from "@/hooks/use-user-store";
import { cn, formatAmount } from "@/lib/utils";
import {
  Calendar,
  ChevronDown,
  LogOut,
  Plus,
  User,
  Users2,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import CoinIcon from "./icons/coin";
import MesmerismIcon from "./icons/mesmerism";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { HTMLAttributes } from "react";

export default function HeaderClient({
  className,
}: {
  className?: HTMLAttributes<HTMLDivElement>["className"];
}) {
  const { setCoinModalOpen } = useModal();
  const { supabase } = useRealtime();
  const { userOverview } = useUserStore();
  const isAdmin = userOverview?.roles.includes("admin");

  return (
    <header
      className={cn(
        "bg-dark-background shadow-[0_0_0_100vmax_var(--dark-background)] [clip-path:inset(0_-100vmax)]",
        className
      )}
    >
      <nav
        aria-label="Global"
        className="flex w-full items-center justify-between py-6"
      >
        <div className="flex items-center gap-x-4">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Mesmerism</span>
            <MesmerismIcon className="h-9 w-auto" />
          </a>
          <Badge variant="secondary">beta</Badge>
        </div>
        <div className="flex gap-x-4 items-center">
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
              {formatAmount(userOverview?.balance ?? 0)}
            </Button>
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Avatar className="size-10">
                  <AvatarImage src={userOverview?.avatar_url ?? ""} />
                  <AvatarFallback>
                    {userOverview?.username?.slice(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2B2D31] border-[#404249]">
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="size-4 mr-2" />
                  Профайл
                </DropdownMenuItem>
              </Link>
              {isAdmin && (
                <>
                  <Link href="/users">
                    <DropdownMenuItem>
                      <Users2 className="size-4 mr-2" />
                      Хэрэглэгчид
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/weeks">
                    <DropdownMenuItem>
                      <Calendar className="size-4 mr-2" />
                      Тэмцээний үе
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/topups">
                    <DropdownMenuItem>
                      <Wallet className="size-4 mr-2" />
                      Цэнэглэлтүүд
                    </DropdownMenuItem>
                  </Link>
                </>
              )}
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut className="size-4 mr-2 text-destructive" />
                Гарах
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
