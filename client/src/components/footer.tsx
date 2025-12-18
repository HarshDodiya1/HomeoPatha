"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const footerLinks = {
  company: [
    { label: "About Us", href: "/doctors" },
    { label: "Our Doctors", href: "/appointments" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  services: [
    { label: "Book Appointment", href: "/appointments" },
    { label: "Shop Products", href: "/products" },
    { label: "Online Consultation", href: "/appointments" },
    { label: "Health Blog", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

export function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <Image
                src="/logo.png"
                alt="The HomeoPatha"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="font-semibold text-xl text-white group-hover:text-primary transition-colors">
                The HomeoPatha
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              Your trusted partner in homeopathic healthcare. Book appointments with certified doctors and get quality medicines delivered to your doorstep.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:info@homeopatha.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-primary" />
                info@homeopatha.com
              </a>
              <a href="tel:+15551234567" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-primary" />
                +1 (555) 123-4567
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                123 Healthcare Street, Medical City
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="font-semibold text-white text-lg mb-2">
                Subscribe to our newsletter
              </h3>
              <p className="text-gray-400">
                Get health tips, updates, and exclusive offers delivered to your inbox.
              </p>
            </div>
            <form className="flex gap-3 w-full lg:w-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 w-full lg:w-80 focus:border-primary"
              />
              <Button className="rounded-lg px-6 whitespace-nowrap">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} The HomeoPatha. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
