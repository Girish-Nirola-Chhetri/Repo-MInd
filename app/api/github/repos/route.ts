import { eq } from "drizzle-orm";
import { fetchRepo } from '@/features/repo/services/fetch-repo-metadata'
import { getCurrentSession } from "@/features/auth/actions";
import { NextRequest, NextResponse } from "next/server";
import { redirect } from 'next/navigation'
import { githubInstallationTable } from "@/db/schema/gihub-installation";
import { db } from "@/db/index";
import { saveRepoMetadata } from "@/features/repo/db/save-repo-metadata";
import { inngest } from "@/lib/inngest/client";

export async function GET ( req: NextRequest) {
    const session = await getCurrentSession()
    if( !session ) {
        redirect('/sign-in')
    }


    const [installation] = await db
        .select({ isntallationId: githubInstallationTable.installationId })
        .from( githubInstallationTable )
        .where(
            eq( githubInstallationTable.userId, session.user.id  )
        )

    if(!installation ) {
        throw new Error('Github app not installed')
    }


    const url = req.nextUrl.searchParams.get('url')
    if( !url ) {
        return NextResponse.json({message: "repo url is required"}, { status: 400})
    }

    const repo = await fetchRepo({ url, installationId: installation.isntallationId })

    const savedRepo = await saveRepoMetadata({ data: repo, userId: session.user.id})

    // inngest 
    await inngest.send({
        name: 'repository/index-repository',
        data: {
            userId: session.user.id,
            installationId: installation.isntallationId,
            owner: savedRepo.owner,
            repoId: savedRepo.repoId,
            repo: savedRepo.repoName,
            defaultBranch: savedRepo.defaultBranch
        }
    })
        
    return NextResponse.json({ message: 'Repo metadata saved successfully', repository: savedRepo })
}