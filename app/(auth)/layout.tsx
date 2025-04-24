/*
This server layout provides a centered layout for (auth) pages.
*/

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen bg-black">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="rounded-xl overflow-hidden">
          <div className="flex flex-col h-full">
            <SiteHeader />
            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
} 