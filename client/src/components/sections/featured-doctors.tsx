"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Calendar, Stethoscope, ArrowRight, Star } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { specializationService } from "@/lib/services/specialization.service"
import { Specialization } from "@/types/specialization"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export function FeaturedDoctors() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        const response = await specializationService.getSpecializations();
        setSpecializations(response.data.specializations.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch specializations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpecializations();
  }, []);

  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Book Appointment
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Choose Your Specialty
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Browse our specializations and book your consultation with expert homeopathy doctors.
            </p>
          </div>
          <Link href="/appointments">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full group"
            >
              View All Specialties
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded-lg w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded-lg w-full" />
                  <div className="h-4 bg-muted animate-pulse rounded-lg w-2/3" />
                  <div className="h-12 bg-muted animate-pulse rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : specializations.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white rounded-3xl border border-border/50"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Specializations Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Please check back later for available consultations.
            </p>
          </motion.div>
        ) : (
          /* Specialization Cards */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {specializations.map((spec) => (
              <motion.div key={spec._id} variants={itemVariants}>
                <Link href="/appointments" className="block group">
                  <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-500 hover:-translate-y-2">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {spec.imageUrl ? (
                        <Image
                          src={spec.imageUrl}
                          alt={spec.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <Stethoscope className="h-16 w-16 text-primary/40" />
                        </div>
                      )}
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Hover CTA */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-white rounded-full px-6 py-3 shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-foreground">Book Now</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">(5.0)</span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {spec.name}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {spec.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div>
                          <span className="text-sm text-muted-foreground">Starting from</span>
                          <div className="text-xl font-bold text-primary">₹{spec.consultationFee}</div>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Book
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
