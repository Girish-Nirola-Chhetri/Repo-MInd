import { db } from "@/db";
import { repoTable } from "@/db/schema/repo-schema";
import { getCurrentSession } from "@/features/auth/actions";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { type IndexedRepository } from "../components/repository-card";

export async function getRepositories() {
    const session = await getCurrentSession()
    if( !session ) redirect('sign-in')

    const repositories = await db
        .select()
        .from( repoTable )
        .where(
            eq( repoTable.userId, session.user.id )
        )

    return repositories.map((repo) => ({
        id: repo.id,
        name: repo.repoName,
        fullName: repo.repoFullName,
        language: repo.language,
        stars: repo.stars,
        lastIndexedAt: repo.lastIndexedAt,
        htmlUrl: repo.htmlUrl,
        indexStatus: repo.indexStatus as IndexedRepository["indexStatus"],
        indexError: repo.indexError,
    }));
}