"use client";

import CoinIcon from "@/components/icons/coin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRealtime } from "../realtime-provider";

interface CoinTopup {
  id: number;
  user_id: string;
  amount: number;
  price: number;
  status: "pending" | "confirmed" | "failed";
  provider: string | null;
  provider_ref: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

export default function TopupsPage() {
  const { supabase } = useRealtime();
  const [topups, setTopups] = useState<CoinTopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "failed"
  >("all");
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTopups();
  }, []);

  const fetchTopups = async () => {
    setLoading(true);
    try {
      console.log("fetching topups");
      console.log(supabase);
      const { data, error } = await supabase
        .from("coin_topups")
        .select(
          `
          *,
          user:users!coin_topups_user_id_fkey(username, avatar_url)
        `
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching topups:", error);
        toast.error("Failed to fetch topups");
        return;
      }

      setTopups(data || []);
    } catch (error) {
      console.error("Error fetching topups:", error);
      toast.error("Failed to fetch topups");
    } finally {
      setLoading(false);
    }
  };

  const updateTopupStatus = async (
    topupId: number,
    newStatus: "confirmed" | "failed"
  ) => {
    setUpdatingIds((prev) => new Set(prev).add(topupId));

    try {
      const { error } = await supabase
        .from("coin_topups")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", topupId);

      if (error) {
        console.error("Error updating topup:", error);
        toast.error("Failed to update topup status");
        return;
      }

      // Update local state
      setTopups((prev) =>
        prev.map((topup) =>
          topup.id === topupId
            ? {
                ...topup,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : topup
        )
      );

      toast.success(`Topup ${newStatus} successfully`);
    } catch (error) {
      console.error("Error updating topup:", error);
      toast.error("Failed to update topup status");
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(topupId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500/20 text-yellow-400"
          >
            Pending
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            Confirmed
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-500/20 text-red-400">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredTopups = topups.filter((topup) => {
    const matchesSearch =
      !searchQuery ||
      topup.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topup.provider_ref?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || topup.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  if (loading) {
    return (
      <main className="mt-4">
        <Card className="bg-card-background border-none">
          <div className="p-6">
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin size-6 text-white" />
              <span className="ml-2 text-white">Loading topups...</span>
            </div>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="mt-4">
      <Card className="bg-card-background border-none">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">
                Coin Topups Management
              </h1>
              <Button onClick={fetchTopups} variant="outline" size="sm">
                <RefreshCw className="size-4 mr-2" />
                Refresh
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search by username or provider ref..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#34373C] border-none text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-md bg-[#34373C] text-white border-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#34373C] border-none p-4">
                <div className="text-sm text-gray-400">Total Topups</div>
                <div className="text-2xl font-bold text-white">
                  {topups.length}
                </div>
              </Card>
              <Card className="bg-[#34373C] border-none p-4">
                <div className="text-sm text-gray-400">Pending</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {topups.filter((t) => t.status === "pending").length}
                </div>
              </Card>
              <Card className="bg-[#34373C] border-none p-4">
                <div className="text-sm text-gray-400">Confirmed</div>
                <div className="text-2xl font-bold text-green-400">
                  {topups.filter((t) => t.status === "confirmed").length}
                </div>
              </Card>
              <Card className="bg-[#34373C] border-none p-4">
                <div className="text-sm text-gray-400">Failed</div>
                <div className="text-2xl font-bold text-red-400">
                  {topups.filter((t) => t.status === "failed").length}
                </div>
              </Card>
            </div>

            {/* Table */}
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#34373C] hover:bg-[#34373C]/50">
                    <TableHead className="text-white">ID</TableHead>
                    <TableHead className="text-white">User</TableHead>
                    <TableHead className="text-white">Amount</TableHead>
                    <TableHead className="text-white">Price</TableHead>
                    <TableHead className="text-white">Status</TableHead>
                    <TableHead className="text-white">Provider</TableHead>
                    <TableHead className="text-white">Reference</TableHead>
                    <TableHead className="text-white">Created</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTopups.map((topup) => (
                    <TableRow
                      key={topup.id}
                      className="border-[#34373C] hover:bg-[#34373C]/50"
                    >
                      <TableCell className="text-white font-mono">
                        {topup.id}
                      </TableCell>
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          {topup.user?.avatar_url && (
                            <img
                              src={topup.user.avatar_url}
                              alt=""
                              className="size-6 rounded-full"
                            />
                          )}
                          {topup.user?.username || "Unknown User"}
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-mono flex items-center gap-2">
                        <CoinIcon className="size-4" />
                        {formatAmount(topup.amount)}{" "}
                      </TableCell>
                      <TableCell className="text-white font-mono">
                        {formatAmount(topup.price)} ₮
                      </TableCell>
                      <TableCell>{getStatusBadge(topup.status)}</TableCell>
                      <TableCell className="text-white">
                        {topup.provider || "-"}
                      </TableCell>
                      <TableCell className="text-white font-mono text-xs">
                        {topup.provider_ref || "-"}
                      </TableCell>
                      <TableCell className="text-white text-xs">
                        {formatDate(topup.created_at)}
                      </TableCell>
                      <TableCell>
                        {topup.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTopupStatus(topup.id, "confirmed")
                              }
                              disabled={updatingIds.has(topup.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {updatingIds.has(topup.id) ? (
                                <RefreshCw className="size-3 animate-spin" />
                              ) : (
                                <Check className="size-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateTopupStatus(topup.id, "failed")
                              }
                              disabled={updatingIds.has(topup.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              {updatingIds.has(topup.id) ? (
                                <RefreshCw className="size-3 animate-spin" />
                              ) : (
                                <X className="size-3" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No actions
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredTopups.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  No topups found
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
