"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const MagneticLink = ({ href, children, isActive, onClick }: NavLinkProps) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!linkRef.current) return;

    const rect = linkRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    // Magnetic effect within 20px radius
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
    <motion.a
      ref={linkRef}
      href={href}
      onClick={onClick}
      className={cn(
        "relative px-4 py-2 text-sm font-medium transition-colors duration-300 magnetic-link underline-animation",
        isActive ? "text-white active" : "text-white/70 hover:text-white"
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
      {children}
    </motion.a>
  );
};

interface ShimmerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const ShimmerButton = ({ children, onClick, className }: ShimmerButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative overflow-hidden px-6 py-2.5 rounded-full text-sm font-semibold text-white",
        "bg-gradient-to-r from-[#0066FF] to-[#00A3FF]",
        "shadow-lg shadow-[#0066FF]/25",
        "shimmer-button",
        className
      )}
      whileHover={{
        y: -2,
        boxShadow: "0 20px 40px rgba(0, 102, 255, 0.3)",
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

const MobileNavLink = ({
  href,
  children,
  delay,
  onClick,
}: NavLinkProps & { delay: number }) => {
  return (
    <motion.a
      href={href}
      onClick={onClick}
      className="block text-3xl font-bold text-white hover:text-[#00A3FF] transition-colors"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{
        delay,
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.a>
  );
};

interface FloatingNavbarProps {
  isVisible: boolean;
}

const FloatingNavbar = ({ isVisible }: FloatingNavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("home");
  const { scrollY } = useScroll();

  const navLinks = [
    { id: "home", label: "Home", href: "#home" },
    { id: "specializations", label: "Specializations", href: "#specializations" },
    { id: "products", label: "Products", href: "#products" },
    { id: "about", label: "About", href: "#about" },
    { id: "contact", label: "Contact", href: "#contact" },
  ];

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 100);
  });

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
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

  const handleLinkClick = (id: string) => {
    setActiveLink(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.header
            className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 md:px-6"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.6,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            <motion.nav
              className={cn(
                "mt-5 w-full max-w-[1400px] flex items-center justify-between px-6 md:px-8",
                "rounded-full border glass"
              )}
              style={{
                borderColor: "rgba(255, 255, 255, 0.18)",
              }}
              animate={{
                height: isScrolled ? 60 : 70,
                backgroundColor: isScrolled
                  ? "rgba(10, 25, 47, 0.95)"
                  : "rgba(255, 255, 255, 0.08)",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              {/* Logo */}
              <motion.a
                href="#home"
                className="flex items-center gap-3"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }}
              >
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="navLogoGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#0066FF" />
                        <stop offset="100%" stopColor="#00CDB7" />
                      </linearGradient>
                    </defs>
                    <rect
                      x="15"
                      y="6"
                      width="10"
                      height="28"
                      rx="3"
                      fill="url(#navLogoGradient)"
                    />
                    <rect
                      x="6"
                      y="15"
                      width="28"
                      height="10"
                      rx="3"
                      fill="url(#navLogoGradient)"
                    />
                  </svg>
                </div>
                <span
                  className="hidden lg:block text-lg font-bold gradient-text"
                  style={{ fontFamily: "var(--font-satoshi), sans-serif" }}
                >
                  HealthCare Pro
                </span>
              </motion.a>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <MagneticLink
                    key={link.id}
                    href={link.href}
                    isActive={activeLink === link.id}
                    onClick={() => handleLinkClick(link.id)}
                  >
                    {link.label}
                  </MagneticLink>
                ))}
              </div>

              {/* CTA Button - Desktop */}
              <div className="hidden md:block">
                <ShimmerButton>Book Now</ShimmerButton>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden relative w-10 h-10 flex items-center justify-center text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.nav>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(10, 25, 47, 0.98) 0%, rgba(30, 58, 95, 0.98) 100%)",
                backdropFilter: "blur(20px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Menu Content */}
            <div className="relative h-full flex flex-col items-center justify-center gap-8 p-8">
              {navLinks.map((link, index) => (
                <MobileNavLink
                  key={link.id}
                  href={link.href}
                  delay={index * 0.05}
                  onClick={() => handleLinkClick(link.id)}
                >
                  {link.label}
                </MobileNavLink>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="mt-8"
              >
                <ShimmerButton
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg px-10 py-4"
                >
                  Book Now
                </ShimmerButton>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className="absolute bottom-10 flex gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/20"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.6, 0.2],
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
};

export default FloatingNavbar;
