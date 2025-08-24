"use client";

import { createContext, useContext, useMemo, useState } from "react";

interface ModalContextType {
  voteModalOpen: boolean;
  setVoteModalOpen: (open: boolean) => void;
  coinModalOpen: boolean;
  setCoinModalOpen: (open: boolean) => void;
  waitPaymentModalOpen: boolean;
  setWaitPaymentModalOpen: (open: boolean) => void;
  voteSuccessModalOpen: boolean;
  setVoteSuccessModalOpen: (open: boolean) => void;
  selectedCreator: DbUser | null;
  setSelectedCreator: (creator: DbUser | null) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const [waitPaymentModalOpen, setWaitPaymentModalOpen] = useState(false);
  const [voteSuccessModalOpen, setVoteSuccessModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<DbUser | null>(null);

  const contextValue: ModalContextType = useMemo(
    () => ({
      voteModalOpen,
      setVoteModalOpen,
      coinModalOpen,
      setCoinModalOpen,
      waitPaymentModalOpen,
      setWaitPaymentModalOpen,
      voteSuccessModalOpen,
      setVoteSuccessModalOpen,
      selectedCreator,
      setSelectedCreator,
    }),
    [
      voteModalOpen,
      setVoteModalOpen,
      coinModalOpen,
      setCoinModalOpen,
      waitPaymentModalOpen,
      setWaitPaymentModalOpen,
      voteSuccessModalOpen,
      setVoteSuccessModalOpen,
      selectedCreator,
      setSelectedCreator,
    ]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
}
