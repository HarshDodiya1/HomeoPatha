"use client"

import { useState } from "react"
import { Blog } from "@/types/blog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreVertical, Edit, Trash2, Eye, EyeOff, Calendar, User } from "lucide-react"
import { toast } from "sonner"
import { useBlogsStore } from "@/store/blogs.store"
import { format } from "date-fns"

interface BlogCardProps {
  blog: Blog
  onEdit: (blog: Blog) => void
}

export function BlogCard({ blog, onEdit }: BlogCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingPublish, setIsTogglingPublish] = useState(false)
  const { deleteBlog, togglePublishStatus } = useBlogsStore()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteBlog(blog._id)
      toast.success("Blog deleted successfully")
      setShowDeleteDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete blog")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublish = async () => {
    try {
      setIsTogglingPublish(true)
      await togglePublishStatus(blog._id)
      toast.success(blog.published ? "Blog unpublished" : "Blog published")
    } catch (error: any) {
      toast.error(error.message || "Failed to update blog status")
    } finally {
      setIsTogglingPublish(false)
    }
  }

  const getAuthorInitials = () => {
    if (!blog.author?.userId?.fullName) return "?"
    const names = blog.author.userId.fullName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return blog.author.userId.fullName.substring(0, 2).toUpperCase()
  }

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {blog.coverImage ? (
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400">
              <span className="text-lg font-semibold">No Cover</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute left-2 top-2">
            <Badge variant={blog.published ? "default" : "secondary"} className="shadow-sm">
              {blog.published ? "Published" : "Draft"}
            </Badge>
          </div>

          {/* Actions Menu */}
          <div className="absolute right-2 top-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="size-8 shadow-md"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(blog)}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleTogglePublish}
                  disabled={isTogglingPublish}
                >
                  {blog.published ? (
                    <>
                      <EyeOff className="mr-2 size-4" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 size-4" />
                      Publish
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-semibold leading-tight text-base">
            {blog.title}
          </h3>

          {/* Summary */}
          {blog.summary && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {blog.summary}
            </p>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {blog.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {blog.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{blog.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Author & Date */}
          <div className="flex items-center justify-between pt-3 border-t">
            {blog.author ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-6">
                  <AvatarImage src={blog.author.images?.[0]} alt={blog.author.userId?.fullName} />
                  <AvatarFallback className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {getAuthorInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                  {blog.author.userId?.fullName || "Unknown"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="size-3" />
                <span>No author</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              <span>
                {blog.publishedAt 
                  ? format(new Date(blog.publishedAt), "MMM d, yyyy")
                  : format(new Date(blog.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{blog.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
