"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Search, MapPin, Stethoscope, User } from "lucide-react"

export function SearchBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full md:max-w-4xl"
    >
      <div className="rounded-2xl bg-white shadow-xl shadow-primary/5 border border-border/50 p-4 md:p-5">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-3" role="search" aria-label="Find a doctor">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Doctor name" 
              aria-label="Doctor name"
              className="pl-10 h-12 rounded-xl border-border bg-secondary/50 focus:bg-white transition-colors"
            />
          </div>
          <div className="relative">
            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Specialization" 
              aria-label="Specialization"
              className="pl-10 h-12 rounded-xl border-border bg-secondary/50 focus:bg-white transition-colors"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Location" 
              aria-label="Location"
              className="pl-10 h-12 rounded-xl border-border bg-secondary/50 focus:bg-white transition-colors"
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl font-semibold gap-2">
            <Search className="h-5 w-5" />
            Search
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
