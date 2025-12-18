"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, ShoppingBag, Play } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { useCallback, useEffect, useState } from "react"
import { siteSettingsService, HeroImage } from "@/lib/services/site-settings.service"

const defaultHeroImages = [
  {
    _id: "default-1",
    imageUrl: "/doctor-illustration-for-healthcare-hero.jpg",
    title: "Expert Consultations",
    subtitle: "Connect with certified homeopaths",
    isActive: true,
    order: 0,
    createdAt: "",
    updatedAt: "",
  },
]

export function Hero() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>(defaultHeroImages)
  const [isLoading, setIsLoading] = useState(true)
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Fetch hero images from backend
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await siteSettingsService.getActiveHeroImages()
        if (response.data.heroImages && response.data.heroImages.length > 0) {
          setHeroImages(response.data.heroImages)
        }
      } catch (error) {
        console.error("Failed to fetch hero images:", error)
        // Keep default images on error
      } finally {
        setIsLoading(false)
      }
    }
    fetchHeroImages()
  }, [])

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Full-screen Image Slider */}
      <div
        ref={emblaRef}
        className="absolute inset-0 w-full h-full overflow-hidden"
      >
        <div className="flex h-full">
          {heroImages.map((image, index) => (
            <div
              key={image._id}
              className="relative flex-[0_0_100%] h-full"
            >
              {image.imageUrl.startsWith('/') ? (
                <Image
                  src={image.imageUrl}
                  alt={image.title || "Hero image"}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                />
              ) : (
                <img
                  src={image.imageUrl}
                  alt={image.title || "Hero image"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="mx-auto max-w-7xl w-full px-4 md:px-6 py-24 md:py-32">
          <div className="max-w-2xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium border border-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                </span>
                Trusted by 10,000+ patients
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-6"
            >
              Book Doctor{" "}
              <span className="text-primary">Appointments</span>
              <br />
              <span className="text-white/80 font-normal text-3xl md:text-4xl lg:text-5xl">With Care & Confidence</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-white/80 max-w-xl leading-relaxed mb-8"
            >
              Find trusted homeopathy doctors, schedule appointments seamlessly, and access quality medical products — all in one place.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link href="/appointments">
                <Button
                  size="lg"
                  className="w-full sm:w-auto rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 group"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full px-8 py-6 text-base font-semibold border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  View Products
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-8 md:gap-12"
            >
              {[
                { value: "500+", label: "Doctors" },
                { value: "10K+", label: "Appointments" },
                { value: "98%", label: "Satisfaction" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-white/60 mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {heroImages.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {heroImages.map((image, index) => (
            <button
              key={image._id}
              onClick={() => scrollTo(index)}
              className={`relative h-1 rounded-full transition-all duration-500 ${
                index === selectedIndex
                  ? "w-12 bg-white"
                  : "w-6 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === selectedIndex && (
                <motion.div
                  layoutId="activeSlide"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-8 right-8 z-20 hidden lg:flex flex-col items-center gap-2"
      >
        <span className="text-white/60 text-sm font-medium tracking-widest rotate-90 origin-center translate-x-6">SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 rounded-full bg-white/60" />
        </motion.div>
      </motion.div>
    </section>
  )
}
