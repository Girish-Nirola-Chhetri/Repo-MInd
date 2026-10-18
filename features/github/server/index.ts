import { GithubApp } from "@/lib/github-app";
import { db } from "@/db/index";
import { githubInstallationTable } from "@/db/schema/gihub-installation";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";


export function getAccountLogin(
    account: { login?: string; slug?: string } | null | undefined
): string | null {
    return account?.login ?? account?.slug ?? null;
}



export async function githubInstallationStatus( userId: string ) {
    const [installation] = await db
        .select()
        .from( githubInstallationTable )
        .where(
            eq( githubInstallationTable.userId, userId )
        )

    if( !installation ) {
        return {
            connected: false,
            accountLogin: null,
            installedAt: null
        }
    }

    return {
        connected: true,
        accountLogin: installation.accountLogin,
        installedAt: installation.createdAt.toString()
    }
}




export async function saveInstallation(userId: string, installationId: number) {
    const app = GithubApp();

    const { data } = await app.octokit.request(
        "GET /app/installations/{installation_id}",
        { installation_id: installationId }
    );

    const accountLogin = getAccountLogin(data.account);

    if (!accountLogin) {
        throw new Error(`Installation ${installationId} has no account login`);
    }

    const accountType = data.target_type;

    await db
        .insert(githubInstallationTable)
        .values({
            id: randomUUID(),
            userId,
            installationId,
            accountLogin,
            accountType,
        })
        .onConflictDoUpdate({
            target: githubInstallationTable.userId,
            set: {
                installationId,
                accountLogin,
                accountType,
                updatedAt: new Date(),
            },
        });

    return { success: true }
}


export async function getInstallatioIdByUser( userId: string ) {
    // will return an array
    const [ installation ] = await db
        .select({
            installationId: githubInstallationTable.installationId
        })
        .from( githubInstallationTable )
        .where(
            eq( githubInstallationTable.userId, userId )
        )

    return installation?.installationId 
}

export async function getUserByInstallationId( installationId: number ) {
    const [ installation ] = await db
        .select({
            userId: githubInstallationTable.userId
        })
        .from( githubInstallationTable )
        .where(
            eq( githubInstallationTable.installationId, installationId )
        )

    return installation?.userId
}

