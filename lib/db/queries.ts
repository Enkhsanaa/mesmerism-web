import { and, eq, isNull } from "drizzle-orm";
import { createClient } from "../supabase/server";
import { db } from "./drizzle";
import { userCoinBalances, users } from "./migrations/schema";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, supabaseUser.id))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getUserBalance(userId: string) {
  const userCoinBalance = await db
    .select()
    .from(userCoinBalances)
    .where(eq(userCoinBalances.userId, userId));

  if (userCoinBalance.length === 0) {
    return 0;
  }

  return userCoinBalance[0].balance ?? 0;
}
