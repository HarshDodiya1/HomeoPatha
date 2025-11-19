"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { appointmentService } from "@/lib/services/appointment.service";
import { loadRazorpayScript } from "@/lib/utils/razorpay";
import { Doctor } from "@/types/doctor";
import { RazorpayOptions, RazorpaySuccessResponse } from "@/types/appointment";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";

const appointmentFormSchema = z.object({
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface BookAppointmentDialogProps {
  doctor: Doctor;
  children?: React.ReactNode;
}

export function BookAppointmentDialog({
  doctor,
  children,
}: BookAppointmentDialogProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentDate: "",
      appointmentTime: "",
      reason: "",
      notes: "",
    },
  });

  const handlePayment = async (
    appointmentId: string,
    orderId: string,
    amount: number,
    currency: string,
    keyId: string
  ) => {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      toast.error("Failed to load payment gateway. Please try again.");
      setIsLoading(false);
      return;
    }

    const options: RazorpayOptions = {
      key: keyId,
      amount: amount * 100, // Convert to paise
      currency: currency,
      name: "HomeoPatha",
      description: `Appointment with Dr. ${doctor.userId.fullName}`,
      order_id: orderId,
      handler: async (response: RazorpaySuccessResponse) => {
        // Verify payment on server
        try {
          await appointmentService.verifyPayment({
            appointmentId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          toast.success("Appointment booked successfully!");
          setOpen(false);
          form.reset();
          
          // Redirect to appointments page or show success
          router.push(`/profile?tab=appointments`);
        } catch (error: any) {
          console.error("Payment verification error:", error);
          toast.error(
            error.response?.data?.message || "Payment verification failed"
          );
        } finally {
          setIsLoading(false);
        }
      },
      prefill: {
        name: user?.fullName || "",
        email: user?.email || "",
        contact: user?.phoneNumber || "",
      },
      theme: {
        color: "#16a34a", // Your primary color
      },
      modal: {
        ondismiss: () => {
          toast.error("Payment cancelled");
          setIsLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const onSubmit = async (values: AppointmentFormValues) => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error("Please login to book an appointment");
      router.push("/login");
      return;
    }

    // Check if user is a patient
    if (user.role !== "patient") {
      toast.error("Only patients can book appointments");
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(values.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      toast.error("Appointment date cannot be in the past");
      return;
    }

    setIsLoading(true);

    try {
      // Create order on server
      const orderResponse = await appointmentService.createAppointmentOrder({
        doctorId: (doctor as any).id || doctor._id,
        appointmentDate: values.appointmentDate,
        appointmentTime: values.appointmentTime,
        reason: values.reason,
        notes: values.notes,
      });

      // Initiate Razorpay payment
      await handlePayment(
        orderResponse.data.appointmentId,
        orderResponse.data.orderId,
        orderResponse.data.amount,
        orderResponse.data.currency,
        orderResponse.data.keyId
      );
    } catch (error: any) {
      console.error("Appointment booking error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create appointment"
      );
      setIsLoading(false);
    }
  };

  // Generate time slots
  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
  ];

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="lg">
            <Calendar className="h-5 w-5 mr-2" />
            Book Appointment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details to book an appointment with Dr.{" "}
            {doctor.userId.fullName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="appointmentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={getMinDate()}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appointmentTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Time</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      disabled={isLoading}
                    >
                      <option value="">Select time slot</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Appointment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your symptoms or reason for consultation"
                      className="resize-none"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information"
                      className="resize-none"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Consultation Fee:</span>
                <span className="text-xl font-bold">
                  ₹{doctor.consultationFee}
                </span>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Proceed to Payment</>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
