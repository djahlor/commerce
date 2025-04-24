"use client"

import { getSignedUrlAction } from "@/actions/storage/pdf-storage-actions"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from "react"

// Function to format type names for display
function formatTypeLabel(type: string): string {
  // Map from internal type names to user-friendly names
  const typeLabels: Record<string, string> = {
    "blueprint": "Brand Blueprint",
    "persona": "Customer Persona",
    "technical": "Technical Audit",
    "marketing": "Marketing Strategy",
    "content": "Content Strategy",
    "seo": "SEO Analysis"
  }
  
  return typeLabels[type] || type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')
}

interface DownloadLinkProps {
  filePath: string
  type: string
  className?: string
}

export default function DownloadLink({ filePath, type, className = '' }: DownloadLinkProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const result = await getSignedUrlAction(filePath)
        if (result.isSuccess && result.data) {
          setUrl(result.data.signedUrl)
        } else {
          setError(result.message || "Could not generate download link")
        }
      } catch (err) {
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUrl()
  }, [filePath])
  
  const label = formatTypeLabel(type)
  
  if (isLoading) {
    return (
      <Button 
        variant="outline" 
        className={`w-full ${className}`}
        disabled
      >
        Loading...
      </Button>
    )
  }
  
  if (error) {
    return (
      <Button 
        variant="destructive" 
        className={`w-full ${className}`}
        disabled
      >
        Error: {error}
      </Button>
    )
  }
  
  return (
    <Button 
      variant="outline"
      className={`w-full ${className}`}
      asChild
    >
      <a href={url || '#'} download target="_blank" rel="noopener noreferrer">
        <DownloadIcon className="mr-2" />
        {label}
      </a>
    </Button>
  )
} 