"use client"

import { motion, AnimatePresence, type Variants } from "framer-motion"
import Image from "next/image"
import { useState, useEffect, useCallback, useMemo } from "react"

// Particle component for floating background effect
interface ParticleProps {
  index: number
}

const Particle = ({ index }: ParticleProps) => {
  // Memoize random values to prevent recalculation on re-renders
  const particleValues = useMemo(() => ({
    randomX: Math.random() * 400 - 200,
    randomY: Math.random() * 400 - 200,
    randomDelay: Math.random() * 2,
    randomDuration: 4 + Math.random() * 5,
    randomSize: 4 + Math.random() * 10,
    randomOpacity: 0.2 + Math.random() * 0.4,
    startX: Math.random() * 100,
    startY: Math.random() * 100,
  }), [])

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: particleValues.randomSize,
        height: particleValues.randomSize,
        background: `radial-gradient(circle, rgba(34, 197, 94, ${particleValues.randomOpacity}), rgba(22, 163, 74, ${particleValues.randomOpacity * 0.5}))`,
        filter: "blur(1px)",
        left: `${particleValues.startX}%`,
        top: `${particleValues.startY}%`,
      }}
      initial={{
        x: 0,
        y: 0,
        opacity: 0,
        scale: 0,
      }}
      animate={{
        x: [0, particleValues.randomX * 0.5, particleValues.randomX],
        y: [0, particleValues.randomY * 0.5, particleValues.randomY],
        opacity: [0, particleValues.randomOpacity, 0],
        scale: [0, 1.5, 0.5],
      }}
      transition={{
        duration: particleValues.randomDuration,
        delay: particleValues.randomDelay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

// Animated leaf/plant SVG for homeopathy theme
const HomeopathyLogo = () => {
  return (
    <motion.div className="relative">
      {/* Outer glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)",
          transform: "scale(2.5)",
        }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [2.5, 2.8, 2.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner pulsing ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, transparent 60%, rgba(34, 197, 94, 0.3) 100%)",
          transform: "scale(1.5)",
        }}
        animate={{
          scale: [1.5, 1.8, 1.5],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Logo image with animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{
          duration: 1.2,
          ease: [0.34, 1.56, 0.64, 1], // Spring-like bounce
        }}
        className="relative z-10"
      >
        <motion.div
          animate={{
            y: [0, -8, 0],
            rotateY: [0, 10, 0, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/logo.png"
            alt="The HomeoPatha"
            width={140}
            height={140}
            className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

interface LogoLoaderProps {
  onComplete?: () => void
  duration?: number
}

export function LogoLoader({ onComplete, duration = 3000 }: LogoLoaderProps) {
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const brandName = "The HomeoPatha"
  const tagline = "Your trusted wellness partner"

  // Simulated loading progress
  useEffect(() => {
    const interval = 30
    const increment = 100 / (duration / interval)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          return 100
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [duration])

  // Trigger exit animation when progress is complete
  useEffect(() => {
    if (progress >= 100) {
      const exitTimer = setTimeout(() => {
        setIsExiting(true)
      }, 300)

      return () => clearTimeout(exitTimer)
    }
  }, [progress])

  // Notify parent when exit animation completes
  const handleExitComplete = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  const containerVariants: Variants = {
    initial: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 1.3,
      filter: "blur(20px)",
      transition: {
        duration: 0.7,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  }

  const logoExitVariants: Variants = {
    initial: {
      scale: 1,
      opacity: 1,
    },
    exit: {
      scale: 2.5,
      opacity: 0,
      transition: {
        duration: 0.7,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  }

  // Calculate stroke dashoffset for progress circle
  const circumference = 2 * Math.PI * 58
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
      {!isExiting && (
        <motion.div
          variants={containerVariants}
          initial="initial"
          exit="exit"
          className="fixed inset-0 z-100 flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 60%, #f0fdf4 100%)",
          }}
        >
          {/* Animated background gradient overlay */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)",
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <Particle key={i} index={i} />
            ))}
          </div>

          {/* Decorative circles in background */}
          <motion.div
            className="absolute w-150 h-150 rounded-full border border-green-200/30"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-125 h-125 rounded-full border border-green-300/20"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />

          {/* Logo with exit animation */}
          <motion.div
            variants={logoExitVariants}
            initial="initial"
            exit="exit"
            className="relative z-10 mb-6"
          >
            <HomeopathyLogo />

            {/* Circular progress indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width="180"
                height="180"
                viewBox="0 0 180 180"
                className="absolute"
                style={{ 
                  transform: "rotate(-90deg)",
                  top: "50%",
                  left: "50%",
                  marginTop: "-90px",
                  marginLeft: "-90px",
                }}
              >
                {/* Progress end dot */}
                <defs>
                  <linearGradient
                    id="progressGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="50%" stopColor="#16a34a" />
                    <stop offset="100%" stopColor="#15803d" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>

          {/* Brand name with character stagger animation */}
          <motion.div
            className="relative z-10 flex flex-wrap justify-center overflow-hidden mb-2"
            initial="hidden"
            animate="visible"
          >
            {brandName.split("").map((char, index) => (
              <motion.span
                key={index}
                className="text-3xl md:text-4xl lg:text-5xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #166534 0%, #22c55e 50%, #15803d 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  display: "inline-block",
                  textShadow: "0 2px 10px rgba(34, 197, 94, 0.2)",
                }}
                initial={{
                  opacity: 0,
                  y: 30,
                  rotateX: -90,
                  scale: 0.5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.6 + index * 0.03,
                  ease: [0.23, 1, 0.32, 1],
                }}
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="relative z-10 text-green-700/80 text-sm md:text-base font-medium tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: "easeOut" }}
          >
            {tagline}
          </motion.p>

          {/* Progress percentage */}
          <motion.div
            className="relative z-10 mt-8 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.span
              className="text-2xl md:text-3xl font-bold tabular-nums"
              style={{
                background: "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {Math.round(progress)}%
            </motion.span>
            <motion.span 
              className="text-xs md:text-sm text-green-600/70 mt-2 font-medium"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Preparing your wellness journey...
            </motion.span>
          </motion.div>

          {/* Decorative animated lines at bottom */}
          <motion.div
            className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-8 md:w-12 h-1 rounded-full"
                style={{
                  background:
                    i === 2
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : "rgba(34, 197, 94, 0.2)",
                }}
                animate={{
                  scaleX: i === 2 ? [1, 1.5, 1] : [1, 0.8, 1],
                  opacity: i === 2 ? [0.7, 1, 0.7] : [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>

          {/* Floating leaf decorations */}
          <motion.div
            className="absolute top-10 left-10 text-4xl opacity-30"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🌿
          </motion.div>
          <motion.div
            className="absolute top-20 right-16 text-3xl opacity-20"
            animate={{
              y: [0, 15, 0],
              rotate: [0, -15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          >
            🍃
          </motion.div>
          <motion.div
            className="absolute bottom-32 left-20 text-2xl opacity-25"
            animate={{
              y: [0, -10, 0],
              x: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            🌱
          </motion.div>
          <motion.div
            className="absolute bottom-40 right-24 text-3xl opacity-20"
            animate={{
              y: [0, 12, 0],
              rotate: [0, 20, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.5,
            }}
          >
            🌿
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
