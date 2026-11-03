"use client"

import {PanelLeftOpen, PanelLeftClose, ChevronDown,} from "lucide-react"

import { Button } from "@/components/ui/button"
import GithubIcon from "@/components/utility/github-icon"

type ChatHeaderProps = {
    repoName: string
    sidebarCollapsed: boolean
    onToggleSidebar: () => void
}

export function ChatHeader({
    repoName,
    sidebarCollapsed,
    onToggleSidebar,
}: ChatHeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">

            <div className="flex min-w-0 items-center gap-3">

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleSidebar}
                    title={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
                >
                    {sidebarCollapsed ? (
                        <PanelLeftOpen className="size-5" />
                    ) : (
                        <PanelLeftClose className="size-5" />
                    )}
                </Button>

                <div className="flex min-w-0 items-center gap-2">
                    <GithubIcon />

                    <span className="truncate text-sm font-semibold">
                        {repoName}
                    </span>

                    <ChevronDown className="size-4 text-muted-foreground" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 dark:text-green-400 sm:inline-flex">
                    Indexed
                </span>
            </div>

        </header>
    )
}