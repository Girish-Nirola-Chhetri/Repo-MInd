import { ArrowRight, Star } from "lucide-react"
import GithubIcon from "@/components/utility/github-icon"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type IndexedRepository = {
    id: string
    name: string
    fullName: string
    language: string | null
    stars: number
    lastIndexedAt: Date | string | null 
    htmlUrl : string
    indexStatus: "pending" | "processing" | "completed" | "failed"
    indexError: string | null;
}


type RepositoryCardProps = {
    repository: IndexedRepository
    onSelect?: ( repository: IndexedRepository ) => void;
}

export function RepositoryCard(
    { repository, onSelect } : RepositoryCardProps
) {

    const indexedAt = repository.lastIndexedAt? new Date( repository.lastIndexedAt ).toISOString().slice(0, 10) : "Never indexed"

    const statusConfig = {
        pending: {
            label: "Pending",
            className: "bg-muted text-muted-foreground",
        },
        processing: {
            label: "Indexing",
            className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        completed: {
            label: "Completed",
            className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        failed: {
            label: "Failed",
            className: "bg-destructive/10 text-destructive",
        },
    } satisfies Record<
        IndexedRepository["indexStatus"],
        { label: string; className: string }
    >

    const status = statusConfig[repository.indexStatus]

    return (
        <button
            type="button"
            onClick={() => onSelect?.(repository)}
            disabled={repository.indexStatus !== "completed"}
            className={cn(
                "group flex w-full items-center gap-6 rounded-xl border bg-card px-5 py-4 text-left",
                "transition-all duration-200 ease-out",
                "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/40 hover:shadow-md",
                "active:translate-y-0 active:scale-[0.995]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:bg-card disabled:hover:shadow-none"
            )}
        >   
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                    <GithubIcon />
                </div>

                <div className="min-w-0 space-y-1">
                    <h3 className="truncate font-semibold tracking-tight">
                        { repository.name }
                    </h3>
                    <p className="truncate text-sm text-muted-foreground">
                        { repository.fullName }
                    </p>
                </div>
            </div>

            <div className="hidden w-28 shrink-0 flex-col gap-1 sm:flex">
                <span className="text-xs text-muted-foreground">
                    Language
                </span>
                <span className="truncate text-sm">
                    { repository.language ?? "Unknown" }
                </span>
            </div>

            <div className="hidden w-20 shrink-0 flex-col gap-1 md:flex">
                <span className="text-xs text-muted-foreground">
                    Stars
                </span>
                <span className="flex items-center gap-1 text-sm">
                    <Star className="size-3.5 text-muted-foreground"/>
                    { repository.stars.toLocaleString()}
                </span>
            </div>

            <div className="flex w-28 shrink-0 flex-col items-start gap-1">
                <span className="text-xs text-muted-foreground">
                    Index status
                </span>
                <Badge variant="outline" className={status.className}>
                    { status.label }
                </Badge>
            </div>

            <div className="hidden w-32 shrink-0 flex-col gap-1 lg:flex">
                <span className="text-xs text-muted-foreground">
                    Last indexed
                </span>
                <span className="truncate text-sm text-muted-foreground">
                    { indexedAt }
                </span>
            </div>

            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1"/>
        </button>
    )
}