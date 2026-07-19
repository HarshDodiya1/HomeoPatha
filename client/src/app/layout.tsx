import type { Metadata } from "next";
import Script from "next/script";
import { Ubuntu, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { CartSidebar } from "@/components/cart-sidebar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
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
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1415509880633362');
fbq('track', 'PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1415509880633362&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <ScrollProgress height={4} color="bg-primary" position="top" />
        <Navbar />
        {children}
        <Footer />
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
