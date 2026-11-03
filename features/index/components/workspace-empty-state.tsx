
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, FolderCode, ArrowRight } from "lucide-react";

type WorkspaceEmptyStateProps = {
    isSearching?: boolean;
    searchQuery?: string;
};

export function WorkspaceEmptyState(
    { isSearching= false, searchQuery = "" } : WorkspaceEmptyStateProps
) {
    if( isSearching ) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                    <Search className="size-5 text-muted-foreground" />
                </div>

                <h3 className="font-semibold">
                    No repositories found
                </h3>

                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    No repositories match &quot;{searchQuery}&quot;.
                    Try a different repository name or owner.
                </p>
            </div>
        )
    }


    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
                <FolderCode className="size-5 text-muted-foreground" />
            </div>

            <h3 className="font-semibold">No repositories yet</h3>
                
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Add a GitHub repository and index its code to start exploring
                your codebase with AI.
            </p>

            <Button className="mt-5">
                <Link href="/dashboard/repositories">
                    Add repository
                    <ArrowRight className="ml-2 size-4" />
                </Link>
            </Button>
        </div>
    )
}
