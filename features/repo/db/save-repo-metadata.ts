
import { db } from "@/db/index";
import { repoTable } from "@/db/schema/repo-schema";
import { randomUUID } from "crypto";

type SaveRepoMetadata = {
    data: {
        githubRepoId: string;
        repoName: string;
        repoFullName: string;
        owner: string;
        description: string | null;
        htmlUrl: string;
        defaultBranch: string;
        isPrivate: boolean;
        stars: number;
        language: string | null;
    };
    userId: string;
};

export async function saveRepoMetadata({
    data,
    userId,
}: SaveRepoMetadata) {
    const [repository] = await db
        .insert(repoTable)
        .values({
            id: randomUUID(),
            userId,
            repoId: data.githubRepoId,
            repoName: data.repoName,
            repoFullName: data.repoFullName,
            description: data.description,
            owner: data.owner,
            defaultBranch: data.defaultBranch,
            isPrivate: data.isPrivate,
            stars: data.stars,
            language: data.language,
            htmlUrl: data.htmlUrl,
        })
        .onConflictDoUpdate({
            target: [
                repoTable.userId,
                repoTable.repoId,
            ],
            set: {
                repoName: data.repoName,
                repoFullName: data.repoFullName,
                description: data.description,
                owner: data.owner,
                defaultBranch: data.defaultBranch,
                isPrivate: data.isPrivate,
                stars: data.stars,
                language: data.language,
                htmlUrl: data.htmlUrl,
                updatedAt: new Date(),
            },
        })
        .returning();

    return repository;
}
