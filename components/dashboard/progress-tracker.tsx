"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProgressTrackerProps {
  percentage: number
  title?: string
  description?: string
}

export function ProgressTracker({ 
  percentage, 
  title = "Optimization Progress", 
  description = "Your e-commerce optimization completion progress" 
}: ProgressTrackerProps) {
  // Ensure percentage is between 0-100
  const safePercentage = Math.min(100, Math.max(0, percentage))
  
  // Determine color based on percentage
  const getProgressColor = () => {
    if (safePercentage < 30) return "bg-yellow-500"
    if (safePercentage < 70) return "bg-blue-500"
    return "bg-green-500"
  }

  return (
    <Card className="bg-[#1d1d1d] border-[#222222] w-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg font-medium">{title}</CardTitle>
        <CardDescription className="text-gray-400 text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="relative w-full">
            <Progress 
              value={safePercentage} 
              className={`h-2 bg-gray-700 [&>div]:${getProgressColor()}`}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{safePercentage}% Complete</span>
            {safePercentage < 100 && (
              <span className="text-blue-400">{100 - safePercentage}% to go</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 