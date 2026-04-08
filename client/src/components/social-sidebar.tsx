"use client"

import { motion } from "framer-motion"
import { Facebook, Instagram, MessageCircle } from "lucide-react"
import Link from "next/link"

const socialLinks = [
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://www.facebook.com/share/1CfRHVR3PE",
    color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    hoverShadow: "hover:shadow-[#1877F2]/30",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://www.instagram.com/the_homeopatha",
    color: "hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white hover:border-transparent",
    hoverShadow: "hover:shadow-[#E1306C]/30",
  },
  {
    name: "WhatsApp",
    icon: MessageCircle,
    href: "https://wa.me/+919521235103",
    color: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
    hoverShadow: "hover:shadow-[#25D366]/30",
  },
]

const containerVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 1,
      duration: 0.6,
      staggerChildren: 0.1,
      delayChildren: 1.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.8 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export function SocialSidebar() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-1"
    >
      {/* Vertical line top */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 40 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="w-px bg-gradient-to-b from-transparent via-primary/30 to-primary/50"
      />

      {/* Social icons container */}
      <div className="flex flex-col items-center gap-3 py-3 px-2 rounded-full bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg shadow-black/5">
        {socialLinks.map((social) => (
          <motion.div key={social.name} variants={itemVariants}>
            <Link
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className={`
                group relative flex items-center justify-center w-10 h-10 rounded-full
                bg-white dark:bg-card border border-border/50
                text-muted-foreground transition-all duration-300
                shadow-sm hover:shadow-xl ${social.color} ${social.hoverShadow}
              `}
            >
              <social.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              
              {/* Tooltip */}
              <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-foreground text-background text-sm font-medium whitespace-nowrap opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                {social.name}
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-foreground rotate-45" />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Vertical line bottom */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 40 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent"
      />

      {/* "Follow Us" text rotated */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="mt-2 text-xs font-medium text-muted-foreground tracking-widest"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
      >
        FOLLOW US
      </motion.span>
    </motion.div>
  )
}
