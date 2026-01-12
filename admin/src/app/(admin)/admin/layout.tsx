"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { 
  CalendarDays, 
  CreditCard, 
  LayoutDashboard, 
  LogOut, 
  Package, 
  User, 
  Stethoscope, 
  ShoppingBag, 
  MessageSquare, 
  FolderHeart, 
  Settings,
  ChevronDown,
  FileText
} from "lucide-react"
import type * as React from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Main navigation routes
const mainRoutes = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
]

// Settings & management routes
const settingsRoutes = [
  { href: "/admin/site-settings", label: "Site Settings", icon: Settings },
  { href: "/admin/specializations", label: "Specializations", icon: FolderHeart },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/contacts", label: "Contacts", icon: MessageSquare },
]

function usePageTitle(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  if (parts[0] !== "admin") return "Admin"
  if (parts.length === 1) return "Dashboard"
  const map: Record<string, string> = {
    "site-settings": "Site Settings",
    specializations: "Specializations",
    doctors: "Doctors",
    patients: "Patients",
    appointments: "Appointments",
    products: "Products",
    orders: "Orders",
    payments: "Payments",
    contacts: "Contacts",
    profile: "Profile",
    blogs: "Blogs",
  }
  if (parts[1] in map) {
    if (parts[2] === "new") return `Add ${map[parts[1]].slice(0, -1)}`
    if (parts[2] === "edit") return `Edit ${map[parts[1]].slice(0, -1)}`
    if (parts[2] === "doctors") return "Doctors"
    if (parts[2] === "patients") return "Patients"
    return map[parts[1]]
  }
  return "Admin"
}

// Main sidebar content component
function AdminSidebarContent() {
  const pathname = usePathname()
  const { user, logoutAndRedirect } = useAuth()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const handleLogout = async () => {
    try {
      await logoutAndRedirect()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

  const isRouteActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const getUserInitials = () => {
    if (!user?.fullName) return "AD"
    const names = user.fullName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.fullName.substring(0, 2).toUpperCase()
  }

  return (
    <>
      {/* Header with Logo */}
      <SidebarHeader className="border-b">
        <Link href="/admin" className="flex items-center gap-3 px-2 py-2">
          <Image
            src="/logo.png"
            alt="HomeoPatha"
            width={32}
            height={32}
            className="size-8 shrink-0 object-contain"
          />
          <span className={cn(
            "font-semibold text-lg text-green-600 dark:text-green-500 truncate transition-opacity",
            isCollapsed && "opacity-0"
          )}>
            HomeoPatha
          </span>
        </Link>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="overflow-x-hidden">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainRoutes.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isRouteActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Settings & Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsRoutes.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isRouteActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User */}
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip={user?.fullName || 'Admin'}>
                  <Avatar className="size-6 shrink-0">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{user?.fullName || 'Admin'}</span>
                  <ChevronDown className="ml-auto size-4 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-popper-anchor-width] min-w-56"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.fullName || 'Admin'}</span>
                    <span className="text-xs text-muted-foreground">{user?.email || ''}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">
                    <User className="size-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                >
                  <LogOut className="size-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  )
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const title = usePageTitle(pathname)
  const { user, logoutAndRedirect } = useAuth()

  const handleLogout = async () => {
    try {
      await logoutAndRedirect()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    }
  }

  const getUserInitials = () => {
    if (!user?.fullName) return "AD"
    const names = user.fullName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.fullName.substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-svh bg-background">
      <SidebarProvider>
        <Sidebar collapsible="icon" variant="sidebar">
          <AdminSidebarContent />
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
            <div className="flex h-14 items-center gap-3 px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="font-semibold">{title}</h1>

              <div className="ml-auto flex items-center gap-2">
                <ModeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Avatar className="size-7">
                        <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                        <AvatarFallback className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{user?.fullName || 'Admin'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-medium">{user?.fullName || 'Admin'}</span>
                        <span className="text-xs text-muted-foreground">{user?.email || ''}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin/profile">
                        <User className="size-4 mr-2" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="size-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <main className="p-4 md:p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  )
}
