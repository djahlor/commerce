"use client"

import {
  IconDashboard,
  IconFileDescription,
  IconHelp,
  IconSettings,
  IconShoppingBag,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function DashboardSidebar() {
  const pathname = usePathname()
  
  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Reports",
      href: "/purchases",
      icon: IconFileDescription,
    },
    {
      title: "Shop",
      href: "/",
      icon: IconShoppingBag,
    },
    {
      title: "Help",
      href: "/help",
      icon: IconHelp,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: IconSettings,
    },
  ]

  return (
    <div className="w-64 border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center font-semibold">
          <span className="text-lg">Commerce</span>
        </Link>
      </div>
      <div className="flex flex-col py-2">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 