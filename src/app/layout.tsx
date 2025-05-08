import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
// GeistMono is part of GeistSans, no separate import needed
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layout/AppLayout";

const geistSans = GeistSans;
// const geistMono = GeistMono; // Removed as it's included in GeistSans

export const metadata: Metadata = {
  title: "StoreFlow",
  description: "Streamline, track, and manage new store launches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased`} // Removed geistMono.variable
      >
        <AppLayout>{children}</AppLayout>
        <Toaster />
      </body>
    </html>
  );
}
