"use client";

import { cn } from "@/lib/utils";
import { ChatMessageItem } from "@/components/chat-message";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { ChatMessage, useRealtimeChat } from "@/hooks/use-realtime-chat"; // ⬅️ new hook API (no roomName/username args)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRealtime } from "@/app/(dashboard)/realtime-provider";

/**
 * Legacy UI message shape expected by <ChatMessageItem />
 * (content + user.name + createdAt)
 */
export type UIMessage = {
  id: string;
  content: string | null;
  user: {
    id: string;
    name: string;
    role?: string;
    avatar?: string;
    color?: string;
  };
  createdAt: string;
};

interface RealtimeChatProps {
  // roomName removed (schema is global messages). If you plan to add rooms later, reintroduce it.
  onMessage?: (messages: UIMessage[]) => void;
  messages?: UIMessage[]; // optionally preseed UI with external messages
}

/** Normalize DB ChatMessage → UIMessage the item component expects */
function toUIMessage(db: ChatMessage): UIMessage {
  // Map message_source to role
  const getRole = (source?: string) => {
    switch (source) {
      case "admin":
        return "Admin";
      case "moderator":
        return "Mod";
      case "creator":
        return "Creator";
      case "system":
        return "System";
      default:
        return undefined;
    }
  };

  return {
    id: db.id,
    content: db.message,
    user: {
      id: db.author_user_id ?? "SYSTEM",
      name: db.author_username ?? "SYSTEM",
      role: getRole(db.message_source),
      avatar: db.author_avatar_url || undefined,
      color: db.author_color || undefined,
    },
    createdAt: db.created_at,
  };
}

export const RealtimeChat = ({
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll();
  const { user } = useRealtime();
  const {
    messages: dbMessages, // ChatMessage[] from the new hook (camelCase)
    sendMessage, // (content: string) => Promise<void>
    isConnected,
    isLoading,
    hasMore,
    loadMore,
    // deleteMessage, // available if you want to surface moderation
    // postSystemMessage,   // available for mods/admins
  } = useRealtimeChat({ pageSize: 5 });

  const [newMessage, setNewMessage] = useState("");

  // Map DB messages to UIMessage so <ChatMessageItem /> keeps working
  const realtimeUIMessages = useMemo<UIMessage[]>(
    () => dbMessages.map((m) => toUIMessage(m)),
    [dbMessages]
  );

  // Merge provided initial messages (already UIMessage shape) with realtime
  const allMessages = useMemo<UIMessage[]>(() => {
    const merged = [...initialMessages, ...realtimeUIMessages];
    const unique = merged.filter(
      (msg, i, arr) => i === arr.findIndex((m) => m.id === msg.id)
    );
    return unique.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [initialMessages, realtimeUIMessages]);

  useEffect(() => {
    onMessage?.(allMessages);
  }, [allMessages, onMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages, scrollToBottom]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = newMessage.trim();
      if (!text || !isConnected) return;
      await sendMessage(text); // realtime INSERT will update the list
      setNewMessage("");
    },
    [newMessage, isConnected, sendMessage]
  );

  return (
    <div className="flex flex-col max-h-full bg-card-background rounded-[24px] text-foreground">
      {/* Header / Older loader (optional) */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="text-sm text-muted-foreground">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-red-500">Live</span>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          ) : (
            "Холбогдож байна…"
          )}
        </div>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? "Уншиж байна…" : "Өмнөх чат мэссэжүүдийг унших"}
          </Button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4"
      >
        {allMessages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            Чат хоосон байна. Та эхлүүлэх үү?
          </div>
        ) : null}
        <div className="space-y-1">
          {allMessages.map((message, index) => {
            const prevMessage = index > 0 ? allMessages[index - 1] : null;
            const showHeader =
              !prevMessage || prevMessage.user.name !== message.user.name;

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ChatMessageItem
                  isOwnMessage={message.user.id === user?.id}
                  message={message}
                  showHeader={showHeader}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSendMessage}
        className="flex w-full gap-2 border-t border-border p-4"
      >
        <Input
          className={cn(
            "rounded-full bg-background text-sm transition-all duration-300",
            isConnected && newMessage.trim() ? "w-[calc(100%-36px)]" : "w-full"
          )}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        {isConnected && newMessage.trim() && (
          <Button
            className="aspect-square rounded-full animate-in fade-in slide-in-from-right-4 duration-300"
            type="submit"
            disabled={!isConnected}
          >
            <Send className="size-4" />
          </Button>
        )}
      </form>
    </div>
  );
};
