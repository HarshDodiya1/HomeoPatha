"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Heart, Leaf, Phone, Mail, MapPin } from "lucide-react"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Doctors", href: "/doctors" },
  { label: "Appointments", href: "/appointments" },
  { label: "Products", href: "/products" },
  { label: "Contact", href: "/contact" },
]

const serviceLinks = [
  { label: "Book Appointment", href: "/appointments" },
  { label: "Shop Products", href: "/products" },
  { label: "Online Consultation", href: "/appointments" },
  { label: "Health Tips", href: "/products" },
]

const socialLinks = [
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "Twitter", href: "https://twitter.com" },
  { label: "Instagram", href: "https://instagram.com" },
]

export function Footer() {
  return (
    <div className="text-foreground">
      <footer className="relative">
        {/* Top gradient border */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        
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
                
                <h2 className="mb-3 text-2xl font-semibold tracking-tight text-white">Stay Connected</h2>
                <p className="mb-6 text-green-100/80 leading-relaxed">
                  Join our newsletter for the latest updates on homeopathy, wellness tips, and exclusive offers.
                </p>
                
                <form className="relative">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white/20 border-green-400/30 pr-14 text-white placeholder:text-green-200/60 backdrop-blur-sm focus:border-green-300 focus:ring-green-300/30"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-white text-green-700 transition-all hover:scale-105 hover:bg-green-50"
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Subscribe</span>
                  </Button>
                </form>
                
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
                    href="mailto:info@homeopatha.com"
                    className="flex items-center gap-3 text-green-100/70 hover:text-white transition-colors"
                  >
                    <Mail className="w-4 h-4 text-green-300" />
                    info@homeopatha.com
                  </a>
                  <a
                    href="tel:+15551234567"
                    className="flex items-center gap-3 text-green-100/70 hover:text-white transition-colors"
                  >
                    <Phone className="w-4 h-4 text-green-300" />
                    +1 (555) 123-4567
                  </a>
                  <div className="flex items-start gap-3 text-green-100/70">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-300" />
                    123 Healthcare Street, Medical City
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
