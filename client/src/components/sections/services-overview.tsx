"use client"

import { motion } from "framer-motion"
import { 
  BadgeCheck, 
  CreditCard, 
  CalendarCheck, 
  ShieldCheck,
  UserSearch,
  Stethoscope,
  ArrowRight
} from "lucide-react"

const trustItems = [
  {
    icon: BadgeCheck,
    title: "Certified Doctors",
    description: "All healthcare professionals are verified and certified with proven expertise.",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Your transactions are encrypted with industry-standard security protocols.",
    gradient: "from-accent to-accent/70",
  },
  {
    icon: CalendarCheck,
    title: "Easy Appointments",
    description: "Book your consultation seamlessly in just a few clicks.",
    gradient: "from-amber-500 to-amber-400",
  },
  {
    icon: ShieldCheck,
    title: "Verified Products",
    description: "Quality-assured homeopathy medicines delivered to your doorstep.",
    gradient: "from-purple-500 to-purple-400",
  },
]

const steps = [
  {
    number: "01",
    icon: UserSearch,
    title: "Choose Doctor",
    description: "Browse certified specialists",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Book Slot",
    description: "Pick convenient time",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Pay Securely",
    description: "Safe & encrypted payment",
  },
  {
    number: "04",
    icon: Stethoscope,
    title: "Get Care",
    description: "Personalized treatment",
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

export function ServicesOverview() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-background to-secondary/50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(37,99,235,0.05),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.05),transparent_40%)]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 border border-primary/20">
            <BadgeCheck className="h-4 w-4" />
            Your Health Journey
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why Trust <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">HomeoPatha</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience seamless healthcare with our trusted platform — from booking to treatment.
          </p>
        </motion.div>

        {/* Main Grid - Trust Cards Left, How It Works Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Trust Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {trustItems.map((item, index) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="group"
              >
                <div className="relative h-full bg-white dark:bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className="mb-4">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-300`}>
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

                  {/* Decorative corner */}
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Side - How It Works Circular Flow */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            {/* Section Label */}
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium">
                Simple 4-Step Process
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mt-3">
                How It Works
              </h3>
            </div>

            {/* Circular Flow Container */}
            <div className="relative">
              {/* Central Circle with rotating border */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 md:w-56 md:h-56 rounded-full border-2 border-dashed border-primary/20 animate-[spin_30s_linear_infinite]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/10" />
              </div>

              {/* Center Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-xl shadow-primary/30">
                  <Stethoscope className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
              </div>

              {/* Steps positioned around the circle */}
              <div className="relative h-80 md:h-96">
                {steps.map((step, index) => {
                  // Position each step at corners of a square around the center
                  const positions = [
                    "top-0 left-1/2 -translate-x-1/2", // Top center
                    "top-1/2 right-0 -translate-y-1/2", // Right center
                    "bottom-0 left-1/2 -translate-x-1/2", // Bottom center
                    "top-1/2 left-0 -translate-y-1/2", // Left center
                  ]

                  return (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      className={`absolute ${positions[index]} group`}
                    >
                      <div className="relative flex flex-col items-center text-center max-w-[140px]">
                        {/* Step Number Badge */}
                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center z-10 shadow-lg">
                          {index + 1}
                        </div>

                        {/* Icon Circle */}
                        <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-white dark:bg-card border-2 border-primary/20 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:border-primary/40 group-hover:scale-110 transition-all duration-300">
                          <step.icon className="w-7 h-7 md:w-8 md:h-8 text-primary" />
                        </div>

                        {/* Content */}
                        <h4 className="text-sm md:text-base font-semibold text-foreground mt-3 mb-1">
                          {step.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-snug hidden md:block">
                          {step.description}
                        </p>
                      </div>

                      {/* Connector Arrow (except last step) */}
                      {index < steps.length - 1 && (
                        <div className="absolute hidden lg:flex">
                          {index === 0 && (
                            <ArrowRight className="w-4 h-4 text-primary/40 absolute top-6 -right-12 rotate-45" />
                          )}
                          {index === 1 && (
                            <ArrowRight className="w-4 h-4 text-primary/40 absolute -bottom-12 left-6 rotate-45" />
                          )}
                          {index === 2 && (
                            <ArrowRight className="w-4 h-4 text-primary/40 absolute top-6 -left-12 rotate-[225deg]" />
                          )}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
