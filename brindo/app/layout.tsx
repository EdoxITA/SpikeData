import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TITLE = "Brindo. Niente fila, solo la serata.";
const DESCRIPTION =
  "Gli ordini al bar diventano digitali, i clienti diventano contatti, e i contatti tornano. Brindo elimina la fila al bar di discoteche e locali notturni, a costo zero per il locale.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Brindo",
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "Brindo",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
