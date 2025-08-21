import Header from "@/components/header";
import BubbleIcon from "@/components/icons/bubble";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function CreatorCard() {
  return (
    <div className="w-full p-8 flex justify-between items-center rounded-3xl bg-card-background">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="size-16 shadow-[0_0_0_2px_#FAD02C]">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="absolute -top-[40px] left-[20px] w-[80px]">
            <BubbleIcon className="w-[120px] h-[41px]" />
            <p className="absolute top-[5px] left-[30px] text-xs">PLS</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-bold">John Doe</p>
          <Badge variant="secondary">1.2 M Subscribers</Badge>
        </div>
      </div>
      <Button>Санал өгөх</Button>
    </div>
  );
}

export default function TestPage() {
  return (
    <div className="grid gap-16">
      <Header />
      <div className="grid gap-8 max-w-[1312px] mx-auto w-full">
        <div className="w-full aspect-[3.44] bg-red-500"></div>
        <div className="w-full h-[900px] grid md:grid-cols-[0.7fr_0.3fr] gap-8">
          <div className="flex flex-col gap-8 order-2 md:order-1">
            <CreatorCard />
            <div className="bg-red-200 h-[200px]" />
            <div className="bg-black/20 h-[200px]" />
          </div>
          <div className="bg-slate-200 order-1 md:order-2"></div>
        </div>
      </div>
    </div>
  );
}
