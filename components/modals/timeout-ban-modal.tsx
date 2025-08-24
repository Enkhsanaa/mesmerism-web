"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserManage } from "@/hooks/use-user-manage";
import { toast } from "sonner";

interface ManageUser {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface TimeoutBanModalProps {
  user: ManageUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const TIMEOUT_PRESETS = [
  { label: "5 минут", seconds: 5 * 60 },
  { label: "30 минут", seconds: 30 * 60 },
  { label: "1 цаг", seconds: 60 * 60 },
  { label: "6 цаг", seconds: 6 * 60 * 60 },
  { label: "12 цаг", seconds: 12 * 60 * 60 },
  { label: "1 өдөр", seconds: 24 * 60 * 60 },
  { label: "3 өдөр", seconds: 3 * 24 * 60 * 60 },
  { label: "7 өдөр", seconds: 7 * 24 * 60 * 60 },
];

export default function TimeoutBanModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: TimeoutBanModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customReason, setCustomReason] = useState("");
  const [selectedTimeout, setSelectedTimeout] = useState<number | null>(null);
  const { timeoutUser, banUser } = useUserManage();

  if (!user) return null;

  const handleTimeoutUser = async (
    timeoutSeconds: number,
    timeoutLabel: string
  ) => {
    setIsLoading(true);
    try {
      await timeoutUser(user.id, timeoutSeconds, timeoutLabel);
      onUpdate?.();
      onClose();
      setCustomReason("");
      setSelectedTimeout(null);
    } catch (error) {
      toast.error("Алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermanentBan = async () => {
    setIsLoading(true);
    try {
      await banUser(user.id);
      onUpdate?.();
      onClose();
      setCustomReason("");
      setSelectedTimeout(null);
    } catch (error) {
      toast.error("Алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCustomReason("");
    setSelectedTimeout(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card-background border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Хэрэглэгчийг бандах</DialogTitle>
          <DialogDescription className="text-gray-300">
            Хэрэглэгчийг түр хугацаагаар эсвэл бүрмөсөн бандах
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="size-12">
              <AvatarImage src={user.avatar_url ?? ""} />
              <AvatarFallback className="bg-gray-600 text-white">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {user.username}
              </h3>
              <p className="text-sm text-gray-400">Хэрэглэгчийг бандах</p>
            </div>
          </div>

          {/* Custom Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-gray-300">
              Шалтгаан (сонголт)
            </Label>
            <Input
              id="reason"
              placeholder="Бан-ны шалтгааныг бичнэ үү..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>

          {/* Timeout Presets */}
          <div className="space-y-2">
            <Label className="text-gray-300">Түр хугацааны бан:</Label>
            <div className="grid grid-cols-2 gap-2">
              {TIMEOUT_PRESETS.map((preset) => (
                <Button
                  key={preset.seconds}
                  variant={
                    selectedTimeout === preset.seconds ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    setSelectedTimeout(preset.seconds);
                    handleTimeoutUser(preset.seconds, preset.label);
                  }}
                  disabled={isLoading}
                  className={`text-xs ${
                    selectedTimeout === preset.seconds
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Permanent Ban */}
          <div className="pt-2 border-t border-gray-700">
            <Button
              variant="destructive"
              onClick={handlePermanentBan}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Бүрмөсөн бандах
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-white border-gray-600"
            disabled={isLoading}
          >
            Цуцлах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
