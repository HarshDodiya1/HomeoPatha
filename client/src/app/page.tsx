"use client"

import { useState, useEffect } from "react"
import { LogoLoader } from "@/components/logo-loader"
import { Hero } from "@/components/hero"
import { SocialSidebar } from "@/components/social-sidebar"
import { FeaturedDoctors } from "@/components/sections/featured-doctors"
import { FeaturedProducts } from "@/components/sections/featured-products"
import { ServicesOverview } from "@/components/sections/services-overview"
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
            {/* Sticky Social Sidebar */}
            <SocialSidebar />

            {/* Hero Section */}
            <Hero />

            {/* Featured Products */}
            <FeaturedProducts />

            {/* Featured Doctors / Appointment Booking */}
            <FeaturedDoctors />

            {/* Services Overview - Trust + How It Works Combined */}
            <ServicesOverview />

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

