"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Headset, Users, Award, Clock, Heart } from "lucide-react"

const reasons = [
  {
    icon: Award,
    title: "Experienced Doctors",
    description: "All our doctors are verified specialists with years of experience in homeopathy.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Your transactions are protected with industry-standard encryption.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description: "Our dedicated support team is always here to assist you.",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Users,
    title: "Trusted by Thousands",
    description: "Join our growing community of satisfied patients nationwide.",
    color: "bg-purple-500/10 text-purple-600",
  },
  {
    icon: Clock,
    title: "Quick Appointments",
    description: "Book your consultation in minutes and get treated faster.",
    color: "bg-rose-500/10 text-rose-600",
  },
  {
    icon: Heart,
    title: "Personalized Care",
    description: "Every treatment plan is customized to your unique health needs.",
    color: "bg-cyan-500/10 text-cyan-600",
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

export function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.05),transparent_50%)]" />
      
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Why HomeoPatha
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why Choose Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing the best healthcare experience with care, convenience, and quality.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reasons.map((reason) => (
            <motion.div
              key={reason.title}
              variants={itemVariants}
              className="group"
            >
              <div className="h-full bg-white rounded-2xl p-6 md:p-8 border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${reason.color} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <reason.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {reason.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
