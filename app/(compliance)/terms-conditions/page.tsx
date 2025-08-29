import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Хэрэглэх Нөхцөл",
  description: "Mesmerism — Хэрэглэх Нөхцөл",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">
          Хэрэглэх Нөхцөл (Terms and Conditions)
        </h1>
        <p className="text-sm text-muted-foreground">
          Сүүлд шинэчилсэн огноо: {new Date().toLocaleDateString("mn-MN")}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Тодорхойлолтууд</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            “Бид”, “Компани” – Жи Жи Эм цогц энтертайнмент, Монгол улсад
            бүртгэлтэй хуулийн этгээд.
          </li>
          <li>
            “Та”, “Хэрэглэгч” – Вэбсайтад хандаж буй, эсвэл бүртгүүлж санал өгч
            буй хувь хүн.
          </li>
          <li>
            “Үйлчилгээ” – <span className="underline">www.mesmerism.mn</span>{" "}
            (цаашид “Вэбсайт”) хаягаар хүргэгдэж буй санал хураалтын платформ.
          </li>
          <li>
            “Санал”, “Star” – Хэрэглэгч өөрийн дансаар дамжуулан дуртай YouTube
            бүтээчид өгч буй нэг “Star” 500₮ үнэтэй нэгж.
          </li>
          <li>
            “Цэнэглэлт” – Хэрэглэгчийн дансанд хийгдэж буй мөнгөн дүн, хамгийн
            багадаа 5000₮ байна.
          </li>
          <li>
            “YouTube Champ 2025” – дөрвөн 7 хонгийн хугацаанд санал хураалт
            явагдах ба долоо хоног бүр 4 контент бүтээгч шалгарсаар нийт 16
            контент бүтээгч YOUTUBE CHAMP 2025-д оролцоно.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Ерөнхий нөхцөл</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Хэрэглэгч нь 18-аас дээш настай байх ёстой.</li>
          <li>
            Та зөвхөн өөрийн болон товчилсон нэрээр бүртгүүлж, үнэн зөв мэдээлэл
            өгөх үүрэгтэй.
          </li>
          <li>
            Та санал өгөхийн тулд дансаа хамгийн багадаа 5000₮-өөр цэнэглэх
            шаардлагатай.
          </li>
          <li>1 санал = 500₮, санал буцаах боломжгүй.</li>
          <li>
            Цэнэглэлтээс орж ирсэн нийт мөнгөн дүнг тэмцээний шагналын сан болон
            зохион байгуулалтын зардалд ашиглана.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          3. Хэрэглэгчийн бүртгэл ба аюулгүй байдал
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Та бүртгэлийн мэдээллээ үнэн зөв, бүрэн бөглөх үүрэгтэй.</li>
          <li>Нууц үг, дансны мэдээллээ хамгаалах хариуцлага таны өөрийнх.</li>
          <li>
            Хэрвээ та хэн нэгэн таны дансыг зөвшөөрөлгүй ашигласан гэж
            сэжиглэвэл бидэнд нэн даруй мэдэгдэнэ үү.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          4. Саналын ашиглалт ба хязгаарлалт
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Нэг хэрэглэгч олон санал өгөх боломжтой боловч хууль бус автомат
            саналын үйлдлийг хориглоно.
          </li>
          <li>
            Луйврын шинжтэй, системийг хуурсан үйлдэл илэрсэн тохиолдолд данс
            хасагдана.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">5. Буцаалт ба нөхөн төлбөр</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Санал, дансны цэнэглэлтийн төлбөр буцаах боломжгүй.</li>
          <li>
            Техникийн асуудлаас болж санал бүртгэгдэхгүй тохиолдолд хэрэглэгч
            бидэнтэй холбогдож гомдол гаргах эрхтэй.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6. Зохисгүй агуулга</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Хууль бус, доромж, садар самуун, бусдын нэр хүндэд халдсан агуулга
            оруулахыг хориглоно.
          </li>
          <li>
            Хуурамч мэдээлэл, вирус болон системд хортой код нийтлэхийг
            хориглоно.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">7. Оюуны өмч</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Вэбсайт дээр нийтлэгдсэн бүх текст, зураг, видео болон бусад контент
            нь компанийн өмч.
          </li>
          <li>
            Хэрэглэгч өөрийн оруулсан агуулгад эзэмших эрхтэй боловч, нийтлэх
            эрхийг компанид олгож байна.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          8. Үйлчилгээний тасалдал ба хариуцлага
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Бид санал хураалтын найдвартай ажиллагааг хангахыг зорих боловч
            тодорхой нөхцөлд тасалдал гарч болзошгүй.
          </li>
          <li>Үйлчилгээ “байгаа чигээрээ” (as-is) нөхцөлтэйгөөр олгогдоно.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">9. Эрх зүйн зохицуулалт</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Энэхүү нөхцөлд Монгол Улсын хууль тогтоомж хамаарна.</li>
          <li>
            Маргаан гарсан тохиолдолд эхлээд бидэнтэй холбогдон эвлэрлийн аргаар
            шийдвэрлэхийг зорих хэрэгтэй.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">10. Өөрчлөлт хийх эрх</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Компани нь энэхүү нөхцөлд аливаа өөрчлөлт хийх эрхтэй.</li>
          <li>
            Шинэчилсэн нөхцлийг вэбсайтад нийтэлснээр хүчин төгөлдөр болно.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">11. Холбоо барих</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Вэбсайтын хаяг: <span className="underline">www.mesmerism.mn</span>
          </li>
          <li>
            И-мэйл: <span className="underline">info@mesmerism.mn</span>
          </li>
          <li>
            Холбоо барих хуудас:{" "}
            <span className="underline">www.mesmerism.mn/contact</span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">12. Live Chat болон Сэтгэгдэл</h2>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">12.1 Live Chat үйлчилгээ</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Вэбсайт нь хэрэглэгчидтэй бодит цагийн харилцаа үүсгэх Live Chat
              үйлчилгээг агуулна.
            </li>
            <li>Live Chat нь 30 секундийн хоцрогдол (delay)-той байна.</li>
            <li>
              Чатыг хянах модератор ажиллаж байгаа бөгөөд зохисгүй, хууль
              зөрчсөн, ёс зүйгүй агуулгатай мессежүүдийг хянаж устгах эрхтэй.
            </li>
            <li>
              Доромж, гадуурхал, гүтгэлэг, хувийн мэдээлэл, линк, сурталчилгааг
              хориглоно.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">12.2 Сэтгэгдэл бичих</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              Хэрэглэгч YouTuber-ийн профайл хуудас дээр сэтгэгдэл үлдээх
              боломжтой.
            </li>
            <li>
              Доромж, сурталчилгаа, спам, хувийн мэдээлэл зэргийг нийтлэхийг
              хориглоно.
            </li>
            <li>
              Модератор хянах ба шаардлагатай тохиолдолд устгаж, хэрэглэгчийн
              эрхийг хязгаарлаж болно.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
