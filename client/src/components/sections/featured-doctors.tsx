"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

const doctors = [
  { id: 1, name: "Dr. Amelia Hart", spec: "Cardiologist", rating: 4.9 },
  { id: 2, name: "Dr. Noah Patel", spec: "Dermatologist", rating: 4.8 },
  { id: 3, name: "Dr. Sofia Lin", spec: "Pediatrician", rating: 4.9 },
  { id: 4, name: "Dr. Ethan Kim", spec: "Orthopedic", rating: 4.7 },
]

export function FeaturedDoctors() {
  return (
    <div className="mx-auto max-w-7xl py-12">
      <header className="mb-6 md:mb-8 flex items-end justify-between">
        <div>
          <h2 id="top-doctors" className="text-2xl md:text-3xl font-semibold">
            Our Top Doctors
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Book trusted specialists with top ratings.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {doctors.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="p-0">
                <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={`/portrait-doctor-.jpg?height=240&width=400&query=portrait%20doctor%20${encodeURIComponent(
                      d.spec,
                    )}`}
                    alt={`${d.name} - ${d.spec}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-muted-foreground">{d.spec}</div>
                <div className="mt-2 flex items-center gap-1 text-sm" aria-label={`Rating ${d.rating} out of 5`}>
                  <Star className="h-4 w-4 text-yellow-500" aria-hidden />
                  <span>{d.rating}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full" aria-label={`Book appointment with ${d.name}`}>
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
