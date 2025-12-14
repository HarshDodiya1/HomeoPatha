"use client";

import { useState, useEffect } from "react";
import { doctorService } from "@/lib/services/doctor.service";
import { Doctor } from "@/types/doctor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User, Heart, Award, Users, Clock, CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import Link from "next/link";

export default function AboutPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await doctorService.getAllDoctors({
        page: 1,
        limit: 50, // Get all doctors for the team section
      });
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
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
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-green-50 pt-24 pb-16 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              About HomeoPatha
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Your trusted partner in natural healing. We combine ancient homeopathic wisdom with modern healthcare practices to provide you with the best possible care.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/appointments">Book a Consultation</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</p>
                  <p className="text-sm md:text-base opacity-90">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    HomeoPatha was founded with a simple yet powerful mission: to make quality homeopathic healthcare accessible to everyone. We understand that true healing goes beyond just treating symptoms—it's about nurturing the body's natural ability to heal itself.
                  </p>
                  <p>
                    Our journey began with a small team of passionate homeopaths who believed in the power of natural remedies. Today, we've grown into a trusted healthcare platform serving thousands of patients across the country.
                  </p>
                  <p>
                    We combine traditional homeopathic principles with modern technology, making it easier than ever for you to consult with experienced practitioners from the comfort of your home.
                  </p>
                </div>
              </div>
              <div className="relative h-[400px] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-green-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <Heart className="h-24 w-24 mx-auto text-primary mb-4" />
                  <p className="text-2xl font-semibold text-primary">Healing with Care</p>
                  <p className="text-muted-foreground mt-2">Since 2010</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-16 px-4 md:px-8 lg:px-12 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                These core values guide everything we do and how we care for our patients.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Homeopathy Section */}
        <section className="py-16 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Homeopathy?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover the benefits of this gentle yet effective system of medicine.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Natural & Safe - No harmful side effects",
                "Treats Root Cause - Not just symptoms",
                "Individualized Treatment - Tailored to you",
                "Gentle on Body - Suitable for all ages",
                "Chronic Disease Management - Long-term solutions",
                "Holistic Approach - Mind, body & spirit"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="py-16 px-4 md:px-8 lg:px-12 bg-gradient-to-br from-primary/5 to-green-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our experienced homeopathic practitioners are dedicated to your well-being and committed to providing the highest quality care.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Our team is growing</h3>
                <p className="text-muted-foreground">
                  Check back soon to meet our practitioners
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {doctors.map((doctor) => (
                  <Card
                    key={doctor._id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative h-56 bg-gradient-to-br from-primary/10 to-green-100">
                      {doctor.images && doctor.images[0] ? (
                        <Image
                          src={doctor.images[0]}
                          alt={doctor.userId.fullName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-20 w-20 text-primary/30" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg mb-1">
                        Dr. {doctor.userId.fullName}
                      </h3>
                      <p className="text-sm text-primary font-medium mb-2">
                        {doctor.specialization}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1">
                        {doctor.qualification}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {doctor.experience} years of experience
                      </p>

                      <div className="flex items-center gap-1 pt-3 border-t">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {doctor.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({doctor.totalRatings} reviews)
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 md:px-8 lg:px-12 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Healing Journey?</h2>
            <p className="text-lg opacity-90 mb-8">
              Book a consultation with one of our expert homeopathic practitioners today and take the first step towards natural wellness.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/appointments">Book Appointment</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white hover:bg-white/10" asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-16 px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                <p className="text-muted-foreground">support@homeopatha.com</p>
              </div>
              <div className="text-center p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                <p className="text-muted-foreground">+91 1234 567 890</p>
              </div>
              <div className="text-center p-6">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Visit Us</h3>
                <p className="text-muted-foreground">123 Health Street, Mumbai</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
