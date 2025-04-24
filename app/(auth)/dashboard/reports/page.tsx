"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@clerk/nextjs'

export default function ReportsPage() {
  const { user, isLoaded } = useUser()
  
  if (!isLoaded) {
    return <div className="p-8 flex items-center justify-center">Loading...</div>
  }
  
  if (!user) {
    return <div className="p-8 flex items-center justify-center">Not authenticated</div>
  }

  return (
    <div className="p-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Reports</h1>
        <p className="text-gray-400 mt-1">
          View and download all your generated reports
        </p>
      </div>
      
      <Card className="bg-[#1d1d1d] border-[#222222] rounded-xl overflow-hidden shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg font-medium">Your Reports</CardTitle>
          <CardDescription className="text-gray-400 text-sm">All your generated reports in one place</CardDescription>
        </CardHeader>
        <CardContent className="text-gray-300">
          <p>Report listings will be shown here in the next step (Step 26).</p>
        </CardContent>
      </Card>
    </div>
  )
} 