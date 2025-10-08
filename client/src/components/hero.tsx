"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:pt-16 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-6"
        >
          <h1 id="hero" className="text-balance text-4xl md:text-5xl font-semibold leading-tight">
            Your Health, Our Priority.
          </h1>
          <p className="text-muted-foreground text-pretty">
            Book trusted doctors and get medical products delivered to your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" aria-label="Book Appointment">
              Book Appointment
            </Button>
            <Button size="lg" variant="outline" aria-label="Explore Products">
              Explore Products
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { k: "500+", v: "Doctors" },
              { k: "10,000+", v: "Appointments" },
              { k: "100%", v: "Secure Payments" },
            ].map((s) => (
              <Card key={s.v} className="shadow-sm">
                <CardContent className="p-3 text-center">
                  <div className="text-lg font-semibold">{s.k}</div>
                  <div className="text-xs text-muted-foreground">{s.v}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55, ease: "easeOut" }}
          className="relative aspect-[4/3] md:aspect-[5/4] rounded-lg overflow-hidden"
        >
          <Image 
            src="/doctor-illustration-for-healthcare-hero.jpg" 
            alt="Doctor illustration" 
            fill 
            className="object-cover" 
            priority 
          />
        </motion.div>
      </div>
    </div>
  )
}
