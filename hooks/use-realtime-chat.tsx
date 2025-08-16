"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// ---------- Wire & UI types ----------

// What Supabase/PostgREST actually sends back (snake_case, bigint/uuid as strings)
type MessageWire = {
  [key: string]: unknown; // 👈 satisfies supabase generic constraint
  id: string | number;
  created_at: string;
  updated_at: string;
  message: string | null;
  author_user_id: string | null;
  author_username: string | null;
  author_avatar_url: string | null;
  author_color: string | null;
  message_source: "user" | "creator" | "moderator" | "admin" | "system";
  deleted_at: string | null;
  deleted_by: string | null;
};

// What we keep in React state (camelCase, id as string)
export type ChatMessage = {
  id: string;
  createdAt: string;
  updatedAt: string;
  message: string | null;
  authorUserId: string | null;
  authorUsername: string | null;
  authorAvatarUrl: string | null;
  authorColor: string | null;
  messageSource: MessageWire["message_source"];
  deletedAt: string | null;
  deletedBy: string | null;
};

// column list for selects
const MESSAGE_COLUMNS =
  "id,created_at,updated_at,message,author_user_id,author_username,author_avatar_url,author_color,message_source,deleted_at,deleted_by";

// normalize row -> UI shape
function fromWire(r: MessageWire): ChatMessage {
  return {
    id: String(r.id),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    message: r.message,
    authorUserId: r.author_user_id,
    authorUsername: r.author_username,
    authorAvatarUrl: r.author_avatar_url,
    authorColor: r.author_color,
    messageSource: r.message_source,
    deletedAt: r.deleted_at,
    deletedBy: r.deleted_by,
  };
}

interface UseRealtimeChatOptions {
  pageSize?: number;
  includeDeleted?: boolean;
}

export function useRealtimeChat(options: UseRealtimeChatOptions = {}) {
  const { pageSize = 30, includeDeleted = false } = options;

  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // for pagination (older-than)
  const oldestTsRef = useRef<string | null>(null);

  // keep list sorted asc by createdAt
  const sortAsc = (arr: ChatMessage[]) =>
    arr.slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // upsert a single row into state
  const applyUpsert = useCallback(
    (row: MessageWire) => {
      const mapped = fromWire(row);
      setMessages((curr) => {
        // if not showing deleted, drop it
        if (!includeDeleted && mapped.deletedAt) {
          const idx = curr.findIndex((m) => m.id === mapped.id);
          if (idx === -1) return curr;
          const next = curr.slice();
          next.splice(idx, 1);
          return next;
        }
        const idx = curr.findIndex((m) => m.id === mapped.id);
        if (idx === -1) return sortAsc([...curr, mapped]);
        const next = curr.slice();
        next[idx] = mapped;
        return sortAsc(next);
      });
    },
    [includeDeleted]
  );

  // -------- Initial load --------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);

      let q = supabase
        .from("messages")
        .select(MESSAGE_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(pageSize);

      if (!includeDeleted) {
        // only apply the filter when needed
        // (avoid passing undefined into .is, which can confuse types)
        q = q.is("deleted_at", null);
      }

      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        console.error("load messages error", error);
        setIsLoading(false);
        return;
      }

      const rows = (data ?? []).slice().reverse().map(fromWire); // UI asc
      setMessages(rows);
      oldestTsRef.current = rows.length ? rows[0].createdAt : null;
      setHasMore((data ?? []).length === pageSize);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, pageSize, includeDeleted]);

  // -------- Realtime subscription --------
  useEffect(() => {
    const channel = supabase
      .channel("realtime:messages")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload: RealtimePostgresChangesPayload<MessageWire>) => {
          if (payload.eventType === "INSERT") {
            applyUpsert(payload.new);
          } else if (payload.eventType === "UPDATE") {
            applyUpsert(payload.new);
          }
          // DELETE events won't occur (hard-deletes prevented)
        }
      )
      .subscribe((status) => {
        console.log("subscribe status", status);
        if (status === "SUBSCRIBED") setIsConnected(true);
      });

    return () => {
      setIsConnected(false);
      supabase.removeChannel(channel);
    };
  }, [supabase, applyUpsert]);

  // -------- Pagination --------
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    setIsLoading(true);

    let q = supabase
      .from("messages")
      .select(MESSAGE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(pageSize);

    if (!includeDeleted) q = q.is("deleted_at", null);
    if (oldestTsRef.current) q = q.lt("created_at", oldestTsRef.current);

    const { data, error } = await q;
    if (error) {
      console.error("loadMore error", error);
      setIsLoading(false);
      return;
    }
    const batch = (data ?? []).slice().reverse().map(fromWire); // UI asc
    setMessages((curr) => sortAsc([...batch, ...curr]));
    if (batch.length) {
      oldestTsRef.current = batch[0].createdAt;
    }
    setHasMore((data ?? []).length === pageSize);
    setIsLoading(false);
  }, [supabase, pageSize, includeDeleted, hasMore, isLoading]);

  // -------- Insert (user message) --------
  const sendMessage = useCallback(
    async (content: string) => {
      const text = content?.trim();
      if (!text) return;

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) {
        console.error("No authenticated user", userErr);
        return;
      }

      // RLS: author_user_id must equal auth.uid()
      const { error } = await supabase.from("messages").insert({
        message: text,
        author_user_id: userRes.user.id,
      });
      if (error) console.error("insert message error", error);
      // No optimistic push — realtime INSERT will arrive
    },
    [supabase]
  );

  // -------- Soft delete via RPC --------
  const deleteMessage = useCallback(
    async (messageId: string) => {
      const { error } = await supabase.rpc("mark_message_deleted", {
        p_message_id: Number(messageId),
      });
      if (error) console.error("delete message error", error);
      // UPDATE flows in via realtime
    },
    [supabase]
  );

  // -------- Post system message (mods/admins) --------
  const postSystemMessage = useCallback(
    async (content: string) => {
      const txt = content?.trim();
      if (!txt) return;
      const { error } = await supabase.rpc("post_system_message", {
        p_message: txt,
      });
      if (error) console.error("post system message error", error);
    },
    [supabase]
  );

  return {
    messages, // ChatMessage[] (camelCase, id:string), asc by createdAt
    isConnected,
    isLoading,
    hasMore,
    loadMore,
    sendMessage,
    deleteMessage,
    postSystemMessage,
  };
}
