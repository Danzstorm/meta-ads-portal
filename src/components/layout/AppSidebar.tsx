"use client";

import * as React from "react"
import { LayoutDashboard, Megaphone, Settings, Users, CreditCard, Image } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Campaigns",
        url: "/campaigns",
        icon: Megaphone,
    },
    {
        title: "Ad Accounts",
        url: "/ad-accounts",
        icon: Users,
    },
    {
        title: "Asset Library",
        url: "/assets",
        icon: Image,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    // We can add active state logic here if needed, or rely on Link/Pathname
    // shadcn SidebarMenuButton can take isActive prop.

    // NOTE: In a real app we'd use usePathname() to set isActive.
    // But for SSR compatibility/simplicity, we might use client component or just simple links.
    // Sidebar is usually a client component if it uses hooks.
    // So I'll mark "use client" (wait, I put "use strict" above, I should use "use client").

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <div className="flex items-center gap-2 px-4 py-2">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Megaphone className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Meta Ads</span>
                        <span className="truncate text-xs">Automation</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {/* User profile or other footer items */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
