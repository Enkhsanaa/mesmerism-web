"use server";

import { validatedActionWithUser } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/migrations/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateAvatarSchema = z.object({
  avatar: z
    .file()
    .mime(["image/png", "image/jpeg", "image/webp"])
    .max(1024 * 1024 * 8),
});

export const updateAvatar = validatedActionWithUser(
  updateAvatarSchema,
  async (data, _, user) => {
    const { avatar } = data;
    const supabase = await createClient();

    if (!avatar) {
      return {
        error: "Please upload an image file.",
      };
    }

    const { data: uploadResult, error: uploadError } = await supabase.storage
      .from("images")
      .upload(avatar.name, avatar);

    if (uploadError) {
      return { error: uploadError.message };
    }

    const result = supabase.storage
      .from("images")
      .getPublicUrl(uploadResult.path);

    await Promise.all([
      db
        .update(users)
        .set({ avatarUrl: result.data.publicUrl })
        .where(eq(users.id, user.id)),
    ]);

    return {
      success: "Avatar updated successfully.",
    };
  }
);
