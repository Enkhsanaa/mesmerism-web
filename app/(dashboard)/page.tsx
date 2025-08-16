import Banner from "@/components/banner";
import Livechat from "@/components/livechat";
import Prize from "@/components/prize";
import YoutubeList from "@/components/youtubelist ";

export default async function Home() {
  return (
    <>
      <Banner />
      <div className="mx-auto flex">
        <div className="mx-auto">
          <Prize />
          <YoutubeList />
        </div>
        <Livechat />
      </div>
    </>
  );
}
