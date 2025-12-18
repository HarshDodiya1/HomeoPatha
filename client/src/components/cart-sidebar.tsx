"use client";

import { useEffect } from "react";
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function CartSidebar() {
  const {
    cart,
    isCartOpen,
    closeCart,
    fetchCart,
    updateQuantity,
    removeItem,
    clearCart,
    isLoading,
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && isCartOpen) {
      fetchCart();
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              {cart && cart.items.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {cart.items.length} item{cart.items.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            className="rounded-full hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {!cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6 max-w-[250px]">
                Looks like you haven't added any products yet
              </p>
              <Button onClick={closeCart} className="rounded-full px-6">
                Start Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.items.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex gap-4 p-4 rounded-2xl border border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-border/50">
                      {item.product.images && item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {item.product.title}
                      </h4>
                      <p className="text-sm text-primary font-semibold mb-3">
                        ₹{item.priceAtTime}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-white border border-border/50 rounded-full">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() =>
                              item.quantity > 1 &&
                              updateQuantity(item.product._id, item.quantity - 1)
                            }
                            disabled={isLoading || item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-3 text-sm font-medium min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() =>
                              updateQuantity(item.product._id, item.quantity + 1)
                            }
                            disabled={isLoading}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.product._id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        ₹{(item.priceAtTime * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-border/50 p-5 space-y-4 bg-secondary/20">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-accent font-medium">Free</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-primary">₹{cart.totalAmount.toFixed(2)}</span>
            </div>

            <div className="space-y-2 pt-2">
              <Button 
                className="w-full rounded-xl h-12 text-base font-semibold" 
                size="lg"
                onClick={() => {
                  closeCart();
                  window.location.href = '/checkout';
                }}
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={clearCart}
                disabled={isLoading}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
