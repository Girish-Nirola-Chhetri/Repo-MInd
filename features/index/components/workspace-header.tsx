
import { FolderCode } from "lucide-react"

type WorkspaceHeaderProps = {
    repoCount: number
}

export function WorkspaceHeader(
    { repoCount }: WorkspaceHeaderProps
) {
    return(
        <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-muted/50">
                <FolderCode className="size-5" />
            </div>

            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">
                    Code WorkSpace
                </h1>

                <p className="text-sm text-muted-foreground">
                    Explore your indexed repositories and understand your codebase
                </p>

                <p className="flex items-center gap-2 pt-2">
                    <span className="inline-flex min-w-9 items-center justify-center rounded-lg border border-border bg-muted px-3 py-1 text-lg font-bold tabular-nums text-foreground shadow-sm">
                        {repoCount}
                    </span>
                    <span className="text-m font-medium text-muted-foreground">
                        {repoCount === 1 ? "repository" : "repositories"}
                    </span>
                </p>

            </div>
        </div>
    )
}
