export function githubInstallUrl( userId: string ) {
    const url = new URL("https://github.com/apps/repomind-github-app/installations/new");

    // add user id in the url installayion ( userId state )
    url.searchParams.set("state", userId)

    return url.toString()
}