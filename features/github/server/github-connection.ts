import { redirect } from "next/navigation";
import { githubInstallUrl } from "@/lib/github-install-url";
import { GithubApp } from "@/lib/github-app"
import { getCurrentSession } from "@/features/auth/actions";
import { db } from "@/db/index";
import { githubInstallationTable } from "@/db/schema/gihub-installation";
import { eq, and } from "drizzle-orm";


export async function ConnectGithub() {
    const session = await getCurrentSession();
    const userId = session?.user.id;

    if( !userId ) {
        redirect("/login");
    }

    const installUrl = githubInstallUrl(userId);

    return installUrl ;
}


// this disconnects for github and delete from the installation from db
export async function disconnectGithubApp( userId: string ) {
    const app = GithubApp();

    const [installation] = await db
        .select()
        .from( githubInstallationTable )
        .where( 
            eq( githubInstallationTable.userId, userId ), 
        )
        .limit(1)

    if( !installation ) return null;

    // uninstall the specific installation forn github
    await app.octokit.request(
        "DELETE /app/installations/{installation_id}",
        {
            installation_id:  installation.installationId
        }
    );

    // delete from db
    await db
        .delete( githubInstallationTable )
        .where(
            eq( githubInstallationTable.userId, userId ),            
        )
        

    return { success: true }
}