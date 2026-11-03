import { GithubApp } from "@/lib/github-app";

type repoFetchParams = {
    url: string,
    installationId: number
}

const app = GithubApp()

export async function fetchRepo( {url, installationId }: repoFetchParams) {
    const parsedUrl = new URL( url )
    
    if( parsedUrl.hostname != 'github.com' || parsedUrl.username || parsedUrl.password ) {
        throw new Error('Invalid github repo url ')
    }

    // http://githu.com/apple/abc =. pathname = apple/abc  [apple, abc]   // filter to rmeove empty spaces if asny as its false 
    const pathNameParts = parsedUrl.pathname.split('/').filter(Boolean)

    if( pathNameParts.length !== 2 || pathNameParts.some((part) => part === '.' || part === '..') ) {
        throw new Error('ecpected url like https://github.com/owner/repo')
    }

    const [owner, repo ] = pathNameParts

    // create an authenticated github client
    const octokit = await app.getInstallationOctokit( installationId )
    
    // fecth rpo meta data
    const { data } = await octokit.rest.repos.get({
        owner, repo 
    })

    return {
        githubRepoId: String( data.id ),
        repoName: data.name,
        repoFullName: data.full_name,
        owner: data.owner.login,
        description: data.description,
        htmlUrl: data.html_url,
        defaultBranch: data.default_branch,
        isPrivate: data.private,
        stars: data.stargazers_count,
        language: data.language
    }

}