"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight, Heart } from "lucide-react"

const footerLinks = {
  company: [
    { label: "About Us", href: "/doctors" },
    { label: "Our Doctors", href: "/appointments" },
  ],
  services: [
    { label: "Book Appointment", href: "/appointments" },
    { label: "Shop Products", href: "/products" },
    { label: "Online Consultation", href: "/appointments" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
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
    <footer className="bg-white border-t border-gray-100">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <Image
                src="/logo.png"
                alt="The HomeoPatha"
                width={44}
                height={44}
                className="w-11 h-11 object-contain"
              />
              <span className="font-bold text-xl text-gray-900 group-hover:text-green-600 transition-colors">
                The HomeoPatha
              </span>
            </Link>
            <p className="text-gray-600 leading-relaxed mb-5 text-sm">
              Your trusted partner in homeopathic healthcare. Book appointments with certified doctors and get quality medicines delivered.
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5">
              <a href="mailto:info@homeopatha.com" className="flex items-center gap-2.5 text-gray-600 hover:text-green-600 transition-colors text-sm">
                <Mail className="w-4 h-4 text-green-600" />
                info@homeopatha.com
              </a>
              <a href="tel:+15551234567" className="flex items-center gap-2.5 text-gray-600 hover:text-green-600 transition-colors text-sm">
                <Phone className="w-4 h-4 text-green-600" />
                +1 (555) 123-4567
              </a>
              <div className="flex items-center gap-2.5 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 text-green-600 flex-shrink-0" />
                123 Healthcare Street, Medical City
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-green-600 transition-colors inline-flex items-center group text-sm"
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
            <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-green-600 transition-colors inline-flex items-center group text-sm"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Social */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2.5 mb-6">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-600 hover:text-green-600 transition-colors inline-flex items-center group text-sm"
                  >
                    {link.label}
                    <ArrowRight className="w-3 h-3 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div>
              <h4 className="font-medium text-gray-900 text-sm mb-3">Follow Us</h4>
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-green-600 hover:text-white transition-all"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} The HomeoPatha. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for your wellness
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
