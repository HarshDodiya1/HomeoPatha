import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { CartSidebar } from "@/components/cart-sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "The HomeoPatha - Your Trusted Homeopathy Partner",
  description:
    "Book trusted homeopathy doctors and get natural remedies delivered to your doorstep. Quality healthcare made easy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <CartSidebar />
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
