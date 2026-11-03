
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DASHBOARD_NAV_ITEMS } from "@/lib/routes";

interface SidebarProps {
    userMenu: ReactNode;
    collapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
}

const Sidebar = ({ userMenu, collapsed, onCollapsedChange }: SidebarProps) => {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "relative flex h-dvh shrink-0 flex-col",
                "border-r border-sidebar-border",
                "bg-sidebar text-sidebar-foreground",
                "transition-[width] duration-200 ease-in-out",
                collapsed ? "w-16" : "w-62"
            )}
            >
            {/* Brand */}
            <div
                className={cn(
                "flex h-[68px] shrink-0 items-center border-b",
                "border-sidebar-border px-4",
                collapsed ? "justify-center" : "justify-between"
                )}
            >
                <Link
                href="/dashboard"
                aria-label="Chai dashboard"
                className="flex min-w-0 items-center gap-2.5"
                >
                <Image
                    src="/logo.png"
                    alt="Chai"
                    width={34}
                    height={34}
                    priority
                    className="size-[34px] shrink-0 object-contain"
                />

                {!collapsed && (
                    <span className="truncate text-xl font-semibold tracking-tight">
                        Repo Mind
                    </span>
                )}
                </Link>

                {!collapsed && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => onCollapsedChange(true)}
                    aria-label="Collapse sidebar"
                >
                    <ChevronLeft className="size-4" />
                </Button>
                )}

                {collapsed && (
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute -right-3 top-5 z-20 size-6 rounded-full bg-background shadow-sm"
                    onClick={() => onCollapsedChange(false)}
                    aria-label="Expand sidebar"
                >
                    <ChevronRight className="size-3" />
                </Button>
                )}
            </div>

            {/* Navigation */}
            <nav
                aria-label="Dashboard navigation"
                className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
            >
                {!collapsed && (
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Workspace
                </p>
                )}

                {DASHBOARD_NAV_ITEMS.map((item) => {
                const Icon = item.icon;

                const isActive =
                    item.href === "/dashboard"
                    ? pathname === item.href
                    : pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                return (
                    <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.title : undefined}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                        "group relative flex h-10 items-center gap-3",
                        "rounded-lg px-3 text-[13px] font-medium",
                        "transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-ring",
                        collapsed && "justify-center px-0",
                        isActive
                        ? [
                            "bg-primary/10 text-primary",
                            "dark:bg-primary/15 dark:text-primary",
                            ]
                        : [
                            "text-muted-foreground",
                            "hover:bg-sidebar-accent",
                            "hover:text-sidebar-accent-foreground",
                            ]
                    )}
                    >
                    {/* Active indicator */}
                    {isActive && (
                        <span
                        aria-hidden="true"
                        className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-primary"
                        />
                    )}

                    <Icon
                        aria-hidden="true"
                        className={cn(
                        "size-[18px] shrink-0 transition-colors",
                        isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                        )}
                        strokeWidth={isActive ? 2.2 : 1.8}
                    />

                    {!collapsed && (
                        <span className="truncate">{item.title}</span>
                    )}
                    </Link>
                );
                })}
            </nav>

            {/* Account section */}
            <div className="shrink-0 border-t p-2">
                <div
                    className={cn(
                    "rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-1.5",
                    collapsed && "border-transparent bg-transparent p-0"
                    )}
                >
                    {userMenu}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
