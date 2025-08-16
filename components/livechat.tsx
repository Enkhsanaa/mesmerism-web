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
    <div className="flex justify-center mx-auto ml-6">
      <div className="w-[530px] max-h-[892px]">
        <RealtimeChat username={user?.username ?? ""} />
      </div>
      {/* <img
          src="/Chat.png"
          alt="chat"
          className="w-[530px] h-[892px] object-cover"
        /> */}
    </div>
  );
}
