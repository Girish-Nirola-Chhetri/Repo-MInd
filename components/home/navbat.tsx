import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "../utility/mode-toggle"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 text-black backdrop-blur-xl dark:border-zinc-800 dark:bg-[#0B0D12]/95 dark:text-white">
      <nav className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-3 sm:px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="RepoMind logo"
            width={36}
            height={36}
            priority
            className="size-9 object-contain brightness-0 dark:brightness-100"
          />

          <span className="text-lg font-semibold tracking-tight">
            Repo
            <span className="text-violet-600 dark:text-violet-400">Mind</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-700 transition-colors hover:text-violet-600 dark:text-zinc-300 dark:hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Theme Toggle */}
          <ModeToggle />

          {/* Get Started */}
          <Button
            className="bg-violet-600 font-medium text-white hover:bg-violet-700"
          >
            <Link href="/sign-in">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}