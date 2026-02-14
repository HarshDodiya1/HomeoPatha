"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Calendar, Stethoscope, ArrowRight, Star, Clock, Users, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { specializationService } from "@/lib/services/specialization.service"
import { Specialization } from "@/types/specialization"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
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
    <section className="py-20 md:py-28 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
        >
          <div>
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-sm font-medium mb-4 border border-primary/20"
            >
              <Sparkles className="h-4 w-4" />
              Book Appointment
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Specialty</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Browse our specializations and book your consultation with expert homeopathy doctors.
            </p>
          </div>
          <Link href="/appointments">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full group border-primary/30 hover:bg-primary hover:text-white hover:border-primary"
            >
              View All Specialties
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-50" />
                <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-border/50">
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-muted animate-pulse rounded-lg w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded-lg w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded-lg w-2/3" />
                    <div className="h-12 bg-muted animate-pulse rounded-xl mt-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : specializations.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-gradient-to-br from-white to-secondary/30 rounded-3xl border border-border/50 shadow-lg"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-6">
              <Stethoscope className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No Specializations Available</h3>
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {specializations.map((spec) => (
              <motion.div key={spec._id} variants={itemVariants}>
                <Link href={`/appointments?specializationId=${spec._id}`} className="block group">
                  <div className="relative">
                    {/* Glow effect on hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-[28px] blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                    
                    <div className="relative bg-white dark:bg-card rounded-3xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/10">
                      {/* Top accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Image */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {spec.imageUrl ? (
                          <Image
                            src={spec.imageUrl}
                            alt={spec.name}
                            fill
                            className="object-cover transition-all duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/50 to-accent/10">
                            <div className="relative">
                              <div className="absolute inset-0 animate-ping">
                                <Stethoscope className="h-16 w-16 text-primary/20" />
                              </div>
                              <Stethoscope className="h-16 w-16 text-primary/60" />
                            </div>
                          </div>
                        )}
                        
                        {/* Gradient overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Floating badge */}
                        <div className="absolute top-4 right-4">
                          <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-card/90 backdrop-blur-sm shadow-lg flex items-center gap-1.5 border border-white/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-foreground">Available</span>
                          </div>
                        </div>

                        {/* Bottom content overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="flex items-center gap-1.5 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-4 w-4 fill-amber-400 text-amber-400 drop-shadow-sm"
                              />
                            ))}
                            <span className="text-sm text-white/90 ml-1 font-medium">(5.0)</span>
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                            {spec.name}
                          </h3>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {spec.description}
                        </p>

                        {/* Stats row */}
                        <div className="flex items-center gap-4 mb-5 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-primary" />
                            <span>30 min</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-primary" />
                            <span>1000+ consultations</span>
                          </div>
                        </div>

                        {/* Price and CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Starting from</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">₹{spec.consultationFee}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 gap-1.5"
                          >
                            <Calendar className="h-4 w-4" />
                            Book
                          </Button>
                        </div>
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
