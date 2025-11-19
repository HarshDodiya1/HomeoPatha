"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Star, ShoppingCart } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { productService } from "@/lib/services/product.service"
import { Product } from "@/types/product"

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
    <div className="mx-auto max-w-7xl py-12">
      <header className="mb-6 md:mb-8 flex items-end justify-between">
        <div>
          <h2 id="shop-essentials" className="text-2xl md:text-3xl font-semibold">
            Shop Medical Essentials
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Quality products delivered to your doorstep.</p>
        </div>
        <Link href="/products">
          <Button variant="outline">View All</Button>
        </Link>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              <Link href={`/products/${p._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="p-0">
                    <div className="relative h-40 w-full overflow-hidden rounded-t-lg bg-muted">
                      {p.images && p.images[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      {p.badge && (
                        <Badge className="absolute top-2 right-2">{p.badge}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="font-medium line-clamp-2">{p.title}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{p.rating.toFixed(1)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold">₹{p.currentPrice}</span>
                      {p.oldPrice && p.oldPrice > p.currentPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{p.oldPrice}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
