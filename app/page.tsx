import Header from "@/components/header";
import Banner from "@/components/banner";
import Prize from "@/components/prize";
import Livechat from "@/components/livechat";
import YoutubeList from "@/components/youtubelist ";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Header />
      <Banner />
      <div className="mx-auto">
        <p>Hello {data.user.email}</p>
      </div>
      <div className="mx-auto flex">
        <div className="mx-auto">
          <Prize />
          <YoutubeList />
        </div>
        <Livechat />
      </div>
    </div>
  );
}
