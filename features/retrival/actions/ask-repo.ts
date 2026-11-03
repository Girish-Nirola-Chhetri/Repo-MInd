"use server"

import { getCurrentSession } from "@/features/auth/actions"
import { db } from "@/db/index"
import { repoTable } from "@/db/schema/repo-schema"
import { and, eq } from "drizzle-orm"
import { ChatRepo } from "../services/chat"

export async function askRepo( repoId: string, query: string ) {
    
    const session = await getCurrentSession()
    if( !session ) throw new Error("unauthorized access")

    if( !repoId.trim() || !query.trim() )
        throw new Error("Repository ID and query are required")


    const [repo] = await db
        .select()
        .from( repoTable )
        .where(
            and(
                eq( repoTable.userId, session.user.id ),
                eq( repoTable.repoId, repoId )
            )
        )

    if( !repo ) throw new Error("repo not found")

    if( repo.indexStatus !== 'completed') throw new Error("repository indexing not completed")

    return await ChatRepo({ repoId, query})
}