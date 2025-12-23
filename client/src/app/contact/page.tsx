"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  Loader2, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  MessageSquare,
  ArrowRight,
  User,
  AtSign
} from "lucide-react"
import apiClient from "@/lib/api/client"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name")
      return
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email")
      return
    }

    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter your phone number")
      return
    }

    if (!formData.message.trim()) {
      toast.error("Please enter your message")
      return
    }

    if (formData.message.length < 10) {
      toast.error("Message must be at least 10 characters long")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await apiClient.post("/api/contact", formData)
      
      if (response.data.success) {
        toast.success(response.data.message || "Message sent successfully!")
        setIsSubmitted(true)
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          message: "",
        })
        
        setTimeout(() => {
          setIsSubmitted(false)
        }, 5000)
      }
    } catch (error: any) {
      console.error("Contact form error:", error)
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-28 pb-16 relative overflow-hidden">
      {/* Premium background */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.06),transparent_60%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(22,163,74,0.06),transparent_60%)] -z-10" />
      
      {/* Floating decorative elements */}
      <div className="fixed top-40 right-20 w-3 h-3 rounded-full bg-primary/30 animate-bounce pointer-events-none" style={{ animationDelay: '0s' }} />
      <div className="fixed top-72 left-16 w-2 h-2 rounded-full bg-accent/30 animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }} />
      <div className="fixed bottom-40 right-1/4 w-2 h-2 rounded-full bg-primary/20 animate-bounce pointer-events-none" style={{ animationDelay: '1s' }} />

      <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <Badge className="mb-6 bg-primary/10 text-primary border-0 rounded-full px-4 py-1.5">
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            We're Here to Help
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Get In{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Touch
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help! Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[28px] blur-lg opacity-50" />
              <Card className="relative rounded-3xl border-border/50 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Send className="h-4 w-4 text-primary" />
                    </div>
                    Send us a Message
                  </CardTitle>
                  <CardDescription>Fill out the form and we'll respond within 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6"
                      >
                        <CheckCircle2 className="h-10 w-10 text-primary" />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for contacting us. We'll get back to you soon.
                      </p>
                      <Button 
                        onClick={() => setIsSubmitted(false)} 
                        variant="outline"
                        className="rounded-full"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            value={formData.fullName}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                            className="pl-11 rounded-xl border-border/50 focus:border-primary h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <div className="relative">
                          <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john.doe@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                            className="pl-11 rounded-xl border-border/50 focus:border-primary h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phoneNumber"
                            name="phoneNumber"
                            type="tel"
                            placeholder="9876543210"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            required
                            className="pl-11 rounded-xl border-border/50 focus:border-primary h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="Tell us how we can help you..."
                          value={formData.message}
                          onChange={handleChange}
                          disabled={isSubmitting}
                          required
                          rows={5}
                          className="resize-none rounded-xl border-border/50 focus:border-primary"
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum 10 characters ({formData.message.length}/1000)
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <Card className="rounded-3xl border-border/50 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    Contact Information
                  </CardTitle>
                  <CardDescription>Get in touch with us through these channels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground text-sm">info@homeopatha.com</p>
                      <p className="text-muted-foreground text-sm">support@homeopatha.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-muted-foreground text-sm">+91 1234 567 890</p>
                      <p className="text-muted-foreground text-sm">Mon-Fri: 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Address</h3>
                      <p className="text-muted-foreground text-sm">123 Medical Street</p>
                      <p className="text-muted-foreground text-sm">Healthcare City, HC 12345</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="rounded-3xl border-border/50 overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">Office Hours</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-background/50">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <Badge variant="secondary" className="rounded-full">9:00 AM - 6:00 PM</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-background/50">
                      <span className="text-muted-foreground">Saturday</span>
                      <Badge variant="secondary" className="rounded-full">10:00 AM - 4:00 PM</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-background/50">
                      <span className="text-muted-foreground">Sunday</span>
                      <Badge variant="outline" className="rounded-full">Closed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* FAQ CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="rounded-3xl border-border/50 overflow-hidden">
            <CardContent className="py-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-2">Frequently Asked Questions</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Before reaching out, you might find answers to common questions in our FAQ section.
                </p>
                <a href="/#about">
                  <Button variant="outline" className="rounded-full">
                    Learn More About Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
