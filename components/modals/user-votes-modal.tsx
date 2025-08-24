"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { timeSince } from "@/lib/utils";
import { Vote, Coins, Calendar, User } from "lucide-react";

interface ManageUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface UserVotesModalProps {
  user: ManageUser | null;
  isOpen: boolean;
  onClose: () => void;
}

type VoteOrder = {
  id: string;
  created_at: string;
  creator_user_id: string;
  week_id: number;
  votes: number;
  coins_spent: number;
  creator_username?: string;
  creator_avatar_url?: string;
  week_title?: string;
  week_number?: number;
};

export default function UserVotesModal({
  user,
  isOpen,
  onClose,
}: UserVotesModalProps) {
  const { supabase } = useRealtime();
  const [votes, setVotes] = useState<VoteOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      fetchVotes();
    }
  }, [user, isOpen]);

  const fetchVotes = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("vote_orders")
        .select(
          `
          id,
          created_at,
          creator_user_id,
          week_id,
          votes,
          coins_spent,
          creator:users!vote_orders_creator_user_id_fkey(username, avatar_url),
          week:competition_weeks!vote_orders_week_id_fkey(title, week_number)
        `
        )
        .eq("buyer_user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching votes:", error);
      } else {
        const formattedData = (data || []).map((item: any) => ({
          id: item.id,
          created_at: item.created_at,
          creator_user_id: item.creator_user_id,
          week_id: item.week_id,
          votes: item.votes,
          coins_spent: item.coins_spent,
          creator_username: item.creator?.username,
          creator_avatar_url: item.creator?.avatar_url,
          week_title: item.week?.title,
          week_number: item.week?.week_number,
        }));
        setVotes(formattedData);
      }
    } catch (error) {
      console.error("Error fetching votes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const totalVotes = votes.reduce((sum, vote) => sum + vote.votes, 0);
  const totalCoinsSpent = votes.reduce(
    (sum, vote) => sum + vote.coins_spent,
    0
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl bg-card-background border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage src={user.avatar_url ?? ""} />
              <AvatarFallback className="bg-gray-600 text-white text-sm">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user.username} - Санал өгсөн түүх
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Сүүлийн 50 санал өгсөн түүх
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Vote className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-400">Нийт санал</p>
                <p className="text-lg font-semibold text-white">
                  {totalVotes.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-400">Нийт зарцуулсан</p>
                <p className="text-lg font-semibold text-white">
                  {totalCoinsSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-white">Ачааллаж байна...</div>
            </div>
          ) : votes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Санал өгсөн түүх байхгүй</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Огноо</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Долоо хоног</TableHead>
                  <TableHead>Санал</TableHead>
                  <TableHead>Зарцуулсан</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {votes.map((vote) => (
                  <TableRow key={vote.id}>
                    <TableCell className="text-gray-300">
                      {timeSince(new Date(vote.created_at))}-н өмнө
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          <AvatarImage src={vote.creator_avatar_url ?? ""} />
                          <AvatarFallback className="bg-gray-600 text-white text-xs">
                            {vote.creator_username?.charAt(0).toUpperCase() ??
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white text-sm">
                          {vote.creator_username ?? "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-purple-600 text-white text-xs"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {vote.week_title ??
                          `Week ${vote.week_number ?? vote.week_id}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Vote className="h-4 w-4 text-blue-500" />
                        <span className="text-white font-medium">
                          {vote.votes.toLocaleString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="text-white font-medium">
                          {vote.coins_spent.toLocaleString()}
                        </span>
                      </div>
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
