"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { useActionState } from "react";
import { updateAvatar } from "./actions";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";

type AvatarState = {
  avatar?: File;
  error?: string;
  success?: string;
};

export default function ProfilePage() {
  const client = createClient();
  const { data: userResponse } = useSWR("/api/user", () =>
    client.auth.getUser()
  );

  const [avatarState, avatarAction, isAvatarPending] = useActionState<
    AvatarState,
    FormData
  >(updateAvatar, {});

  const user = userResponse?.data?.user;
  const error = userResponse?.error;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium bold text-gray-900 mb-6">
        Profile Settings
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 text-sm">{error.message}</p>}
          <form className="space-y-4" action={avatarAction}>
            <div>
              <Label htmlFor="name" className="mb-2">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                required
                defaultValue={user?.email}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="avatar" className="mb-2">
                Avatar
              </Label>
              <Input
                id="avatar"
                name="avatar"
                type="file"
                autoComplete="avatar"
                required
                accept="image/*"
              />
            </div>
            {avatarState.error && (
              <p className="text-red-500 text-sm">{avatarState.error}</p>
            )}
            {avatarState.success && (
              <p className="text-green-500 text-sm">{avatarState.success}</p>
            )}
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isAvatarPending}
            >
              {isAvatarPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Avatar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
