"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"

const products = [
  { id: 1, name: "BP Monitor", price: "$59", img: "blood pressure monitor" },
  { id: 2, name: "Digital Thermometer", price: "$19", img: "digital thermometer" },
  { id: 3, name: "First Aid Kit", price: "$29", img: "first aid kit" },
  { id: 4, name: "Surgical Masks (50)", price: "$12", img: "surgical masks" },
  { id: 5, name: "Hand Sanitizer", price: "$9", img: "hand sanitizer" },
  { id: 6, name: "Glucose Meter", price: "$49", img: "glucose meter" },
]

export function FeaturedProducts() {
  return (
    <div className="mx-auto max-w-7xl py-12">
      <header className="mb-6 md:mb-8 flex items-end justify-between">
        <div>
          <h2 id="shop-essentials" className="text-2xl md:text-3xl font-semibold">
            Shop Medical Essentials
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Quality products delivered to your doorstep.</p>
        </div>
      </header>

      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 8).map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="p-0">
                <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={`/.jpg?height=240&width=400&query=${encodeURIComponent(p.img)}`}
                    alt={p.name}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.price}</div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button className="flex-1" aria-label={`Add ${p.name} to cart`}>
                  Add to Cart
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" aria-label={`View ${p.name} details`}>
                  View
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Mobile horizontal carousel */}
      <div className="sm:hidden">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="min-w-[80%] snap-center"
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={`/.jpg?height=240&width=400&query=${encodeURIComponent(p.img)}`}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.price}</div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button className="flex-1" aria-label={`Add ${p.name} to cart`}>
                    Add
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent" aria-label={`View ${p.name} details`}>
                    View
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
