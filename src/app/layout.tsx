import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { getAllEntries } from "@/lib/docs-fetcher";
import NavBar from "@/components/nav-bar";
import Footer from "@/components/footer";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: '--font-noto-sans-jp'
});


export const metadata: Metadata = {
  title: "Beutl"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rootEntry = await getAllEntries("ja");

  return (
    <html lang="en" className="dark">
      <body
        style={{ colorScheme: "dark" }}
        className={`${notoSansJP.variable} antialiased col`}
      >
        <NavBar rootEntry={rootEntry} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
