import { RealtimeChat } from "@/components/realtime-chat";
import { getUser } from "@/lib/db/queries";

export default async function Livechat() {
  const user = await getUser();
  // const { data: messages } = useMessagesQuery()
  // const handleMessage = (messages: ChatMessage[]) => {
  //   // Store messages in your database
  //   await storeMessages(messages)
  // }
  if (!user) {
    return null;
  }
  return (
    <div className="max-h-[592px]">
      <RealtimeChat username={user?.username ?? ""} />
    </div>
  );
}
