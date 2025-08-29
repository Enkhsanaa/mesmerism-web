"use client";

import HeaderClient from "@/components/header-client";
import CoinSelectModal from "@/components/modals/coin-select-modal";
import VoteModal from "@/components/modals/vote.modal";
import { SystemAnnouncementListener } from "@/components/system-announcement-listener";
import { UserSuspensionListener } from "@/components/user-suspension-listener";
import { Toaster } from "sonner";
import { ModalProvider } from "./modal-provider";
import { RealtimeProvider } from "./realtime-provider";
import VoteSuccessModal from "@/components/modals/vote-success-modal";

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

        <div className="mx-auto max-w-7xl flex flex-col gap-5 px-2">
          <HeaderClient />
          {children}
          <Toaster position="bottom-right" richColors />
        </div>
        <VoteModal />
        <CoinSelectModal />
        <VoteSuccessModal />
      </ModalProvider>
    </RealtimeProvider>
  );
}
