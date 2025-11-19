"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  uploadFunction: (files: File[]) => Promise<string[]>
  label?: string
  maxImages?: number
  disabled?: boolean
}

export function ImageUpload({
  images,
  onImagesChange,
  uploadFunction,
  label = "Images",
  maxImages,
  disabled = false,
}: ImageUploadProps) {
  const [uploadingImages, setUploadingImages] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingImages(true)
      setError("")

      const fileArray = Array.from(files)

      // Check max images limit
      if (maxImages && images.length + fileArray.length > maxImages) {
        setError(`Maximum ${maxImages} image(s) allowed`)
        toast.error(`Maximum ${maxImages} image(s) allowed`)
        setUploadingImages(false)
        return
      }

      // Validate file types
      const validFiles = fileArray.filter((file) => {
        if (!file.type.startsWith("image/")) {
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
      const uploadedUrls = await uploadFunction(validFiles)

      onImagesChange([...images, ...uploadedUrls])
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
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Image Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={!maxImages || maxImages > 1}
          onChange={handleImageUpload}
          className="hidden"
          disabled={uploadingImages || disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImages || disabled || (maxImages ? images.length >= maxImages : false)}
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
          {images.length} {maxImages ? `/ ${maxImages}` : ""} image(s)
        </span>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
              <img src={url} alt={`Upload ${index + 1}`} className="size-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute right-1 top-1 size-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeImage(index)}
                disabled={disabled}
              >
                <X className="size-3" />
              </Button>
              {index === 0 && <Badge className="absolute bottom-1 left-1 text-xs">Primary</Badge>}
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
  )
}
