"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Edit, Trash2, Star, Briefcase, DollarSign, Mail, Phone } from "lucide-react"

interface DoctorCardProps {
  doctor: any
  onEdit: (doctor: any) => void
  onDelete: (doctor: any) => void
}

export function DoctorCard({ doctor, onEdit, onDelete }: DoctorCardProps) {
  const getDoctorInitials = (name?: string) => {
    if (!name) return "DR"
    return name
      .split(" ")
      .map((word: string) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const fullName = doctor.userId?.fullName || doctor.user?.fullName || "Unknown"
  const email = doctor.userId?.email || doctor.user?.email || ""
  const phoneNumber = doctor.userId?.phoneNumber || doctor.user?.phoneNumber || ""

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                {getDoctorInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{fullName}</h3>
              <Badge variant="outline" className="mt-1">
                {doctor.specialization || "N/A"}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onEdit(doctor)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(doctor)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{email}</span>
            </div>
          )}
          {phoneNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{phoneNumber}</span>
            </div>
          )}
        </div>

        {/* Professional Details */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="font-medium">{doctor.experience || 0} years</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Consultation Fee</p>
              <p className="font-medium">₹{doctor.consultationFee || 0}</p>
            </div>
          </div>
        </div>

        {/* Qualification */}
        {doctor.qualification && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">Qualification</p>
            <p className="text-sm font-medium">{doctor.qualification}</p>
          </div>
        )}

        {/* Rating */}
        {doctor.rating > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-sm">{doctor.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              ({doctor.totalRatings || 0} reviews)
            </span>
          </div>
        )}

        {/* About */}
        {doctor.about && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-1">About</p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {doctor.about}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
