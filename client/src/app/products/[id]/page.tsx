"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { productService } from "@/lib/services/product.service";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  ShoppingCart, 
  Star, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RefreshCw,
  Package,
  Leaf,
  Zap
} from "lucide-react";
import Image from "next/image";
import { CartSidebar } from "@/components/cart-sidebar";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addToCart, openCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [params.id]);

  const fetchProduct = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await productService.getProductById(id);
      setProduct(response.data.product);
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast.error("Failed to load product");
      router.push("/products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart({ productId: product._id, quantity });
      openCart();
    } catch (error) {
      // Error handled in store
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <main className="min-h-screen pt-28 pb-16 relative overflow-hidden">
          {/* Premium background */}
          <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
          
          <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
            <div className="h-10 w-24 bg-muted animate-pulse rounded-full mb-8" />
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 animate-pulse rounded-3xl" />
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-muted animate-pulse rounded-xl"
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className="h-10 bg-muted animate-pulse rounded-xl" />
                <div className="h-6 bg-muted animate-pulse rounded-lg w-2/3" />
                <div className="h-8 bg-muted animate-pulse rounded-lg w-1/3" />
                <div className="h-32 bg-muted animate-pulse rounded-xl" />
                <div className="h-14 bg-muted animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return null;
  }

  const discount = product.oldPrice && product.oldPrice > product.currentPrice 
    ? Math.round(((product.oldPrice - product.currentPrice) / product.oldPrice) * 100) 
    : 0;

  return (
    <>
      <main className="min-h-screen pt-28 pb-16 relative overflow-hidden">
        {/* Premium background */}
        <div className="fixed inset-0 bg-gradient-to-b from-background via-secondary/10 to-background -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.05),transparent_60%)] -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(22,163,74,0.05),transparent_60%)] -z-10" />
        
        <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="ghost"
              className="mb-6 rounded-full hover:bg-primary/10"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
            {/* Images */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[28px] blur-lg opacity-50" />
                <div className="relative aspect-square bg-white dark:bg-card rounded-3xl overflow-hidden border border-border/50 shadow-xl">
                  {product.images && product.images[selectedImage] ? (
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/50 to-secondary/20">
                      <Package className="h-24 w-24 text-muted-foreground/20" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.badge && (
                      <Badge className="bg-gradient-to-r from-accent to-primary text-white border-0 rounded-full px-3 py-1.5 text-sm font-semibold shadow-lg shadow-primary/30">
                        <Zap className="h-3.5 w-3.5 mr-1" />
                        {product.badge}
                      </Badge>
                    )}
                    {discount > 0 && (
                      <Badge className="bg-rose-500 text-white border-0 rounded-full px-3 py-1.5 text-sm font-bold shadow-lg">
                        -{discount}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* Wishlist & Share */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button className="w-11 h-11 rounded-full bg-white/90 dark:bg-card/90 shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/20">
                      <Heart className="h-5 w-5" />
                    </button>
                    <button className="w-11 h-11 rounded-full bg-white/90 dark:bg-card/90 shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-200 backdrop-blur-sm border border-white/20">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? "border-primary shadow-lg shadow-primary/20"
                          : "border-border/50 hover:border-primary/50"
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.title} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  <Leaf className="h-3.5 w-3.5 mr-1 text-primary" />
                  {product.category}
                </Badge>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-amber-600 dark:text-amber-400">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.title}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-4">
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ₹{product.currentPrice}
                </span>
                {product.oldPrice && product.oldPrice > product.currentPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.oldPrice}
                  </span>
                )}
              </div>

              <Separator />

              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="rounded-full px-3 py-1 border-primary/30 hover:bg-primary/10 transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Quantity & Add to Cart */}
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <span className="font-semibold">Quantity:</span>
                  <div className="flex items-center bg-secondary/50 rounded-full border border-border/50">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-10 w-10 hover:bg-primary/10"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-5 py-2 font-semibold text-lg min-w-[60px] text-center">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full h-10 w-10 hover:bg-primary/10"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-14 rounded-full text-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25 gap-2"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-center text-muted-foreground">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-center text-muted-foreground">Genuine Product</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary/30 border border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <RefreshCw className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs text-center text-muted-foreground">Easy Returns</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <CartSidebar />
    </>
  );
}
