"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/actions";
import { LogOut, Settings, User } from "lucide-react";

type UserMenuProps = {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
};

export function UserMenuClient({ user }: UserMenuProps) {
    const firstLetter = user.name?.charAt(0).toUpperCase() ?? "U";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        aria-label="Open user menu"
                    />
                }
            >
                <Avatar className="size-9">
                    <AvatarImage
                        src={user.image ?? ""}
                        alt={user.name ?? "User"}
                    />
                    <AvatarFallback>{firstLetter}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <User className="mr-2 size-4" />
                        Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem>
                        <Settings className="mr-2 size-4" />
                        Settings
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => signOut()}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                >
                    <LogOut className="mr-2 size-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}