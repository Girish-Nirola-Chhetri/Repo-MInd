import {  repoIndex } from "@/lib/pinecone/client";
import type { CodeChunk } from "./chunk-code";
import { createHash } from "node:crypto";

type UpsertCodeChunkParams = {
    repoId: string
    repoFullName: string
    branch: string
    commitSha: string
    chunks: CodeChunk[]
}

const BATCH_SIZE = 50;

function createChunkId( repoId: string, chunk: CodeChunk): string  {
    return createHash('sha256')
        .update([
            repoId, chunk.path, chunk.startLine, chunk.endLine, chunk.content,
        ].join(":"))
        .digest('hex') 
}

export async function upsertCodeChunks (
    { repoId, repoFullName, branch, commitSha, chunks }: UpsertCodeChunkParams
) {
    if( chunks.length === 0 ) return { upserted: 0 }


    let upserted = 0;
    for( let i = 0; i<chunks.length; i+= BATCH_SIZE ) {
        const batch = chunks.slice(i, i + BATCH_SIZE);

        const documents = batch.map((chunk) => {
            if( !chunk.content.trim() ) 
                throw new Error(`Empty chunk received: ${chunk.path}`)

            return {
                _id: createChunkId(repoId, chunk),
                chunk_text : chunk.content,
                repository_id: repoId,
                repo_fullname: repoFullName,
                file_path: chunk.path,
                language: chunk.language,
                start_line: chunk.startLine,
                end_line: chunk.endLine,
                branch: branch,
                commit_sha: commitSha
            }
        })

        const response = await repoIndex.documents.upsert({
            documents,
        });

        upserted += response.upsertedCount;
    }

    return { upserted }
}