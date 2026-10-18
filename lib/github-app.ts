import { readFileSync } from 'fs';
import { App } from 'octokit'
import path from 'path/win32';

let githubApp: App | null = null

export function GithubApp() {
    if( !githubApp ) {

        const privateKey = readFileSync(
            path.join(process.cwd(),"github-app-private-key.pem"),
            "utf8"
        );

        if( !privateKey ) 
            throw new Error("mising github app credentials")

        githubApp = new App({
            appId: process.env.GITHUB_App_ID!,
            privateKey: privateKey
        })
    }
    return githubApp
}
