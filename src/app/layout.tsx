import type {Metadata} from "next";
import localFont from "next/font/local";
import "./globals.css";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import {SpeedInsights} from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"
import WebSiteAnalyze from "@/Components/WebSiteAnalyze";

export const runtime = "nodejs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "🚣‍♀️划水网 - 一个划水的网站",
  description: "划水网是一个划水的网站",
  keywords: ["划水", "水", "网站"],
};


export default async function RootLayout({children}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={'h-full'}>
    <body
      className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
    >
    <AntdRegistry>
      {children}
    </AntdRegistry>
    <SpeedInsights />
    <Analytics />
    </body>
    <WebSiteAnalyze />
    </html>
  );
}
