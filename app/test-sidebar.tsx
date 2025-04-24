"use client"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"
import { IconDashboard } from "@tabler/icons-react"
import Link from 'next/link'

export default function TestSidebar() {
  return (
    <div className="h-screen">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--header-height": "3.5rem",
          } as React.CSSProperties
        }
      >
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <span className="text-base font-semibold">Test Sidebar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent className="px-2 py-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <IconDashboard className="size-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="mt-auto border-t p-4">
            <div>Footer</div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex h-screen flex-col">
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold">Test Sidebar Page</h1>
            <p className="mt-4">This is a test page to isolate the sidebar component.</p>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
} 