"use client";
import { useModal } from "@/app/(dashboard)/modal-provider";
import { useRealtime } from "@/app/(dashboard)/realtime-provider";
import { useUserStore } from "@/hooks/use-user-store";
import { cn, formatAmount } from "@/lib/utils";
import { CheckIcon, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CoinIcon from "../icons/coin";
import Loader from "../icons/loader";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

const UNIT_COIN = 500;
const COIN_OPTIONS = [10, 20, 50, 100];

type PaymentEventPayload = {
  user_id: string;
  amount: number;
  status: "confirmed" | "failed";
  provider_ref: string;
  new_balance: number;
};

const CoinOption = ({
  coins,
  selected,
  onSelect,
}: {
  coins: number;
  selected: number;
  onSelect: (amount: number) => void;
}) => {
  return (
    <div className="border-b border-[#333333]">
      <Button
        variant="ghost"
        className="w-full !py-10"
        onClick={() => onSelect?.(coins)}
      >
        <label
          htmlFor={`coin-select-${coins}`}
          className="flex w-full gap-2 items-center"
        >
          <div className="bg-[#34373C] p-1 rounded-full">
            <CoinIcon className="size-6 text-[#FAD02C]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-base font-semibold text-white">
              {formatAmount(coins * UNIT_COIN)}
            </p>
            <p className="text-sm text-[#DCDDDE]">
              {formatAmount(coins)} coins
            </p>
          </div>
        </label>
        {/* Check indicator */}
        <div
          id={`coin-select-${coins}`}
          className={cn(
            "peer border-input size-6 shrink-0 rounded-full border shadow-xs transition-shadow outline-none flex items-center justify-center",
            selected === coins && "bg-[#FAD02C] text-[#212121] border-[#FAD02C]"
          )}
        >
          {selected === coins && <CheckIcon className="size-3.5" />}
        </div>
      </Button>
    </div>
  );
};

export default function CoinSelectModal() {
  const { supabase, subscribe } = useRealtime();
  const { userOverview, setUserBalance } = useUserStore();
  const { coinModalOpen, setCoinModalOpen } = useModal();
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(0);
  const [paymentError, setPaymentError] = useState(false);
  const subscriptionRef = useRef<ReturnType<typeof subscribe> | null>(null);

  const [selectedCoins, setSelectedCoins] = useState(0);

  // Unsubscribe from payment events when modal closes
  useEffect(() => {
    return () => {
      console.log("Unsubscribing from payment events");
      if (subscriptionRef.current) {
        console.log(
          "Unsubscribing from payment events",
          subscriptionRef.current
        );
        subscriptionRef.current();
      } else {
        console.log("No subscription to unsubscribe from");
      }
    };
  }, []);

  const handlePaymentEvent = (
    payload: PaymentEventPayload,
    providerRef: string
  ) => {
    console.log(
      "handlePaymentEvent: PAYMENT_EVENT caught in the modal",
      payload,
      providerRef,
      userOverview
    );
    if (!userOverview) return;
    if (
      payload.user_id === userOverview.id &&
      payload.provider_ref === providerRef
    ) {
      if (payload.status === "confirmed") {
        setIsWaitingPayment(false);
        setPaymentSuccess(true);
        setPaymentError(false);
        setConfirmedAmount(payload.amount);
        setUserBalance(payload.new_balance);
      } else if (payload.status === "failed") {
        setIsWaitingPayment(false);
        setPaymentSuccess(false);
        setPaymentError(true);
        setConfirmedAmount(0);
        setUserBalance(payload.new_balance);
      }
    }
  };

  const handleOpenCloseModal = (open: boolean) => {
    setCoinModalOpen(open);
    if (!open) {
      setSelectedCoins(0);
      setConfirmedAmount(0);
      setPaymentError(false);
      setPaymentSuccess(false);
    }
    if (subscriptionRef.current) {
      subscriptionRef.current();
    }
  };

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!coinModalOpen) {
      setIsWaitingPayment(false);
      setPaymentSuccess(false);
      setConfirmedAmount(0);
      setSelectedCoins(0);
      setPaymentError(false);
    }
  }, [coinModalOpen]);

  if (!coinModalOpen) return null;

  const handleCheckout = async (value: number) => {
    console.log(`Checkout ${value}`);
    setIsWaitingPayment(true);
    const providerRef = crypto.randomUUID();

    const { data, error } = await supabase
      .from("coin_topups")
      .insert({
        user_id: userOverview?.id,
        amount: value,
        status: "pending",
        provider: "qpay",
        provider_ref: providerRef,
      })
      .select();

    if (error) {
      console.error("coin_topups insert error", error);
    }

    if (data && data.length > 0 && data[0].provider_ref) {
      console.log("coin_topups insert data", data[0]);
      console.log("paymentRef set", data[0].provider_ref);
      subscriptionRef.current = subscribe("PAYMENT_EVENT", (payload) => {
        console.log("PAYMENT_EVENT caught in the modal", payload);
        handlePaymentEvent(payload, data[0].provider_ref);
      });
    }
  };

  return (
    <Dialog open={coinModalOpen} onOpenChange={handleOpenCloseModal}>
      <DialogTitle className="sr-only">Coin авах</DialogTitle>
      <DialogContent className="p-0 max-w-md">
        <Card className="border-none text-white flex flex-col justify-between gap-10">
          <CardHeader className="flex flex-col items-center justify-between">
            <div className="w-full flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-semiboldtext-white">
                Coin авах
              </CardTitle>
            </div>
            {!paymentSuccess && (
              <p className="text-base font-normaltext-white">
                Та Coin худалдаж авах хэмжээгээ оруулж үргэлжлүүлнэ үү.
              </p>
            )}
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            {/* Coin selection */}
            {paymentSuccess ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="size-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckIcon className="size-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-white mb-2">
                    Төлбөр баталгаажлаа!
                  </p>
                  <p className="text-base text-white flex items-center justify-center gap-2">
                    {formatAmount(confirmedAmount)}{" "}
                    <CoinIcon className="size-5 text-[#FAD02C]" /> таны данс руу
                    нэмэгдлээ.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Та өөрийн дэмжиж буй Youtuber дээ саналаа өгөөрэй
                  </p>
                </div>
              </div>
            ) : paymentError ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="size-16 bg-red-500 rounded-full flex items-center justify-center">
                  <X className="h-[32px] w-[32px] text-white" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-white mb-2">
                    Төлбөр амжилтгүй боллоо
                  </p>
                  <p className="text-base text-white">Та дахин оролдоно уу.</p>
                </div>
              </div>
            ) : isWaitingPayment ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader color="white" />
                <p className="text-base font-normaltext-white">
                  Төлбөр баталгаажихыг хүлээж байна.
                </p>
              </div>
            ) : (
              <div className="grid w-full">
                {COIN_OPTIONS.map((option) => (
                  <CoinOption
                    key={`coin-select-${option}`}
                    coins={option}
                    selected={selectedCoins}
                    onSelect={() => {
                      const input = document.getElementById(
                        "custom-coin-input"
                      ) as HTMLInputElement;
                      if (input) {
                        input.value = option.toString();
                      }
                      setSelectedCoins(option);
                    }}
                  />
                ))}
                <Collapsible className="flex flex-col gap-2 pt-10">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full">
                      <p className="text-sm text-[#DCDDDE]">
                        or custom amount of coins
                      </p>
                      <ChevronDown className="size-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Input
                      id="custom-coin-input"
                      type="number"
                      min={10}
                      placeholder="Enter amount"
                      className="w-full bg-[#34373C] text-white rounded-[24px]"
                      onChange={(e) => setSelectedCoins(Number(e.target.value))}
                      step={10}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-row items-center justify-between gap-2">
            {paymentSuccess ? (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  setPaymentSuccess(false);
                  setCoinModalOpen(false);
                  setSelectedCoins(0);
                }}
              >
                Хаах
              </Button>
            ) : paymentError ? (
              <Button
                variant="ghost"
                className="w-[89px]"
                onClick={() => handleOpenCloseModal(false)}
                disabled={isWaitingPayment}
              >
                Хаах
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-[89px]"
                  onClick={() => handleOpenCloseModal(false)}
                  disabled={isWaitingPayment}
                >
                  Болих
                </Button>
                <Button
                  disabled={selectedCoins <= 0 || isWaitingPayment}
                  className="bg-[#FAD02C] text-[#212121] rounded-[24px] h-[48px] w-[131px] disabled:bg-[#333333] disabled:text-[#888888] disabled:border-[#34373C] disabled:border-[1px]"
                  onClick={() => handleCheckout(selectedCoins ?? 0)}
                >
                  {isWaitingPayment ? "Хүлээж байна..." : "Төлбөр төлөх"}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
