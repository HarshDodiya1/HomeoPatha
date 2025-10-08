"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"

export function Newsletter() {
  return (
    <div className="mx-auto max-w-7xl py-12">
      <div className="rounded-xl border bg-muted/40 p-6 md:p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
        >
          <h2 id="newsletter" className="text-xl md:text-2xl font-semibold text-balance">
            Stay updated with health tips and offers.
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Subscribe to receive curated content and exclusive deals.
          </p>
          <form
            className="mt-5 mx-auto grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 max-w-xl"
            aria-label="Subscribe to newsletter"
          >
            <Input type="email" placeholder="Enter your email" aria-label="Email address" />
            <Button type="submit">Subscribe</Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
