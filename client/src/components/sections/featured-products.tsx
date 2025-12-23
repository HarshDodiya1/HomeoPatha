"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Star, ShoppingCart, ArrowRight, Heart, Plus, Package, Leaf, Zap } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { productService } from "@/lib/services/product.service"
import { Product } from "@/types/product"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts({ page: 1, limit: 8 });
        setProducts(response.data.products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-secondary/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(22,163,74,0.08),transparent_60%)]" />
      
      {/* Decorative floating elements */}
      <div className="absolute top-40 left-20 w-3 h-3 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0s' }} />
      <div className="absolute top-60 right-32 w-2 h-2 rounded-full bg-accent/40 animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-40 left-40 w-2 h-2 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: '1s' }} />
      
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14"
        >
          <div>
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 text-accent text-sm font-medium mb-4 border border-accent/20"
            >
              <Leaf className="h-4 w-4" />
              Shop Essentials
            </motion.span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">Products</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Quality homeopathy medicines and health products delivered to your doorstep.
            </p>
          </div>
          <Link href="/products">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full group border-accent/30 hover:bg-accent hover:text-white hover:border-accent"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-xl opacity-30" />
                <div className="relative bg-white dark:bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50">
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-10 bg-muted animate-pulse rounded-xl mt-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Product Grid */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            {products.map((product, index) => (
              <motion.div key={product._id} variants={itemVariants}>
                <Link href={`/products/${product._id}`} className="block group">
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
                        {product.oldPrice && product.oldPrice > product.currentPrice && (
                          <div className="absolute top-3 right-3">
                            <div className="bg-rose-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                              -{Math.round(((product.oldPrice - product.currentPrice) / product.oldPrice) * 100)}%
                            </div>
                          </div>
                        )}

                        {/* Quick Actions - appears on hover */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                          <button className="w-11 h-11 rounded-full bg-white/95 dark:bg-card/95 shadow-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/20">
                            <Heart className="h-5 w-5" />
                          </button>
                          <button className="w-11 h-11 rounded-full bg-gradient-to-r from-primary to-accent shadow-xl shadow-primary/30 flex items-center justify-center text-white hover:shadow-primary/50 transition-all duration-200">
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Bottom Add to Cart - mobile friendly */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                          <Button className="w-full rounded-xl bg-white/95 dark:bg-card/95 text-foreground hover:bg-primary hover:text-white shadow-xl backdrop-blur-sm gap-2 font-semibold border border-white/20">
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Rating with enhanced styling */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{product.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">(Reviews)</span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-foreground line-clamp-2 mb-3 group-hover:text-primary transition-colors leading-snug min-h-[2.75rem]">
                          {product.title}
                        </h3>

                        {/* Price section */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            ₹{product.currentPrice}
                          </span>
                          {product.oldPrice && product.oldPrice > product.currentPrice && (
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
      </div>
    </section>
  )
}
