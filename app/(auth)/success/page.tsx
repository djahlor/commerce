"use client"

import { getPurchaseOutputsAction } from '@/actions/db/outputs-actions'
import { getPurchaseByOrderIdAction } from '@/actions/db/purchases-actions'
import DownloadLink from '@/components/success/download-link'
import ProcessingSpinner from '@/components/success/processing-spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

// Map of statuses to progress percentages
const STATUS_PROGRESS = {
  'processing': 10,
  'pending_scrape': 30,
  'scrape_complete': 50,
  'completed': 100,
  'scrape_failed': 100,
  'generation_failed': 100,
  'failed': 100
} as const

type PurchaseStatus = keyof typeof STATUS_PROGRESS

// Error states that need special handling
const ERROR_STATUSES: PurchaseStatus[] = ['scrape_failed', 'generation_failed', 'failed']

// Loading fallback component
function SuccessPageLoading() {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Processing Order</CardTitle>
        <CardDescription>
          We're confirming your purchase details...
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <ProcessingSpinner size={60} />
        <p className="mt-4 text-center text-gray-500">Please wait while we verify your purchase</p>
      </CardContent>
    </Card>
  )
}

function SuccessPageContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  // State for tracking purchase and outputs
  const [loadingPurchase, setLoadingPurchase] = useState(true)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchaseId, setPurchaseId] = useState<string | null>(null)
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus | null>(null)
  const [outputs, setOutputs] = useState<Array<{ id: string, type: string, filePath: string }>>([])
  
  // Polling state
  const [pollingCount, setPollingCount] = useState(0)
  
  // Function to fetch purchase data
  const fetchPurchaseData = async () => {
    if (!orderId) return
    
    try {
      // Get purchase by Polar order ID
      const purchaseResult = await getPurchaseByOrderIdAction(orderId)
      
      if (!purchaseResult.isSuccess || !purchaseResult.data) {
        setPurchaseError(purchaseResult.message || "Purchase not found")
        setLoadingPurchase(false)
        return
      }
      
      // Store purchase info
      const purchase = purchaseResult.data
      setPurchaseId(purchase.id)
      setPurchaseStatus(purchase.status as PurchaseStatus)
      
      // Check if purchase is completed
      if (purchase.status === 'completed') {
        // Fetch outputs
        const outputsResult = await getPurchaseOutputsAction(purchase.id)
        if (outputsResult.isSuccess && outputsResult.data) {
          setOutputs(outputsResult.data)
        }
      }
      
      setLoadingPurchase(false)
      
    } catch (error) {
      console.error("Error fetching purchase:", error)
      setPurchaseError("An unexpected error occurred")
      setLoadingPurchase(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchPurchaseData()
  }, [orderId])
  
  // Polling for updates
  useEffect(() => {
    // Only poll if we have a purchase and it's not in a final state
    if (
      !purchaseId || 
      purchaseStatus === 'completed' || 
      ERROR_STATUSES.includes(purchaseStatus as PurchaseStatus) ||
      purchaseError
    ) {
      return
    }
    
    // Set up polling interval (every 5 seconds)
    const intervalId = setInterval(() => {
      fetchPurchaseData()
      setPollingCount(prev => prev + 1)
      
      // Stop polling after 10 minutes (120 polls at 5s each)
      if (pollingCount > 120) {
        clearInterval(intervalId)
        setPurchaseError("Processing is taking longer than expected. Please check back later.")
      }
    }, 5000)
    
    // Clean up
    return () => clearInterval(intervalId)
  }, [purchaseId, purchaseStatus, purchaseError, pollingCount])
  
  // Get progress percentage
  const progressPercentage = purchaseStatus ? STATUS_PROGRESS[purchaseStatus] : 0
  
  // Loading state
  if (loadingPurchase) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Processing Order</CardTitle>
          <CardDescription>
            We're confirming your purchase details...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <ProcessingSpinner size={60} />
          <p className="mt-4 text-center text-gray-500">Please wait while we verify your purchase</p>
        </CardContent>
      </Card>
    )
  }
  
  // Error state (no order ID or not found)
  if (purchaseError || !orderId) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Order Verification Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>We couldn't verify your purchase</AlertTitle>
            <AlertDescription>
              {purchaseError || "No order ID was provided. Please check your payment confirmation email."}
            </AlertDescription>
          </Alert>
          <Button asChild className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  // Processing state
  if (purchaseStatus && purchaseStatus !== 'completed' && !ERROR_STATUSES.includes(purchaseStatus)) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Processing Your Reports</CardTitle>
          <CardDescription>
            We're creating your custom reports based on your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                {purchaseStatus === 'processing' && 'Initializing...'}
                {purchaseStatus === 'pending_scrape' && 'Analyzing your website...'}
                {purchaseStatus === 'scrape_complete' && 'Generating reports...'}
              </span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-md text-sm">
            <p className="mb-2 font-medium">What's happening now?</p>
            
            {purchaseStatus === 'processing' && (
              <p>We're preparing to analyze your website and generate your custom reports.</p>
            )}
            
            {purchaseStatus === 'pending_scrape' && (
              <p>Our AI is visiting your website to gather data about your brand, products, and content.</p>
            )}
            
            {purchaseStatus === 'scrape_complete' && (
              <p>Analysis complete! We're now creating your custom PDF reports with actionable insights.</p>
            )}
          </div>
          
          <p className="text-center text-muted-foreground text-sm">
            This process typically takes 3-5 minutes. This page will automatically update.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  // Error states (failed processes)
  if (purchaseStatus && ERROR_STATUSES.includes(purchaseStatus)) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Processing Error</CardTitle>
          <CardDescription>
            We encountered an issue while processing your reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTitle>
              {purchaseStatus === 'scrape_failed' && 'Website Analysis Failed'}
              {purchaseStatus === 'generation_failed' && 'Report Generation Failed'}
              {purchaseStatus === 'failed' && 'Order Processing Failed'}
            </AlertTitle>
            <AlertDescription>
              {purchaseStatus === 'scrape_failed' && 'We had trouble analyzing your website. This could be due to access restrictions or site availability.'}
              {purchaseStatus === 'generation_failed' && 'We encountered an issue while creating your custom reports.'}
              {purchaseStatus === 'failed' && 'We encountered an unexpected error processing your order.'}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <p className="text-center">Our team has been notified and will contact you shortly to resolve this issue.</p>
            
            <div className="flex flex-col space-y-2">
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  // Success state - Completed with outputs
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Your Reports Are Ready!</CardTitle>
        <CardDescription>
          Download your custom reports or access them anytime from your dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {outputs.length > 0 ? (
          <div className="grid gap-3">
            {outputs.map(output => (
              <DownloadLink 
                key={output.id} 
                filePath={output.filePath} 
                type={output.type} 
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No reports are available yet. Please check back soon.</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          For secure access to your reports at any time, sign in to your dashboard.
        </p>
        <SignInButton mode="modal">
          <Button variant="outline" className="w-full">
            Sign In to Dashboard
          </Button>
        </SignInButton>
      </CardFooter>
    </Card>
  )
}

// Main component wrapped with Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessPageLoading />}>
      <SuccessPageContent />
    </Suspense>
  )
} 