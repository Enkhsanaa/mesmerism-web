import Link from "next/link";
import MesmerismIcon from "./icons/mesmerism";
import { Badge } from "./ui/badge";

export default function SiteHeader() {
  return (
    <header className="bg-dark-background">
      <nav
        aria-label="Global"
        className="flex w-full items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-x-4">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Mesmerism</span>
            <MesmerismIcon className="h-9 w-auto" />
          </Link>
          <Badge variant="secondary">beta</Badge>
        </div>

        <ul className="hidden md:flex items-center gap-x-8 text-sm text-white/80">
          <li>
            <Link href="/auth/login" className="hover:text-white">
              Нэвтрэх
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
