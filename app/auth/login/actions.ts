"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// Zod schema for login validation
const loginSchema = z.object({
  email: z
    .email()
    .min(1, "Email is required")
    .max(255, "Email is too long")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password is too long")
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
    let errorMessage = "Login failed. Please check your credentials.";

    switch (error.message) {
      case "Invalid login credentials":
        errorMessage = "Invalid email or password. Please try again.";
        break;
      case "Email not confirmed":
        errorMessage = "Please confirm your email address before logging in.";
        break;
      case "Too many requests":
        errorMessage = "Too many login attempts. Please try again later.";
        break;
      case "User not found":
        errorMessage = "No account found with this email address.";
        break;
      case "Invalid email":
        errorMessage = "Please enter a valid email address.";
        break;
      case "Network error":
        errorMessage =
          "Network error. Please check your connection and try again.";
        break;
      default:
        errorMessage =
          error.message || "Login failed. Please check your credentials.";
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
