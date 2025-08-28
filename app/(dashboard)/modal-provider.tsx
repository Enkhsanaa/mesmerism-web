"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Creator = DbUser & { received_votes: number; quote: string };

interface ModalContextType {
  voteModalOpen: boolean;
  setVoteModalOpen: (open: boolean) => void;
  coinModalOpen: boolean;
  setCoinModalOpen: (open: boolean) => void;
  waitPaymentModalOpen: boolean;
  setWaitPaymentModalOpen: (open: boolean) => void;
  voteSuccessModalOpen: boolean;
  setVoteSuccessModalOpen: (open: boolean) => void;
  selectedCreator: Creator | null;
  setSelectedCreator: (creator: Creator | null) => void;
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
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  // Enhanced setter functions with logging
  const handleSetVoteModalOpen = (open: boolean) => {
    console.log(`Setting vote modal to: ${open}`);
    setVoteModalOpen(open);
  };

  const handleSetSelectedCreator = (creator: Creator | null) => {
    console.log("Setting selected creator:", creator);
    setSelectedCreator(creator);
  };

  const contextValue: ModalContextType = useMemo(
    () => ({
      voteModalOpen,
      setVoteModalOpen: handleSetVoteModalOpen,
      coinModalOpen,
      setCoinModalOpen,
      waitPaymentModalOpen,
      setWaitPaymentModalOpen,
      voteSuccessModalOpen,
      setVoteSuccessModalOpen,
      selectedCreator,
      setSelectedCreator: handleSetSelectedCreator,
    }),
    [
      voteModalOpen,
      coinModalOpen,
      waitPaymentModalOpen,
      voteSuccessModalOpen,
      selectedCreator,
    ]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
}
