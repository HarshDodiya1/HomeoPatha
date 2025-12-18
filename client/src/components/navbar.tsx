"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { User, LogOut, ShoppingCart } from "lucide-react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/appointments", label: "Book" },
  { href: "/products", label: "Products" },
  { href: "/doctors", label: "Doctors" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [visible, setVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, initialize, logout } = useAuthStore();
  const { toggleCart, getItemCount } = useCartStore();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <motion.header
        className="fixed inset-x-0 top-8 z-50 mx-auto hidden w-full max-w-6xl px-4 lg:block"
      >
        <motion.nav
          animate={{
            backdropFilter: visible ? "blur(16px)" : "blur(0px)",
            boxShadow: visible
              ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
              : "none",
            width: visible ? "85%" : "100%",
            y: visible ? 4 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 50,
          }}
          className={cn(
            "relative mx-auto flex items-center justify-between rounded-full px-8 py-5 transition-colors duration-300",
            visible ? "bg-white/90 dark:bg-neutral-950/90" : "bg-white/60 dark:bg-neutral-950/60"
          )}
        >
          {/* Logo */}
          <Link
            href="/"
            className="relative z-20 flex items-center gap-2.5 group"
            aria-label="The HomeoPatha Home"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Image
                src="/logo.png"
                alt="The HomeoPatha Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
            </motion.div>
            <span className="font-semibold text-base tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
              HomeoPatha
            </span>
          </Link>

          {/* Center Navigation */}
          <motion.div
            onMouseLeave={() => setHoveredIndex(null)}
            className="absolute inset-0 flex flex-1 items-center justify-center"
          >
            <div className="flex items-center gap-1">
              {navItems.map((item, idx) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {hoveredIndex === idx && (
                    <motion.div
                      layoutId="navbar-hover"
                      className="absolute inset-0 h-full w-full rounded-full bg-muted/60"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className={cn(
                    "relative z-20",
                    isActive(item.href) && "text-primary font-semibold"
                  )}>
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Right Actions */}
          <div className="relative z-20 flex items-center gap-2">
            {isAuthenticated && user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full hover:bg-muted/60"
                  onClick={toggleCart}
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {getItemCount() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium"
                    >
                      {getItemCount()}
                    </motion.span>
                  )}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 px-3 rounded-full hover:bg-muted/60"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm max-w-[100px] truncate">
                        {user.fullName}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link href="/profile" className="flex items-center gap-2 py-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                      <Link href="/orders" className="flex items-center gap-2 py-2">
                        <ShoppingCart className="h-4 w-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium rounded-full hover:bg-muted/60"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="text-sm font-medium rounded-full px-5 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] hover:-translate-y-0.5 transition-all duration-200">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile Navbar */}
      <motion.header
        animate={{
          backdropFilter: visible ? "blur(16px)" : "blur(0px)",
          boxShadow: visible
            ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
            : "none",
          width: visible ? "95%" : "100%",
          borderRadius: visible ? "16px" : "0px",
          y: visible ? 8 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 mx-auto flex flex-col lg:hidden",
          visible ? "bg-white/90 dark:bg-neutral-950/90" : "bg-white/70 dark:bg-neutral-950/70"
        )}
        style={{ maxWidth: visible ? "calc(100% - 2rem)" : "100%", marginTop: visible ? "16px" : "0px" }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="The HomeoPatha Home"
          >
            <Image
              src="/logo.png"
              alt="The HomeoPatha Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span className="font-semibold text-base tracking-tight text-foreground">
              HomeoPatha
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full"
                onClick={toggleCart}
              >
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {getItemCount()}
                  </span>
                )}
              </Button>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full hover:bg-muted/60 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <IconX className="h-5 w-5 text-foreground" />
              ) : (
                <IconMenu2 className="h-5 w-5 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border/50"
            >
              <div className="px-4 py-4 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                <div className="pt-4 mt-4 border-t border-border/50 space-y-2">
                  {isAuthenticated && user ? (
                    <>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/60 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">View Profile</div>
                        </div>
                      </Link>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Link href="/login" className="flex-1">
                        <Button variant="outline" className="w-full rounded-full">
                          Login
                        </Button>
                      </Link>
                      <Link href="/register" className="flex-1">
                        <Button className="w-full rounded-full">Sign Up</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for content below (only needed on mobile when not visible) */}
      <div className="h-16 lg:h-0" />
    </>
  );
}
