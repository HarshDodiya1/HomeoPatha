"use client"

import { ProductForm } from "@/components/admin/forms/product-form"

export default function NewProductPage() {
  return (
    <div>
      <ProductForm onSubmit={(values) => console.log("Submit:", values)} />
    </div>
  )
}
