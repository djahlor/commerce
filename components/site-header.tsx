"use client"

import { UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname()
  
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) {
      return 'Dashboard'
    } else if (pathname.includes('/purchases')) {
      return 'My Purchases'
    } else if (pathname.includes('/settings')) {
      return 'Settings'
    } else if (pathname.includes('/help')) {
      return 'Help'
    } else {
      return 'My Reports'
    }
  }

  return (
    <header className="flex h-14 items-center border-b border-[#222222] bg-black px-4 lg:px-6">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-white">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center gap-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
