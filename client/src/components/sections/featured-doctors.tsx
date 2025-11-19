"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Star, User } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { doctorService } from "@/lib/services/doctor.service"
import { Doctor } from "@/types/doctor"

export function FeaturedDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorService.getAllDoctors({ page: 1, limit: 4 });
        setDoctors(response.data.doctors);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="mx-auto max-w-7xl py-12">
      <header className="mb-6 md:mb-8 flex items-end justify-between">
        <div>
          <h2 id="top-doctors" className="text-2xl md:text-3xl font-semibold">
            Our Top Doctors
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Book trusted specialists with top ratings.</p>
        </div>
        <Link href="/doctors">
          <Button variant="outline">View All</Button>
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {doctors.map((d, i) => (
            <motion.div
              key={d._id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Link href={`/doctors/${d._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-muted">
                      {d.images && d.images[0] ? (
                        <Image
                          src={d.images[0]}
                          alt={d.userId.fullName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="font-semibold">{d.userId.fullName}</div>
                    <p className="text-sm text-primary">{d.specialization}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{d.rating.toFixed(1)}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" size="sm">
                      Book Appointment
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
