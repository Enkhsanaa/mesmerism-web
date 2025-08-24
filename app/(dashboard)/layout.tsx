"use client";

import HeaderClient from "@/components/header-client";
import { Toaster } from "sonner";
import { RealtimeProvider } from "./realtime-provider";
import { SystemAnnouncementListener } from "@/components/system-announcement-listener";
import { UserSuspensionListener } from "@/components/user-suspension-listener";
import { ModalProvider } from "./modal-provider";
import VoteModal from "@/components/modals/vote.modal";
import CoinSelectModal from "@/components/modals/coin-select-modal";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RealtimeProvider>
      <ModalProvider>
        <SystemAnnouncementListener />
        <UserSuspensionListener />

        <div className="mx-auto max-w-7xl">
          <HeaderClient />
          {children}
          <Toaster position="bottom-right" richColors />
        </div>
        <VoteModal />
        <CoinSelectModal />
      </ModalProvider>
    </RealtimeProvider>
  );
}
