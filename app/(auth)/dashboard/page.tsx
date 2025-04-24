"use client"

import { getPurchaseOutputsAction } from '@/actions/db/outputs-actions'
import { getUserPurchasesAction } from '@/actions/db/purchases-actions'
import { getSignedUrlAction } from '@/actions/storage/pdf-storage-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@clerk/nextjs'
import { IconDownload, IconShoppingBag } from '@tabler/icons-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string[]>>({})
  
  // Fetch purchase data
  useEffect(() => {
    if (isLoaded && user) {
      fetchPurchases()
    }
  }, [isLoaded, user])
  
  const fetchPurchases = async () => {
    try {
      setLoading(true)
      const result = await getUserPurchasesAction()
      
      if (result.isSuccess && result.data) {
        setPurchases(result.data)
        
        // Fetch outputs for completed purchases
        for (const purchase of result.data) {
          if (purchase.status === 'completed') {
            fetchOutputLinks(purchase.id)
          }
        }
      } else {
        setError(result.message || 'Failed to load purchase history')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  const fetchOutputLinks = async (purchaseId: string) => {
    try {
      const outputsResult = await getPurchaseOutputsAction(purchaseId)
      
      if (outputsResult.isSuccess && outputsResult.data && outputsResult.data.length > 0) {
        const urls: string[] = []
        
        for (const output of outputsResult.data) {
          const signedUrlResult = await getSignedUrlAction(output.filePath)
          
          if (signedUrlResult.isSuccess && signedUrlResult.data) {
            urls.push(signedUrlResult.data.signedUrl)
          }
        }
        
        setDownloadUrls(prev => ({
          ...prev,
          [purchaseId]: urls
        }))
      }
    } catch (err) {
      console.error('Error fetching output links:', err)
    }
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Get status color for badges
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'processing': 'bg-blue-500/10 text-blue-500',
      'pending_scrape': 'bg-yellow-500/10 text-yellow-500',
      'scrape_complete': 'bg-purple-500/10 text-purple-500',
      'completed': 'bg-green-500/10 text-green-500',
      'scrape_failed': 'bg-red-500/10 text-red-500',
      'generation_failed': 'bg-red-500/10 text-red-500',
      'failed': 'bg-red-500/10 text-red-500'
    }
    
    return statusColors[status] || 'bg-gray-500/10 text-gray-500'
  }
  
  // Format status for display
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'processing': 'Processing',
      'pending_scrape': 'Analyzing Website',
      'scrape_complete': 'Generating Reports',
      'completed': 'Completed',
      'scrape_failed': 'Analysis Failed',
      'generation_failed': 'Generation Failed',
      'failed': 'Failed'
    }
    
    return statusMap[status] || status
  }
  
  if (!isLoaded) {
    return <div className="flex-1 p-8 flex items-center justify-center text-white">Loading...</div>
  }
  
  if (!user) {
    return <div className="flex-1 p-8 flex items-center justify-center text-white">Not authenticated</div>
  }

  // Get recent purchases (up to 3)
  const recentPurchases = [...purchases].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 3)

  // Get completed purchases with reports
  const completedPurchases = purchases.filter(p => p.status === 'completed')

  return (
    <div className="p-6 space-y-6">
      {/* Recent Purchases Card */}
      <Card className="bg-[#1d1d1d] border-[#222222] rounded-xl overflow-hidden shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg font-medium">Recent Purchases</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Your latest orders</CardDescription>
        </CardHeader>
        <CardContent className="text-gray-300">
          {loading ? (
            <div className="py-4 text-center">Loading purchases...</div>
          ) : error ? (
            <div className="py-4 text-center text-red-400">{error}</div>
          ) : purchases.length === 0 ? (
            <div className="py-4 text-center">You haven't made any purchases yet.</div>
          ) : (
            <div className="space-y-4">
              {recentPurchases.map((purchase) => (
                <div key={purchase.id} className="p-4 border border-[#333333] rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {purchase.url ? 
                        purchase.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 
                        'No URL'
                      }
                    </div>
                    <div className="text-sm text-gray-400">{formatDate(purchase.createdAt)}</div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                      {formatStatus(purchase.status)}
                    </span>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <Link href="/purchases">
                  <Button variant="outline" className="border-[#333333] text-gray-300 hover:bg-[#333333] hover:text-white">
                    View All Purchases
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Reports Card */}
      <Card className="bg-[#1d1d1d] border-[#222222] rounded-xl overflow-hidden shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg font-medium">Your Reports</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Generated reports ready to download</CardDescription>
        </CardHeader>
        <CardContent className="text-gray-300">
          {loading ? (
            <div className="py-4 text-center">Loading reports...</div>
          ) : error ? (
            <div className="py-4 text-center text-red-400">{error}</div>
          ) : completedPurchases.length === 0 ? (
            <div className="py-4 text-center">You don't have any completed reports yet.</div>
          ) : (
            <div className="space-y-4">
              {completedPurchases.slice(0, 3).map((purchase) => (
                <div key={purchase.id} className="p-4 border border-[#333333] rounded-lg">
                  <div className="font-medium mb-2">{purchase.url?.replace(/^https?:\/\//, '') || 'No URL'}</div>
                  <div className="flex gap-2 flex-wrap">
                    {downloadUrls[purchase.id]?.map((url, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="outline"
                        asChild
                        className="text-blue-400 border-blue-400/20 hover:bg-blue-400/10"
                      >
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <IconDownload className="w-4 h-4 mr-1" />
                          PDF {index + 1}
                        </a>
                      </Button>
                    ))}
                    {!downloadUrls[purchase.id] && (
                      <span className="text-gray-500">Loading reports...</span>
                    )}
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <Link href="/purchases">
                  <Button variant="outline" className="border-[#333333] text-gray-300 hover:bg-[#333333] hover:text-white">
                    View All Reports
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    
      {/* Upsell Card */}
      <Card className="bg-[#1d1d1d] border-[#222222] rounded-xl overflow-hidden shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg font-medium">Available Upgrades</CardTitle>
          <CardDescription className="text-gray-400 text-sm">Enhance your e-commerce insights</CardDescription>
        </CardHeader>
        <CardContent className="text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-[#333333] rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-white">Full Analysis Pack</h3>
                <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs font-medium">Popular</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Comprehensive analytics and competitor insights for your e-commerce store.
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <IconShoppingBag className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>
            
            <div className="p-4 border border-[#333333] rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-white">SEO Booster</h3>
                <span className="bg-purple-500/10 text-purple-400 px-2 py-1 rounded text-xs font-medium">New</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Advanced SEO analysis and recommendations tailored to your specific market.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <IconShoppingBag className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            </div>
            
            <div className="p-4 border border-[#333333] rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-white">Marketing Strategy</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Actionable marketing plans to grow your business and increase conversions.
              </p>
              <Button variant="outline" className="w-full border-[#333333] text-gray-300 hover:bg-[#333333]">
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 