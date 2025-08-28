"use client";

import { useRealtimeStore } from "@/lib/stores/realtime-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { timeSince } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  Coins,
  DollarSign,
  RefreshCw,
  Vote,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ManageUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface UserTransactionsModalProps {
  user: ManageUser | null;
  isOpen: boolean;
  onClose: () => void;
}

type CoinTransaction = {
  id: string;
  delta: number;
  reason: "topup" | "vote_purchase" | "adjustment" | "refund";
  created_at: string;
  ref_topup_id: number | null;
  ref_vote_order_id: number | null;
};

const getReasonIcon = (reason: string) => {
  switch (reason) {
    case "topup":
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case "vote_purchase":
      return <Vote className="h-4 w-4 text-blue-500" />;
    case "adjustment":
      return <RefreshCw className="h-4 w-4 text-yellow-500" />;
    case "refund":
      return <ArrowUp className="h-4 w-4 text-purple-500" />;
    default:
      return <Coins className="h-4 w-4 text-gray-500" />;
  }
};

const getReasonLabel = (reason: string) => {
  switch (reason) {
    case "topup":
      return "Цэнэглэлт";
    case "vote_purchase":
      return "Санал худалдаж авсан";
    case "adjustment":
      return "Засвар";
    case "refund":
      return "Буцаалт";
    default:
      return reason;
  }
};

const getReasonBadgeColor = (reason: string) => {
  switch (reason) {
    case "topup":
      return "bg-green-600 text-white";
    case "vote_purchase":
      return "bg-blue-600 text-white";
    case "adjustment":
      return "bg-yellow-600 text-white";
    case "refund":
      return "bg-purple-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

export default function UserTransactionsModal({
  user,
  isOpen,
  onClose,
}: UserTransactionsModalProps) {
  const { supabase } = useRealtimeStore();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchTransactions();
    }
  }, [user, isOpen]);

  const fetchTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("coin_ledger")
        .select(
          "id, delta, reason, created_at, ref_topup_id, ref_vote_order_id"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-card-background border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={user.avatar_url ?? ""} />
              <AvatarFallback className="bg-gray-600 text-white text-sm">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user.username} - Гүйлгээний түүх
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Сүүлийн 50 гүйлгээ
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-white">Ачааллаж байна...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Гүйлгээ байхгүй</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Огноо</TableHead>
                  <TableHead>Төрөл</TableHead>
                  <TableHead>Дүн</TableHead>
                  <TableHead>Лавлагаа</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-gray-300">
                      {timeSince(new Date(transaction.created_at))}-н өмнө
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getReasonIcon(transaction.reason)}
                        <Badge
                          variant="secondary"
                          className={`${getReasonBadgeColor(
                            transaction.reason
                          )} text-xs`}
                        >
                          {getReasonLabel(transaction.reason)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {transaction.delta > 0 ? (
                          <ArrowUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDown className="h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`font-medium ${
                            transaction.delta > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {transaction.delta > 0 ? "+" : ""}
                          {transaction.delta.toLocaleString()}
                        </span>
                        <Coins className="h-4 w-4 text-yellow-500" />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {transaction.ref_topup_id && (
                        <span>Topup #{transaction.ref_topup_id}</span>
                      )}
                      {transaction.ref_vote_order_id && (
                        <span>Vote #{transaction.ref_vote_order_id}</span>
                      )}
                      {!transaction.ref_topup_id &&
                        !transaction.ref_vote_order_id && <span>-</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
