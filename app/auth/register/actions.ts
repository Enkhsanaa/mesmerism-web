"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

// Zod schema for registration validation
const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters long")
      .max(50, "Username is too long")
      .trim(),
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
    confirmPassword: z.string().min(1, "Please confirm your password").trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
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
  console.log(error);

  if (error) {
    // Provide user-friendly error messages for common cases
    let errorMessage = "Registration failed. Please try again.";

    switch (error.message) {
      case "User already registered":
        errorMessage = "An account with this email already exists.";
        break;
      case "Password should be at least 6 characters":
        errorMessage = "Password must be at least 6 characters long.";
        break;
      case "Invalid email":
        errorMessage = "Please enter a valid email address.";
        break;
      case "Email rate limit exceeded":
        errorMessage =
          "Too many registration attempts. Please try again later.";
        break;
      case "Network error":
        errorMessage =
          "Network error. Please check your connection and try again.";
        break;
      default:
        errorMessage =
          error.message || "Registration failed. Please try again.";
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
