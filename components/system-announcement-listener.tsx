import { useRealtime, WebsiteEvent } from "@/app/(dashboard)/realtime-provider";
import { useEffect } from "react";
import { toast } from "sonner";

export function SystemAnnouncementListener() {
  const { subscribe, unsubscribe } = useRealtime();

  useEffect(() => {
    const handleSystemAnnouncement = (
      payload: Extract<WebsiteEvent, { event: "SYSTEM_ANNOUNCEMENT" }>
    ) => {
      console.log("System announcement:", payload);
      toast.warning(payload.payload.reason);
    };

    const unsubscribeSystemAnnouncement = subscribe(
      "SYSTEM_ANNOUNCEMENT",
      handleSystemAnnouncement
    );

    return () => {
      unsubscribeSystemAnnouncement();
    };
  }, [subscribe, unsubscribe]);

  return null;
}
