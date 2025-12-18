import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { CartSidebar } from "@/components/cart-sidebar";
import { Navbar } from "@/components/navbar";
import { PromoBanner } from "@/components/promo-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "The HomeoPatha - Your Trusted Homeopathy Partner",
  description:
    "Book trusted homeopathy doctors and get natural remedies delivered to your doorstep. Quality healthcare made easy.",
  keywords: ["homeopathy", "doctor appointment", "medical products", "healthcare", "consultation"],
  authors: [{ name: "The HomeoPatha" }],
  openGraph: {
    title: "The HomeoPatha - Your Trusted Homeopathy Partner",
    description: "Book trusted homeopathy doctors and get natural remedies delivered to your doorstep.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <PromoBanner />
        <Navbar />
        {children}
        <CartSidebar />
        <Toaster 
          position="top-center" 
          richColors 
          toastOptions={{
            style: {
              borderRadius: '12px',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
