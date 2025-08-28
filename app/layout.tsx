import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Geist_Mono, Manrope } from "next/font/google";
import { getUser, getUserBalance } from "@/lib/db/queries";
import { SWRConfig } from "swr";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
});

export const viewport: Viewport = {
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Mesmerism",
  description: "Mesmerism is a social media influencer platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="apple-mobile-web-app-title" content="Mesmerism" />
      </head>
      <body className={`${manrope.variable} ${geistMono.variable} antialiased`}>
        <SWRConfig>{children}</SWRConfig>
      </body>
    </html>
  );
}
