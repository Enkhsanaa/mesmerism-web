import Banner from "@/components/banner";
import Livechat from "@/components/livechat";
import Prize from "@/components/prize";
import YoutubeList from "@/components/youtubelist ";

export default async function Home() {
  return (
    <>
      <Banner />
      <div className="md:flex flex-wrap w-full gap-5">
        <div className="flex-1 flex flex-col gap-8">
          <Prize />
          <YoutubeList />
        </div>
        <div className="flex-1 max-w-[530px]">
          <Livechat />
        </div>
      </div>
    </>
  );
}
