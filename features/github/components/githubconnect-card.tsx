"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { githubInstallUrl } from "@/lib/github-install-url";
import { uninstallGithubApp } from "../actions/uninstall-app";
import { CheckCircle2, XCircle } from "lucide-react";
import GithubIcon from "@/components/utility/github-icon";
import { Button } from "@/components/ui/button";

type GithubInstallationStatus = {
    connected: boolean;
    accountLogin: string;
    installedAt: string | null;
};

type GithubConnectCardProps = {
    userId: string;
    installation: GithubInstallationStatus;
};

export function GithubConnectCard({
    userId,
    installation,
}: GithubConnectCardProps) {
    const installUrl = githubInstallUrl(userId);

    const [connected, setConnected] = useState(installation.connected);
    const [accountLogin, setAccountLogin] = useState(
        installation.accountLogin
    );

    const installedAt = installation.installedAt;

    const [loading, setLoading] = useState(false);

    const handleDisconnect = async () => {
        try {
            setLoading(true);

            await uninstallGithubApp(userId);

            setConnected(false);
            setAccountLogin("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-border bg-card text-card-foreground shadow-sm">
            <CardHeader className="border-b border-border">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted">
                            <GithubIcon />
                        </div>

                        <div>
                            <h3 className="font-semibold">
                                GitHub
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Connect your GitHub account to access
                                repositories.
                            </p>
                        </div>
                    </div>

                    {connected ? (
                        <div className="flex shrink-0 items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Installed
                        </div>
                    ) : (
                        <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                            <XCircle className="h-3.5 w-3.5" />
                            Not Installed
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-5">
                {connected ? (
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                                {accountLogin}
                            </p>

                            {installedAt && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Connected on{" "}
                                    {new Date(installedAt).toLocaleDateString(
                                        "en-IN"
                                    )}
                                </p>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            disabled={loading}
                            onClick={handleDisconnect}
                            className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                            {loading ? "Uninstalling..." : "Uninstall"}
                        </Button>
                    </div>
                ) : (
                    <Button
                        className="whitespace-nowrap font-semibold"
                    >
                        <a
                            href={installUrl}
                            className="flex items-center gap-2"
                        >
                            <GithubIcon />
                            <span>Install GitHub App</span>
                        </a>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}