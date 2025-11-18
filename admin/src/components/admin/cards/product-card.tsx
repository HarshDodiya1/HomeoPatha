"use client"

import { useState } from "react"
import { Product } from "@/types/product"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { MoreVertical, Edit, Trash2, Star } from "lucide-react"
import { toast } from "sonner"
import { useProductsStore } from "@/store/products.store"

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteProduct } = useProductsStore()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteProduct(product._id)
      toast.success("Product deleted successfully")
      setShowDeleteDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  const getDiscountPercentage = () => {
    if (product.oldPrice && product.currentPrice < product.oldPrice) {
      return Math.round(((product.oldPrice - product.currentPrice) / product.oldPrice) * 100)
    }
    return 0
  }

  const discount = getDiscountPercentage()

  return (
    <>
      <Card className="group overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
              No Image
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.badge && (
              <Badge variant="default" className="shadow-sm">
                {product.badge}
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="shadow-sm">
                -{discount}%
              </Badge>
            )}
          </div>

          {/* Status Badge */}
          <div className="absolute right-2 top-2">
            <Badge variant={product.isActive ? "default" : "secondary"} className="shadow-sm">
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Actions Menu */}
          <div className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100">
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
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Edit className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>
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
          {/* Category */}
          <p className="mb-1 text-xs text-muted-foreground">{product.category}</p>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 font-semibold leading-tight">
            {product.title}
          </h3>

          {/* Description */}
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>

          {/* Rating */}
          <div className="mb-3 flex items-center gap-1">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({product.rating.toFixed(1)})</span>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {product.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t p-4">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">₹{product.currentPrice}</span>
            {product.oldPrice && product.oldPrice > product.currentPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.oldPrice}
              </span>
            )}
          </div>

          {/* Quick Edit Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(product)}
          >
            <Edit className="mr-1 size-3" />
            Edit
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{product.title}&quot;. This action cannot be undone.
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
