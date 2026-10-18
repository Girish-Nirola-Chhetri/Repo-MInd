"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <button
            onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle theme"
            className="cursor-pointer"
        >
            <Sun className="hidden size-5 dark:block" />
            <Moon className="block size-5 dark:hidden" />
        </button>
    );
}