"use client"

import { createPolarCheckoutAction } from "@/actions/polar/polar-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { IconChevronRight, IconSparkles } from "@tabler/icons-react"
import { useState } from "react"
import { toast } from "sonner"

export interface UpsellProduct {
  id: string
  title: string
  description: string
  price: number
  features?: string[]
  priceId?: string // Polar product ID
  badge?: string
}

interface UpsellCardProps {
  product: UpsellProduct
  customerUrl?: string
}

export function UpsellCard({ product, customerUrl }: UpsellCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    try {
      setIsLoading(true)
      
      if (!product.priceId) {
        toast.error("Product not available for purchase at this time.")
        return
      }
      
      const result = await createPolarCheckoutAction({
        priceId: product.priceId,
        url: customerUrl
      })
      
      if (result.isSuccess && result.data) {
        window.location.href = result.data.checkoutUrl
      } else {
        toast.error(result.message || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Purchase error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(price)
  }

  return (
    <Card className="group bg-[#1d1d1d] border-[#222222] overflow-hidden hover:border-blue-500/30 transition-all duration-300 h-full flex flex-col">
      <CardHeader className="pb-4 relative">
        {product.badge && (
          <div className="absolute top-2 right-2 bg-blue-500 text-[10px] font-bold uppercase tracking-wider text-white px-2 py-1 rounded-full flex items-center gap-1">
            <IconSparkles className="w-3 h-3" />
            {product.badge}
          </div>
        )}
        <CardTitle className="text-white text-xl font-medium">{product.title}</CardTitle>
        <CardDescription className="text-gray-400">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {product.features && product.features.length > 0 && (
          <ul className="space-y-2 text-sm text-gray-300">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <IconChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 pt-2">
        <div className="text-2xl font-bold text-white">{formatPrice(product.price)}</div>
        <Button 
          onClick={handlePurchase} 
          disabled={isLoading} 
          className="w-full bg-blue-600 hover:bg-blue-500 text-white"
          size="lg"
        >
          {isLoading ? "Processing..." : "Buy Now"}
        </Button>
      </CardFooter>
    </Card>
  )
} 