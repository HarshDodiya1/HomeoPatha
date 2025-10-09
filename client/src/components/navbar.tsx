"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

const navItems = [
  { href: "#", label: "Home" },
  { href: "#top-doctors", label: "Doctors" },
  { href: "#shop-essentials", label: "Products" },
  { href: "#about", label: "About Us" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState("Home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <nav
        className={`mx-auto max-w-7xl px-4 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "py-2 md:py-2.5" : "py-3 md:py-3"
        }`}
      >
        <Link
          href="#"
          className="flex items-center gap-2 group"
          aria-label="The HomeoPatha Home"
        >
          <div className="relative">
            <Image
              src="/logo.png"
              alt="The HomeoPatha Logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <span className="font-semibold tracking-tight text-pretty transition-colors duration-300 group-hover:text-primary">
            The HomeoPatha
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item, index) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setActiveItem(item.label)}
              className={`text-sm relative group transition-colors duration-300 ${
                activeItem === item.label
                  ? "text-primary"
                  : "text-foreground/80 hover:text-foreground"
              }`}
              style={{
                animation: `fadeInDown 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              {item.label}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                  activeItem === item.label
                    ? "w-full"
                    : "w-0 group-hover:w-full"
                }`}
              />
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            aria-label="Login"
            className="relative overflow-hidden group transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10">Login</span>
            <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
          <Button
            variant="outline"
            aria-label="Signup"
            className="relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <span className="relative z-10">Signup</span>
            <span className="absolute inset-0 bg-primary/5 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          </Button>
          <Button
            aria-label="Book Appointment"
            className="relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
              Book Appointment
            </span>
            <span className="absolute inset-0 bg-primary-foreground/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Button>
        </div>

        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                aria-label="Open menu"
                className="relative overflow-hidden group hover:scale-105 transition-transform duration-300"
              >
                <Menu className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-52 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300"
            >
              {navItems.map((item, index) => (
                <DropdownMenuItem
                  key={item.label}
                  asChild
                  className="cursor-pointer transition-colors duration-200"
                  style={{
                    animation: `fadeInLeft 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              ))}
              <div
                className="px-2 py-2"
                style={{ animation: "fadeInLeft 0.3s ease-out 0.25s both" }}
              >
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Signup
                  </Button>
                  <Button
                    size="sm"
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    Book
                  </Button>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <style jsx>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </header>
  );
}
