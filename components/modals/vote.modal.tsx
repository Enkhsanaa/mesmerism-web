import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { X, Minus, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState } from "react";
import CoinIcon from "../icons/coin";
import { Input } from "../ui/input";
import useSWR from "swr";
import { useRealtime } from "@/app/(dashboard)/realtime-provider";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface VoteModalProps {
  creator: DbUser;
  isOpen: boolean;
  onClose: () => void;
  onVote?: (value: number) => void;
}

export default function VoteModal({
  creator,
  isOpen,
  onClose,
  onVote,
}: VoteModalProps) {
  const { userBalance } = useRealtime();
  const [selectedCoins, setSelectedCoins] = useState(0);

  if (!isOpen) return null;

  const handleVote = (value: number) => {
    // Handle vote submission here
    console.log(`Voted ${value} for ${creator.username}`);
    onVote?.(value);
    onClose();
  };

  const handleMaxCoins = () => {
    setSelectedCoins(userBalance ?? 0);
  };

  const handleMinusCoins = () => {
    setSelectedCoins(selectedCoins - 10);
  };

  const handlePlusCoins = () => {
    setSelectedCoins(selectedCoins + 10);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/50">
      <Card className="w-full max-w-md bg-card-background border-none text-white pointer-events-auto flex flex-col justify-between gap-10">
        <CardHeader className="flex flex-col items-center justify-between">
          <div className="w-full flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-semiboldtext-white">
              Санал өгөх
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-[48px] w-[48px] p-0text-white hover:bg-[#34373C]"
            >
              <X className="h-[20px] w-[20px]" />
            </Button>
          </div>
          <p className="text-base font-normaltext-white">
            Та өөрийн дуртай Youtuber-дээ санал өгөх Coin-ний хэмжээгээ оруулна
            уу.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          {/* User info */}
          <div className="flex flex-col items-center justify-center gap-2">
            <Avatar className="size-12 border-yellow-300 border-2">
              <AvatarImage src={creator.avatar_url || ""} />
              <AvatarFallback>
                {creator.username?.slice(0, 2).toUpperCase() || "AN"}
              </AvatarFallback>
            </Avatar>
            <p className="text-white font-semibold text-base">
              {creator.username}
            </p>
          </div>

          {/* Coin input */}
          <div className="flex flex-row items-center justify-center gap-2">
            <Button
              size="icon"
              onClick={handleMinusCoins}
              disabled={selectedCoins <= 0}
              className="bg-[#F8F9FA] text-[#212121] rounded-full h-[48px] w-[48px]"
            >
              <Minus className="h-[20px] w-[20px] text-[#212121]" />
            </Button>
            <Input
              type="number"
              value={selectedCoins}
              onChange={(e) => setSelectedCoins(Number(e.target.value))}
              className="text-white font-semibold text-sm bg-[#34373C] rounded-[24px] w-[100px] h-[48px] px-[10px] border-none text-center [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-number-spin-button]:appearance-none"
            />
            <Button
              size="icon"
              onClick={handlePlusCoins}
              disabled={selectedCoins >= (userBalance ?? 0)}
              className="bg-[#F8F9FA] text-[#212121] rounded-full h-[48px] w-[48px]"
            >
              <Plus className="h-[20px] w-[20px] text-[#212121]" />
            </Button>
          </div>

          {/* Use max coins button */}
          <Button
            onClick={handleMaxCoins}
            className="w-full bg-[#34373C]text-white rounded-[20px] h-[40px] max-w-[116px]"
          >
            Use max coin
          </Button>

          {/* Coin info */}
          <div className="flex flex-row items-center justify-between w-full bg-[#34373C] rounded-[24px] p-[24px]">
            <div className="flex flex-row items-start justify-start gap-4 flex-wrap">
              <p className="text-white font-semibold text-sm">Боломжтой:</p>
              <div className="flex items-center gap-[4px]">
                <span className="text-white font-semibold text-sm">
                  {userBalance}
                </span>
                <CoinIcon className="size-6 text-[#FAD02C]" />
              </div>
            </div>
            <Button className="bg-[#FAD02C] text-[#212121] rounded-[24px] h-[48px] w-[128px] flex items-center justify-center gap-2">
              <Plus className="h-[20px] w-[20px] text-[#212121]" />
              Coin авах
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row items-center justify-between gap-2">
          <Button
            className="bg-transparent text-white w-[89px]"
            onClick={onClose}
          >
            Болих
          </Button>
          <Button
            disabled={selectedCoins <= 0 || selectedCoins > (userBalance ?? 0)}
            className="bg-[#FAD02C] text-[#212121] rounded-[24px] h-[48px] w-[131px] disabled:bg-[#333333] disabled:text-[#888888] disabled:border-[#34373C] disabled:border-[1px]"
          >
            Санал өгөх
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
