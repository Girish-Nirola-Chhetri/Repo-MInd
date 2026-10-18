import { redirect } from "next/navigation";

import { getCurrentSession } from "@/features/auth/actions";
import { githubInstallationStatus } from "@/features/github/server/index";
import { GithubConnectCard } from "@/features/github/components/githubconnect-card";

const GithubPage = async () => {
    const session = await getCurrentSession();

    if (!session?.user) {
        redirect("/sign-in");
    }

    const installation = await githubInstallationStatus(
        session.user.id
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    GitHub
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Manage your GitHub connection.
                </p>
            </div>

            <div className="max-w-xl">
                <GithubConnectCard
                    userId={session.user.id}
                    installation={{
                        connected: installation.connected,
                        accountLogin: installation.accountLogin ?? "",
                        installedAt: installation.installedAt ?? null,
                    }}
                />
            </div>
        </div>
    );
};

export default GithubPage;