import { Logo } from "@/components/ui/Logo";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="#top" aria-label="Brindo, torna in cima" className="text-white">
          <Logo className="text-lg" />
        </a>
        <a
          href="#contatti"
          className="rounded-full bg-gold px-4 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <span className="hidden sm:inline">Prova Brindo nel tuo locale</span>
          <span className="sm:hidden">Prova Brindo</span>
        </a>
      </div>
    </header>
  );
}
