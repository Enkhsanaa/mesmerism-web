import CoinIcon from "./icons/coin";
import MesmerismIcon from "./icons/mesmerism";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <header className="bg-dark-background">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        <div className="flex items-center gap-x-4">
          <a href="#" className="-m-1.5 p-1.5">
            <span className="sr-only">Mesmerism</span>
            <MesmerismIcon className="h-9 w-auto" />
          </a>
          <Badge variant="secondary">beta</Badge>
        </div>
        <div className="flex gap-x-4">
          <Button
            variant="secondary"
            className="font-extrabold text-base gap-x-2"
          >
            <CoinIcon className="size-6" />
            15,000
          </Button>
          <Avatar className="size-10">
            <AvatarImage src="https://github.com/enkhsanaa.png" />
            <AvatarFallback>EN</AvatarFallback>
          </Avatar>
        </div>
      </nav>
    </header>
  );
}
