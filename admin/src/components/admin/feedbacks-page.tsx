"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  MessageSquareQuote,
  Eye,
  EyeOff,
  X,
  Star,
} from "lucide-react"
import { useFeedbacksStore } from "@/store/feedbacks.store"
import { FeedbackCard } from "@/components/admin/cards/feedback-card"
import { FeedbackDialog } from "@/components/admin/dialogs/feedback-dialog"
import { Feedback } from "@/types/feedback"

export function FeedbacksPage() {
  const { allFeedbacks, isLoading, error, fetchAllFeedbacks, stats } = useFeedbacksStore()

  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Local filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [starsFilter, setStarsFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Fetch all feedbacks on mount
  useEffect(() => {
    fetchAllFeedbacks()
  }, [])

  // Filter and sort feedbacks on client side
  const filteredFeedbacks = useMemo(() => {
    let filtered = [...allFeedbacks]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(feedback => 
        feedback.quote.toLowerCase().includes(query) ||
        feedback.userName?.toLowerCase().includes(query) ||
        feedback.userRole?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(feedback => 
        feedback.isPublished === (statusFilter === "published")
      )
    }

    // Stars filter
    if (starsFilter !== "all") {
      filtered = filtered.filter(feedback => 
        feedback.stars === parseInt(starsFilter)
      )
    }

    // Sort feedbacks
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "userName":
          const nameA = a.userName || ""
          const nameB = b.userName || ""
          comparison = nameA.localeCompare(nameB)
          break
        case "stars":
          comparison = a.stars - b.stars
          break
        case "createdAt":
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [allFeedbacks, searchQuery, statusFilter, starsFilter, sortBy, sortOrder])

  // Paginate feedbacks
  const paginatedFeedbacks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredFeedbacks.slice(startIndex, endIndex)
  }, [filteredFeedbacks, currentPage, itemsPerPage])

  // Pagination info
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage)
    return {
      currentPage,
      totalPages,
      totalFeedbacks: filteredFeedbacks.length,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    }
  }, [filteredFeedbacks.length, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, starsFilter, sortBy, sortOrder])

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setStarsFilter("all")
    setSortBy("createdAt")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  const handleEditFeedback = (feedback: Feedback) => {
    setSelectedFeedback(feedback)
    setShowFeedbackDialog(true)
  }

  const handleCreateFeedback = () => {
    setSelectedFeedback(null)
    setShowFeedbackDialog(true)
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || starsFilter !== "all"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
          <p className="text-muted-foreground">
            Manage customer testimonials and reviews for your website.
          </p>
        </div>
        <Button onClick={handleCreateFeedback}>
          <Plus className="mr-2 size-4" />
          Add Testimonial
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
            <MessageSquareQuote className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeedbacks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.publishedFeedbacks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpublished</CardTitle>
            <EyeOff className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unpublishedFeedbacks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="size-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search testimonials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="shrink-0"
                >
                  <Filter className="mr-2 size-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    size="icon"
                    className="shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="unpublished">Unpublished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Rating</Label>
                  <Select value={starsFilter} onValueChange={setStarsFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="stars">Rating</SelectItem>
                      <SelectItem value="userName">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Order</Label>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-4" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Feedbacks Grid */}
      {!isLoading && filteredFeedbacks.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedFeedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback._id}
                feedback={feedback}
                onEdit={handleEditFeedback}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, pagination.totalFeedbacks)} of{" "}
                {pagination.totalFeedbacks} testimonials
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && filteredFeedbacks.length === 0 && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <MessageSquareQuote className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? "No testimonials found" : "No testimonials yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters or search query."
                : "Add your first customer testimonial to get started."}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={handleCreateFeedback}>
                <Plus className="mr-2 size-4" />
                Add Testimonial
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
        feedback={selectedFeedback}
        onSuccess={() => fetchAllFeedbacks()}
      />
    </div>
  )
}
