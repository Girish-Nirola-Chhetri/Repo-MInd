import { GithubApp } from "@/lib/github-app";
import type { RepoFIle } from "./fetch-repo-tree";



type FetchRepoFileContentParams = {
    installationId: number,
    owner: string,
    repo: string,
    file: RepoFIle
}

type FetchedFile = RepoFIle & {
    content: string
}

export async function fetchRepoContents(
    { installationId, owner, repo, file }: FetchRepoFileContentParams
): Promise<FetchedFile> {

    const app = GithubApp()
    const octokit = await app.getInstallationOctokit( installationId )


    const { data: blob } = await octokit.rest.git.getBlob({
        owner, repo, file_sha: file.sha
    });

    const content = Buffer.from( blob.content, "base64").toString("utf8")

    return {
        ...file, content
    }

}