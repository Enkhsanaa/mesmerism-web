import { useRealtimeStore } from "@/lib/stores/realtime-store";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import CoinIcon from "../icons/coin";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useModal } from "@/app/(dashboard)/modal-provider";
import { toast } from "sonner";
import { formatAmount } from "@/lib/utils";

export default function VoteModal() {
  const { voteModalOpen, setVoteModalOpen, selectedCreator, setCoinModalOpen } =
    useModal();
  const {
    user: userOverview,
    supabase,
    currentWeekId,
    refreshUserBalance,
  } = useRealtimeStore();
  const [selectedCoins, setSelectedCoins] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!voteModalOpen) return null;

  if (!selectedCreator) {
    console.error("VoteModal: No selected creator, closing modal");
    setVoteModalOpen(false);
    return null;
  }

  console.log("VoteModal rendering with creator:", selectedCreator);

  const handleVote = async () => {
    if (!selectedCreator || !currentWeekId || selectedCoins <= 0) {
      toast.error("Invalid vote data");
      return;
    }

    if (selectedCoins > (userOverview?.balance ?? 0)) {
      toast.error("Insufficient balance");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate votes from coins (assuming 1 coin = 1 vote, but check actual rate)
      const votes = selectedCoins; // This might need adjustment based on coins_per_vote rate

      const { data, error } = await supabase.rpc("purchase_votes", {
        p_creator_id: selectedCreator.id,
        p_week_id: currentWeekId,
        p_votes: votes,
      });

      if (error) {
        console.error("Vote purchase error:", error);
        if (error.message.includes("INSUFFICIENT_FUNDS")) {
          toast.error("Insufficient funds");
        } else if (error.message.includes("not currently open")) {
          toast.error("Voting is not currently open for this week");
        } else if (error.message.includes("not a participant")) {
          toast.error("Creator is not participating in this week");
        } else {
          toast.error("Failed to submit vote: " + error.message);
        }
        return;
      }

      toast.success(`Таны ${votes} саналыг амжилттай хүлээж авлаа!`);
      setVoteModalOpen(false);
      setSelectedCoins(0);
      refreshUserBalance();
    } catch (error) {
      console.error("Vote submission error:", error);
      toast.error("Failed to submit vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxCoins = () => {
    setSelectedCoins(userOverview?.balance ?? 0);
  };

  const handleMinusCoins = () => {
    setSelectedCoins(selectedCoins - 10);
  };

  const handlePlusCoins = () => {
    setSelectedCoins(selectedCoins + 10);
  };

  return (
    <Dialog open={voteModalOpen} onOpenChange={setVoteModalOpen}>
      <DialogTitle className="sr-only">Санал өгөх</DialogTitle>
      <DialogContent>
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
                  onClick={() => setVoteModalOpen(false)}
                  className="h-[48px] w-[48px] p-0text-white hover:bg-[#34373C]"
                >
                  <X className="h-[20px] w-[20px]" />
                </Button>
              </div>
              <p className="text-base font-normaltext-white">
                Та өөрийн дуртай Youtuber-дээ санал өгөх Coin-ний хэмжээгээ
                оруулна уу.
              </p>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4">
              {/* User info */}
              <div className="flex flex-col items-center justify-center gap-2">
                <Avatar className="size-12 border-yellow-300 border-2">
                  <AvatarImage src={selectedCreator?.avatar_url || ""} />
                  <AvatarFallback>
                    {selectedCreator?.username?.slice(0, 2).toUpperCase() ||
                      "AN"}
                  </AvatarFallback>
                </Avatar>
                <p className="text-white font-semibold text-base">
                  {selectedCreator?.username}
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
                  disabled={selectedCoins >= (userOverview?.balance ?? 0)}
                  className="bg-[#F8F9FA] text-[#212121] rounded-full h-[48px] w-[48px]"
                >
                  <Plus className="h-[20px] w-[20px] text-[#212121]" />
                </Button>
              </div>

              {/* Use max coins button */}
              <Button
                onClick={handleMaxCoins}
                className="w-full bg-[#34373C] hover:bg-accent active:bg-accent text-white rounded-[20px] h-[40px] max-w-[116px]"
              >
                Use max coin
              </Button>

              {/* Coin info */}
              <div className="flex flex-row items-center justify-between w-full bg-[#34373C] rounded-[24px] p-[24px]">
                <div className="flex flex-row items-center justify-start gap-4 flex-wrap">
                  <p className="text-white font-semibold text-sm">Боломжтой:</p>
                  <div className="flex items-center gap-[4px]">
                    <span className="text-white font-semibold text-sm">
                      {formatAmount(userOverview?.balance ?? 0)}
                    </span>
                    <CoinIcon className="size-6 text-[#FAD02C]" />
                  </div>
                </div>
                <Button
                  className="bg-[#FAD02C] text-[#212121] rounded-[24px] h-[48px] w-[128px] flex items-center justify-center gap-2"
                  onClick={() => setCoinModalOpen(true)}
                >
                  <Plus className="h-[20px] w-[20px] text-[#212121]" />
                  Coin авах
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-row items-center justify-between gap-2">
              <Button
                className="bg-transparent hover:bg-accent text-white w-[89px]"
                onClick={() => setVoteModalOpen(false)}
              >
                Болих
              </Button>
              <Button
                disabled={
                  selectedCoins <= 0 ||
                  selectedCoins > (userOverview?.balance ?? 0) ||
                  isSubmitting
                }
                onClick={handleVote}
                className="bg-[#FAD02C] text-[#212121] rounded-[24px] h-[48px] w-[131px] disabled:bg-[#333333] disabled:text-[#888888] disabled:border-[#34373C] disabled:border-[1px]"
              >
                {isSubmitting ? "Илгээж байна..." : "Санал өгөх"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
