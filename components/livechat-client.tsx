"use client";

import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { RealtimeChat } from "@/components/realtime-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUserStore } from "@/hooks/use-user-store";
import { MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Responsive Livechat Client Component
 *
 * Features:
 * - Desktop (md+): Shows full chat interface inline
 * - Mobile (<md): Shows floating action button that opens chat in modal
 * - Unread message notifications with badge
 * - Swipe-to-close gesture on mobile
 * - Haptic feedback on mobile devices
 * - Smooth animations and transitions
 * - Touch-friendly mobile interface
 */
export function LivechatClient() {
  const { isConnected } = useRealtime();
  const { userOverview } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  console.log("rerendering live chat client");

  // Reset unread state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setHasUnreadMessages(false);
    }
  }, [isOpen]);

  // Handle swipe to close on mobile
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      if (deltaY > 50) {
        // Swipe down to close
        // Haptic feedback on mobile
        if ("vibrate" in navigator) {
          navigator.vibrate(50);
        }
        setIsOpen(false);
        isDragging = false;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    const dialog = dialogRef.current;
    dialog.addEventListener("touchstart", handleTouchStart);
    dialog.addEventListener("touchmove", handleTouchMove);
    dialog.addEventListener("touchend", handleTouchEnd);

    return () => {
      dialog.removeEventListener("touchstart", handleTouchStart);
      dialog.removeEventListener("touchmove", handleTouchMove);
      dialog.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen]);

  const handleOpenChat = () => {
    // Haptic feedback on mobile
    if ("vibrate" in navigator) {
      navigator.vibrate(25);
    }
    setIsOpen(true);
  };

  const chatComponent = useMemo(
    () => (
      <RealtimeChat
        messages={[
          {
            id: "WELCOME_MESSAGE",
            message: "Тавтай морилно уу",
            author_user_id: "SYSTEM",
            author_username: "SYSTEM",
            message_source: "system",
            author_avatar_url: "https://github.com/shadcn.png",
            author_color: "red",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
            deleted_by: null,
          },
        ]}
        onMessage={() => {
          if (!isOpen) {
            setHasUnreadMessages(true);
          }
        }}
      />
    ),
    []
  );

  // Show loading state while connecting
  if (!userOverview || !isConnected) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Холбогдож байна...</p>
          <p>User: {JSON.stringify(userOverview)}</p>
          <p>Is Connected: {isConnected ? "Yes" : "No"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Show full chat */}
      <div className="hidden md:block w-full h-full max-h-[760px]">
        {chatComponent}
      </div>

      {/* Mobile: Show floating action button */}
      <div className="md:hidden">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:bg-primary/90 text-[#FAD02C] transition-all duration-200 hover:scale-105 active:scale-95 group bg-card-background"
              size="icon"
              aria-label="Open live chat"
              onClick={handleOpenChat}
            >
              <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-12" />
              {hasUnreadMessages && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-[#FAD02C] border-2 border-background animate-pulse"
                  variant="destructive"
                >
                  <span className="sr-only">New messages</span>
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent
            ref={dialogRef}
            className="fixed flex flex-col inset-x-0 bottom-0 top-10 w-full max-w-none sm:max-w-none p-0 border-0 rounded-t-3xl sm:rounded-3xl translate-y-0 translate-x-0 left-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4"
          >
            <DialogTitle className="sr-only">Live Chat</DialogTitle>
            {/* Swipe indicator */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-muted rounded-full opacity-60" />

            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <h2 className="text-lg font-semibold">Live Chat</h2>
            </div>
            <div className="flex-1 min-h-0">{chatComponent}</div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
