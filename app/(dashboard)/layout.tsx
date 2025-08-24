"use client";

import HeaderClient from "@/components/header-client";
import { Toaster } from "sonner";
import { RealtimeProvider } from "./realtime-provider";
import { SystemAnnouncementListener } from "@/components/system-announcement-listener";
import { UserSuspensionListener } from "@/components/user-suspension-listener";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RealtimeProvider>
      {/* Global realtime listeners - these don't render anything but listen to events */}
      <SystemAnnouncementListener />
      <UserSuspensionListener />

      <div className="mx-auto max-w-7xl">
        <HeaderClient />
        {children}
        <Toaster position="bottom-right" richColors />
      </div>
    </RealtimeProvider>
  );
}
