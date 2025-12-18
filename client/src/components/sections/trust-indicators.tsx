"use client"

import { motion } from "framer-motion"
import { ShieldCheck, CreditCard, CalendarCheck, BadgeCheck } from "lucide-react"

const trustItems = [
  {
    icon: BadgeCheck,
    title: "Certified Doctors",
    description: "All healthcare professionals are verified and certified",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Your transactions are encrypted and 100% safe",
  },
  {
    icon: CalendarCheck,
    title: "Easy Appointments",
    description: "Book your consultation in just a few clicks",
  },
  {
    icon: ShieldCheck,
    title: "Verified Products",
    description: "Quality-assured homeopathy medicines and products",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export function TrustIndicators() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="group"
            >
              <div className="relative h-full bg-white rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {/* Decorative accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-tr-2xl rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
