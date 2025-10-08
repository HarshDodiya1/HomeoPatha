"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const navItems = [
  { href: "#", label: "Home" },
  { href: "#top-doctors", label: "Doctors" },
  { href: "#shop-essentials", label: "Products" },
  { href: "#about", label: "About Us" },
  { href: "#contact", label: "Contact" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav className="mx-auto max-w-7xl px-4 py-3 md:px-6 flex items-center justify-between">
        <Link href="#" className="flex items-center gap-2" aria-label="The HomeoPatha Home">
          <Image 
            src="/logo.png" 
            alt="The HomeoPatha Logo" 
            width={32} 
            height={32}
            className="h-8 w-8 object-contain"
          />
          <span className="font-semibold tracking-tight text-pretty">The HomeoPatha</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="text-sm hover:underline underline-offset-4">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" aria-label="Login">
            Login
          </Button>
          <Button variant="outline" aria-label="Signup">
            Signup
          </Button>
          <Button aria-label="Book Appointment">Book Appointment</Button>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.label} asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
              <div className="px-2 py-2">
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" variant="ghost">
                    Login
                  </Button>
                  <Button size="sm" variant="outline">
                    Signup
                  </Button>
                  <Button size="sm">Book</Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  )
}
