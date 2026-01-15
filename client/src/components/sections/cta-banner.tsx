"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Heart, Shield, Sparkles } from "lucide-react";
import Link from "next/link";

export function CTABanner() {
  return (
    <section className="py-24 md:py-32 px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-7xl"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-800 via-primary to-emerald-700 p-10 md:p-16 lg:p-20">
          {/* Background decorations */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          {/* Floating elements */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-16 right-16 hidden lg:block"
          >
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-16 left-16 hidden lg:block"
          >
            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute top-1/2 right-32 hidden xl:block"
          >
            <div className="w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
          </motion.div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-block px-5 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-8"
            >
              Start your wellness journey today
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Your Health Deserves
              <br />
              <span className="text-white/90">Better Care</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Join thousands of patients who trust us for their homeopathic
              healthcare needs. Book your appointment today and experience the
              difference.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-14"
            >
              <Link href="/appointments">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-full px-10 py-7 text-lg font-semibold shadow-xl shadow-black/20 group"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Your Appointment
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/products">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto rounded-full px-10 py-7 text-base font-semibold border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300"
                >
                  Browse Products
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-10 md:gap-16 lg:gap-20 pt-10 border-t border-white/20"
            >
              {[
                { value: "10K+", label: "Happy Patients" },
                { value: "500+", label: "Expert Doctors" },
                { value: "98%", label: "Satisfaction Rate" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm md:text-base text-white/70 mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
