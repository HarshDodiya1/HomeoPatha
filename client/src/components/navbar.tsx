"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { LogOut, Menu, ShoppingCart, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/appointments", label: "Book Appointment" },
  { href: "/products", label: "Products" },
  { href: "/aboutus", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

// Magnetic link component with hover effect
interface MagneticLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const MagneticLink = ({ href, children, isActive, onClick }: MagneticLinkProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!linkRef.current) return;

    const rect = linkRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    const maxDistance = 20;
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

    if (distance < maxDistance * 3) {
      const strength = Math.min(1, (maxDistance * 3 - distance) / (maxDistance * 3));
      setPosition({
        x: distanceX * strength * 0.3,
        y: distanceY * strength * 0.3,
      });
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <Link href={href} legacyBehavior passHref>
      <motion.a
        ref={linkRef}
        onClick={onClick}
        className={cn(
          "relative px-5 py-2.5 text-base font-semibold transition-colors duration-300",
          isActive 
            ? "text-green-600 dark:text-green-400" 
            : "text-gray-800 hover:text-green-600 dark:text-white dark:hover:text-green-400"
        )}
        style={{
          x: position.x,
          y: position.y,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
      >
        <span className="relative z-10">{children}</span>
        {isActive && (
          <motion.div
            layoutId="active-nav-indicator"
            className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
        <motion.div
          className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-green-500 to-green-600 rounded-full"
          initial={{ width: 0, x: "-50%" }}
          whileHover={{ width: "60%", x: "-50%" }}
          transition={{ duration: 0.3 }}
        />
      </motion.a>
    </Link>
  );
};

// Shimmer button with gradient
interface ShimmerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  asChild?: boolean;
}

const ShimmerButton = ({ children, onClick, className }: ShimmerButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden px-7 py-3 rounded-full text-base font-bold text-white",
        "bg-gradient-to-r from-green-600 via-green-500 to-green-600 bg-[length:200%_100%]",
        "shadow-lg shadow-green-500/30",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        className
      )}
      whileHover={{
        y: -2,
        backgroundPosition: "100% 0",
        boxShadow: "0 20px 40px rgba(34, 197, 94, 0.35)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      {children}
    </motion.button>
  );
};

// Mobile nav link with stagger animation
const MobileNavLink = ({
  href,
  children,
  delay,
  onClick,
  isActive,
}: {
  href: string;
  children: React.ReactNode;
  delay: number;
  onClick?: () => void;
  isActive?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "block text-2xl md:text-3xl font-bold transition-colors",
          isActive
            ? "text-green-500"
            : "text-foreground hover:text-green-500 dark:text-white dark:hover:text-green-400"
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, initialize, logout } = useAuthStore();
  const { toggleCart, getItemCount } = useCartStore();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 100);
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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
      {/* Desktop Floating Navbar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 hidden lg:flex justify-center px-4 md:px-6"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.3,
          duration: 0.6,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        <motion.nav
          className={cn(
            "mt-5 flex items-center justify-between px-8 md:px-10",
            "rounded-full border backdrop-blur-xl"
          )}
          animate={{
            height: isScrolled ? 68 : 80,
            width: isScrolled ? "90%" : "100%",
            maxWidth: isScrolled ? "1100px" : "1400px",
            backgroundColor: isScrolled
              ? "rgba(255, 255, 255, 0.98)"
              : "rgba(255, 255, 255, 0.85)",
            borderColor: isScrolled
              ? "rgba(209, 250, 229, 0.8)"
              : "rgba(209, 250, 229, 0.4)",
            boxShadow: isScrolled
              ? "0 8px 32px rgba(34, 197, 94, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.08)"
              : "0 4px 24px rgba(0, 0, 0, 0.05)",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        >
          {/* Logo */}
          <Link href="/" className="relative z-20 flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="relative"
            >
              {/* Glow effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400/30 blur-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.5 }}
                transition={{ duration: 0.3 }}
              />
              <Image
                src="/logo.png"
                alt="The HomeoPatha Logo"
                width={48}
                height={48}
                className="relative w-12 h-12 object-contain"
              />
            </motion.div>
            <motion.span
              className="font-bold text-xl tracking-tight"
              style={{
                background: "linear-gradient(135deg, #166534 0%, #22c55e 50%, #16a34a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              HomeoPatha
            </motion.span>
          </Link>

          {/* Center Navigation */}
          <div className="absolute inset-0 flex flex-1 items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1 pointer-events-auto">
              {navItems.map((item) => (
                <MagneticLink
                  key={item.label}
                  href={item.href}
                  isActive={isActive(item.href)}
                >
                  {item.label}
                </MagneticLink>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="relative z-20 flex items-center gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Cart Button */}
                <motion.button
                  onClick={toggleCart}
                  className="relative p-3 rounded-full bg-green-50 hover:bg-green-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="h-6 w-6 text-green-700" />
                  {getItemCount() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white text-xs flex items-center justify-center font-semibold shadow-lg shadow-green-500/30"
                    >
                      {getItemCount()}
                    </motion.span>
                  )}
                </motion.button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-green-50 hover:bg-green-100 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-inner">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-base text-green-800 max-w-[100px] truncate">
                        {user.fullName}
                      </span>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-green-100">
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-green-50">
                      <Link href="/profile" className="flex items-center gap-2 py-2.5 text-base">
                        <User className="h-5 w-5 text-green-600" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-green-50">
                      <Link href="/orders" className="flex items-center gap-2 py-2.5 text-base">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-green-100" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive rounded-lg py-2.5 text-base"
                    >
                      <LogOut className="h-5 w-5 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <motion.button
                    className="px-5 py-2.5 text-base font-semibold text-green-700 hover:text-green-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/register">
                  <ShimmerButton>Sign Up</ShimmerButton>
                </Link>
              </>
            )}
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile Navbar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex lg:hidden justify-center px-4"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          delay: 0.3,
          duration: 0.6,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        <motion.nav
          className={cn(
            "mt-3 w-full flex items-center justify-between px-4 py-3",
            "rounded-2xl border backdrop-blur-xl"
          )}
          animate={{
            backgroundColor: isScrolled
              ? "rgba(255, 255, 255, 0.95)"
              : "rgba(255, 255, 255, 0.8)",
            borderColor: isScrolled
              ? "rgba(209, 250, 229, 0.8)"
              : "rgba(209, 250, 229, 0.4)",
            boxShadow: isScrolled
              ? "0 8px 32px rgba(34, 197, 94, 0.1)"
              : "0 4px 24px rgba(0, 0, 0, 0.05)",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="The HomeoPatha Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
            />
            <span
              className="font-bold text-base"
              style={{
                background: "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              HomeoPatha
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <motion.button
                onClick={toggleCart}
                className="relative p-2 rounded-full bg-green-50"
                whileTap={{ scale: 0.9 }}
              >
                <ShoppingCart className="h-5 w-5 text-green-700" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-semibold">
                    {getItemCount()}
                  </span>
                )}
              </motion.button>
            )}

            {/* Menu Toggle */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-full bg-green-50 hover:bg-green-100 transition-colors"
              whileTap={{ scale: 0.9 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5 text-green-700" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5 text-green-700" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, rgba(240, 253, 244, 0.98) 0%, rgba(220, 252, 231, 0.98) 50%, rgba(187, 247, 208, 0.98) 100%)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Floating particles for visual interest */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-32 h-32 rounded-full bg-green-300/20"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + i * 12}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 4 + i,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>

            {/* Menu Content */}
            <div className="relative h-full flex flex-col items-center justify-center gap-6 p-8 pt-24">
              {navItems.map((item, index) => (
                <MobileNavLink
                  key={item.label}
                  href={item.href}
                  delay={index * 0.05}
                  onClick={() => setIsMobileMenuOpen(false)}
                  isActive={isActive(item.href)}
                >
                  {item.label}
                </MobileNavLink>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-8 flex flex-col items-center gap-4"
              >
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 shadow-lg"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-green-800">{user.fullName}</div>
                        <div className="text-sm text-green-600">View Profile</div>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full px-6"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-4">
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="rounded-full px-8 border-green-300 text-green-700 hover:bg-green-50">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <ShimmerButton className="px-8">Sign Up</ShimmerButton>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Decorative dots */}
              <motion.div
                className="absolute bottom-10 flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-green-400"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.1,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
