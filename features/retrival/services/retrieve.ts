import type { DocumentSearchMatch } from "@pinecone-database/pinecone";
import { repoIndex } from "@/lib/pinecone/client";

type RetrieveCodeParams = {
    repoId: string;
    query: string;
    topK?: number;
};

export type RetrievedCodeChunk = {
    content: string;
    filePath: string;
    startLine: number;
    endLine: number;
    language: string;
    score: number | null;
};

export async function retrieveCode(
    { repoId, query, topK = 5 }: RetrieveCodeParams
): Promise<RetrievedCodeChunk[]> {
    if (!query.trim()) {
        throw new Error("Search query cannot be empty");
    }

    const results = await repoIndex.documents.search({
        scoreBy: [
            {
                type: "embed",
                field: "chunk_text",
                query: query,
            },
        ],
        filter: {
            repository_id: { $eq: repoId },
        },
        topK,
        includeFields: [
            "chunk_text",
            "file_path",
            "start_line",
            "end_line",
            "language",
        ],
    });

    return results.matches.map((hit: DocumentSearchMatch) => ({
        content: String(hit.chunk_text ?? ""),
        filePath: String(hit.file_path ?? ""),
        startLine: Number(hit.start_line ?? 0),
        endLine: Number(hit.end_line ?? 0),
        language: String(hit.language ?? "unknown"),
        score: hit._score,
    }));
}
