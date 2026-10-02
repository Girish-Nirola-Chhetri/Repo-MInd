import Image from "next/image";
import { GithubSignInForm } from "@/features/auth/components/github-signin-form";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    FieldGroup,
    FieldSet,
} from "@/components/ui/field";

type SearchParamsProps = {
    searchParams: Promise<{
        callbackUrl?: string;
    }>;
};

const SignIn = async ({ searchParams }: SearchParamsProps) => {
    const { callbackUrl } = await searchParams;

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
            {/* Background glow */}
            <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

            <Card className="relative z-10 w-full max-w-md border-border/70 bg-card/95 shadow-xl shadow-black/5 backdrop-blur-sm">
                <CardHeader className="pb-6 pt-8">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/logo.png"
                            alt="Repo Chat logo"
                            width={76}
                            height={76}
                            className="size-19 shrink-0 object-contain"
                            priority
                        />

                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-semibold tracking-tight">
                                Welcome back
                            </CardTitle>

                            <CardDescription className="text-sm leading-relaxed">
                                Sign in to continue to Repo Chat and start exploring
                                your repositories.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-3">
                    <FieldSet>
                        <FieldGroup>
                            <GithubSignInForm callbackUrl={callbackUrl} />
                        </FieldGroup>
                    </FieldSet>

                    <p className="px-2 text-center text-xs leading-relaxed text-muted-foreground">
                        We only request the permissions needed to identify
                        your account. You can revoke access anytime from
                        GitHub settings.
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                        <span className="h-px flex-1 bg-border" />
                        <span className="whitespace-nowrap">
                            Secure authentication
                        </span>
                        <span className="h-px flex-1 bg-border" />
                    </div>
                </CardContent>
            </Card>
        </main>
    );
};

export default SignIn;
