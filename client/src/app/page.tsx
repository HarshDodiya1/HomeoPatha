"use client"

import { useState, useEffect } from "react"
import { LogoLoader } from "@/components/logo-loader"
import { Hero } from "@/components/hero"
import { TrustIndicators } from "@/components/sections/trust-indicators"
import { FeaturedDoctors } from "@/components/sections/featured-doctors"
import { HowItWorks } from "@/components/sections/how-it-works"
import { FeaturedProducts } from "@/components/sections/featured-products"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { Testimonials } from "@/components/sections/testimonials"
import { CTABanner } from "@/components/sections/cta-banner"
// import { Newsletter } from "@/components/sections/newsletter"
import { motion, AnimatePresence } from "framer-motion"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Check if user has visited before (session)
    const hasVisited = sessionStorage.getItem("hasVisitedHome")
    if (hasVisited) {
      setIsLoading(false)
      setShowContent(true)
    }
  }, [])

  const handleLoaderComplete = () => {
    sessionStorage.setItem("hasVisitedHome", "true")
    setIsLoading(false)
    setTimeout(() => setShowContent(true), 100)
  }

  return (
    <>
      {/* Logo Loader */}
      <AnimatePresence>
        {isLoading && <LogoLoader onComplete={handleLoaderComplete} duration={2500} />}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {showContent && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-dvh flex flex-col overflow-hidden"
          >
            {/* Hero Section */}
            <Hero />

            {/* Trust Indicators */}
            <TrustIndicators />

            {/* How It Works */}
            <HowItWorks />

            {/* Featured Doctors / Specializations */}
            <FeaturedDoctors />

            {/* Featured Products */}
            <FeaturedProducts />

            {/* Why Choose Us */}
            <WhyChooseUs />

            {/* Testimonials */}
            <Testimonials />

            {/* CTA Banner */}
            <CTABanner />

            {/* Newsletter - Removed */}
            {/* <Newsletter /> */}
          </motion.main>
        )}
      </AnimatePresence>
    </>
  )
}

