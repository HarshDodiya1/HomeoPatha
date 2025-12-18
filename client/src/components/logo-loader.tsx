"use client"

import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"

interface LogoLoaderProps {
  onComplete?: () => void
  duration?: number
}

export function LogoLoader({ onComplete, duration = 2000 }: LogoLoaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, duration / 50)

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onComplete?.()
      }, 500)
    }, duration)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [duration, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
        >
          {/* Background subtle pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.6, 
              ease: [0.22, 1, 0.36, 1]
            }}
            className="flex flex-col items-center gap-8"
          >
            {/* Logo with glow effect */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                delay: 0.1
              }}
              className="relative"
            >
              {/* Glow ring */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ 
                  duration: 2, 
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="absolute -inset-8 bg-primary/20 rounded-full blur-2xl"
              />
              
              {/* Logo container */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="relative z-10"
              >
                <Image
                  src="/logo.png"
                  alt="The HomeoPatha"
                  width={120}
                  height={120}
                  className="w-28 h-28 md:w-32 md:h-32 object-contain drop-shadow-lg"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                delay: 0.3
              }}
              className="text-center"
            >
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                The HomeoPatha
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Your trusted wellness partner
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-48 md:w-64"
            >
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
