import Header from "@/components/header";
import Banner from "@/components/banner";
import Prize from "@/components/prize";
import Livechat from "@/components/livechat";
import YoutubeList from "@/components/youtubelist ";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl"> 
      <Header />
      <Banner />
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
