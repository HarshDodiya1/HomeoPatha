"use client"
import { Heart, Leaf, Mail, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Appointments", href: "/appointments" },
  { label: "About Us", href: "/aboutus" },
  { label: "Contact", href: "/contact" },
]

const serviceLinks = [
  { label: "Book Appointment", href: "/appointments" },
  { label: "Shop Products", href: "/products" },
  { label: "Online Consultation", href: "/appointments" },
  { label: "Health Tips", href: "/aboutus" },
]

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "WhatsApp", href: "https://wa.me/+919521235103" },
  { label: "Facebook", href: "https://facebook.com" },
]

export function Footer() {
  return (
    <div className="text-foreground">
      <footer className="relative">
        {/* Top gradient border */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary to-transparent" />
        
        <div className="pt-16 pb-4 px-4 md:px-8 lg:px-12">
          {/* Main Footer Content */}
          <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-3xl border border-green-500/30 p-8 md:p-12 lg:p-14 shadow-2xl">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
              
              {/* Brand & Newsletter Section */}
              <div className="relative lg:col-span-1">
                <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                  <div className="relative">
                    <Image
                      src="/logo.png"
                      alt="The HomeoPatha"
                      width={48}
                      height={48}
                      className="w-12 h-12 object-contain rounded-xl bg-white/20 p-1"
                    />
                    <Leaf className="absolute -bottom-1 -right-1 w-4 h-4 text-green-200" />
                  </div>
                  <span className="font-bold text-2xl text-white group-hover:text-green-100 transition-colors">
                    The HomeoPatha
                  </span>
                </Link>
                
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-white">Stay Connected,</h2>
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-white">Stay Healthy ❤️</h2>
                
                {/* Decorative blur */}
                <div className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-green-400/20 blur-3xl pointer-events-none" />
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="mb-6 text-lg font-semibold text-white">Quick Links</h3>
                <nav className="space-y-3">
                  {navLinks.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="block text-green-100/70 transition-colors hover:text-white hover:translate-x-1 transform duration-200"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Services */}
              <div>
                <h3 className="mb-6 text-lg font-semibold text-white">Our Services</h3>
                <nav className="space-y-3">
                  {serviceLinks.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      className="block text-green-100/70 transition-colors hover:text-white hover:translate-x-1 transform duration-200"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Contact & Follow */}
              <div className="relative">
                <h3 className="mb-6 text-lg font-semibold text-white">Contact Us</h3>
                <div className="space-y-3 mb-8">
                  <a
                    href="mailto:thehomeopatha@gmail.com"
                    className="flex items-center gap-3 text-green-100/70 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 text-green-300" />
                    thehomeopatha@gmail.com
                  </a>
                  <div className="flex items-start gap-3 text-green-100/70">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-300" />
                    Mishrawari, Bathario Ka Chawk, Nagaur, Rajasthan 341001
                  </div>
                </div>

                <h4 className="mb-4 text-lg font-semibold text-white">Follow Us</h4>
                <div className="flex gap-6">
                  {socialLinks.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-100/70 hover:text-white transition-colors font-medium"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="relative mt-8">
            {/* Gradient border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            
            <div className="flex flex-col items-center justify-between gap-3 py-4 text-center md:flex-row">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} The HomeoPatha. All rights reserved.
              </p>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for your wellness
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
