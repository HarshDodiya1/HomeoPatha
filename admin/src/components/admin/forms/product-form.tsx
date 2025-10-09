"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as React from "react"

export function ProductForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: Partial<{
    name: string
    description: string
    price: string
    stock: string
    category: string
    imageUrl: string
  }>
  onSubmit?: (values: Record<string, string>) => void
}) {
  const [values, setValues] = React.useState<Record<string, string>>({
    name: defaultValues?.name || "",
    description: defaultValues?.description || "",
    price: defaultValues?.price || "",
    stock: defaultValues?.stock || "",
    category: defaultValues?.category || "",
    imageUrl: defaultValues?.imageUrl || "",
  })
  const change = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => change("name", e.currentTarget.value)}
            placeholder="Product name"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={values.description}
            onChange={(e) => change("description", e.currentTarget.value)}
            placeholder="Short description..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={values.price}
            onChange={(e) => change("price", e.currentTarget.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            value={values.stock}
            onChange={(e) => change("stock", e.currentTarget.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={values.category} onValueChange={(v) => change("category", v)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supplements">Supplements</SelectItem>
              <SelectItem value="skincare">Skincare</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="image">Image Upload</Label>
          <Input id="image" type="file" onChange={(e) => change("imageUrl", e.currentTarget.value)} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="button" onClick={() => onSubmit?.(values)}>
          Save Product
        </Button>
      </CardFooter>
    </Card>
  )
}
