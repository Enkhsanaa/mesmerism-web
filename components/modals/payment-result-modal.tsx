"use client";
import { X } from "lucide-react";
import { useState } from "react";
import CoinIcon from "../icons/coin";
import ErrorIcon from "../icons/error";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose?: (reason?: string) => void;
}

export default function PaymentResultModal({
  isOpen,
  onClose,
}: PaymentSuccessModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/50">
      <Card className="w-full max-w-md bg-card-background border-none text-white pointer-events-auto flex flex-col justify-between gap-10">
        <CardHeader className="flex flex-col items-center justify-between">
          <div className="w-full flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-semibold">
              {isSuccess ? "Амжилттай" : "Алдаа гарлаа"}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClose?.("close")}
              className="h-[48px] w-[48px] p-0 hover:bg-[#34373C]"
            >
              <X className="h-[20px] w-[20px]" />
            </Button>
          </div>
          {isSuccess && (
            <p className="text-base font-normal">
              Та амжилттай 20 coins худалдаж авлаа. Та дуртай Creator-доо
              саналаа өгөөрэй.
            </p>
          )}
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          {!isSuccess && (
            <>
              <ErrorIcon className="size-12" />
              <p className="text-sm">Төлбөр төлөлт амжилтгүй боллоо.</p>
            </>
          )}
        </CardContent>
        <CardFooter className="flex-row items-center justify-between text-center gap-2">
          {isSuccess ? (
            <div className="grid place-items-center mx-auto">
              <p className="text-sm">Төлбөр баталгаажлаа.</p>
              <p className="flex flex-row items-center gap-2">
                <span className="text-sm font-semibold">20</span>{" "}
                <CoinIcon className="size-6" />
              </p>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                className="w-[89px]"
                onClick={() => onClose?.("cancel")}
              >
                Болих
              </Button>
              <Button className="bg-[#FAD02C] text-[#212121] rounded-[24px] h-[48px] w-[131px] disabled:bg-[#333333] disabled:text-[#888888] disabled:border-[#34373C] disabled:border-[1px]">
                Дахин оролдох
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
