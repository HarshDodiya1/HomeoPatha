"use client"

import { useState } from "react"
import { Feedback } from "@/types/feedback"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar, 
  Star,
  Quote,
  User,
} from "lucide-react"
import { toast } from "sonner"
import { useFeedbacksStore } from "@/store/feedbacks.store"
import { format } from "date-fns"

interface FeedbackCardProps {
  feedback: Feedback
  onEdit: (feedback: Feedback) => void
}

export function FeedbackCard({ feedback, onEdit }: FeedbackCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingPublish, setIsTogglingPublish] = useState(false)
  const { deleteFeedback, togglePublishStatus } = useFeedbacksStore()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteFeedback(feedback._id)
      toast.success("Feedback deleted successfully")
      setShowDeleteDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete feedback")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePublish = async () => {
    try {
      setIsTogglingPublish(true)
      await togglePublishStatus(feedback._id)
      toast.success(feedback.isPublished ? "Feedback unpublished" : "Feedback published")
    } catch (error: any) {
      toast.error(error.message || "Failed to update feedback status")
    } finally {
      setIsTogglingPublish(false)
    }
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`size-4 ${
          index < count 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ))
  }

  const getUserInitials = () => {
    if (!feedback.userName) return "?"
    const names = feedback.userName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return feedback.userName.substring(0, 2).toUpperCase()
  }

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <CardContent className="p-5">
          {/* Header with Status and Actions */}
          <div className="flex items-start justify-between mb-4">
            <Badge variant={feedback.isPublished ? "default" : "secondary"}>
              {feedback.isPublished ? "Published" : "Draft"}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8"
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(feedback)}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleTogglePublish}
                  disabled={isTogglingPublish}
                >
                  {feedback.isPublished ? (
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

          {/* Quote */}
          <div className="mb-4">
            <Quote className="size-6 text-green-600 dark:text-green-500 mb-2 rotate-180" />
            <p className="text-sm text-muted-foreground line-clamp-4 italic">
              "{feedback.quote}"
            </p>
          </div>

          {/* Stars Rating */}
          <div className="flex items-center gap-1 mb-4">
            {renderStars(feedback.stars)}
            <span className="text-xs text-muted-foreground ml-1">
              ({feedback.stars}/5)
            </span>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold text-sm">
              {getUserInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {feedback.userName || "Anonymous"}
              </p>
              {feedback.userRole && (
                <p className="text-xs text-muted-foreground truncate">
                  {feedback.userRole}
                </p>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            <span>{format(new Date(feedback.createdAt), "MMM d, yyyy")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feedback from{" "}
              <span className="font-medium">{feedback.userName || "Anonymous"}</span>?
              This action cannot be undone.
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
