"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Star, ShoppingCart, ArrowRight, Heart, Plus } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { productService } from "@/lib/services/product.service"
import { Product } from "@/types/product"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
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
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              Shop Essentials
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Medical Products
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Quality homeopathy medicines and health products delivered to your doorstep.
            </p>
          </div>
          <Link href="/products">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full group"
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
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square bg-muted animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  <div className="h-10 bg-muted animate-pulse rounded-xl mt-2" />
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
            {products.map((product) => (
              <motion.div key={product._id} variants={itemVariants}>
                <Link href={`/products/${product._id}`} className="block group">
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-secondary/30">
                      {product.images && product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Badge */}
                      {product.badge && (
                        <Badge className="absolute top-3 left-3 bg-accent text-white border-0 rounded-full px-3">
                          {product.badge}
                        </Badge>
                      )}

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                          <Heart className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Quick Add Button */}
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Button className="w-full rounded-xl shadow-lg gap-2">
                          <Plus className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">(Reviews)</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
                        {product.title}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-foreground">
                          ₹{product.currentPrice}
                        </span>
                        {product.oldPrice && product.oldPrice > product.currentPrice && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              ₹{product.oldPrice}
                            </span>
                            <Badge variant="secondary" className="bg-accent/10 text-accent border-0 text-xs">
                              {Math.round(((product.oldPrice - product.currentPrice) / product.oldPrice) * 100)}% OFF
                            </Badge>
                          </>
                        )}
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
