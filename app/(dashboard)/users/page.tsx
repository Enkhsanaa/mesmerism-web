"use client";
import { Card } from "@/components/ui/card";
import { useRealtime } from "../realtime-provider";
import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { timeSince } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUserManage } from "@/hooks/use-user-manage";
import { SupabaseClient } from "@supabase/supabase-js";
import { Pagination } from "@/components/ui/pagination";
import RoleManageModal from "@/components/modals/role-manage-modal";
import TimeoutBanModal from "@/components/modals/timeout-ban-modal";
import UserTransactionsModal from "@/components/modals/user-transactions-modal";
import UserVotesModal from "@/components/modals/user-votes-modal";
import { Search, Settings, Clock, Receipt, Vote } from "lucide-react";

type AppRole = "admin" | "moderator" | "creator";

type ManageUser = {
  id: string;
  username: string;
  created_at: string;
  avatar_url: string | null;
  color: string | null;
  roles: AppRole[];
  balance: number; // sum of coin_ledger.delta
  is_suspended: boolean;
  suspension?: {
    id: number;
    reason: string | null;
    created_at: string;
    expires_at: string | null; // null = permanent
  } | null;
};

async function fetchManageUsersOneQuery(
  supabase: SupabaseClient,
  {
    page = 1,
    pageSize = 25,
    search = "",
    sortBy = "created_at", // or 'username'
    sortDir = "desc" as "asc" | "desc",
  } = {}
): Promise<{ rows: ManageUser[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const nowIso = new Date().toISOString();

  let q = supabase
    .from("users")
    .select(
      `
      id, username, created_at, avatar_url, color,
      user_roles!user_roles_user_id_fkey ( role ),
      user_suspensions!user_suspensions_target_user_id_fkey (
        id, reason, created_at, expires_at
      ),
      coin_ledger!coin_ledger_user_id_fkey ( delta )
    `,
      { count: "exact" }
    )
    .order(sortBy, { ascending: sortDir === "asc" })
    .range(from, to);

  if (search.trim()) q = q.ilike("username", `%${search.trim()}%`);

  // Keep only ACTIVE suspensions and just the latest one per user
  q = q
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`, {
      foreignTable: "user_suspensions",
    })
    .order("created_at", { foreignTable: "user_suspensions", ascending: false })
    .limit(1, { foreignTable: "user_suspensions" });

  const { data, error, count } = await q;
  if (error) throw error;

  const rows: ManageUser[] = (data ?? []).map((u: any) => {
    const roles: AppRole[] = (u.user_roles ?? []).map((r: any) => r.role);
    const suspension = (u.user_suspensions && u.user_suspensions[0]) || null;
    const balance = (u.coin_ledger ?? []).reduce(
      (sum: number, l: any) => sum + Number(l.delta),
      0
    );
    return {
      id: u.id,
      username: u.username,
      created_at: u.created_at,
      avatar_url: u.avatar_url ?? null,
      color: u.color ?? null,
      roles,
      balance,
      is_suspended: Boolean(suspension),
      suspension: suspension
        ? {
            id: suspension.id,
            reason: suspension.reason ?? null,
            created_at: suspension.created_at,
            expires_at: suspension.expires_at ?? null,
          }
        : null,
    };
  });

  return { rows, total: count ?? rows.length };
}

export default function UsersPage() {
  const { supabase } = useRealtime();
  const [users, setUsers] = useState<ManageUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManageUser | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [isVotesModalOpen, setIsVotesModalOpen] = useState(false);
  const { unbanUser } = useUserManage();

  const pageSize = 50;
  const totalPages = Math.ceil(totalUsers / pageSize);

  const fetchUsers = useCallback(
    async (page = 1, search = "") => {
      setIsLoading(true);
      try {
        const { rows, total } = await fetchManageUsersOneQuery(supabase, {
          page,
          pageSize,
          search,
          sortBy: "created_at",
          sortDir: "desc",
        });
        setUsers(rows);
        setTotalUsers(total);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [supabase, pageSize]
  );

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [fetchUsers, currentPage, searchQuery]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenRoleModal = (user: ManageUser) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleOpenBanModal = (user: ManageUser) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  const handleOpenTransactionsModal = (user: ManageUser) => {
    setSelectedUser(user);
    setIsTransactionsModalOpen(true);
  };

  const handleOpenVotesModal = (user: ManageUser) => {
    setSelectedUser(user);
    setIsVotesModalOpen(true);
  };

  const handleModalUpdate = () => {
    setIsRoleModalOpen(false);
    fetchUsers(currentPage, searchQuery);
  };

  const handleUnbanUser = async (userId: string) => {
    await unbanUser(userId);
    fetchUsers(currentPage, searchQuery);
  };

  return (
    <main className="mt-4 space-y-4">
      <Card className="p-4 bg-card-background">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-white">
            Хэрэглэгчид ({totalUsers})
          </h1>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Хэрэглэгчийн нэр хайх..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="text-white">Ачааллаж байна...</div>
          </div>
        )}

        {/* Users table */}
        {!isLoading && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Зураг</TableHead>
                  <TableHead>Хэрэглэгчийн нэр</TableHead>
                  <TableHead>Бүртгүүлсэн огноо</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Suspended</TableHead>
                  <TableHead>Үйлдэл</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar className="size-10">
                        <AvatarImage src={user.avatar_url ?? ""} />
                        <AvatarFallback>
                          {user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {user.username}
                    </TableCell>
                    <TableCell>
                      {timeSince(new Date(user.created_at))}-н өмнө
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                            >
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">Байхгүй</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.balance}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_suspended
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.is_suspended ? "Тийм" : "Үгүй"}
                      </span>
                    </TableCell>
                    <TableCell className="flex gap-2 flex-wrap">
                      {/* Role Management */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRoleModal(user)}
                        className="text-white border-gray-600 hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Role
                      </Button>

                      {/* Ban/Timeout Management */}
                      {!user.suspension ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenBanModal(user)}
                          className="text-red-400 border-red-600 hover:bg-red-600/10"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Бандах
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          Бан гаргах
                        </Button>
                      )}

                      {/* Transactions */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenTransactionsModal(user)}
                        className="text-green-400 border-green-600 hover:bg-green-600/10"
                      >
                        <Receipt className="h-4 w-4 mr-1" />
                        Гүйлгээ
                      </Button>

                      {/* Votes */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenVotesModal(user)}
                        className="text-blue-400 border-blue-600 hover:bg-blue-600/10"
                      >
                        <Vote className="h-4 w-4 mr-1" />
                        Санал
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}

            {/* No results */}
            {users.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  {searchQuery
                    ? "Хайлтын үр дүн олдсонгүй"
                    : "Хэрэглэгч байхгүй"}
                </p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Modals */}
      <RoleManageModal
        user={selectedUser}
        isOpen={isRoleModalOpen}
        onClose={() => {
          setIsRoleModalOpen(false);
          setSelectedUser(null);
        }}
        onUpdate={handleModalUpdate}
      />

      <TimeoutBanModal
        user={selectedUser}
        isOpen={isBanModalOpen}
        onClose={() => {
          setIsBanModalOpen(false);
          setSelectedUser(null);
        }}
        onUpdate={handleModalUpdate}
      />

      <UserTransactionsModal
        user={selectedUser}
        isOpen={isTransactionsModalOpen}
        onClose={() => {
          setIsTransactionsModalOpen(false);
          setSelectedUser(null);
        }}
      />

      <UserVotesModal
        user={selectedUser}
        isOpen={isVotesModalOpen}
        onClose={() => {
          setIsVotesModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </main>
  );
}
