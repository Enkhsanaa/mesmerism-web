"use client";

import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { ChatMessageItem } from "@/components/chat-message";
import { EmojiPicker } from "@/components/emoji-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { ChatMessage, useRealtimeChat } from "@/hooks/use-realtime-chat";
import { useUserManage } from "@/hooks/use-user-manage";
import {
  ArrowDown,
  Ban,
  Clock,
  Hammer,
  Send,
  Smile,
  Trash2,
} from "lucide-react";
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
import { useUserStore } from "@/hooks/use-user-store";

interface RealtimeChatProps {
  onMessage?: (messages: ChatMessage[]) => void;
  messages?: ChatMessage[];
}

export const RealtimeChat = ({
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const { userOverview } = useUserStore();
  const isAdmin = userOverview?.roles.includes("admin");
  const isModerator = userOverview?.roles.includes("moderator");
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e);
      }
    },
    [handleSendMessage]
  );

  const handleEmojiSelect = useCallback((emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  }, []);

  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker((prev) => !prev);
  }, []);

  const closeEmojiPicker = useCallback(() => {
    setShowEmojiPicker(false);
  }, []);

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

            if (message.author_user_id !== userOverview?.id) {
              return (
                <div
                  key={message.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-300"
                >
                  <ChatMessageItem
                    isOwnMessage={message.author_user_id === userOverview?.id}
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
                      isOwnMessage={message.author_user_id === userOverview?.id}
                      message={message}
                      showHeader={showHeader}
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    {(isAdmin || isModerator) && (
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
      <div className="relative">
        <form
          onSubmit={handleSendMessage}
          className="flex w-full border-t border-border p-4"
        >
          <div
            className="flex items-center w-full px-4 py-3 gap-3 border-none bg-card-background"
            style={{ backgroundColor: "#34373C", borderRadius: "16px" }}
          >
            {/* Emoji button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleEmojiPicker}
            >
              <Smile className="size-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>

            {/* Input field */}
            <Input
              className="flex-1 border-none text-sm focus:ring-0 focus:ring-offset-0 active:ring-0 active:ring-offset-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ backgroundColor: "#34373C", borderRadius: "16px" }}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Chat here..."
              disabled={!isConnected}
            />

            {/* Send button - always visible */}
            <Button
              className="aspect-square rounded-full p-2 transition-colors duration-200"
              type="submit"
              disabled={!isConnected || !newMessage.trim()}
              variant="ghost"
              size="sm"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </form>

        {/* Emoji Picker */}
        <EmojiPicker
          isOpen={showEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
          onClose={closeEmojiPicker}
        />
      </div>
    </div>
  );
};
