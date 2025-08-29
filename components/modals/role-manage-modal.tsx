"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserManage } from "@/hooks/use-user-manage";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AppRole = "admin" | "moderator" | "creator";

interface ManageUser {
  id: string;
  username: string;
  avatar_url: string | null;
  roles: AppRole[];
}

interface RoleManageModalProps {
  user: ManageUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

const AVAILABLE_ROLES: { value: AppRole; label: string }[] = [
  { value: "moderator", label: "Moderator" },
  { value: "creator", label: "Creator" },
  { value: "admin", label: "Admin" },
];

export default function RoleManageModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: RoleManageModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addRole, removeRole } = useUserManage();

  if (!user) return null;

  const handleAddRole = async (role: AppRole) => {
    if (user.roles.includes(role)) return;

    setIsLoading(true);
    try {
      await addRole(user.id, role);
      onUpdate?.();
    } catch (error) {
      toast.error("Алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (role: AppRole) => {
    if (!user.roles.includes(role)) return;

    setIsLoading(true);
    try {
      await removeRole(user.id, role);
      onUpdate?.();
    } catch (error) {
      toast.error("Алдаа гарлаа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md  border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Role удирдлага</DialogTitle>
          <DialogDescription className="text-gray-300">
            Хэрэглэгчийн role-г удирдах
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          {/* User Info */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="size-16">
              <AvatarImage src={user.avatar_url ?? ""} />
              <AvatarFallback className="bg-gray-600 text-white">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold text-white">
              {user.username}
            </h3>
          </div>

          {/* Current Roles */}
          <div className="w-full">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Одоогийн role-ууд:
            </h4>
            <div className="flex flex-wrap gap-2">
              {user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <Badge
                    key={role}
                    variant="secondary"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-400 text-sm">Role байхгүй</span>
              )}
            </div>
          </div>

          {/* Role Management */}
          <div className="w-full">
            <h4 className="text-sm font-medium text-gray-300 mb-2">
              Role удирдлага:
            </h4>
            <div className="space-y-2">
              {AVAILABLE_ROLES.map((role) => {
                const hasRole = user.roles.includes(role.value);
                return (
                  <div
                    key={role.value}
                    className="flex items-center justify-between px-4 py-1 rounded-xl bg-accent"
                  >
                    <span className="text-sm text-white">{role.label}</span>
                    <div className="flex gap-2">
                      {!hasRole ? (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAddRole(role.value)}
                          disabled={isLoading}
                        >
                          <Plus className="w-4 h-4" />
                          Нэмэх
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveRole(role.value)}
                          disabled={isLoading}
                        >
                          <Minus className="w-4 h-4" />
                          Хасах
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-white border-gray-600"
          >
            Хаах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
