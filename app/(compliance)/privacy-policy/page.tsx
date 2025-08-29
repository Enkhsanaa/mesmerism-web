import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Нууцлалын бодлого",
  description: "Хэрэглэгчийн нууцлалын бодлого",
};

export default function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Хэрэглэгчийн нууцлалын бодлого</h1>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Хүчинтэй огноо: 2025 оны 08-р сарын 07</p>
          <p>Сүүлд шинэчилсэн: 2025 оны 08-р сарын 07</p>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Ерөнхий мэдээлэл</h2>
        <p>
          www.mesmerism.mn (цаашид “Бид”, “Манай сайт” гэх) нь хэрэглэгчдийн
          хувийн мэдээллийг хамгаалах үүрэгтэй. Энэхүү Нууцлалын бодлого нь
          манай вэбсайтад бүртгүүлэх, саналаа өгөх, контент үзэх, чатлах болон
          бусад үйлчилгээг ашиглах явцад цуглуулах, ашиглах, хадгалах мэдээллийг
          хэрхэн зохицуулахыг тодорхойлно.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">1. Цуглуулж болох мэдээлэл</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Нэр</li>
          <li>И-мэйл хаяг</li>
          <li>Утасны дугаар</li>
          <li>Нэвтрэх нэр, нууц үг</li>
          <li>Төлбөрийн мэдээлэл (аюулгүй байдлаар дамжин хадгалагдана)</li>
          <li>Санал хураалт, лайв чат, сэтгэгдлийн лог</li>
          <li>IP хаяг, төхөөрөмжийн мэдээлэл</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">2. Мэдээллийг ашиглах зорилго</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Бүртгэл үүсгэх, удирдах</li>
          <li>Санал хураалт зохион байгуулах</li>
          <li>Хувийн тохиргоо хадгалах</li>
          <li>Харилцаа холбоо тогтоох</li>
          <li>Хуулийн шаардлага биелүүлэх</li>
          <li>Зөрчил илрүүлэх, таслан зогсоох</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">3. Мэдээлэл хадгалах хугацаа</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Хэрэглэгчийн бүртгэл устах хүртэл</li>
          <li>Хуулиар заасан хугацаанд</li>
          <li>Уралдаан дууссанаас хойш 1 жил</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          4. Мэдээллийг гуравдагч этгээдэд дамжуулах нөхцөл
        </h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Төлбөрийн системд</li>
          <li>Хууль сахиулах байгууллагад</li>
          <li>IT үйлчилгээ үзүүлэгчид</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          5. Күүки (Cookies) болон Tracking
        </h2>
        <p>
          Хэрэглэгчийн туршлагыг сайжруулахын тулд cookies ашиглаж болно.
          Хэрэглэгч өөрийн браузераас cookies-ийг идэвхгүй болгож болно.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">6. Мэдээлэл хамгаалалт</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>SSL шифрлэл</li>
          <li>Давхар баталгаажуулалт</li>
          <li>Хандалтын хяналт, лог бүртгэл</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">7. Хүүхдийн мэдээлэл</h2>
        <p>
          13 нас хүрээгүй хүүхдэд зориулагдаагүй. Хэрэв ийм мэдээлэл цуглуулсан
          бол устгана.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">8. Хэрэглэгчийн эрх</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Өөрийн мэдээллийг үзэх, засах, устгах</li>
          <li>Маркетингээс татгалзах</li>
          <li>Гомдол гаргах</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">9. Бодлогын өөрчлөлт</h2>
        <p>
          Шаардлагад нийцүүлэн шинэчилж болно. Шинэ хувилбарыг сайтад
          байршуулна.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">10. Холбоо барих</h2>
        <p>И-мэйл: support@mesmerism.mn</p>
      </section>
    </main>
  );
}
