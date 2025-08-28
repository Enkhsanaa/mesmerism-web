import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Үйлчилгээний нөхцөл</h1>
        <p className="text-sm text-muted-foreground">
          Сүүлд шинэчилсэн огноо: {new Date().getFullYear()} он
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ерөнхий заалт</h2>
        <p>
          Манай платформ, вебсайт болон түүнтэй холбоотой бүх үйлчилгээ (цаашид
          "Үйлчилгээ" гэх)-г ашигласнаар та дараах Үйлчилгээний нөхцөлийг
          зөвшөөрч хүлээн зөвшөөрсөнд тооцогдоно. Хэрэв та эдгээр нөхцөлийг
          зөвшөөрөхгүй бол Үйлчилгээг ашиглахгүй байхыг хүсье.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Бүртгэл ба аюулгүй байдал</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Та зөв, үнэн зөв мэдээллээр бүртгүүлж, шинэчилж байх үүрэгтэй.
          </li>
          <li>
            Данс, нууц үг, нэвтрэлтийн мэдээллээ хамгаалах үүрэг танд хамаарна.
          </li>
          <li>Таны дансаар хийгдсэн бүх үйлдэл таны хариуцлага байна.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Хориотой үйл ажиллагаа</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Хууль бус, луйврын, айлган сүрдүүлэх, доромжлох агуулга түгээх
          </li>
          <li>Оюуны өмч зөрчих, зөвшөөрөлгүй хандалт хийх оролдлого</li>
          <li>Системийн ажиллагаанд саад учруулах аливаа оролдлого</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Оюуны өмч</h2>
        <p>
          Үйлчилгээнд багтсан бүх контент, тэмдэг, дизайн, програм хангамж нь
          холбогдох эрх эзэмшигчдийн өмч бөгөөд зохиогчийн эрх зэрэг хуулиар
          хамгаалагдсан. Зөвшөөрөлгүй хуулбарлах, түгээхийг хориглоно.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Төлбөр ба гүйлгээ</h2>
        <p>
          Хэрэв төлбөртэй үйлчилгээ ашиглавал гуравдагч талын төлбөрийн
          системээр дамжин гүйлгээ хийгдэж болно. Буцаалт, татгалзалт, шимтгэл
          зэрэг нь холбогдох нөхцөл, хууль дүрмээр зохицуулагдана.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Хариуцлагын хязгаарлалт</h2>
        <p>
          Үйлчилгээг "байгаагаар нь" хүргэдэг. Шууд, шууд бус баталгаа өгдөггүй.
          Болзошгүй алдаа, тасалдал, өгөгдлийн алдагдал зэрэгт бид хариуцлага
          хүлээхгүй. Хуульд тусгайлан заасан тохиолдлыг эс тооцно.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Гуравдагч талын холбоос</h2>
        <p>
          Манай үйлчилгээ гуравдагч талын вебсайт, үйлчилгээ рүү холбож болно.
          Бид тэдгээрийн контент, практикт хяналт тавьдаггүй бөгөөд хариуцлага
          хүлээхгүй.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Нууцлалын бодлого</h2>
        <p>
          Таны хувийн мэдээлэлтэй холбоотой асуудлыг манай Нууцлалын бодлогоор
          зохицуулна. Дэлгэрэнгүйг тус хуудсаас үзнэ үү.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Нөхцөл өөрчлөх</h2>
        <p>
          Бид энэхүү нөхцөлийг үе үе шинэчилж болно. Шинэчилсэн хувилбар нь
          вебсайт дээр нийтлэгдсэн даруй хүчин төгөлдөр болно.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Холбогдох хууль ба маргаан</h2>
        <p>
          Энэхүү нөхцөл нь холбогдох Монгол Улсын хуулиар зохицуулагдана.
          Маргааныг талууд хэлэлцээрээр шийдвэрлэх, шийдвэрлэж чадахгүй
          тохиолдолд эрх бүхий шүүхэд хандана.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Холбоо барих</h2>
        <p>
          Энэхүү Үйлчилгээний нөхцөлтэй холбоотой асуулт, хүсэлтээ
          support@example.com хаягаар илгээж холбогдоно уу.
        </p>
      </section>
    </main>
  );
}
