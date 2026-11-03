"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import type { IndexedRepository } from "./repository-card"
import { WorkspaceHeader } from "./workspace-header"
import { SearchRepository } from "./repository-search"
import { WorkspaceEmptyState } from "./workspace-empty-state"
import { RepositoryGrid } from "./repository-grid"

type CodeWorkspaceProps = {
    repositories: IndexedRepository[]
}

export function CodeWorkspace({ repositories }: CodeWorkspaceProps) {
    const [search, setSearch] = useState("")
    const router = useRouter()

    const filteredRepositories = useMemo(() => {
        const query = search.trim().toLowerCase()

        if (!query) return repositories

        return repositories.filter((repository) =>
            repository.name.toLowerCase().includes(query) ||
            repository.fullName.toLowerCase().includes(query)
        )
    }, [repositories, search])

    const hasNoRepositories = repositories.length === 0
    const hasNoSearchResults =
        search.trim().length > 0 && filteredRepositories.length === 0

    function handleSelectRepository(repository: IndexedRepository) {
        if (repository.indexStatus !== "completed") return

        router.push(`/repositories/${repository.id}/chat`)
    }

    return (
        <div className="mx-auto w-full max-w-[1600px] space-y-6 px-6 py-6 lg:px-8 xl:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <WorkspaceHeader repoCount={repositories.length} />

                <div className="w-full sm:max-w-xs">
                    <SearchRepository
                        value={search}
                        onChange={setSearch}
                    />
                </div>
            </div>

            {hasNoRepositories || hasNoSearchResults ? (
                <WorkspaceEmptyState
                    isSearching={hasNoSearchResults}
                    searchQuery={search.trim()}
                />
            ) : (
                <RepositoryGrid
                    repositories={filteredRepositories}
                    onSelectRepository={handleSelectRepository}
                />
            )}
        </div>
    )
}