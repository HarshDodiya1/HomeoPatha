"use client"

import { motion } from "framer-motion"
import { UserSearch, CalendarCheck, CreditCard, Stethoscope } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: UserSearch,
    title: "Choose Your Doctor",
    description: "Browse our network of certified homeopathy specialists and find the perfect match for your needs.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book Appointment",
    description: "Select a convenient time slot and book your consultation with just a few clicks.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Pay Securely",
    description: "Complete your payment through our encrypted and secure payment gateway.",
  },
  {
    number: "04",
    icon: Stethoscope,
    title: "Get Consultation",
    description: "Meet your doctor and receive personalized homeopathic treatment and care.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-secondary/20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.05),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Getting quality healthcare has never been easier. Follow these simple steps to book your appointment.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6"
        >
          {steps.map((step, index) => (
            <motion.div key={step.number} variants={itemVariants} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+48px)] w-[calc(100%-96px)] h-[2px]">
                  <div className="w-full h-full bg-gradient-to-r from-primary/30 to-primary/10" />
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/30" />
                </div>
              )}

              <div className="group text-center">
                {/* Number & Icon */}
                <div className="relative inline-flex flex-col items-center mb-6">
                  {/* Large number background */}
                  <span className="absolute -top-2 text-6xl font-bold text-primary/5 select-none">
                    {step.number}
                  </span>
                  
                  {/* Icon circle */}
                  <div className="relative w-24 h-24 rounded-2xl bg-white shadow-lg shadow-primary/5 flex items-center justify-center group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300 group-hover:-translate-y-1">
                    <step.icon className="w-10 h-10 text-primary" />
                    
                    {/* Accent dot */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
