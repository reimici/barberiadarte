import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "La Barberia d'Arte | Barbiere di Lusso a Rimini",
  description:
    "Prenota il tuo appuntamento alla Barberia d'Arte di Rimini. Taglio classico, rasatura tradizionale e cura della barba d'eccellenza. Stile British Vintage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
