"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { useCallback, useEffect, useState } from "react"

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Patient",
    avatar: "/avatars/avatar-1.jpg",
    text: "The booking experience was incredibly smooth. Found an excellent homeopathy doctor who really understood my condition. Highly recommend this platform!",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Regular Customer",
    avatar: "/avatars/avatar-2.jpg",
    text: "Fast delivery for medicines I needed urgently. The quality of products is exceptional and prices are very reasonable compared to local pharmacies.",
    rating: 5,
  },
  {
    id: 3,
    name: "Aarav Kumar",
    role: "Patient",
    avatar: "/avatars/avatar-3.jpg",
    text: "Trustworthy platform with excellent customer support. The doctors are knowledgeable and the consultation was very thorough and professional.",
    rating: 5,
  },
  {
    id: 4,
    name: "Sarah Johnson",
    role: "New Patient",
    avatar: "/avatars/avatar-4.jpg",
    text: "As someone new to homeopathy, this platform made it easy to find the right doctor. The whole process from booking to consultation was seamless.",
    rating: 5,
  },
  {
    id: 5,
    name: "Rahul Verma",
    role: "Regular Customer",
    avatar: "/avatars/avatar-5.jpg",
    text: "Been using HomeoPatha for over a year now. Consistent quality service, genuine medicines, and doctors who actually care about your health.",
    rating: 5,
  },
]

export function Testimonials() {
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

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
    }
  }, [emblaApi, onSelect])

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

        {/* Carousel */}
        <div className="relative">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex -ml-4 md:-ml-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex-[0_0_90%] sm:flex-[0_0_45%] lg:flex-[0_0_33.333%] pl-4 md:pl-6"
                >
                  <div className="group h-full bg-gradient-to-b from-secondary/50 to-secondary/20 rounded-3xl p-6 md:p-8 border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                    {/* Quote Icon */}
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary">
                        <Quote className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-foreground leading-relaxed mb-6 min-h-[100px]">
                      "{testimonial.text}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                        {testimonial.avatar ? (
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-semibold text-lg">
                            {testimonial.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
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
      </div>
    </section>
  )
}
