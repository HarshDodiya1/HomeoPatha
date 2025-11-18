"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { useProductsStore } from "@/store/products.store"
import { productService } from "@/lib/services/products.service"
import { Product } from "@/types/product"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSuccess?: () => void
}

interface FormData {
  title: string
  category: string
  description: string
  badge: string
  rating: string
  oldPrice: string
  currentPrice: string
  tags: string
  isActive: boolean
}

export function ProductDialog({ open, onOpenChange, product, onSuccess }: ProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploadingImages, setUploadingImages] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { createProduct, updateProduct } = useProductsStore()
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    description: "",
    badge: "",
    rating: "0",
    oldPrice: "",
    currentPrice: "",
    tags: "",
    isActive: true,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        category: product.category,
        description: product.description,
        badge: product.badge || "",
        rating: product.rating.toString(),
        oldPrice: product.oldPrice?.toString() || "",
        currentPrice: product.currentPrice.toString(),
        tags: product.tags.join(", "),
        isActive: product.isActive,
      })
      setImages(product.images || [])
    } else {
      resetForm()
    }
  }, [product, open])

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError("")
  }

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      description: "",
      badge: "",
      rating: "0",
      oldPrice: "",
      currentPrice: "",
      tags: "",
      isActive: true,
    })
    setImages([])
    setError("")
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingImages(true)
      setError("")

      const fileArray = Array.from(files)
      
      // Validate file types
      const validFiles = fileArray.filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) {
        setUploadingImages(false)
        return
      }

      toast.info(`Uploading ${validFiles.length} image(s)...`)
      const uploadedUrls = await productService.uploadMultipleImages(validFiles)
      
      setImages(prev => [...prev, ...uploadedUrls])
      toast.success(`${validFiles.length} image(s) uploaded successfully`)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: any) {
      const errorMessage = err.message || "Failed to upload images"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return "Title is required"
    }
    if (!formData.category.trim()) {
      return "Category is required"
    }
    if (!formData.description.trim()) {
      return "Description is required"
    }
    if (!formData.currentPrice || parseFloat(formData.currentPrice) <= 0) {
      return "Valid current price is required"
    }
    if (formData.oldPrice && parseFloat(formData.oldPrice) < 0) {
      return "Old price cannot be negative"
    }
    const rating = parseFloat(formData.rating)
    if (rating < 0 || rating > 5) {
      return "Rating must be between 0 and 5"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setIsLoading(true)

      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const productData = {
        title: formData.title.trim(),
        category: formData.category.trim(),
        description: formData.description.trim(),
        badge: formData.badge.trim() || undefined,
        rating: parseFloat(formData.rating),
        oldPrice: formData.oldPrice ? parseFloat(formData.oldPrice) : undefined,
        currentPrice: parseFloat(formData.currentPrice),
        images,
        tags,
        isActive: formData.isActive,
      }

      if (product) {
        await updateProduct(product._id, productData)
        toast.success("Product updated successfully")
      } else {
        await createProduct(productData)
        toast.success("Product created successfully")
      }

      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to save product"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update product details and images" : "Fill in the details to create a new product"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Image Upload Section */}
            <div className="space-y-3">
              <Label>Product Images</Label>
              
              {/* Image Upload Button */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                  className="w-full sm:w-auto"
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 size-4" />
                      Upload Images
                    </>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {images.length} image(s)
                </span>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((url, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="size-full object-cover"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute right-1 top-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeImage(index)}
                      >
                        <X className="size-3" />
                      </Button>
                      {index === 0 && (
                        <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="mx-auto size-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No images uploaded</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Arnica Montana 30C"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  placeholder="e.g., Homeopathic Medicine"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => handleInputChange("badge", e.target.value)}
                  placeholder="e.g., Best Seller, New"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Product description..."
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPrice">Current Price (₹) *</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.currentPrice}
                  onChange={(e) => handleInputChange("currentPrice", e.target.value)}
                  placeholder="249.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oldPrice">Old Price (₹)</Label>
                <Input
                  id="oldPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.oldPrice}
                  onChange={(e) => handleInputChange("oldPrice", e.target.value)}
                  placeholder="299.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => handleInputChange("rating", e.target.value)}
                  placeholder="4.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  placeholder="pain relief, natural, homeopathy"
                />
              </div>

              <div className="flex items-center justify-between space-x-2 sm:col-span-2">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Make product visible to customers
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading || uploadingImages}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || uploadingImages}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {product ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>{product ? "Update Product" : "Create Product"}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
