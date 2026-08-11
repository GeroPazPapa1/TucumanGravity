import Link from "next/link";
import Logo from "./Logo";
import AccountMenu from "./AccountMenu";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-tg-border bg-tg-bg/95 backdrop-blur">
      <div className="w-full max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Logo size={40} />
          <div className="leading-none min-w-0">
            <p className="font-display text-lg tracking-wide truncate">DOWNHILL APP</p>
            <p className="text-[11px] uppercase tracking-widest text-tg-text-dim truncate">
              Todos los torneos, un solo lugar
            </p>
          </div>
        </Link>
        <div className="ml-auto">
          <AccountMenu />
        </div>
      </div>
      <div className="h-[3px] tg-gradient-bar-animated" />
    </header>
  );
}
