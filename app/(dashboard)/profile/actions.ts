"use server";

import { validatedActionWithUser } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import { User, users } from "@/lib/db/migrations/schema";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  avatar: z.file().nullish(),
  username: z.string().min(3).max(20).nullish(),
  color: z.string().min(3).max(20).nullish(),
});

export const updateProfile = validatedActionWithUser(
  updateProfileSchema,
  async (data, _, user) => {
    const { avatar, username, color } = data;
    console.log("avatar", avatar);
    console.log("username", username);
    console.log("color", color);
    const supabase = await createClient();

    const changes: Partial<User> = {};

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (username && dbUser?.username !== username) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username),
      });
      if (existingUser) {
        return { error: "Username already exists." };
      }
      changes.username = username;
    }

    if (color && dbUser?.color !== color) {
      changes.color = color;
    }

    if (avatar && avatar.size > 0) {
      const filePath = `${user.id}/avatar${
        avatar.name.includes(".")
          ? avatar.name.slice(avatar.name.lastIndexOf("."))
          : ".png"
      }`;

      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, avatar, { upsert: true });

      console.log(
        "uploadResult",
        JSON.stringify(uploadResult),
        "uploadError",
        uploadError
      );
      if (uploadError) {
        return { error: uploadError.message };
      }

      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filePath}`;
      changes.avatarUrl = publicUrl;
    }
    console.log("changes", changes);

    if (Object.keys(changes).length > 0) {
      await db.update(users).set(changes).where(eq(users.id, user.id));
    }

    return {
      success:
        Object.keys(changes).length > 0
          ? "Профайл амжилттай шинэчлэгдлээ."
          : undefined,
      username: changes.username || user.username,
      email: user.email,
      avatarUrl: changes.avatarUrl || user.avatarUrl,
      color: changes.color || user.color,
    };
  }
);
