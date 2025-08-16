"use client";

import { cn } from "@/lib/utils";
import { ChatMessageItem } from "@/components/chat-message";
import { useChatScroll } from "@/hooks/use-chat-scroll";
import { useRealtimeChat } from "@/hooks/use-realtime-chat"; // ⬅️ new hook API (no roomName/username args)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Legacy UI message shape expected by <ChatMessageItem />
 * (content + user.name + createdAt)
 */
export type UIMessage = {
  id: string;
  content: string | null;
  user: { name: string };
  createdAt: string;
};

interface RealtimeChatProps {
  // roomName removed (schema is global messages). If you plan to add rooms later, reintroduce it.
  username: string; // for "own message" highlighting only
  onMessage?: (messages: UIMessage[]) => void;
  messages?: UIMessage[]; // optionally preseed UI with external messages
}

/** Normalize DB ChatMessage → UIMessage the item component expects */
function toUIMessage(db: {
  id: string;
  message: string | null;
  authorUsername: string | null;
  createdAt: string;
}): UIMessage {
  return {
    id: db.id,
    content: db.message,
    user: { name: db.authorUsername ?? "SYSTEM" },
    createdAt: db.createdAt,
  };
}

export const RealtimeChat = ({
  username,
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const { containerRef, scrollToBottom } = useChatScroll();

  // new hook — persistent + realtime
  const {
    messages: dbMessages, // ChatMessage[] from the new hook (camelCase)
    sendMessage, // (content: string) => Promise<void>
    isConnected,
    isLoading,
    hasMore,
    loadMore,
    // deleteMessage,       // available if you want to surface moderation
    // postSystemMessage,   // available for mods/admins
  } = useRealtimeChat({ pageSize: 50 });

  const [newMessage, setNewMessage] = useState("");

  // Map DB messages to UIMessage so <ChatMessageItem /> keeps working
  const realtimeUIMessages = useMemo<UIMessage[]>(
    () =>
      dbMessages.map((m) =>
        toUIMessage({
          id: m.id,
          message: m.message,
          authorUsername: m.authorUsername,
          createdAt: m.createdAt,
        })
      ),
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
    <div className="flex flex-col h-full w-full bg-background text-foreground antialiased">
      {/* Header / Older loader (optional) */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="text-sm text-muted-foreground">
          {isConnected ? "Live" : "Connecting…"}
        </div>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? "Loading…" : "Load older"}
          </Button>
        )}
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet. Start the conversation!
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
                  message={message}
                  isOwnMessage={message.user.name === username}
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
