"use client"

import AccountLinker from '@/components/dashboard/account-linker'
import { useAuth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { userId } = useAuth()
  
  // Redirect to login if not authenticated
  if (!userId) {
    redirect('/login')
  }

  return (
    <>
      <AccountLinker />
      {children}
    </>
  )
} 