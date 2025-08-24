"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// Zod schema for registration validation
const registerSchema = z
  .object({
    username: z
      .string("Хэрэглэгчийн нэр буруу байна")
      .min(1, "Хэрэглэгчийн нэр оруулна уу")
      .min(3, "Хэрэглэгчийн нэр хамгийн багадаа 3 тэмдэгт байх ёстой")
      .max(50, "Хэрэглэгчийн нэр 50 тэмдэгтээс илүү байж болохгүй")
      .trim(),
    email: z
      .email("И-мэйл хаяг буруу байна")
      .min(1, "И-мэйл хаяг оруулна уу")
      .max(255, "И-мэйл хаяг 255 тэмдэгтээс илүү байж болохгүй")
      .trim()
      .toLowerCase(),
    password: z
      .string("Нууц үг буруу байна")
      .min(1, "Нууц үг оруулна уу")
      .min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой")
      .max(100, "Нууц үг 100 тэмдэгтээс илүү байж болохгүй")
      .trim(),
    confirmPassword: z
      .string("Нууц үгээ давтан оруулна уу")
      .min(1, "Нууц үгээ давтан оруулна уу")
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Нууц үгүүд хоорондоо таарахгүй байна",
    path: ["confirmPassword"],
  });

type RegisterState = {
  error: string | null;
  success: boolean;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export async function signup(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const supabase = await createClient();

  // Extract form data
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate with Zod
  const validationResult = registerSchema.safeParse({
    username,
    email,
    password,
    confirmPassword,
  });

  if (!validationResult.success) {
    // Get the first validation error
    const firstError = validationResult.error.issues[0];

    return {
      error: firstError.message,
      success: false,
      username,
      email,
      password,
      confirmPassword,
    };
  }

  const { data: validatedData } = validationResult;

  // Attempt Supabase registration
  const { error } = await supabase.auth.signUp({
    email: validatedData.email,
    password: validatedData.password,
    options: {
      data: {
        username: validatedData.username,
      },
    },
  });

  if (error) {
    // Provide user-friendly error messages for common cases
    let errorMessage = "Бүртгэл амжилтгүй боллоо.";

    switch (error.message) {
      case "User already registered":
        errorMessage = "Бүртгэлтэй и-мэйл хаяг байна.";
        break;
      case "Password should be at least 6 characters":
        errorMessage = "Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.";
        break;
      case "Invalid email address":
        errorMessage = "И-мэйл хаяг алдаатай байна.";
        break;
      case "Email rate limit exceeded":
        errorMessage =
          "Бүртгэл түр хугацаанд идэвхигүй байна. Та түр хүлээнэ үү.";
        break;
      case "Network error":
        errorMessage = "Таны интернет холболт дээр алдаа гарлаа.";
        break;
      case "Database error saving new user":
        errorMessage = "Хэрэглэгчийн нэр бүртгэлтэй байна.";
        break;
      default:
        errorMessage = error.message || "Бүртгэл амжилтгүй боллоо.";
    }

    return {
      error: errorMessage,
      success: false,
      username: validatedData.username,
      email: validatedData.email,
      password: validatedData.password,
      confirmPassword: validatedData.confirmPassword,
    };
  }

  // Registration successful - redirect to login
  revalidatePath("/", "layout");
  redirect("/auth/login");
}
