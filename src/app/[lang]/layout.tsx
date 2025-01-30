import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { getAllEntries } from "@/lib/docs-fetcher";
import NavBar from "@/components/nav-bar";
import Footer from "@/components/footer";
import { LanguageProvider } from "../i18n/client";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: '--font-noto-sans-jp'
});


export const metadata: Metadata = {
  title: "Beutl"
};

export default async function RootLayout({
  children,
  params: { lang }
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  const rootEntry = await getAllEntries(lang);

  return (
    <html lang={lang} className="dark">
      <body
        style={{ colorScheme: "dark" }}
        className={`${notoSansJP.variable} antialiased col`}
      >
        <LanguageProvider initialLanguage={lang}>
          <NavBar rootEntry={rootEntry} lang={lang} />
          {children}
          <Footer lang={lang} />
        </LanguageProvider>
      </body>
    </html>
  );
}
