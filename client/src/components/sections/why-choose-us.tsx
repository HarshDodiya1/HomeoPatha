"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Headset, Users, Award } from "lucide-react"
import { motion } from "framer-motion"

const reasons = [
  { icon: Award, title: "Experienced Doctors", desc: "Verified specialists across disciplines." },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Encrypted transactions for peace of mind." },
  { icon: Headset, title: "24/7 Support", desc: "We're here whenever you need help." },
  { icon: Users, title: "Trusted by Thousands", desc: "A growing community of satisfied patients." },
]

export function WhyChooseUs() {
  return (
    <div className="mx-auto max-w-7xl py-12">
      <header className="mb-6 md:mb-8 text-center">
        <h2 id="why-choose-us" className="text-2xl md:text-3xl font-semibold">
          Why Choose Us
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Care, convenience, and quality.</p>
      </header>

      <div className="rounded-xl border bg-muted/40 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <Card className="h-full">
                <CardContent className="p-5">
                  <r.icon className="h-6 w-6 text-primary" aria-hidden />
                  <div className="mt-3 font-medium">{r.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
