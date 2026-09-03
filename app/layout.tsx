import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Caveat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["400", "600", "700"] });

export const metadata: Metadata = {
  title: "A wish in the snow",
  description:
    "Leave a Christmas wish. Search a name to find someone's wishes, or wander the snowfield and see what you find.",
  openGraph: {
    title: "A wish in the snow",
    description: "Leave a Christmas wish in the sea of snow.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${caveat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
