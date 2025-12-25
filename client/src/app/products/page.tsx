"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { productService } from "@/lib/services/product.service";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ShoppingCart,
  Star,
  Filter,
  Heart,
  Plus,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Package,
  Zap,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { CartSidebar } from "@/components/cart-sidebar";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart, openCart } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, sortBy, sortOrder]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productService.getAllProducts({
        page,
        limit: 12,
        search: search || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        sortBy,
        sortOrder,
      });

      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
      if (response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    try {
      await addToCart({ productId, quantity: 1 });
      openCart();
    } catch (error) {
      // Error handled in store
    }
  };

  return (
    <>
      <main className="min-h-screen pt-28 pb-16 relative overflow-hidden">
        {/* Premium background */}
        <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.06),transparent_60%)] -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(22,163,74,0.06),transparent_60%)] -z-10" />

        {/* Floating decorative elements */}
        <div
          className="fixed top-40 left-10 w-3 h-3 rounded-full bg-primary/30 animate-bounce pointer-events-none"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="fixed top-60 right-20 w-2 h-2 rounded-full bg-accent/30 animate-bounce pointer-events-none"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="fixed bottom-40 left-1/4 w-2 h-2 rounded-full bg-primary/20 animate-bounce pointer-events-none"
          style={{ animationDelay: "1s" }}
        />

        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 text-accent text-sm font-medium mb-4 border border-accent/20"
            >
              <Leaf className="h-4 w-4" />
              Natural Remedies
            </motion.span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
              Homeopathic{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
                Products
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Discover natural remedies for your health and wellness, delivered
              to your doorstep.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-10 space-y-4"
          >
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 rounded-xl bg-white dark:bg-card border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="rounded-xl px-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/20"
              >
                Search
              </Button>
            </form>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters:</span>
              </div>

              <Select
                value={selectedCategory}
                onValueChange={(v) => {
                  setSelectedCategory(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] rounded-xl bg-white dark:bg-card border-border/50">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={(v) => {
                  setSortBy(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] rounded-xl bg-white dark:bg-card border-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="createdAt">Newest First</SelectItem>
                  <SelectItem value="currentPrice">Price</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="title">Name</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(v) => {
                  setSortOrder(v as "asc" | "desc");
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] rounded-xl bg-white dark:bg-card border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Products Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl opacity-30" />
                    <div className="relative bg-white dark:bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
                      <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-muted animate-pulse rounded-lg w-3/4" />
                        <div className="h-4 bg-muted animate-pulse rounded-lg w-1/2" />
                        <div className="h-10 bg-muted animate-pulse rounded-xl mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Package className="h-12 w-12 text-primary/60" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Try adjusting your filters or search query to find what you're
                  looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-full"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("all");
                    setPage(1);
                    fetchProducts();
                  }}
                >
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="products"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {products.map((product) => (
                  <motion.div key={product._id} variants={itemVariants}>
                    <Link
                      href={`/products/${product._id}`}
                      className="block group"
                    >
                      <div className="relative">
                        {/* Glow effect */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/40 to-accent/40 rounded-[20px] blur-md opacity-0 group-hover:opacity-25 transition-all duration-500" />

                        <div className="relative bg-white dark:bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-primary/5">
                          {/* Image Container */}
                          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/50 to-secondary/20">
                            {product.images && product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.title}
                                fill
                                className="object-cover transition-all duration-700 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-16 w-16 text-muted-foreground/20" />
                              </div>
                            )}

                            {/* Gradient overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Badge */}
                            {product.badge && (
                              <Badge className="absolute top-3 left-3 bg-gradient-to-r from-accent to-primary text-white border-0 rounded-full px-3 py-1 text-xs font-semibold shadow-lg shadow-primary/30">
                                <Zap className="h-3 w-3 mr-1" />
                                {product.badge}
                              </Badge>
                            )}

                            {/* Discount badge */}
                            {product.oldPrice &&
                              product.oldPrice > product.currentPrice && (
                                <div className="absolute top-3 right-3">
                                  <div className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                                    -
                                    {Math.round(
                                      ((product.oldPrice -
                                        product.currentPrice) /
                                        product.oldPrice) *
                                        100
                                    )}
                                    %
                                  </div>
                                </div>
                              )}

                            {/* Quick Actions */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                              <button className="w-11 h-11 rounded-full bg-white/95 dark:bg-card/95 shadow-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/20">
                                <Heart className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => handleAddToCart(e, product._id)}
                                className="w-11 h-11 rounded-full bg-gradient-to-r from-primary to-accent shadow-xl shadow-primary/30 flex items-center justify-center text-white hover:shadow-primary/50 transition-all duration-200"
                              >
                                <Plus className="h-5 w-5" />
                              </button>
                            </div>

                            {/* Bottom Add to Cart */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                              <Button
                                onClick={(e) => handleAddToCart(e, product._id)}
                                className="w-full rounded-xl bg-white/95 dark:bg-card/95 text-foreground hover:bg-primary hover:text-white shadow-xl backdrop-blur-sm gap-2 font-semibold border border-white/20"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            {/* Rating */}
                            <div className="flex items-center gap-1.5 mb-2">
                              <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                  {product.rating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {product.category}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug min-h-[2.75rem]">
                              {product.title}
                            </h3>

                            {/* Price */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                ₹{product.currentPrice}
                              </span>
                              {product.oldPrice &&
                                product.oldPrice > product.currentPrice && (
                                  <span className="text-sm text-muted-foreground line-through">
                                    ₹{product.oldPrice}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && !isLoading && products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-12 flex justify-center items-center gap-3"
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full gap-2 border-border/50 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2 px-4">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                        page === pageNum
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/30"
                          : "bg-white dark:bg-card border border-border/50 hover:border-primary/50 text-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full gap-2 border-border/50 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </main>
      <CartSidebar />
    </>
  );
}
