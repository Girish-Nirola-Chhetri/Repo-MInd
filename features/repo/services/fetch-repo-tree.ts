import {GithubApp} from "@/lib/github-app";


type fetchRepoTreeParams = {
    installationId: number,
    owner: string,
    repo: string
    defaultBranch: string
}

export type RepoFIle = {
    path: string
    sha: string
    size: number
}

export type RepoTreeResult = {
    owner: string
    repo: string
    commitSha: string
    files: RepoFIle[]
}
 
export async function fetchRepoTree(
    { installationId, owner, repo, defaultBranch }: fetchRepoTreeParams
): Promise<RepoTreeResult> {

    //1: get github app and octokit 
    const app = GithubApp()
    const octokit = await app.getInstallationOctokit( installationId )

    //2: get the branch 
    const {data: branch } = await octokit.rest.repos.getBranch({
        owner, repo, branch: defaultBranch
    })

    //3: commot on which the bracnh is
    const commitSha = branch.commit.sha

    //4: get the tree
    const { data: tree } = await octokit.rest.git.getTree({
        owner, repo, tree_sha: commitSha, recursive: "true"
    })

    if( tree.truncated ) throw new Error("Repo too large. Tree truncated ")

    // 5: get only the required imp files 
    const files = tree.tree
        .filter((item)  => 
            item.type === 'blob' && item.path && item.sha
        )
        .map((item) => ({
            path: item.path,
            sha: item.sha,
            size: item.size ?? 0
        }))
    
    return {
        owner, 
        repo,
        commitSha,
        files
    }
}