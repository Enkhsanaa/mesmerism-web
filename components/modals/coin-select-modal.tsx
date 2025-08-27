"use client";
import { useModal } from "@/app/(dashboard)/modal-provider";
import { cn, formatAmount } from "@/lib/utils";
import { CheckIcon, ChevronDown, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { useRealtime } from "@/app/(dashboard)/realtime-provider";

const UNIT_COIN = 500;
const COIN_OPTIONS = [10, 20, 50, 100];

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
  const { supabase, user, subscribe, unsubscribe } = useRealtime();
  const { coinModalOpen, setCoinModalOpen } = useModal();
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(0);

  const [selectedCoins, setSelectedCoins] = useState(0);

  // Listen for payment confirmation events
  useEffect(() => {
    if (!coinModalOpen || !user) return;

    const handlePaymentConfirmed = (payload: any) => {
      // Only handle events for this user
      if (payload.user_id === user.id) {
        setIsWaitingPayment(false);
        setPaymentSuccess(true);
        setConfirmedAmount(payload.amount);

        // Auto-close modal after 3 seconds
        // setTimeout(() => {
        //   setPaymentSuccess(false);
        //   setCoinModalOpen(false);
        //   setSelectedCoins(0);
        // }, 3000);
      }
    };

    const unsubscribePayment = subscribe(
      "PAYMENT_CONFIRMED",
      handlePaymentConfirmed
    );

    return () => {
      unsubscribePayment();
    };
  }, [coinModalOpen, user, subscribe, unsubscribe, setCoinModalOpen]);

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!coinModalOpen) {
      setIsWaitingPayment(false);
      setPaymentSuccess(false);
      setConfirmedAmount(0);
      setSelectedCoins(0);
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
        user_id: user?.id,
        amount: value,
        status: "pending",
        provider: "qpay",
        provider_ref: providerRef,
      })
      .select();

    if (error) {
      console.error("coin_topups insert error", error);
    }

    if (data) {
      console.log("coin_topups insert data", data);
    }
  };

  return (
    <Dialog open={coinModalOpen} onOpenChange={setCoinModalOpen}>
      <DialogTitle className="sr-only">Coin авах</DialogTitle>
      <DialogContent>
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/50">
          <Card className="w-full max-w-md bg-card-background border-none text-white pointer-events-auto flex flex-col justify-between gap-10">
            <CardHeader className="flex flex-col items-center justify-between">
              <div className="w-full flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-semiboldtext-white">
                  Coin авах
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCoinModalOpen(false)}
                  className="h-[48px] w-[48px] p-0text-white hover:bg-[#34373C]"
                >
                  <X className="h-[20px] w-[20px]" />
                </Button>
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
                      <CoinIcon className="size-5 text-[#FAD02C]" /> таны данс
                      руу нэмэгдлээ.
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Та өөрийн дэмжиж буй Youtuber дээ саналаа өгөөрэй
                    </p>
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
                    <CollapsibleTrigger>
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
                        onChange={(e) =>
                          setSelectedCoins(Number(e.target.value))
                        }
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
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-[89px]"
                    onClick={() => setCoinModalOpen(false)}
                    disabled={isWaitingPayment}
                  >
                    Болих
                  </Button>
                  <Button
                    disabled={selectedCoins <= 0 || isWaitingPayment}
                    className="bg-[#FAD02C] text-[#212121] rounded-[24px] h-[48px] w-[131px] disabled:bg-[#333333] disabled:text-[#888888] disabled:border-[#34373C] disabled:border-[1px]"
                    onClick={() => handleCheckout(selectedCoins ?? 0)}
                  >
                    {isWaitingPayment ? "Боловсруулж байна..." : "Төлбөр төлөх"}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
