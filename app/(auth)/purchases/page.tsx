"use client"

import { getPurchaseOutputsAction } from '@/actions/db/outputs-actions'
import { getUserPurchasesAction } from '@/actions/db/purchases-actions'
import { getSignedUrlAction } from '@/actions/storage/pdf-storage-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@clerk/nextjs'
import { IconDownload, IconExternalLink } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

export default function PurchasesPage() {
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
  
  // Format amount from cents to dollars
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
  }
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Status badge color mapping
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

  return (
    <div className="p-6">
      <Card className="bg-[#1d1d1d] border-[#222222] rounded-xl overflow-hidden shadow-md">
        <CardHeader className="pb-3 sticky top-0 bg-[#1d1d1d] z-10">
          <CardTitle className="text-white text-lg font-medium">Purchase History</CardTitle>
          <CardDescription className="text-gray-400 text-sm">All your previous purchases</CardDescription>
        </CardHeader>
        <CardContent className="text-gray-300">
          {loading ? (
            <div className="py-4 text-center">Loading purchase history...</div>
          ) : error ? (
            <div className="py-4 text-center text-red-400">{error}</div>
          ) : purchases.length === 0 ? (
            <div className="py-4 text-center">You haven't made any purchases yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#1d1d1d] z-10">
                  <tr className="text-left border-b border-[#333333]">
                    <th className="pb-3 pr-6 font-medium text-gray-400">Date</th>
                    <th className="pb-3 pr-6 font-medium text-gray-400">Website</th>
                    <th className="pb-3 pr-6 font-medium text-gray-400">Product</th>
                    <th className="pb-3 pr-6 font-medium text-gray-400">Amount</th>
                    <th className="pb-3 pr-6 font-medium text-gray-400">Status</th>
                    <th className="pb-3 font-medium text-gray-400">Downloads</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-[#333333] hover:bg-[#222222]">
                      <td className="py-4 pr-6">{formatDate(purchase.createdAt)}</td>
                      <td className="py-4 pr-6">
                        {purchase.url ? (
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[120px]">
                              {purchase.url.replace(/^https?:\/\//, '')}
                            </span>
                            <a 
                              href={purchase.url.startsWith('http') ? purchase.url : `https://${purchase.url}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <IconExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="py-4 pr-6 capitalize">{purchase.tier || 'Unknown'}</td>
                      <td className="py-4 pr-6">{typeof purchase.amount === 'number' ? formatAmount(purchase.amount) : 'N/A'}</td>
                      <td className="py-4 pr-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                          {formatStatus(purchase.status)}
                        </span>
                      </td>
                      <td className="py-4">
                        {purchase.status === 'completed' ? (
                          (() => {
                            const links = downloadUrls[purchase.id];
                            return links && links.length > 0 ? (
                              <div className="flex gap-2">
                                {links.map((url, index) => (
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
                              </div>
                            ) : (
                              <span className="text-gray-500">Loading links...</span>
                            );
                          })()
                        ) : (
                          <span className="text-gray-500">
                            {purchase.status.includes('failed') ? 'Failed' : 'Pending'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 