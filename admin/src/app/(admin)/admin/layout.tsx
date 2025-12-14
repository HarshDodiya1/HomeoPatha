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
import { CalendarDays, CreditCard, LayoutDashboard, LogOut, Package, Users, User, Stethoscope, ShoppingBag, MessageSquare, FolderHeart } from "lucide-react"
import type * as React from "react"
import { ModeToggle } from "@/components/mode-toggle"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

const routes = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/specializations", label: "Specializations", icon: FolderHeart },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarDays },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/contacts", label: "Contacts", icon: MessageSquare },
  { href: "/admin/profile", label: "Profile", icon: User },
]

function usePageTitle(pathname: string) {
  const parts = pathname.split("/").filter(Boolean)
  if (parts[0] !== "admin") return "Admin"
  if (parts.length === 1) return "Dashboard"
  const map: Record<string, string> = {
    specializations: "Specializations",
    doctors: "Doctors",
    patients: "Patients",
    appointments: "Appointments",
    products: "Products",
    orders: "Orders",
    payments: "Payments",
    contacts: "Contacts",
    profile: "Profile",
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.fullName) return "AD"
    const names = user.fullName.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return user.fullName.substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-svh">
      <SidebarProvider>
        <Sidebar collapsible="icon" variant="sidebar">
          <SidebarHeader className="px-3 py-2">
            <div className="flex items-center gap-2 px-1">
              <div className="size-6 rounded-md bg-primary" />
              <div className="text-sm font-semibold">HomeoPatha Admin</div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {routes.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                        >
                          <span className="flex items-center gap-2">
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                          </span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                  <SidebarSeparator />
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="size-4" />
                        <span>Logout</span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="text-xs text-muted-foreground">
            <div className="rounded-md bg-muted p-2">
              <div className="font-medium text-foreground">
                {user?.role || 'Admin'} Panel
              </div>
              <div className="text-muted-foreground">Manage appointments & products</div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex h-14 items-center gap-3 px-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-balance text-base font-semibold">{title}</h1>
              <div className="ml-auto flex items-center gap-2">
                <ModeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 gap-2 bg-transparent">
                      <Avatar className="size-6">
                        <AvatarImage src="/placeholder-user.jpg" alt="Admin avatar" />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{user?.fullName || 'Admin'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user?.fullName || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/admin/profile">
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <div className="p-4 md:p-6">{children}</div>
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
