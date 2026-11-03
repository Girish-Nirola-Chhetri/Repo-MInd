import { Pinecone } from "@pinecone-database/pinecone";

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
})

export const repoIndex = pinecone.index({
    name: process.env.PINECONE_INDEX_NAME ?? "repo-chat"
})