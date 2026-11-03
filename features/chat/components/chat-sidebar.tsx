
"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    MessageSquare,
    Plus,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react"

import GithubIcon from "@/components/utility/github-icon"

import type { ConversationType } from "../types/chat"

type ChatSidebarProps = {
    repoName: string
    conversations: ConversationType[]
    activeConversationId: string | null
    collapsed: boolean
    isDisabled: boolean
    onToggleSidebar: () => void
    onSelectConversation: (id: string) => Promise<void>
    onNewConversation: () => void
}

const DEFAULT_WIDTH = 240
const MIN_WIDTH = 200
const MAX_WIDTH = 360
const COLLAPSED_WIDTH = 56

export function ChatSidebar({
    repoName,
    conversations,
    activeConversationId,
    collapsed,
    isDisabled,
    onToggleSidebar,
    onSelectConversation,
    onNewConversation,
}: ChatSidebarProps) {
    const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
    const [isResizing, setIsResizing] = useState(false)

    const sidebarRef = useRef<HTMLElement>(null)
    const isPointerDown = useRef(false)

    function handlePointerDown(
        event: React.PointerEvent<HTMLDivElement>
    ) {
        event.preventDefault()
        isPointerDown.current = true
        setIsResizing(true)
        event.currentTarget.setPointerCapture(event.pointerId)
    }

    function handlePointerMove(
        event: React.PointerEvent<HTMLDivElement>
    ) {
        if (!isPointerDown.current || !sidebarRef.current) return

        const sidebarLeft =
            sidebarRef.current.getBoundingClientRect().left

        const newWidth = event.clientX - sidebarLeft

        setSidebarWidth(
            Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth))
        )
    }

    function handlePointerUp(
        event: React.PointerEvent<HTMLDivElement>
    ) {
        isPointerDown.current = false
        setIsResizing(false)

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
        }
    }

    function handleResetWidth() {
        setSidebarWidth(DEFAULT_WIDTH)
    }

    return (
        <aside
            ref={sidebarRef}
            aria-label="Chat conversations"
            className={cn(
                "relative flex h-full shrink-0 flex-col border-r border-border bg-muted/30",
                !isResizing && "transition-[width] duration-200"
            )}
            style={{
                width: collapsed ? COLLAPSED_WIDTH : sidebarWidth,
            }}
        >
            {/* Header */}
            <div
                className={cn(
                    "flex h-16 shrink-0 items-center border-b border-border",
                    collapsed
                        ? "justify-center"
                        : "justify-between px-4"
                )}
            >
                {collapsed ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggleSidebar}
                        title="Expand sidebar"
                        aria-label="Expand sidebar"
                    >
                        <PanelLeftOpen className="size-5" />
                    </Button>
                ) : (
                    <>
                        <div className="flex min-w-0 items-center gap-2">
                            <GithubIcon />
                            <span className="truncate text-sm font-semibold">
                                {repoName}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onToggleSidebar}
                            title="Collapse sidebar"
                            aria-label="Collapse sidebar"
                            className="size-8 shrink-0"
                        >
                            <PanelLeftClose className="size-4" />
                        </Button>
                    </>
                )}
            </div>

            {/* Repository status */}
            {!collapsed && (
                <div className="px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-green-500" />
                        <span className="text-xs text-muted-foreground">
                            Indexed
                        </span>
                    </div>
                </div>
            )}

            {/* New conversation */}
            <div
                className={cn(
                    "shrink-0",
                    collapsed ? "p-2" : "px-3 pb-3"
                )}
            >
                <Button
                    variant={collapsed ? "ghost" : "outline"}
                    size={collapsed ? "icon" : "default"}
                    className={cn(
                        "gap-2",
                        !collapsed && "w-full justify-start"
                    )}
                    onClick={onNewConversation}
                    disabled={isDisabled}
                    title="New conversation"
                    aria-label="New conversation"
                >
                    <Plus className="size-4 shrink-0" />
                    {!collapsed && "New conversation"}
                </Button>
            </div>

            {/* Conversation list */}
            {!collapsed && (
                <div className="flex-1 overflow-y-auto px-3 pb-3">
                    <p className="mb-2 px-2 text-[11px] font-semibold tracking-wider text-muted-foreground">
                        RECENT CHATS
                    </p>

                    <div className="space-y-1">
                        {conversations.map((conversation) => {
                            const isActive =
                                activeConversationId === conversation.id

                            return (
                                <Button
                                    key={conversation.id}
                                    variant="ghost"
                                    onClick={() =>
                                        onSelectConversation(conversation.id)
                                    }
                                    disabled={isDisabled}
                                    aria-current={
                                        isActive ? "page" : undefined
                                    }
                                    className={cn(
                                        "flex w-full justify-start gap-2 rounded-lg px-3 py-2.5 text-left text-sm",
                                        isActive
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                    )}
                                >
                                    <MessageSquare className="size-4 shrink-0" />
                                    <span className="truncate">
                                        {conversation.title}
                                    </span>
                                </Button>
                            )
                        })}

                        {conversations.length === 0 && (
                            <p className="px-2 py-4 text-sm text-muted-foreground">
                                No conversations yet.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Resize handle */}
            {!collapsed && (
                <div
                    role="separator"
                    aria-label="Resize sidebar"
                    aria-orientation="vertical"
                    aria-valuemin={MIN_WIDTH}
                    aria-valuemax={MAX_WIDTH}
                    aria-valuenow={Math.round(sidebarWidth)}
                    tabIndex={0}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onDoubleClick={handleResetWidth}
                    className={cn(
                        "absolute right-0 top-0 z-20 h-full w-1 cursor-col-resize touch-none",
                        "hover:bg-primary/40",
                        isResizing && "bg-primary/50"
                    )}
                />
            )}
        </aside>
    )
}
