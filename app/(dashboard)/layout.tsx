"use client";

import HeaderClient from "@/components/header-client";
import { RealtimeProvider } from "./realtime-provider";
import {
  PaymentListener,
  VoteListener,
  UserActivityListener,
  SystemAnnouncementListener,
} from "./realtime-examples";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RealtimeProvider>
      {/* Global realtime listeners - these don't render anything but listen to events */}
      <PaymentListener />
      <VoteListener />
      <UserActivityListener />
      <SystemAnnouncementListener />

      <div className="mx-auto max-w-7xl">
        <HeaderClient />
        {children}
      </div>
    </RealtimeProvider>
  );
}
