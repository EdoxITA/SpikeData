import { Logo } from "@/components/ui/Logo";
import { CONTACT } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink px-6 py-12 text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo className="text-xl text-white" />
          <p className="mt-2 text-sm">Brindo, un progetto di Skalio.</p>
        </div>
        <div className="space-y-1 text-sm sm:text-right">
          <p>
            <a className="transition-colors hover:text-gold" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </p>
          <p>
            <a className="transition-colors hover:text-gold" href={CONTACT.phoneHref}>{CONTACT.phone}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
