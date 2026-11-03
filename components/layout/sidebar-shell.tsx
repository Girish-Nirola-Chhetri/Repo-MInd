"use client"

import { useState, type ReactNode} from "react"
import Sidebar from "./sidebar"

interface SIdebarShellProps {
    children: ReactNode
    userMenu: ReactNode
}

export function SidebarShell ({ children, userMenu }: SIdebarShellProps) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar
                userMenu={userMenu}
                collapsed={collapsed}
                onCollapsedChange={setCollapsed}
            />

            <main className="min-w-0 flex-1">
                {children}
            </main>
        </div>
    )

}