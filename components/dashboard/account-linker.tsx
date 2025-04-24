"use client"

import { linkClerkUserAction } from "@/actions/clerk-actions"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { toast } from "sonner"

/**
 * AccountLinker component that automatically links purchases to the user's account.
 * This component should be placed in the dashboard layout to ensure it runs
 * when a user accesses the dashboard.
 */
export default function AccountLinker() {
  const { user, isLoaded } = useUser()
  const [hasLinked, setHasLinked] = useState(false)

  useEffect(() => {
    // Only attempt to link if user data is loaded and we haven't already linked
    if (isLoaded && user && !hasLinked) {
      const linkAccounts = async () => {
        try {
          const result = await linkClerkUserAction()
          
          if (result.isSuccess && result.data && result.data.updatedCount > 0) {
            toast.success(result.message || "Successfully linked your purchases!")
          }
          
          // Mark as linked regardless of success to prevent repeated attempts
          setHasLinked(true)
        } catch (error) {
          console.error("Error linking accounts:", error)
          // Don't show error toast to avoid confusion for users with no purchases
          setHasLinked(true)
        }
      }
      
      linkAccounts()
    }
  }, [isLoaded, user, hasLinked])

  // This component doesn't render anything visible
  return null
} 