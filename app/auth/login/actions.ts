"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// Zod schema for login validation
const loginSchema = z.object({
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
});

type LoginState = {
  error: string | null;
  success: boolean;
  email: string;
  password: string;
};

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const supabase = await createClient();

  // Extract form data
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate with Zod
  const validationResult = loginSchema.safeParse({ email, password });

  if (!validationResult.success) {
    // Get the first validation error
    const firstError = validationResult.error.issues[0];

    return {
      error: firstError.message,
      success: false,
      email,
      password,
    };
  }

  const { data: validatedData } = validationResult;

  // Attempt Supabase authentication
  const { error } = await supabase.auth.signInWithPassword(validatedData);

  if (error) {
    // Provide user-friendly error messages for common cases
    let errorMessage = "Нэвтрэх үйлдэл амжилтгүй боллоо.";
    console.log("error", error.message);

    switch (error.message) {
      case "Invalid login credentials":
        errorMessage = "И-мэйл эсвэл нууц үг буруу байна. Дахин оролдоно уу.";
        break;
      case "Email not confirmed":
        errorMessage = "И-мэйл хаяг баталгаажуулна уу.";
        break;
      case "Too many requests":
        errorMessage =
          "Та нэвтрэх олон удаагийн оролдлого хийсэн байна. Түр хүлээгээр дахин оролдоно уу.";
        break;
      case "User not found":
        errorMessage = "Бүртгэлгүй и-мэйл хаяг байна.";
        break;
      case "Invalid email address":
        errorMessage = "И-мэйл хаяг алдаатай байна.";
        break;
      case "Network error":
        errorMessage =
          "Таны интернет холболт дээр алдаа гарлаа. Дахин оролдоно уу.";
        break;
      default:
        errorMessage = error.message || "Нэвтрэх үйлдэл амжилтгүй боллоо.";
    }

    return {
      error: errorMessage,
      success: false,
      email: validatedData.email,
      password: validatedData.password,
    };
  }

  // Login successful - redirect
  revalidatePath("/", "layout");
  redirect("/");
}
