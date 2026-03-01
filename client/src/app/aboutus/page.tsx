"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { blogService } from "@/lib/services/blog.service";
import { Blog } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Heart, 
  Award, 
  Users, 
  Clock, 
  CheckCircle, 
  Mail, 
  Phone, 
  MapPin,
  Sparkles,
  Leaf,
  ArrowRight,
  Shield,
  Loader2,
  BookOpen,
  Calendar,
  Tag
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

export default function AboutPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isBlogsLoading, setIsBlogsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsBlogsLoading(true);
    try {
      const allBlogs: Blog[] = [];
      let page = 1;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await blogService.getBlogs({
          page,
          limit: 50,
          sortBy: 'publishedAt',
          sortOrder: 'desc',
        });

        const currentBlogs = response.data.blogs;
        allBlogs.push(...currentBlogs);

        if (currentBlogs.length === 0) {
          break;
        }

        hasNextPage = response.data.pagination.hasNextPage;
        page += 1;
      }

      setBlogs(allBlogs);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setIsBlogsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to generate slug from title (fallback if slug not present)
  const getSlug = (blog: Blog) => {
    if (blog.slug) return blog.slug;
    return blog.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const values = [
    {
      icon: Heart,
      title: "Holistic Healing",
      description: "We believe in treating the whole person, not just symptoms. Our approach addresses physical, mental, and emotional well-being."
    },
    {
      icon: Award,
      title: "Expert Care",
      description: "Our team consists of highly qualified homeopathic practitioners with years of experience and continuous learning."
    },
    {
      icon: Users,
      title: "Patient-Centered",
      description: "Every patient is unique. We take time to understand your individual needs and create personalized treatment plans."
    },
    {
      icon: Clock,
      title: "Accessible Healthcare",
      description: "We make homeopathic care accessible to everyone through our easy online consultation booking system."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Patients" },
    { number: "15+", label: "Years Experience" },
    { number: "50+", label: "Specialists" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <>
      <main className="min-h-screen relative overflow-hidden">
        {/* Premium background */}
        <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,197,94,0.06),transparent_60%)] -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(22,163,74,0.06),transparent_60%)] -z-10" />
        
        {/* Floating decorative elements */}
        <div className="fixed top-40 right-20 w-3 h-3 rounded-full bg-primary/30 animate-bounce pointer-events-none" style={{ animationDelay: '0s' }} />
        <div className="fixed top-72 left-16 w-2 h-2 rounded-full bg-accent/30 animate-bounce pointer-events-none" style={{ animationDelay: '0.5s' }} />
        <div className="fixed bottom-40 right-1/4 w-2 h-2 rounded-full bg-primary/20 animate-bounce pointer-events-none" style={{ animationDelay: '1s' }} />

        {/* Hero Section */}
        <section className="relative pt-28 pb-20 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-0 rounded-full px-4 py-1.5">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Natural Healing Excellence
              </Badge>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              About{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                HomeoPatha
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
            >
              Your trusted partner in natural healing. We combine ancient homeopathic wisdom with modern healthcare practices to provide you with the best possible care.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link href="/appointments">
                <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/25">
                  Book a Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full border-primary/20 hover:bg-primary/5">
                  Contact Us
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Featured Blog Section - Full Content */}
        {!isBlogsLoading && blogs.length > 0 && (
          <section className="py-16 px-4 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
              >
                <Badge className="mb-4 bg-primary/10 text-primary border-0 rounded-full px-3 py-1">
                  <BookOpen className="h-3 w-3 mr-1.5" />
                  Latest Insights
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">From Our Blog</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Explore our latest articles on homeopathy, natural healing, and holistic wellness.
                </p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {blogs.map((blog) => (
                  <motion.div key={blog._id} variants={itemVariants}>
                    <Link href={`/blogs/${getSlug(blog)}`}>
                      <Card className="h-full overflow-hidden rounded-3xl border-border/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group cursor-pointer">
                        {/* Cover Image */}
                        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                          {blog.coverImage ? (
                            <Image
                              src={blog.coverImage}
                              alt={blog.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="h-12 w-12 text-primary/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                          
                          {/* Tags overlay */}
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                              {blog.tags.slice(0, 2).map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  className="bg-white/90 dark:bg-black/70 text-primary border-0 rounded-full text-xs shadow-sm capitalize"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <CardContent className="p-5">
                          {/* Title */}
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {blog.title}
                          </h3>

                          {/* Summary */}
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {blog.summary}
                          </p>

                          {/* Author & Date */}
                          <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            {blog.author && (
                              <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
                                  {blog.author.images?.[0] ? (
                                    <Image
                                      src={blog.author.images[0]}
                                      alt={blog.author.userId?.fullName || "Author"}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <User className="h-4 w-4 text-primary/40" />
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs font-medium truncate max-w-[100px]">
                                  {blog.author.userId?.fullName || "Unknown"}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* Loading state for blogs */}
        {isBlogsLoading && (
          <section className="py-16 px-4 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10">
                <div className="h-6 w-32 bg-muted rounded-full mx-auto mb-4 animate-pulse" />
                <div className="h-10 w-64 bg-muted rounded mx-auto mb-4 animate-pulse" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden rounded-3xl animate-pulse">
                    <div className="h-48 bg-muted" />
                    <CardContent className="p-5">
                      <div className="h-6 bg-muted rounded mb-2" />
                      <div className="h-4 bg-muted rounded mb-4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Stats Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[28px] blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-primary to-accent rounded-3xl p-8 md:p-12 text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8">
                  {stats.map((stat, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <p className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</p>
                      <p className="text-sm md:text-base opacity-90">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Badge className="mb-4 bg-primary/10 text-primary border-0 rounded-full px-3 py-1">
                  <Leaf className="h-3 w-3 mr-1.5" />
                  Our Journey
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    The HomeoPatha was founded with a simple yet powerful mission: to make quality homeopathic healthcare accessible to everyone. We understand that true healing goes beyond just treating symptoms—it's about nurturing the body's natural ability to heal itself.
                  </p>
                  <p>
                    Our journey began with a small team of passionate homeopaths who believed in the power of natural remedies. Today, we've grown into a trusted healthcare platform serving thousands of patients across the country.
                  </p>
                  <p>
                    We combine traditional homeopathic principles with modern technology, making it easier than ever for you to consult with experienced practitioners from the comfort of your home.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[32px] blur-xl opacity-50" />
                <div className="relative h-[400px] rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/25">
                      <Heart className="h-12 w-12 text-white" />
                    </div>
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Healing with Care
                    </p>
                    <p className="text-muted-foreground mt-2">Since 2010</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-20 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-0 rounded-full px-3 py-1">
                <Shield className="h-3 w-3 mr-1.5" />
                What We Stand For
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These core values guide everything we do and how we care for our patients.
              </p>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {values.map((value, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full border-border/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                    <CardContent className="pt-8 pb-8 text-center">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                        <value.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg mb-3">{value.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why Choose Homeopathy Section */}
        <section className="py-20 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <Badge className="mb-4 bg-primary/10 text-primary border-0 rounded-full px-3 py-1">
                <Leaf className="h-3 w-3 mr-1.5" />
                Natural Medicine
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Homeopathy?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover the benefits of this gentle yet effective system of medicine.
              </p>
            </motion.div>
            
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {[
                "Natural & Safe - No harmful side effects",
                "Treats Root Cause - Not just symptoms",
                "Individualized Treatment - Tailored to you",
                "Gentle on Body - Suitable for all ages",
                "Chronic Disease Management - Long-term solutions",
                "Holistic Approach - Mind, body & spirit"
              ].map((benefit, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-secondary/30 border border-border/50 hover:border-primary/20 hover:bg-secondary/50 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-medium">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-[28px] blur-lg opacity-60" />
              <div className="relative bg-gradient-to-r from-primary to-accent rounded-3xl p-10 md:p-14 text-white text-center overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Healing Journey?</h2>
                  <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                    Book a consultation with one of our expert homeopathic practitioners today and take the first step towards natural wellness.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/appointments">
                      <Button size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 shadow-lg">
                        Book Appointment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button size="lg" variant="outline" className="rounded-full bg-transparent border-white/50 text-white hover:bg-white/10">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-20 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {[
                { icon: Mail, title: "Email Us", info: "thehomeopatha@gmail.com", color: "primary" },
                { icon: MapPin, title: "Visit Us", info: "Mishrawari, Bathario Ka Chawk, Nagaur, Rajasthan 341001", color: "primary" }
              ].map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="text-center p-8 rounded-3xl border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.info}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
