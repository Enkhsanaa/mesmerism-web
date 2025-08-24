import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { toast } from "sonner";

export const useUserManage = () => {
  const { supabase, user } = useRealtime();

  const banUser = async (userId: string | null) => {
    if (!userId) return;
    const { error } = await supabase.from("user_suspensions").insert({
      target_user_id: userId,
      created_by: user?.id,
      reason: "Та чатнаас бандуулсан.",
      expires_at: null,
    });
    if (error) {
      console.error(error);
    }
    toast.success("Хэрэглэгчийг чатнаас бандлаа");
  };

  const timeoutUser = async (
    userId: string | null,
    timeout: number,
    timeoutLabel: string
  ) => {
    if (!userId) return;
    const { error } = await supabase.from("user_suspensions").insert({
      target_user_id: userId,
      created_by: user?.id,
      reason: `Та чатнаас ${timeoutLabel} бандуулсан.`,
      expires_at: new Date(Date.now() + timeout * 1000),
    });
    if (error) {
      console.error(error);
    }
    toast.success(`Хэрэглэгчийг ${timeoutLabel} турш чатнаас бандлаа`);
  };

  const unbanUser = async (userId: string | null) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_suspensions")
      .delete()
      .eq("target_user_id", userId);
    if (error) {
      console.error(error);
    }
    toast.success("Хэрэглэгчийн бан-г гаргалаа");
  };

  const addRole = async (userId: string | null, role: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_roles")
      .insert({
        user_id: userId,
        role: role,
      })
      .eq("user_id", userId);
    if (error) {
      console.error(error);
    }
    toast.success(`Хэрэглэгчийг ${role} болголоо`);
  };

  const removeRole = async (userId: string | null, role: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);
    if (error) {
      console.error(error);
    }
    toast.success(`Хэрэглэгчийн ${role}-г хаслаа`);
  };

  return {
    banUser,
    timeoutUser,
    unbanUser,
    addRole,
    removeRole,
  };
};
