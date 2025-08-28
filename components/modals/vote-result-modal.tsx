"use client";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import CheckIcon from "../icons/check";
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

interface VoteResultModalProps {
  isOpen: boolean;
  onClose?: (reason?: string) => void;
  creator?: {
    username: string;
    avatar: string;
    quote: string;
    coins: number;
  };
}

// Animated Avatar Component that eats coins
function AnimatedAvatar({
  avatar,
  username,
  coins,
}: {
  avatar?: string;
  username?: string;
  coins: number;
}) {
  const [isEating, setIsEating] = useState(false);
  const [eatenCoins, setEatenCoins] = useState(0);

  useEffect(() => {
    if (coins > 0) {
      setIsEating(true);
      const timer = setTimeout(() => {
        setIsEating(false);
      }, 2000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [coins]);

  // Generate coin positions for dropping animation
  const coinPositions = Array.from({ length: Math.min(coins, 8) }, (_, i) => ({
    id: i,
    x: (i % 2 === 0 ? -1 : 1) * 15, // Alternate left and right
    delay: i * 0.15, // Stagger coin drops
  }));

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Dropping Coins */}
      <AnimatePresence>
        {isEating &&
          coinPositions.map((coin) => (
            <motion.div
              key={coin.id}
              className="absolute top-0 z-10"
              initial={{
                y: -100,
                x: coin.x,
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                y: 60, // Drop to avatar position
                x: coin.x,
                opacity: [0, 1, 1, 0],
                scale: [0.8, 1, 1, 0.6],
              }}
              exit={{
                y: 60,
                x: coin.x,
                opacity: 0,
                scale: 0.6,
              }}
              transition={{
                duration: 1.5,
                delay: coin.delay,
                ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for natural drop
              }}
              onAnimationComplete={() => {
                if (coin.id === coinPositions.length - 1) {
                  setEatenCoins(coins);
                }
              }}
            >
              <CoinIcon className="w-6 h-6" />
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Avatar with eating animation */}
      <motion.div
        animate={{
          scale: isEating ? [1, 1.2, 0.9, 1.1, 1] : 1,
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          repeat: isEating ? 3 : 0,
          repeatType: "reverse",
        }}
      >
        <Avatar className="size-12 relative">
          <AvatarImage src={avatar} />
          <AvatarFallback>{username?.slice(0, 2) || "AN"}</AvatarFallback>

          {/* Eating effect overlay */}
          {isEating && (
            <motion.div
              className="absolute inset-0 bg-yellow-400/20 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0.8, 1.2, 1.5],
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
              }}
            />
          )}
        </Avatar>
      </motion.div>

      {/* Username */}
      <p className="text-base font-semibold">{username}</p>

      {/* Coin counter animation */}
      <motion.div
        className="text-sm text-yellow-400 font-medium"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: eatenCoins > 0 ? 1 : 0,
          y: eatenCoins > 0 ? 0 : 10,
        }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        +{eatenCoins} coins
      </motion.div>
    </div>
  );
}

export default function VoteResultModal({
  isOpen,
  onClose,
  creator,
}: VoteResultModalProps) {
  if (!isOpen) return null;

  const coins = creator?.coins ? (
    creator.coins
  ) : (
    <span className="bg-red-50 animate-pulse w-8 h-4 rounded-lg inline-block -mb-0.5" />
  );
  const username = creator?.username ? (
    creator.username
  ) : (
    <span className="bg-red-50 animate-pulse w-24 h-4 rounded-lg inline-block -mb-0.5" />
  );
  const quote = creator?.quote ? (
    creator.quote
  ) : (
    <span className="bg-red-50 animate-pulse w-full h-4 rounded-lg inline-block -mb-0.5" />
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/50">
      <Card className="w-full max-w-md bg-card-background border-none text-white pointer-events-auto flex flex-col justify-between gap-10">
        <CardHeader className="flex flex-col items-center justify-between">
          <div className="w-full flex flex-row items-center justify-between">
            <CardTitle className="flex flex-row items-center gap-4">
              <CheckIcon className="size-6" />
              <h2 className="text-2xl font-semibold">Амжилттай</h2>
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
          <p className="text-base font-normal w-full">
            Та амжилттай {coins} coin {username}-д өглөө.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <AnimatedAvatar
            avatar={creator?.avatar}
            username={creator?.username}
            coins={creator?.coins || 0}
          />
        </CardContent>
        <CardFooter>
          <div className="bg-[#34373C] rounded-lg p-6 w-full text-center">
            <p>{quote}</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
