"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, User, Lock, Group } from "lucide-react";
import MesmerismIcon from "@/components/icons/mesmerism";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  return (
      <Card className="w-full max-w-[576px] max-h-[620px] bg-card-background border-none p-0">
        <CardContent className="my-[64px] mx-[64px] flex flex-col items-center justify-center gap-[32px] p-0">
          {/* Logo and Brand */}
           <MesmerismIcon className="h-[64px] w-[88px] text-[#DCDDDE]"/>

          {/* Login Form */}
          <form className="w-full gap-[24px] p-0 flex flex-col items-center justify-center">
            {/* Title */}
            <div className="pb-[8px] flex flex-col items-start justify-start gap-[8px]">
              <p className="text-[28px] font-semibold text-[#DCDDDE] p-0 m-0">Тавтай морил</p>
              <p className="text-[14px] text-[#DCDDDE] p-0 m-0">Та өөрийн бүртгэлтэй нэвтрэх нэр болон нууц үгээ оруулна уу.</p>
            </div>

            {/* Username Field */}
            <div className="w-full gap-[12px] p-0 flex flex-col items-start justify-start">
              <div className="relative w-full m-0 p-0">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Нэвтрэх нэр"
                  className="pl-12 pr-12 bg-[#34373C] border-[#34373C] text-[#DCDDDE] placeholder:text-[#61666E] h-12 rounded-lg"
                />
              </div>

              {/* Password Field */}
              <div className="relative w-full m-0 p-0">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] w-5 h-5" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Нууц үг"
                  className="pl-12 pr-12 bg-[#34373C] border-[#34373C] text-[#DCDDDE] placeholder:text-[#61666E] h-12 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between w-full m-0 px-[8px] py-[12px]">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean | "indeterminate") => setRememberMe(checked === true)}
                    className="bg-button-yellow border-button-yellow w-[24px] h-[24px] rounded-[9px]"
                  />
                  <label htmlFor="remember" className="text-[14px] text-[#DCDDDE] cursor-pointer font-semibold ">
                    Намайг санах
                  </label>
                </div>
                <a href="#" className="text-[14px] text-[#DCDDDE] hover:text-gray-300 font-semibold">
                  Нууц үг мартсан ?
                </a>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-button-yellow hover:bg-yellow-600 text-[#292B2F] font-semibold h-12 rounded-lg text-[14px]"
            >
              Нэвтрэх
            </Button>

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full bg-card-background hover:bg-card-background text-[#DCDDDE] font-semibold h-12 rounded-lg text-[14px]"
            >
              Бүртгүүлэх
            </Button>
          </form>
        </CardContent>
      </Card>
  );
}
