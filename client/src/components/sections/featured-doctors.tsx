"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Calendar, Stethoscope, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { specializationService } from "@/lib/services/specialization.service"
import { Specialization } from "@/types/specialization"

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
    <div className="mx-auto max-w-7xl py-12">
      <header className="mb-6 md:mb-8 flex items-end justify-between">
        <div>
          <h2 id="top-doctors" className="text-2xl md:text-3xl font-semibold">
            Book an Appointment
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Choose a specialization and book your consultation today.</p>
        </div>
        <Link href="/appointments">
          <Button variant="outline">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : specializations.length === 0 ? (
        <Card className="p-12 text-center">
          <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Specializations Available</h3>
          <p className="text-muted-foreground">Please check back later for available consultations.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {specializations.map((spec, i) => (
            <motion.div
              key={spec._id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Link href="/appointments">
                <Card className="hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col">
                  <CardHeader className="p-0">
                    <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-primary/10 to-primary/5">
                      {spec.imageUrl ? (
                        <Image
                          src={spec.imageUrl}
                          alt={spec.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-green-100">
                          <Stethoscope className="h-16 w-16 text-primary/40" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 flex-1">
                    <div className="font-semibold text-lg group-hover:text-primary transition-colors">{spec.name}</div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{spec.description}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-lg font-bold text-primary">₹{spec.consultationFee}</span>
                      <span className="text-xs text-muted-foreground">per consultation</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full group-hover:bg-primary/90" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
