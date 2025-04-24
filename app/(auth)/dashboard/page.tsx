"use client"

import { getUserOutputsAction } from '@/actions/db/outputs-actions'
import { getUserPurchasesAction } from '@/actions/db/purchases-actions'
import { ProgressTracker } from '@/components/dashboard/progress-tracker'
import { UpsellCard, UpsellProduct } from '@/components/dashboard/upsell-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PRODUCT_IDS } from '@/lib/polar/index'
import { useUser } from '@clerk/nextjs'
import { IconArrowRight, IconDownload } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// Mock upsell products
const UPSELL_PRODUCTS: UpsellProduct[] = [
  {
    id: "seo-strategy",
    title: "SEO Strategy Blueprint",
    description: "Detailed search engine optimization strategy to boost your store's visibility and organic traffic.",
    price: 9900, // $99
    priceId: PRODUCT_IDS.UPSELLS.SEO_STRATEGY,
    features: [
      "Keyword opportunity analysis",
      "On-page SEO recommendations",
      "Content strategy for search visibility",
      "Technical SEO audit",
      "Competitor SEO analysis"
    ],
    badge: "POPULAR"
  },
  {
    id: "content-strategy",
    title: "Content Strategy Plan",
    description: "Strategic content plan to engage customers and drive conversions through your product storytelling.",
    price: 12900, // $129
    priceId: PRODUCT_IDS.UPSELLS.CONTENT_STRATEGY,
    features: [
      "Content calendar template",
      "Product storytelling framework",
      "Email sequence templates",
      "Social media content strategy",
      "Product page optimization guide"
    ]
  },
  {
    id: "customer-persona",
    title: "Advanced Customer Personas",
    description: "Deep-dive customer profile analysis to understand your ideal customers' motivations and objections.",
    price: 14900, // $149
    priceId: PRODUCT_IDS.UPSELLS.CUSTOMER_PERSONA,
    features: [
      "Detailed psychological buyer profiles",
      "Customer journey mapping",
      "Pain point analysis",
      "Decision-making process breakdown",
      "Marketing message recommendations"
    ]
  }
]

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [purchases, setPurchases] = useState<any[]>([])
  const [outputs, setOutputs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progressPercentage, setProgressPercentage] = useState(0)
  
  useEffect(() => {
    if (isLoaded && user) {
      fetchData()
    }
  }, [isLoaded, user])
  
  const fetchData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user purchases
      const purchasesResult = await getUserPurchasesAction()
      
      if (purchasesResult.isSuccess && purchasesResult.data) {
        setPurchases(purchasesResult.data)
        
        // Fetch all outputs for the user
        const outputsResult = await getUserOutputsAction()
        
        if (outputsResult.isSuccess && outputsResult.data) {
          setOutputs(outputsResult.data)
          
          // Calculate progress
          calculateProgress(outputsResult.data)
        }
      } else {
        setError(purchasesResult.message || 'Failed to load purchases')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const calculateProgress = (outputs: any[]) => {
    // Simple progress calculation - percentage of reports generated
    // Could be made more sophisticated based on tier expectations
    const totalPossibleOutputs = purchases.length * 3 // Assuming 3 outputs per purchase
    const completedOutputs = outputs.length
    
    const percentage = totalPossibleOutputs > 0 
      ? Math.round((completedOutputs / totalPossibleOutputs) * 100)
      : 0
      
    setProgressPercentage(percentage)
  }
  
  // Find the most recent purchase with a URL to use for upsells
  const getLatestPurchaseUrl = (): string | undefined => {
    if (!purchases || purchases.length === 0) return undefined
    
    // Sort purchases by date descending
    const sortedPurchases = [...purchases].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    // Find first purchase with a URL
    const purchaseWithUrl = sortedPurchases.find(p => p.url)
    return purchaseWithUrl?.url
  }
  
  // Get the customer's URL for upsells
  const customerUrl = getLatestPurchaseUrl()

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center text-white">Loading dashboard...</div>
  }

  if (error) {
    return <div className="p-8 flex justify-center items-center text-red-500">{error}</div>
  }

  return (
    <div className="p-6 space-y-8">
      {/* Progress Section */}
      <section>
        <ProgressTracker 
          percentage={progressPercentage} 
          title="Your E-Commerce Optimization" 
          description="Track your store's optimization progress"
        />
      </section>
      
      {/* My Reports Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">My Reports</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/purchases" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all purchases <IconArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
        
        {outputs.length === 0 ? (
          <Card className="bg-[#1d1d1d] border-[#222222]">
            <CardContent className="p-6 text-center text-gray-400">
              <p>No reports generated yet. Your reports will appear here once they're ready.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outputs.slice(0, 3).map((output) => (
              <Card key={output.id} className="bg-[#1d1d1d] border-[#222222] hover:border-blue-500/30 transition-all duration-300">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium capitalize">{output.type.replace(/-/g, ' ')}</h3>
                    <p className="text-gray-400 text-sm">{new Date(output.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-400 border-blue-400/20 hover:bg-blue-400/10">
                    <IconDownload className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      
      {/* Upsells Section */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">Boost Your Edge</h2>
          <p className="text-gray-400">Level up your store with these additional strategic tools</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UPSELL_PRODUCTS.map((product) => (
            <UpsellCard 
              key={product.id} 
              product={product} 
              customerUrl={customerUrl}
            />
          ))}
        </div>
      </section>
    </div>
  )
} 