"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Mail, Bell, Gift, ArrowRight } from "lucide-react"

const benefits = [
  { icon: Bell, text: "Health tips & updates" },
  { icon: Gift, text: "Exclusive offers" },
  { icon: Mail, text: "Doctor availability alerts" },
]

export function Newsletter() {
  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-white border border-border/50 shadow-sm p-8 md:p-12"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Stay Connected
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Get Health Tips & Exclusive Offers
              </h2>
              <p className="text-muted-foreground mb-6">
                Subscribe to our newsletter and stay updated with the latest health insights, doctor availability, and special promotions.
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                      <benefit.icon className="w-4 h-4 text-primary" />
                    </div>
                    {benefit.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div>
              <form className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-12 h-14 text-base rounded-xl border-border bg-secondary/50 focus:bg-white transition-colors"
                  />
                </div>
                <Button size="lg" className="w-full rounded-xl h-14 text-base font-semibold group">
                  Subscribe Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
