"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  { id: 1, name: "Priya S.", text: "Booking was seamless and the doctor was great!", rating: 5 },
  { id: 2, name: "Michael L.", text: "Fast delivery for products I needed urgently.", rating: 5 },
  { id: 3, name: "Aarav K.", text: "Trustworthy platform with friendly support.", rating: 4 },
  { id: 4, name: "Zoe T.", text: "Loved the experience—highly recommend!", rating: 5 },
]

export function Testimonials() {
  return (
    <div className="mx-auto max-w-7xl py-12">
      <header className="mb-6 md:mb-8 text-center">
        <h2 id="testimonials" className="text-2xl md:text-3xl font-semibold">
          What Our Patients Say
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Real feedback from our users.</p>
      </header>

      <div className="rounded-xl border bg-muted/40 p-4">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="min-w-[80%] sm:min-w-[45%] lg:min-w-[31%] snap-start"
            >
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-center gap-1 text-yellow-500" aria-label={`Rating ${t.rating} out of 5`}>
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-pretty">"{t.text}"</p>
                  <div className="mt-4 text-sm font-medium">{t.name}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
