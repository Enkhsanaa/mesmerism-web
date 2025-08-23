import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Crown, Shield, Bot } from "lucide-react";
import type { ChatMessage } from "@/hooks/use-realtime-chat";

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  showHeader: boolean;
}

export const ChatMessageItem = ({
  message,
  isOwnMessage,
  showHeader,
}: ChatMessageItemProps) => {
  const getRoleInfo = (role?: string) => {
    switch (role) {
      case "Admin":
        return {
          icon: Star,
          color: "text-yellow-400",
          bgColor: "bg-yellow-400/10",
        };
      case "Creator":
        return {
          icon: Crown,
          color: "text-purple-400",
          bgColor: "bg-purple-400/10",
        };
      case "Mod":
        return {
          icon: Shield,
          color: "text-blue-400",
          bgColor: "bg-blue-400/10",
        };
      case "System":
        return { icon: Bot, color: "text-gray-400", bgColor: "bg-gray-400/10" };
      case "Prime":
        return {
          icon: Crown,
          color: "text-teal-400",
          bgColor: "bg-teal-400/10",
        };
      default:
        return { icon: undefined, color: "", bgColor: "" };
    }
  };

  const roleInfo = getRoleInfo(message.message_source);
  const RoleIcon = roleInfo.icon;

  // Generate avatar fallback from username
  const getAvatarFallback = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  // Get username color based on role or generate from name
  const getUsernameColor = (name: string, role?: string) => {
    // Use role-based colors if no custom color
    if (role === "Admin") return "text-yellow-400";
    if (role === "Creator") return "text-purple-400";
    if (role === "Mod") return "text-blue-400";
    if (role === "System") return "text-gray-400";
    if (role === "Prime") return "text-teal-400";

    // Generate consistent color from username
    const colors = [
      "text-blue-400",
      "text-green-400",
      "text-purple-400",
      "text-pink-400",
      "text-indigo-400",
      "text-teal-400",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={cn(
        "flex items-start hover:bg-muted/30 transition-colors group",
        showHeader ? "gap-3 px-4 py-2" : "px-4 py-1"
      )}
    >
      {/* Avatar - only show when header is visible */}
      {showHeader ? (
        <Avatar className="w-10 h-10 flex-shrink-0 mt-1">
          <AvatarImage
            src={message.author_avatar_url || ""}
            alt={message.author_username || ""}
          />
          <AvatarFallback className="bg-muted text-muted-foreground font-medium">
            {getAvatarFallback(message.author_username || "")}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-13 h-1 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div className={cn("min-w-0", showHeader ? "flex-1" : "w-full")}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-1.5">
            {/* Username */}
            <span
              className={cn(
                "font-semibold text-sm hover:underline cursor-pointer",
                message.author_color
                  ? undefined
                  : getUsernameColor(
                      message.author_username || "",
                      message.message_source
                    )
              )}
              style={
                message.author_color
                  ? { color: message.author_color }
                  : undefined
              }
            >
              {message.author_username}
            </span>

            {/* Role Badge */}
            {message.message_source && RoleIcon && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-2 py-0.5 border-0 font-medium",
                  roleInfo.bgColor,
                  roleInfo.color
                )}
              >
                <RoleIcon className="w-3 h-3" />
                {message.message_source}
              </Badge>
            )}

            {/* Timestamp */}
            <span className="text-muted-foreground text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date(message.created_at).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        )}

        {/* Message Text */}
        <div
          className={cn(
            "text-sm text-foreground leading-relaxed break-words",
            !showHeader && "pl-0"
          )}
        >
          {message.message}
        </div>
      </div>
    </div>
  );
};
