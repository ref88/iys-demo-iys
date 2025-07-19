import type { Metadata } from "next";
import { Dancing_Script, Libre_Baskerville } from "next/font/google";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing",
  weight: ["400", "700"],
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-libre",
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Im Your SiS - Holistische Womb Healing & Vruchtbaarheidsbehandelingen",
  description: "Ontdek holistische womb healing behandelingen bij Im Your SiS. Specialisaties in baarmoederbehandelingen, vruchtbaarheidsmassage, en geboortetrauma therapie.",
  keywords: "womb healing, baarmoederbehandeling, vruchtbaarheidsmassage, holistische therapie, energiewerk, geboortetrauma",
  authors: [{ name: "Im Your SiS" }],
  metadataBase: new URL('https://imyoursis.nl'),
  openGraph: {
    title: "Im Your SiS - Holistische Womb Healing",
    description: "Ontdek holistische womb healing behandelingen. Specialisaties in baarmoederbehandelingen, vruchtbaarheidsmassage, en geboortetrauma therapie.",
    images: ["/images/sis_card.jpg"],
    type: "website",
    url: "https://imyoursis.nl",
  },
  twitter: {
    card: "summary_large_image",
    title: "Im Your SiS - Holistische Womb Healing",
    description: "Ontdek holistische womb healing behandelingen bij Im Your SiS.",
    images: ["/images/sis_card.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        <link rel="canonical" href="https://imyoursis.nl" />
        <link rel="icon" type="image/png" href="/images/favicon.png" />
      </head>
      <body
        className={`${dancingScript.variable} ${libreBaskerville.variable} antialiased bg-gradient-to-br from-black via-gray-900 to-black min-h-screen text-white`}
      >
        {children}
      </body>
    </html>
  );
}
