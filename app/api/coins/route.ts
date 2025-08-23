import { getUser, getUserBalance } from "@/lib/db/queries";

export async function GET() {
  const balance = await getUserBalance();
  return Response.json({ balance });
}
