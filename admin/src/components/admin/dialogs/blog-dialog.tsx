"use client"

import { useState, useEffect } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useBlogsStore } from "@/store/blogs.store"
import { useDoctorsStore } from "@/store/doctors.store"
import { blogService } from "@/lib/services/blogs.service"
import { Blog } from "@/types/blog"
import { ImageUpload } from "@/components/ui/image-upload"

interface BlogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blog?: Blog | null
  onSuccess?: () => void
}

interface FormData {
  title: string
  summary: string
  content: string
  tags: string
  author: string
  published: boolean
}

export function BlogDialog({ open, onOpenChange, blog, onSuccess }: BlogDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [coverImage, setCoverImage] = useState<string[]>([])
  
  const { createBlog, updateBlog } = useBlogsStore()
  const { doctors, fetchDoctors, isLoadingDoctors } = useDoctorsStore()
  
  const [formData, setFormData] = useState<FormData>({
    title: "",
    summary: "",
    content: "",
    tags: "",
    author: "",
    published: false,
  })

  // Fetch doctors on mount
  useEffect(() => {
    if (open && doctors.length === 0) {
      fetchDoctors(1, 100)
    }
  }, [open, doctors.length, fetchDoctors])

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        summary: blog.summary || "",
        content: blog.content || "",
        tags: blog.tags.join(", "),
        author: blog.author?._id || "",
        published: blog.published,
      })
      setCoverImage(blog.coverImage ? [blog.coverImage] : [])
    } else {
      resetForm()
    }
  }, [blog, open])

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
      summary: "",
      content: "",
      tags: "",
      author: "",
      published: false,
    })
    setCoverImage([])
    setError("")
  }

  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return "Title is required"
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

      const blogData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content,
        coverImage: coverImage[0] || "",
        tags,
        author: formData.author || undefined,
        published: formData.published,
      }

      if (blog) {
        await updateBlog(blog._id, blogData)
        toast.success("Blog updated successfully")
      } else {
        await createBlog(blogData)
        toast.success("Blog created successfully")
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{blog ? "Edit Blog" : "Create New Blog"}</DialogTitle>
          <DialogDescription>
            {blog
              ? "Update the blog details below."
              : "Fill in the details to create a new blog post."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter blog title"
                disabled={isLoading}
              />
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                placeholder="Brief summary of the blog"
                rows={2}
                disabled={isLoading}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Full blog content (supports HTML)"
                rows={8}
                disabled={isLoading}
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <ImageUpload
                images={coverImage}
                onImagesChange={setCoverImage}
                maxImages={1}
                disabled={isLoading}
                uploadFunction={async (files: File[]) => {
                  const urls: string[] = []
                  for (const file of files) {
                    const url = await blogService.uploadImage(file)
                    urls.push(url)
                  }
                  return urls
                }}
              />
            </div>

            {/* Author (Doctor) */}
            <div className="space-y-2">
              <Label htmlFor="author">Author (Doctor)</Label>
              <Select
                value={formData.author || "none"}
                onValueChange={(value) => handleInputChange("author", value === "none" ? "" : value)}
                disabled={isLoading || isLoadingDoctors}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an author (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No author</SelectItem>
                  {doctors.map((doctor) => {
                    // Handle both populated userId (object) and user property
                    const userId = doctor.userId as any;
                    const fullName = userId?.fullName || doctor.user?.fullName || "Unknown";
                    return (
                      <SelectItem key={doctor._id || doctor.id} value={doctor._id || doctor.id}>
                        {fullName} - {doctor.qualification}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange("tags", e.target.value)}
                placeholder="Comma-separated tags (e.g., health, homeopathy, natural)"
                disabled={isLoading}
              />
            </div>

            {/* Published */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="published" className="text-base">
                  Publish Blog
                </Label>
                <p className="text-sm text-muted-foreground">
                  Make this blog visible to the public
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => handleInputChange("published", checked)}
                disabled={isLoading}
              />
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {blog ? "Update Blog" : "Create Blog"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
