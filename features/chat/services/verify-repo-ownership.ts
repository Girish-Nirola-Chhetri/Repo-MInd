import { db } from "@/db"
import { repoTable } from "@/db/schema/repo-schema"
import { and, eq } from "drizzle-orm"

export async function verifyRepositoryOwnership(
    repositoryId: string,
    userId: string
) {
    if (!repositoryId?.trim()) {
        throw new Error("Repository ID is required")
    }

    const [repository] = await db
        .select()
        .from(repoTable)
        .where(
            and(
                eq(repoTable.id, repositoryId),
                eq(repoTable.userId, userId)
            )
        )
        .limit(1)

    if (!repository) {
        throw new Error("Repository not found")
    }

    return repository
}