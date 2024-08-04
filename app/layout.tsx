import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RemoveGrammarly from "@/components/RemoveGrammarly";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NewsHub",
  description: "Your trusted source for the latest news and information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RemoveGrammarly />
        {children}
      </body>
    </html>
  );
}
