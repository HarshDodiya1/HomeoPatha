"use client"

import { DoctorForm } from "@/components/admin/forms/doctor-form"

export default function NewDoctorPage() {
  return (
    <div>
      <DoctorForm onSubmit={(values) => console.log("Submit:", values)} />
    </div>
  )
}
