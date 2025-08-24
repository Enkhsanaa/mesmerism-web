"use client";

import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { ChatMessageItem } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { ChatMessage, useRealtimeChat } from "@/hooks/use-realtime-chat";
import { useUserManage } from "@/hooks/use-user-manage";
import { cn } from "@/lib/utils";
import { ArrowDown, Ban, Clock, Hammer, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./ui/context-menu";

interface RealtimeChatProps {
  onMessage?: (messages: ChatMessage[]) => void;
  messages?: ChatMessage[];
}

export const RealtimeChat = ({
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const { user, userRole } = useRealtime();
  const { banUser, timeoutUser, unbanUser } = useUserManage();
  const {
    messages: dbMessages,
    sendMessage,
    isConnected,
    isLoading,
    hasMore,
    loadMore,
    deleteMessage,
  } = useRealtimeChat({ pageSize: 50 });

  const [newMessage, setNewMessage] = useState("");

  // Merge provided initial messages with realtime messages
  const allMessages = useMemo<ChatMessage[]>(() => {
    const merged = [...initialMessages, ...dbMessages];
    const unique = merged.filter(
      (msg, i, arr) => i === arr.findIndex((m) => m.id === msg.id)
    );
    return unique.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [initialMessages, dbMessages]);

  useEffect(() => {
    onMessage?.(allMessages);
  }, [allMessages, onMessage]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const text = newMessage.trim();
      if (!text || !isConnected) return;
      await sendMessage(text);
      setNewMessage("");
    },
    [newMessage, isConnected, sendMessage]
  );

  // Use the dedicated auto-scroll hook
  const {
    containerRef,
    isAutoScrollEnabled,
    showScrollToBottom,
    isNearTop,
    enableAutoScroll,
  } = useAutoScroll([allMessages], {
    bottomThreshold: 30,
    topThreshold: 50,
    scrollDebounce: 150,
    initialLoadTime: 1000,
    scrollDelay: 100,
    bulkScrollDelay: 200,
  });

  return (
    <div className="flex flex-col max-h-full bg-card-background rounded-[24px] text-foreground">
      {/* Header / Load more button */}
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
        {hasMore && isNearTop && (
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
        className="flex-1 min-h-0 space-y-4 overflow-y-auto p-4 relative scrollbar-custom"
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
              !prevMessage ||
              prevMessage.author_user_id !== message.author_user_id;

            if (!userRole && message.author_user_id !== user?.id) {
              return (
                <div
                  key={message.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <ChatMessageItem
                    isOwnMessage={message.author_user_id === user?.id}
                    message={message}
                    showHeader={showHeader}
                  />
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <ContextMenu>
                  <ContextMenuTrigger>
                    <ChatMessageItem
                      isOwnMessage={message.author_user_id === user?.id}
                      message={message}
                      showHeader={showHeader}
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    {userRole === "admin" && (
                      <>
                        <ContextMenuItem
                          onClick={() => unbanUser(message.author_user_id)}
                        >
                          <Hammer className="size-4 mr-2" />
                          Чатны бан гаргах
                        </ContextMenuItem>
                        <ContextMenuSub>
                          <ContextMenuSubTrigger>
                            <Clock className="size-4 mr-2" />
                            Чатнаас түр бандах
                          </ContextMenuSubTrigger>
                          <ContextMenuSubContent>
                            <ContextMenuItem
                              onClick={() =>
                                timeoutUser(
                                  message.author_user_id,
                                  30,
                                  "30 секунд"
                                )
                              }
                            >
                              30 сек
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={() =>
                                timeoutUser(
                                  message.author_user_id,
                                  300,
                                  "5 минут"
                                )
                              }
                            >
                              5 мин
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={() =>
                                timeoutUser(
                                  message.author_user_id,
                                  900,
                                  "15 минут"
                                )
                              }
                            >
                              15 мин
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={() =>
                                timeoutUser(
                                  message.author_user_id,
                                  3600,
                                  "1 цаг"
                                )
                              }
                            >
                              1 цаг
                            </ContextMenuItem>
                          </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          className="text-destructive"
                          onClick={() => banUser(message.author_user_id)}
                        >
                          <Ban className="size-4 mr-2" />
                          Чатнаас бандах
                        </ContextMenuItem>
                      </>
                    )}
                    <ContextMenuItem
                      onClick={() => deleteMessage(message.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Устгах
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>
            );
          })}
        </div>

        {/* Auto-scroll toggle button */}
        {showScrollToBottom && !isAutoScrollEnabled && (
          <div className="sticky bottom-4 left-0 right-0 flex justify-center">
            <Button
              onClick={enableAutoScroll}
              size="sm"
              className="rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              <ArrowDown className="size-4 mr-2" />
              Доош гүйлгэх
            </Button>
          </div>
        )}
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
