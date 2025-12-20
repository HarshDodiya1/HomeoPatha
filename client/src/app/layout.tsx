import type { Metadata } from "next";
import { Ubuntu, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { CartSidebar } from "@/components/cart-sidebar";
import { Navbar } from "@/components/navbar";
import { PromoBanner } from "@/components/promo-banner";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

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
      <body className={`${ubuntu.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {/* <PromoBanner /> */}
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
