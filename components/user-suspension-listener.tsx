import { useRealtime, WebsiteEvent } from "@/app/(dashboard)/realtime-provider";
import { useEffect } from "react";
import { toast } from "sonner";

export function UserSuspensionListener() {
  const { user, subscribe, unsubscribe } = useRealtime();

  const handleSuspension = (suspension: {
    suspended: boolean;
    reason: string | null;
    expires_at: string | null;
  }) => {
    if (!suspension.suspended) return;
    if (!suspension.expires_at) {
      // permanent suspension
      toast.error(suspension.reason, {
        dismissible: false,
        duration: Infinity,
        id: "toast-user-suspension",
      });
      return;
    }
    const expiresAt = new Date(suspension.expires_at);
    const now = new Date();
    const duration = expiresAt.getTime() - now.getTime();
    if (duration > 0) {
      toast.error(
        <>
          <div>
            <p>{suspension.reason}</p>
            <p>Дуусах огноо: {expiresAt.toLocaleString()}</p>
          </div>
        </>,
        {
          dismissible: false,
          duration: duration,
          id: "toast-user-suspension",
        }
      );
    }
  };

  useEffect(() => {
    if (user?.suspended) {
      handleSuspension({
        suspended: user.suspended,
        reason: user.suspension_reason,
        expires_at: user.suspension_expires_at,
      });
    }
  }, [user]);

  useEffect(() => {
    const handleSystemAnnouncement = (
      payload: Extract<WebsiteEvent, { event: "USER_SUSPENSION" }>["payload"]
    ) => {
      if (
        payload.data.target_user_id === user?.id &&
        !payload.cleared_suspension
      ) {
        handleSuspension({
          suspended: !!payload.data,
          reason: payload.data.reason,
          expires_at: payload.data.expires_at,
        });
      } else if (
        payload.data.target_user_id === user?.id &&
        payload.cleared_suspension
      ) {
        toast.success("Хэрэглэгчийн бан-г гаргалаа", {
          duration: 3000,
          dismissible: true,
          id: "toast-user-suspension",
        });
      }
    };

    const unsubscribeSystemAnnouncement = subscribe(
      "USER_SUSPENSION",
      handleSystemAnnouncement
    );

    return () => {
      unsubscribeSystemAnnouncement();
    };
  }, [subscribe, unsubscribe]);

  return null;
}
