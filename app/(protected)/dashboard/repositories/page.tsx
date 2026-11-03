
"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft,
    ArrowRight,
    Loader2,
    Link as LinkIcon,
    Lock,
    Sparkles,
} from "lucide-react"

import GithubIcon from "@/components/utility/github-icon"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AddRepositoryPage() {
    const router = useRouter()

    const [repoUrl, setRepoUrl] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const url = repoUrl.trim()

        if (!url) {
            setError("Please enter a GitHub repository URL.")
            return
        }

        try {
            const parsedUrl = new URL(url)

            if (
                parsedUrl.hostname !== "github.com" ||
                parsedUrl.pathname.split("/").filter(Boolean).length !== 2
            ) {
                setError("Enter a valid GitHub repository URL.")
                return
            }
        } catch {
            setError("Enter a valid GitHub repository URL.")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            const response = await fetch("/api/repositories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.error || data.message || "Failed to add repository."
                )
            }

            router.push("/dashboard/repositories")
            router.refresh()

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="min-h-screen bg-background px-5 py-8 text-foreground sm:px-8">
            <div className="mx-auto max-w-3xl">


                {/* Heading */}
                <div className="mb-10 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
                            <GithubIcon />
                        </div>

                        <h1 className="text-3xl font-semibold tracking-tight">
                            Add a repository
                        </h1>
                    </div>

                    <p className="max-w-xl text-muted-foreground">
                        Connect a GitHub repository to start indexing your
                        codebase and asking questions about your code.
                    </p>
                </div>

                {/* Repository form */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-2">
                            <label
                                htmlFor="repository-url"
                                className="text-sm font-medium"
                            >
                                GitHub repository URL
                            </label>

                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    id="repository-url"
                                    type="url"
                                    placeholder="https://github.com/username/repository"
                                    value={repoUrl}
                                    onChange={(e) => {
                                        setRepoUrl(e.target.value)
                                        setError(null)
                                    }}
                                    disabled={isSubmitting}
                                    className="h-12 pl-10"
                                />
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Paste the URL of the GitHub repository you
                                want to connect.
                            </p>
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
                            >
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={!repoUrl.trim() || isSubmitting}
                            className="h-11 w-full gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="size-4 animate-spin" />
                                    Adding repository...
                                </>
                            ) : (
                                <>
                                    Add repository
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Information */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div className="rounded-xl border bg-card p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <Sparkles className="size-4 text-primary" />
                            <h3 className="text-sm font-medium">
                                Automatic indexing
                            </h3>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Your repository files will be fetched, chunked
                            and indexed so the AI can understand your codebase.
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <Lock className="size-4 text-primary" />
                            <h3 className="text-sm font-medium">
                                Secure connection
                            </h3>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Repository access is handled through your
                            configured GitHub App integration.
                        </p>
                    </div>

                </div>

            </div>
        </main>
    )
}
