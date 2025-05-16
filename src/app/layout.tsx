
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider

const geistSans = GeistSans;

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
        className={`${geistSans.variable} antialiased`}
      >
        <AuthProvider> {/* Wrap AppLayout with AuthProvider */}
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
