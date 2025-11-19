"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doctorService } from "@/lib/services/doctor.service";
import { Doctor } from "@/types/doctor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Star, ArrowLeft, User, Mail, Phone, Award } from "lucide-react";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { BookAppointmentDialog } from "@/components/appointment/book-appointment-dialog";

export default function DoctorDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDoctor(params.id as string);
    }
  }, [params.id]);

  const fetchDoctor = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await doctorService.getDoctorById(id);
      setDoctor(response.data.doctor as any);
    } catch (error) {
      console.error("Failed to fetch doctor:", error);
      toast.error("Failed to load doctor details");
      router.push("/doctors");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <main className="min-h-screen pt-20 pb-12 px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!doctor) {
    return null;
  }

  return (
    <>
      <main className="min-h-screen pt-20 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <Card className="overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-primary/10 to-primary/5">
              {doctor.images && doctor.images[0] ? (
                <Image
                  src={doctor.images[0]}
                  alt={doctor.userId.fullName}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>

            <CardContent className="p-6 md:p-8 space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {doctor.userId.fullName}
                </h1>
                <p className="text-xl text-primary font-semibold mb-1">
                  {doctor.specialization}
                </p>
                <p className="text-muted-foreground">{doctor.qualification}</p>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">
                    {doctor.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    ({doctor.totalRatings} ratings)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {doctor.experience} years experience
                  </span>
                </div>
              </div>

              <Separator />

              {doctor.about && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {doctor.about}
                  </p>
                </div>
              )}

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{doctor.userId.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{doctor.userId.phoneNumber}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Consultation Fee
                  </p>
                  <p className="text-2xl font-bold">₹{doctor.consultationFee}</p>
                </div>

                <BookAppointmentDialog doctor={doctor} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
