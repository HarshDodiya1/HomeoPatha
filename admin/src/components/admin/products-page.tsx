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
  Package,
  TrendingUp,
  DollarSign,
  Star,
  X,
} from "lucide-react"
import { useProductsStore } from "@/store/products.store"
import { ProductCard } from "@/components/admin/cards/product-card"
import { ProductDialog } from "@/components/admin/dialogs/product-dialog"
import { Product } from "@/types/product"

export function ProductsPage() {
  const { allProducts, isLoading, error, fetchAllProducts } = useProductsStore()

  const [showProductDialog, setShowProductDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Local filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minRating, setMinRating] = useState("")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Fetch all products on mount
  useEffect(() => {
    fetchAllProducts()
  }, [])

  // Get unique categories from all products
  const categories = useMemo(() => {
    return Array.from(new Set(allProducts.map(p => p.category))).sort()
  }, [allProducts])

  // Filter and sort products on client side
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === categoryFilter.toLowerCase()
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(product => 
        product.isActive === (statusFilter === "active")
      )
    }

    // Price range filter
    if (minPrice) {
      const min = parseFloat(minPrice)
      filtered = filtered.filter(product => product.currentPrice >= min)
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice)
      filtered = filtered.filter(product => product.currentPrice <= max)
    }

    // Rating filter
    if (minRating) {
      const min = parseFloat(minRating)
      filtered = filtered.filter(product => product.rating >= min)
    }

    // Sort products
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "currentPrice":
          comparison = a.currentPrice - b.currentPrice
          break
        case "rating":
          comparison = a.rating - b.rating
          break
        case "createdAt":
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [allProducts, searchQuery, categoryFilter, statusFilter, minPrice, maxPrice, minRating, sortBy, sortOrder])

  // Calculate stats from filtered products
  const stats = useMemo(() => {
    if (filteredProducts.length === 0) {
      return {
        totalProducts: 0,
        avgRating: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        activeProducts: 0,
        inactiveProducts: 0,
      }
    }

    const activeProducts = filteredProducts.filter(p => p.isActive).length
    const totalPrice = filteredProducts.reduce((sum, p) => sum + p.currentPrice, 0)
    const totalRating = filteredProducts.reduce((sum, p) => sum + p.rating, 0)
    const prices = filteredProducts.map(p => p.currentPrice)

    return {
      totalProducts: filteredProducts.length,
      avgRating: totalRating / filteredProducts.length,
      avgPrice: totalPrice / filteredProducts.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      activeProducts,
      inactiveProducts: filteredProducts.length - activeProducts,
    }
  }, [filteredProducts])

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }, [filteredProducts, currentPage, itemsPerPage])

  // Pagination info
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
    return {
      currentPage,
      totalPages,
      totalProducts: filteredProducts.length,
      itemsPerPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    }
  }, [filteredProducts.length, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, statusFilter, minPrice, maxPrice, minRating, sortBy, sortOrder])

  const handleClearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setMinPrice("")
    setMaxPrice("")
    setMinRating("")
    setSortBy("createdAt")
    setSortOrder("desc")
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setShowProductDialog(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDialog(true)
  }

  const handleDialogSuccess = () => {
    // Products will be automatically refreshed by the store
  }

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || statusFilter !== "all" || 
                          minPrice || maxPrice || minRating

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProducts} active, {stats.inactiveProducts} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgPrice > 0 ? `₹${stats.avgPrice.toFixed(2)}` : '₹0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProducts > 0 
                ? `Range: ₹${stats.minPrice} - ₹${stats.maxPrice}`
                : 'No products'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalProducts > 0 
                ? `${((stats.activeProducts / stats.totalProducts) * 100).toFixed(1)}% of total`
                : 'No products'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Products</CardTitle>
            <Button onClick={handleAddProduct}>
              <Plus className="mr-2 size-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products by title, category, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 size-4" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      Active
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minPrice">Min Price (₹)</Label>
                      <Input
                        id="minPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxPrice">Max Price (₹)</Label>
                      <Input
                        id="maxPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="1000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minRating">Min Rating</Label>
                      <Input
                        id="minRating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="0"
                        value={minRating}
                        onChange={(e) => setMinRating(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sortBy">Sort By</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger id="sortBy">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">Date Created</SelectItem>
                          <SelectItem value="title">Title</SelectItem>
                          <SelectItem value="currentPrice">Price</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sortOrder">Order</Label>
                      <Select value={sortOrder} onValueChange={setSortOrder}>
                        <SelectTrigger id="sortOrder">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Descending</SelectItem>
                          <SelectItem value="asc">Ascending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        onClick={handleClearFilters}
                        className="w-full"
                      >
                        <X className="mr-2 size-4" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-4 w-20" />
                    <Skeleton className="mb-2 h-5 w-full" />
                    <Skeleton className="mb-3 h-4 w-full" />
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto size-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {hasActiveFilters ? "No products match your filters" : "No products found"}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {hasActiveFilters 
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first product"}
              </p>
              {hasActiveFilters ? (
                <Button className="mt-4" onClick={handleClearFilters}>
                  <X className="mr-2 size-4" />
                  Clear Filters
                </Button>
              ) : (
                <Button className="mt-4" onClick={handleAddProduct}>
                  <Plus className="mr-2 size-4" />
                  Add Product
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Results count */}
              <div className="text-sm text-muted-foreground">
                Showing {paginatedProducts.length} of {filteredProducts.length} products
                {hasActiveFilters && " (filtered)"}
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onEdit={handleEditProduct}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum: number
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i
                        } else {
                          pageNum = pagination.currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <ProductDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        product={selectedProduct}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
