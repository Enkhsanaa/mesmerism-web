import { getUser } from "@/lib/db/queries";
import { LivechatClient } from "./livechat-client";

export default async function Livechat() {
  const user = await getUser();

  if (!user) {
    return null;
  }

  return <LivechatClient user={user} />;
}
