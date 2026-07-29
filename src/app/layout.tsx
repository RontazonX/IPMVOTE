import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Voting Formatur PC IPM Wirobrajan",
  description: "Website resmi pemilihan formatur PC IPM Wirobrajan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className={clsx(inter.className, "h-full bg-slate-50 text-slate-900")}>
        {children}
      </body>
    </html>
  );
}
