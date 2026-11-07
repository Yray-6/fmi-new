import type { Metadata } from "next";
import { Alan_Sans, Anek_Bangla, M_PLUS_Code_Latin } from "next/font/google";
import { Providers } from "@/app/components/providers";
import "./globals.css";

const alanSans = Alan_Sans({
  variable: "--font-alan-sans",
  subsets: ["latin"],
  weight: ["700"],
});

const anekBangla = Anek_Bangla({
  variable: "--font-anek-bangla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mPlusCodeLatin = M_PLUS_Code_Latin({
  variable: "--font-mplus-code",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "FMI",
  description:
    "From real-time performance tracking to ownership transfers and in-depth analytics, everything you need to manage your investments is right here.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${alanSans.variable} ${anekBangla.variable} ${mPlusCodeLatin.variable} h-full antialiased`}
    >
      <head>
        {/* Loaded outside next/font: Next has no size-adjust metrics for these faces. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cascadia+Code:wght@700&family=Stack+Sans+Notch:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
