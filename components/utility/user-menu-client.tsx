
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/actions";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";

type UserMenuProps = {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
    isCollapsed?: boolean;
};

export function UserMenuClient({ user, isCollapsed = false }: UserMenuProps) {
    const firstLetter = user.name?.charAt(0).toUpperCase() || "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        className={[
                            "h-auto w-full justify-start gap-4 rounded-xl p-3",
                            "hover:bg-sidebar-accent",
                            "focus-visible:ring-2 focus-visible:ring-ring",
                            isCollapsed && "justify-center px-1",
                        ].filter(Boolean).join(" ")}
                        aria-label="Open user menu"
                    />
                }
            >
                <Avatar className="size-10 shrink-0 ring-1 ring-border">
                    <AvatarImage src={user.image ?? ""} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {firstLetter}
                    </AvatarFallback>
                </Avatar>

                {!isCollapsed && (
                    <>
                        <span className="flex min-w-0 flex-1 flex-col items-start gap-2">
                            <span className="max-w-full truncate text-sm font-medium leading-none">
                                {user.name}
                            </span>
                            <span className="max-w-full truncate text-xs font-normal leading-none text-muted-foreground">
                                {user.email}
                            </span>
                        </span>

                        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                    </>
                )}
            </DropdownMenuTrigger>

            <DropdownMenuContent side={isCollapsed ? "right" : "top"} align={isCollapsed ? "start" : "end"} sideOffset={8} className="w-64">
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="p-3 font-normal">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-10 shrink-0">
                                <AvatarImage src={user.image ?? ""} alt={user.name} />
                                <AvatarFallback>{firstLetter}</AvatarFallback>
                            </Avatar>

                            <div className="flex min-w-0 flex-col gap-2">
                                <span className="truncate text-sm font-medium">{user.name}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem className="gap-4 py-2">
                        <User className="size-4" />
                        Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem className="gap-4 py-2">
                        <Settings className="size-4" />
                        Settings
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer gap-4 py-2 text-destructive focus:text-destructive">
                    <LogOut className="size-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
