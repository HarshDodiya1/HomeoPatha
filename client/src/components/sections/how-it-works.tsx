"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarCheck2, Stethoscope, Truck } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
  { icon: Stethoscope, title: "Find a Doctor", desc: "Search by name, specialization, and location." },
  { icon: CalendarCheck2, title: "Book Appointment", desc: "Choose your slot and confirm instantly." },
  { icon: Truck, title: "Consult/Delivery", desc: "Get consultation or product delivery at home." },
]

export function HowItWorks() {
  return (
    <div className="mx-auto max-w-7xl py-12">
      <header className="mb-6 md:mb-8 text-center">
        <h2 id="how-it-works" className="text-2xl md:text-3xl font-semibold">
          How It Works
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Easy steps to better healthcare.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <Card className="h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <s.icon className="h-8 w-8 text-primary" aria-hidden />
                <div className="font-medium">{s.title}</div>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Learn more
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
