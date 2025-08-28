import BubbleIcon from "@/components/icons/bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Play, Send, Smile, Youtube, Facebook, Twitch, ChevronDown, HandHeart } from "lucide-react";
import { GlassButton } from "@/components/ui/glass-button";
import Header from "@/components/header";

function CreatorCard() {
  return (
    <div className="w-full p-8 flex justify-between items-center rounded-3xl bg-[#292B2F]">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Avatar className="size-16 shadow-[0_0_0_2px_#FAD02C]">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>MD</AvatarFallback>
          </Avatar>
          <div className="absolute -top-[40px] left-[20px] w-[80px]">
            <BubbleIcon className="w-[120px] h-[41px]" />
            <p className="absolute top-[5px] left-[30px] text-xs text-white">PLS</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-4xl font-bold text-white">Markiplier</p>
          <Badge variant="secondary" className="bg-[#202225] border-[#333333] text-[#DCDDDE] w-fit">
            Gaming Creator
          </Badge>
        </div>
      </div>
      <GlassButton>
        <div className="flex flex-row items-center gap-2">
          <HandHeart className="w-6 h-6" />
          <span className="text-xl font-semibold">Санал өгөх</span>
        </div>
      </GlassButton>
    </div>
  );
}

function SocialMediaSection() {
  return (
    <Card className="w-full bg-[#292B2F] border-none">
      <CardContent className="p-8">
        <div className="flex flex-col gap-6">
          <div className="relative w-full h-[398px] rounded-3xl overflow-hidden">
            <iframe
              src="https://www.youtube.com/embed/YPEQnuC70A8"
              title="YouTube video player"
              className="w-full h-full rounded-3xl"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Description() {
  return (
    <Card className="w-full bg-[#292B2F] border-none">
      <CardContent className="p-8">
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-white">Description</h3>
          <p className="text-[#DCDDDE] text-sm leading-relaxed">
            🎨 UI/UX Design | Digital Product Growth | Build & Scale Smarter 🚀 Welcome to my channel! I'm Tulgux, a UI/UX designer on a mission to help you create better digital products—whether you're a founder, designer, or someone who wants to build their own profitable product. 💡 What You'll Learn Here: ✅ UI/UX design tips & product breakdowns ✅ Common mistakes & how to fix them ✅ How great design can scale a business ✅ Building digital products (even if you can't code) ✅ Freelancing & personal branding for designers Design isn't just about looks—it's about impact. My goal? To inspire you & help you turn ideas into real, profitable products. 📩 Let's connect: tulgaa.mgl@gmail.com 🔔 Subscribe & let's build something great together!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SocialLinksSection() {
  return (
    <Card className="w-full bg-[#292B2F] border-none">
      <CardContent className="p-8">
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-white">Сошиал холбоос</h3>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-transparent border-[#FAD02C] text-[#FAD02C] hover:bg-[#FAD02C]/10 h-10 px-3 gap-2">
              <Youtube className="w-4 h-4" />
              <span className="text-sm font-semibold">tulgux</span>
            </Button>
            <Button className="bg-transparent border-[#FAD02C] text-[#FAD02C] hover:bg-[#FAD02C]/10 h-10 px-3 gap-2">
              <Facebook className="w-4 h-4" />
              <span className="text-sm font-semibold">tulgux</span>
            </Button>
            <Button className="bg-transparent border-[#FAD02C] text-[#FAD02C] hover:bg-[#FAD02C]/10 h-10 px-3 gap-2">
              <Twitch className="w-4 h-4" />
              <span className="text-sm font-semibold">tulgux</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChatSection() {
  const messages = [
    { name: "Tulgux", message: "I need a recap for next time!", color: "#9E5CBD" },
    { name: "Tulgux", message: "I need a recap for next time!", color: "#3D9BB7" },
    { name: "Tulgux", message: "I need a recap for next time!", color: "#9E5CBD" },
    { name: "Tulgux", message: "I need a recap for next time!", color: "#3D9BB7" },
    { name: "Tulgux", message: "I need a recap for next time!", color: "#5ED36A" },
    { name: "Tulgux", message: "I need a recap for next time!", color: "#9E5CBD", isCreator: true },
    { name: "Tulgux", message: "I need a recap for next time!", color: "#3D9BB7" },
    { name: "Tulgux", message: "I need a recap for next time!", color: "#5ED36A" },
  ];

  return (
    <Card className="w-full bg-[#292B2F] border-none">
      <CardContent className="p-8">
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-white">Коммент</h3>
          <div className="flex flex-col gap-4 max-h-[524px] overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="flex items-center gap-4">
                <Avatar className="size-10 border-2 border-[#444444]">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="text-xs">TU</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{ color: msg.color }}>
                      {msg.name}
                    </span>
                    {msg.isCreator && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="text-xs text-[#72767D]">Creator</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-[#DCDDDE]">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 bg-[#34373C] rounded-2xl p-4">
            <Smile className="w-6 h-6 text-[#72767D]" />
            <Input 
              placeholder="Type a message..." 
              className="flex-1 bg-transparent border-none text-[#72767D] placeholder:text-[#72767D]"
            />
            <Send className="w-6 h-6 text-[#72767D] cursor-pointer" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TestPage() {
  return (
    <div className="min-h-screen bg-[#2F3136]">
      <Header />
      
      {/* Main Content */}
      <div className="max-w-[1312px] mx-auto px-16 py-16">
        <div className="flex flex-col gap-8">
          {/* Cover Image */}
          <div className="w-full h-[250px] bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center">
            <div className="text-white text-2xl font-bold">Cover Image</div>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-[0.7fr_0.3fr] gap-8">
            {/* Left Column */}
            <div className="flex flex-col gap-8">
              <CreatorCard />
              <SocialMediaSection />
              <Description />
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-8">
              <SocialLinksSection />
              <ChatSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
