"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { users } from "@/lib/db/migrations/schema";
import { Loader2 } from "lucide-react";
import { Suspense, useActionState, useState } from "react";
import useSWR from "swr";
import { updateProfile } from "./actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  color?: string | null;
  error?: string;
  success?: string;
};

type AccountFormProps = {
  state: ActionState;
  usernameValue?: string;
  emailValue?: string;
  colorValue?: string;
  avatarUrlValue?: string;
};

function AccountForm({
  state,
  usernameValue = "",
  emailValue = "",
  colorValue = "",
  avatarUrlValue = "",
}: AccountFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(state.avatarUrl || avatarUrlValue);

  return (
    <div className="space-y-8">
      {/* Avatar Section - Centered and Prominent */}
      <div className="text-center space-y-4">
        <div
          className="relative inline-block group cursor-pointer"
          onClick={() => {
            const input = document.getElementById("avatar");
            if (input) {
              input.click();
            }
          }}
        >
          <Avatar className="size-32 ring-4 ring-gray-700 group-hover:ring-[#FAD02C] transition-all duration-200 shadow-2xl hover:scale-105">
            <AvatarImage src={avatarUrl} className="object-cover" />
            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-[#FAD02C] to-red-600 text-white">
              {usernameValue.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Upload Overlay */}
          <div className="absolute inset-0 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="text-white text-sm font-medium">Зураг солих</span>
          </div>

          <Input
            id="avatar"
            type="file"
            name="avatar"
            placeholder="Профайл зураг байршуулах"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarUrl(URL.createObjectURL(file));
              }
            }}
          />
        </div>
      </div>

      {/* Profile Details Section */}
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white">Хувийн мэдээлэл</h3>
          <p className="text-gray-400 text-sm">
            Чат дээр хэрхэн харагдахаа тохируулах
          </p>
        </div>

        <div className="grid gap-6 max-w-md mx-auto">
          {/* Username Field */}
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              Харуулах нэр
            </Label>
            <Input
              id="username"
              name="username"
              placeholder="Харуулах нэрээ оруулна уу"
              defaultValue={state.username || usernameValue}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#FAD02C] focus:ring-[#FAD02C] focus:ring-1"
              required
            />
            <p className="text-xs text-gray-500">
              Бусад хэрэглэгчид таныг ингэж харах болно
            </p>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              И-мэйл хаяг
            </Label>
            <Input
              id="email"
              type="email"
              disabled
              placeholder="Таны и-мэйл хаяг"
              defaultValue={state.email || emailValue}
              className="bg-gray-900 border-gray-700 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              И-мэйл хаягийг өөрчлөх боломжгүй
            </p>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <Label
              htmlFor="color"
              className="text-sm font-medium text-gray-300 flex items-center gap-2"
            >
              Өнгө
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                name="color"
                defaultValue={state.color || colorValue || "#f97316"}
                className="w-16 h-12 border-0 rounded-lg cursor-pointer bg-transparent"
              />
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="#f97316"
                  defaultValue={state.color || colorValue || "#f97316"}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#FAD02C] focus:ring-[#FAD02C] focus:ring-1"
                  onChange={(e) => {
                    const colorInput = document.getElementById(
                      "color"
                    ) as HTMLInputElement;
                    if (colorInput && e.target.value.match(/^#[0-9A-F]{6}$/i)) {
                      colorInput.value = e.target.value;
                    }
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Чат дээр харагдах нэрний өнгө
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountFormWithData({ state }: { state: ActionState }) {
  const { data: user } = useSWR<typeof users.$inferSelect>(
    "/api/user",
    fetcher
  );
  return (
    <AccountForm
      state={state}
      usernameValue={user?.username ?? ""}
      emailValue=""
      colorValue={user?.color ?? ""}
      avatarUrlValue={user?.avatarUrl ?? ""}
    />
  );
}

export default function GeneralPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateProfile,
    {}
  );

  return (
    <section className="flex-1 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Профайл тохиргоо</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={formAction}>
            <Suspense fallback={<AccountForm state={state} />}>
              <AccountFormWithData state={state} />
            </Suspense>
            {state.error && (
              <p className="text-red-500 text-sm text-center">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-500 text-sm text-center">
                {state.success}
              </p>
            )}
            <Button
              type="submit"
              disabled={isPending}
              className="ml-auto block"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />
                  Хадгалж байна...
                </>
              ) : (
                "Өөрчлөлтүүдийг хадгалах"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
