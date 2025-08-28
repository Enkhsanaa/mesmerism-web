import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-dark-background border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* <div className="flex items-center justify-between">
          <div className="hidden md:flex gap-x-10 text-white/80">
            <Link href="#" className="hover:text-white">
              Link One
            </Link>
            <Link href="#" className="hover:text-white">
              Link Two
            </Link>
            <Link href="#" className="hover:text-white">
              Link Three
            </Link>
            <Link href="#" className="hover:text-white">
              Link Four
            </Link>
            <Link href="#" className="hover:text-white">
              Link Five
            </Link>
          </div>

          <div className="flex items-center gap-x-4 text-white/80">
            <a aria-label="Facebook" href="#" className="hover:text-white">
              fb
            </a>
            <a aria-label="Instagram" href="#" className="hover:text-white">
              ig
            </a>
            <a aria-label="X" href="#" className="hover:text-white">
              x
            </a>
            <a aria-label="LinkedIn" href="#" className="hover:text-white">
              in
            </a>
            <a aria-label="YouTube" href="#" className="hover:text-white">
              yt
            </a>
          </div>
        </div> */}

        <div className="my-6 h-px w-full bg-white/10" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-y-4 text-white/70 text-sm">
          <p>© {year} Mesmerism. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex items-center gap-x-6">
            <Link href="/privacy-policy" className="hover:text-white">
              Нууцлалын бодлого
            </Link>
            <Link href="/terms-conditions" className="hover:text-white">
              Үйлчилгээний нөхцөл
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
