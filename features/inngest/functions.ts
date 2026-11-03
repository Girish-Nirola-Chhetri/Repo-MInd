import { inngest } from "@/lib/inngest/client";
import { fetchRepoTree, RepoFIle } from "../repo/services/fetch-repo-tree";
import { filteredRepoFiles } from "../repo/services/filter-repo-files";
import { fetchRepoContents } from "../repo/services/fetch-file-contents";
import { chunkCode, CodeChunk } from "../repo/services/chunk-code";
import { upsertCodeChunks } from "../repo/services/vectors";
import { db } from "@/db";
import { repoTable } from "@/db/schema/repo-schema";
import { and, eq } from "drizzle-orm";


export const indexRepository = inngest.createFunction(
    {
        id: 'index-repository',
        triggers: { event: 'repository/index-repository'}
    },

    async ({event, step}) => {

        try{
            await db
                .update(repoTable)
                .set({
                    indexStatus: 'processing',
                    updatedAt: new Date(),
                })
                .where(
                    and(
                        eq(repoTable.repoId, event.data.repoId ),
                        eq( repoTable.userId, event.data.userId)
                    )
                )
                

            const tree = await step.run("fetch-repository-tree", async () => {
                return await fetchRepoTree({
                    installationId: event.data.installationId,
                    owner: event.data.owner,
                    repo: event.data.repo,
                    defaultBranch: event.data.defaultBranch
                })
            })


            const files = await step.run('filter-repository-files', (): RepoFIle[] => {
                return filteredRepoFiles( tree.files )
            })


            const chunks: CodeChunk[] = [];
            const FILE_BATCH_SIZE = 50;

            for ( let i = 0; i<files.length; i+=FILE_BATCH_SIZE ) {
                const batch = files.slice(i, i+FILE_BATCH_SIZE );

                const batchChunks = await step.run(`fetch-and-chunk-files-${i}`, async () => {
                    const results = [];

                    for ( const file of batch ) {
                        const fetched = await fetchRepoContents({
                            installationId: event.data.installationId,
                            owner: event.data.owner,
                            repo: event.data.repo,
                            file
                        });

                        results.push(
                            ...chunkCode({
                                path: fetched.path,
                                content: fetched.content,

                            })
                        )
                    }

                    return results
                })

                chunks.push(...batchChunks )
            }


            const result = await step.run("upsert-pinecone-chunks", async () => {
                return upsertCodeChunks({
                    repoId: event.data.repoId,
                    repoFullName: event.data.repoFullName,
                    branch: event.data.defaultBranch,
                    commitSha: event.data.commitSha,
                    chunks
                })
            })


            await db
                .update(repoTable)
                .set({
                    indexStatus: 'completed',
                    lastIndexedAt: new Date(),
                    lastIndexedCommitSha: tree.commitSha,
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq( repoTable.repoId, event.data.repoId),
                        eq( repoTable.userId, event.data.userId)
                    )
                )


            return {
                owner: tree.owner,
                repo: tree.repo,
                commitSha: tree.commitSha,
                fileCount: tree.files.length,
                chunkCount: chunks.length,
                upsertedCount: result.upserted
            }
        } catch ( error ) {
            await db   
                .update( repoTable )
                .set({
                    indexStatus: 'failed',
                    indexError: error instanceof Error ? error.message : String( error ),
                    updatedAt: new Date()
                })
                .where(
                    and(
                        eq( repoTable.repoId, event.data.repoId ),
                        eq( repoTable.userId, event.data.userId )
                    )
                );

            throw error
        }
    }
)