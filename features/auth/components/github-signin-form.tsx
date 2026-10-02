"use client";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { signInWithGithub } from "../actions";
import GithubIcon from "@/components/utility/github-icon";
import { useFormStatus } from "react-dom";

type GithubSigninFormProps = {
    callbackUrl?: string;
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full gap-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.99]"
        >
            {pending ? (
                <>
                    <Spinner className="size-4" />
                    <span>Redirecting to GitHub...</span>
                </>
            ) : (
                <>
                    <GithubIcon />
                    <span>Continue with GitHub</span>
                </>
            )}
        </Button>
    );
}

export const GithubSignInForm = ({
    callbackUrl,
}: GithubSigninFormProps) => {
    return (
        <form action={signInWithGithub}>
            {callbackUrl && (
                <input
                    type="hidden"
                    name="callbackUrl"
                    value={callbackUrl}
                />
            )}
            <SubmitButton />
        </form>
    );
};
