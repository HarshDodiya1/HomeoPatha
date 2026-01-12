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
  FileText,
  Eye,
  EyeOff,
  X,
} from "lucide-react"
import { useBlogsStore } from "@/store/blogs.store"
import { useDoctorsStore } from "@/store/doctors.store"
import { BlogCard } from "@/components/admin/cards/blog-card"
import { BlogDialog } from "@/components/admin/dialogs/blog-dialog"
import { Blog } from "@/types/blog"

export function BlogsPage() {
  const { allBlogs, isLoading, error, fetchAllBlogs, stats } = useBlogsStore()
  const { doctors, fetchDoctors } = useDoctorsStore()

  const [showBlogDialog, setShowBlogDialog] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Local filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [authorFilter, setAuthorFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Fetch all blogs and doctors on mount
  useEffect(() => {
    fetchAllBlogs()
    fetchDoctors(1, 100)
  }, [])

  // Filter and sort blogs on client side
  const filteredBlogs = useMemo(() => {
    let filtered = [...allBlogs]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(query) ||
        blog.summary?.toLowerCase().includes(query) ||
        blog.tags.some(tag => tag.toLowerCase().includes(query)) ||
        blog.author.fullName.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(blog => 
        blog.published === (statusFilter === "published")
      )
    }

    // Author filter
    if (authorFilter !== "all") {
      filtered = filtered.filter(blog => 
        blog.author?._id === authorFilter
      )
    }

    // Sort blogs
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "publishedAt":
          const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
          const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
          comparison = dateA - dateB
          break
        case "createdAt":
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [allBlogs, searchQuery, statusFilter, authorFilter, sortBy, sortOrder])

  // Paginate blogs
  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredBlogs.slice(startIndex, endIndex)
  }, [filteredBlogs, currentPage, itemsPerPage])

  // Pagination info
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
    return {
      currentPage,
      totalPages,
      totalBlogs: filteredBlogs.length,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    }
  }, [filteredBlogs.length, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, authorFilter, sortBy, sortOrder])

  const handleClearFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setAuthorFilter("all")
    setSortBy("createdAt")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog)
    setShowBlogDialog(true)
  }

  const handleCreateBlog = () => {
    setSelectedBlog(null)
    setShowBlogDialog(true)
  }

  const hasActiveFilters = searchQuery || statusFilter !== "all" || authorFilter !== "all"

  // Get unique authors from blogs
  const blogAuthors = useMemo(() => {
    const authorsMap = new Map()
    allBlogs.forEach(blog => {
      if (blog.author) {
        authorsMap.set(blog.author._id, blog.author)
      }
    })
    return Array.from(authorsMap.values())
  }, [allBlogs])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blogs</h1>
          <p className="text-muted-foreground">
            Create and manage blog posts for your website.
          </p>
        </div>
        <Button onClick={handleCreateBlog}>
          <Plus className="mr-2 size-4" />
          Create Blog
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBlogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.publishedBlogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <EyeOff className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftBlogs}</div>
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
                  placeholder="Search blogs..."
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
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Author</Label>
                  <Select value={authorFilter} onValueChange={setAuthorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All authors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      {blogAuthors.map((author) => (
                        <SelectItem key={author._id} value={author._id}>
                          {author.fullName}
                        </SelectItem>
                      ))}
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
                      <SelectItem value="publishedAt">Published Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
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
              <Skeleton className="aspect-video" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-3" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Blogs Grid */}
      {!isLoading && filteredBlogs.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                onEdit={handleEditBlog}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, pagination.totalBlogs)} of{" "}
                {pagination.totalBlogs} blogs
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
      {!isLoading && filteredBlogs.length === 0 && (
        <Card className="py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <FileText className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? "No blogs found" : "No blogs yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters or search query."
                : "Create your first blog post to get started."}
            </p>
            {hasActiveFilters ? (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button onClick={handleCreateBlog}>
                <Plus className="mr-2 size-4" />
                Create Blog
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Blog Dialog */}
      <BlogDialog
        open={showBlogDialog}
        onOpenChange={setShowBlogDialog}
        blog={selectedBlog}
        onSuccess={() => fetchAllBlogs()}
      />
    </div>
  )
}
