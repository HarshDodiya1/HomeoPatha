"use client"

import { motion } from "framer-motion"
import { Star, Quote, Loader2 } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { useCallback, useEffect, useState } from "react"
import { feedbackService } from "@/lib/services/feedback.service"
import { Feedback } from "@/types/feedback"

export function Testimonials() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  // Fetch feedbacks on mount
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoading(true)
        const response = await feedbackService.getPublishedFeedbacks({
          limit: 20,
          sortBy: "createdAt",
          sortOrder: "desc",
        })
        setFeedbacks(response.data.feedbacks)
      } catch (err: any) {
        console.error("Failed to fetch feedbacks:", err)
        setError(err.message || "Failed to load testimonials")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedbacks()
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name) return "?"
    const names = name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Check if social links exist
  const hasSocialLinks = (feedback: Feedback) => {
    return (
      feedback.socialLinks?.whatsapp ||
      feedback.socialLinks?.instagram ||
      feedback.socialLinks?.facebook
    )
  }

  // Don't render section if no feedbacks and not loading
  if (!isLoading && feedbacks.length === 0) {
    return null
  }

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            What Our Patients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real feedback from our valued patients and customers who trust us for their healthcare needs.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading testimonials...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Carousel */}
        {!isLoading && feedbacks.length > 0 && (
          <div className="relative">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex -ml-4 md:-ml-6">
                {feedbacks.map((feedback, index) => (
                  <motion.div
                    key={feedback._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-[0_0_90%] sm:flex-[0_0_45%] lg:flex-[0_0_33.333%] pl-4 md:pl-6"
                  >
                    <div className="group h-full bg-linear-to-b from-secondary/50 to-secondary/20 rounded-3xl p-6 md:p-8 border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                      {/* Quote Icon */}
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
                          <Quote className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: feedback.stars }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-amber-400 text-amber-400"
                          />
                        ))}
                        {Array.from({ length: 5 - feedback.stars }).map((_, i) => (
                          <Star
                            key={`empty-${i}`}
                            className="w-5 h-5 text-gray-300"
                          />
                        ))}
                      </div>

                      {/* Quote */}
                      <p className="text-foreground leading-relaxed mb-6 min-h-25 line-clamp-4">
                        "{feedback.quote}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg drop-shadow-sm">
                            {getUserInitials(feedback.userName)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground truncate">
                            {feedback.userName || "Anonymous"}
                          </div>
                          {feedback.userRole && (
                            <div className="text-sm text-muted-foreground truncate">
                              {feedback.userRole}
                            </div>
                          )}
                        </div>

                        {/* Social Links */}
                        {hasSocialLinks(feedback) && (
                          <div className="flex items-center gap-1.5">
                            {feedback.socialLinks?.whatsapp && (
                              <a
                                href={feedback.socialLinks.whatsapp.startsWith('http') 
                                  ? feedback.socialLinks.whatsapp 
                                  : `https://wa.me/${feedback.socialLinks.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-[#25D366] text-white hover:bg-[#20BD5A] hover:scale-110 transition-all duration-200 shadow-sm"
                                aria-label="WhatsApp"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                              </a>
                            )}
                            {feedback.socialLinks?.instagram && (
                              <a
                                href={feedback.socialLinks.instagram.startsWith('http') 
                                  ? feedback.socialLinks.instagram 
                                  : `https://instagram.com/${feedback.socialLinks.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-linear-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white hover:opacity-90 hover:scale-110 transition-all duration-200 shadow-sm"
                                aria-label="Instagram"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                              </a>
                            )}
                            {feedback.socialLinks?.facebook && (
                              <a
                                href={feedback.socialLinks.facebook.startsWith('http') 
                                  ? feedback.socialLinks.facebook 
                                  : `https://facebook.com/${feedback.socialLinks.facebook}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-[#1877F2] text-white hover:bg-[#166FE5] hover:scale-110 transition-all duration-200 shadow-sm"
                                aria-label="Facebook"
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="flex justify-center gap-2 mt-8">
              {feedbacks.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === selectedIndex
                      ? "w-8 bg-primary"
                      : "bg-primary/30 hover:bg-primary/50"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
