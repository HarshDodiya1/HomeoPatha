"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function SearchBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full md:max-w-4xl"
    >
      <div className="rounded-xl border bg-card text-card-foreground shadow-lg p-3 md:p-4">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3" role="search" aria-label="Find a doctor">
          <Input placeholder="Doctor name" aria-label="Doctor name" />
          <Input placeholder="Specialization" aria-label="Specialization" />
          <Input placeholder="Location" aria-label="Location" />
          <Button type="submit" className="w-full">
            Search
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
