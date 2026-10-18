
"use client";

import { useState } from "react";
import GithubIcon from "../utility/github-icon";
import {
    Link2,
    LoaderCircle,
    Plus,
    AlertCircle,
    CheckCircle2,
    ArrowUpRight,
    MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";



type Repository = {
    id?: string;
    repoName: string;
    repoFullName: string;
    description: string | null;
    owner: string;
    htmlUrl: string;
    defaultBranch: string;
    isPrivate: boolean;
    stars: number;
    language: string | null;
};




export default function AddRepositoryForm() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [repository, setRepository] =
        useState<Repository | null>(null);

    async function handleSubmit(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        setError("");
        setRepository(null);
        setLoading(true);

        try {
            const params = new URLSearchParams({
                url: url.trim(),
            });

            const response = await fetch(
                `/api/github/repos?${params.toString()}`
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    "Could not fetch repository."
                );
            }

            if (!result.repository) {
                throw new Error(
                    "The server did not return repository information."
                );
            }

            setRepository(result.repository);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GithubIcon />
                    <span>GitHub integration</span>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight">
                    Add a GitHub repository
                </h1>

                <p className="text-sm leading-6 text-muted-foreground">
                    Import a repository to explore its codebase and
                    start asking questions with Chai AI.
                </p>
            </div>

            {/* Repository URL form */}
            <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label
                        htmlFor="repository-url"
                        className="block text-sm font-medium"
                    >
                        GitHub repository URL
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative min-w-0 flex-1">
                            <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                            <input
                                id="repository-url"
                                type="url"
                                required
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://github.com/owner/repo"
                                disabled={loading}
                                className="h-11 w-full rounded-lg border bg-background pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || !url.trim()}
                            className="h-11 gap-2"
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle className="size-4 animate-spin" />
                                    Fetching...
                                </>
                            ) : (
                                <>
                                    <Plus className="size-4" />
                                    Fetch repository
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Your GitHub App must have access to the repository.
                    </p>
                </form>

                {/* Error message */}
                {error && (
                    <div
                        role="alert"
                        className="mt-5 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"
                    >
                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />

                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* Repository success card */}
            {repository && (
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-1 size-5 shrink-0 text-green-600" />

                        <div className="min-w-0 flex-1 space-y-3">
                            <div>
                                <p className="text-sm font-medium">
                                    Repository saved successfully
                                </p>

                                <p className="mt-1 break-all text-sm text-muted-foreground">
                                    {repository.repoFullName}
                                </p>
                            </div>

                            {repository.description && (
                                <p className="text-sm leading-6 text-muted-foreground">
                                    {repository.description}
                                </p>
                            )}

                            <div className="flex flex-wrap gap-2 text-xs">
                                <span className="rounded-md border px-2 py-1">
                                    {repository.isPrivate ? "Private" : "Public"}
                                </span>

                                <span className="rounded-md border px-2 py-1">
                                    Branch: {repository.defaultBranch}
                                </span>

                                <span className="rounded-md border px-2 py-1">
                                    {repository.stars.toLocaleString()} stars
                                </span>

                                {repository.language && (
                                    <span className="rounded-md border px-2 py-1">
                                        {repository.language}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        // TODO: Navigate to the repository chat page
                                    }}
                                    className="gap-2"
                                >
                                    <MessageCircle className="size-4" />
                                    Chat with repository
                                </Button>

                                <a
                                    href={repository.htmlUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
                                >
                                    View on GitHub
                                    <ArrowUpRight className="size-3.5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
