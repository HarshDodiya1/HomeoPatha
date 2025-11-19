"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doctorService } from "@/lib/services/doctor.service";
import { Doctor } from "@/types/doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Star, Calendar, User } from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { toast } from "sonner";

export default function DoctorsPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [specialization, setSpecialization] = useState("all");
  const [minRating, setMinRating] = useState("all");

  useEffect(() => {
    fetchDoctors();
  }, [page, specialization, minRating]);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await doctorService.getAllDoctors({
        page,
        limit: 12,
        specialization: specialization !== "all" ? specialization : undefined,
        minRating: minRating !== "all" ? parseFloat(minRating) : undefined,
      });

      setDoctors(response.data.doctors);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast.error("Failed to load doctors");
    } finally {
      setIsLoading(false);
    }
  };

  const specializations = [
    "Cardiology",
    "Dermatology",
    "Orthopedics",
    "Pediatrics",
    "Neurology",
    "General Practice",
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-12 px-4 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Find a Doctor
            </h1>
            <p className="text-muted-foreground">
              Book appointments with experienced homeopathic practitioners
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              <Select value={specialization} onValueChange={setSpecialization}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Minimum Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Doctors Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
              <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No doctors found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <Card
                  key={doctor._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/doctors/${doctor._id}`)}
                >
                  <div className="relative h-48 bg-muted">
                    {doctor.images && doctor.images[0] ? (
                      <Image
                        src={doctor.images[0]}
                        alt={doctor.userId.fullName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">
                      {doctor.userId.fullName}
                    </h3>
                    <p className="text-sm text-primary font-medium mb-2">
                      {doctor.specialization}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      {doctor.qualification}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      {doctor.experience} years experience
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {doctor.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({doctor.totalRatings})
                        </span>
                      </div>

                      <span className="text-sm font-semibold">
                        ₹{doctor.consultationFee}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
