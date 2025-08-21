"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, User, Lock, AlertCircle, Loader2 } from "lucide-react";
import MesmerismIcon from "@/components/icons/mesmerism";
import { signup } from "./actions";
import React from "react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const router = useRouter();

  const [state, formAction, pending] = useActionState<
    {
      error: string | null;
      success: boolean;
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
    FormData
  >(signup, {
    error: null,
    success: false,
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  return (
    <Card className="w-full h-full md:max-w-[576px] bg-card-background border-none p-0">
      <CardContent className="md:my-[64px] md:mx-[64px] my-[24px] mx-[16px] flex flex-col items-center justify-center gap-[32px] p-0">
        {/* Logo and Brand */}
        <MesmerismIcon className="h-[64px] w-[88px] text-[#DCDDDE]" />

        {/* Registration Form */}
        <form
          className="w-full gap-[24px] p-0 flex flex-col items-center justify-center"
          action={formAction}
          noValidate
        >
          {/* Title */}
          <div className="pb-[8px] flex flex-col items-start justify-start gap-[8px] w-full">
            <p className="text-[28px] font-semibold text-[#DCDDDE] p-0 m-0">
              Бүртгүүлэх
            </p>
            <p className="text-sm text-[#DCDDDE] p-0 m-0">
              Та өөрийн нэвтрэх нэр болон нууц үгээ үүсгэнэ үү.
            </p>
          </div>

          {/* Error Display */}
          {state?.error && (
            <div
              key={0} // Add key to force re-render
              className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{state?.error}</p>
            </div>
          )}

          {/* Username Field */}
          <div className="w-full gap-[12px] p-0 flex flex-col items-start justify-start">
            <div className="relative w-full m-0 p-0">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] w-5 h-5" />
              <Input
                type="text"
                name="username"
                placeholder="Нэвтрэх нэр"
                defaultValue={state.username || ""}
                className="pl-12 pr-12 bg-[#34373C] border-[#34373C] text-[#DCDDDE] placeholder:text-[#DCDDDE] h-12 rounded-lg"
              />
            </div>

            {/* Email Field */}
            <div className="relative w-full m-0 p-0">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] w-5 h-5" />
              <Input
                type="email"
                name="email"
                placeholder="И-мэйл хаяг"
                defaultValue={state.email || ""}
                className="pl-12 pr-12 bg-[#34373C] border-[#34373C] text-[#DCDDDE] placeholder:text-[#DCDDDE] h-12 rounded-lg"
              />
            </div>

            {/* Password Field */}
            <div className="relative w-full m-0 p-0">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] w-5 h-5" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Нууц үг"
                defaultValue={state.password || ""}
                className="pl-12 pr-12 bg-[#34373C] border-[#34373C] text-[#DCDDDE] placeholder:text-[#DCDDDE] h-12 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative w-full m-0 p-0">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] w-5 h-5" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Нууц үг давтах"
                defaultValue={state.confirmPassword || ""}
                className="pl-12 pr-12 bg-[#34373C] border-[#34373C] text-[#DCDDDE] placeholder:text-[#DCDDDE] h-12 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#DCDDDE] hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex flex-col items-start justify-start gap-[8px] w-full">
            <p className="text-sm text-[#DCDDDE] p-0 m-0 font-semibold">
              Доорх "Би зөвшөөрч байна." товчийг дарснаар би
              <a href="#" className="text-sm text-[#FAD02C] p-0 m-0 underline">
                {" "}
                Үйлчилгээний нөхцөл{" "}
              </a>
              - ийг уншиж танилцан зөвшөөрч, мөн
              <a href="#" className="text-sm text-[#FAD02C] p-0 m-0 underline">
                {" "}
                Нууцлалын бодлого{" "}
              </a>
              - той танилцсан болохоо хүлээн зөвшөөрч байна.
            </p>
            <div className="flex items-center justify-between w-full m-0 py-[12px]">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agree"
                  checked={agree}
                  onCheckedChange={(checked: boolean | "indeterminate") =>
                    setAgree(checked === true)
                  }
                  className="bg-[#34373C] border-[#292B2F] border-[1px] w-[24px] h-[24px] rounded-[9px]"
                />
                <label
                  htmlFor="agree"
                  className="text-sm text-[#DCDDDE] cursor-pointer font-semibold "
                >
                  Би зөвшөөрч байна
                </label>
              </div>
            </div>
          </div>

          {/* Register Button */}
          <Button
            type="submit"
            disabled={pending || !agree}
            className="w-full bg-button-yellow hover:bg-yellow-600 text-[#292B2F] font-semibold h-12 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Бүртгэж байна...
              </>
            ) : (
              "Бүртгүүлэх"
            )}
          </Button>

          {/* Login Button */}
          <Button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="w-full bg-card-background hover:bg-background text-[#DCDDDE] font-semibold h-12 rounded-lg text-sm shadow-none"
          >
            Нэвтрэх
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
