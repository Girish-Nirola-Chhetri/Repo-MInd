import { buildPrompt } from "./build-prompt"
import { generateResponse } from "./generate-response"
import { retrieveCode } from "./retrieve"

type ChatRepoProps = {
    repoId: string
    query: string
}

export async function ChatRepo(
    { repoId, query }: ChatRepoProps
) {
    if( !query.trim() ) {
        throw new Error("Query cannot be empty")
    }

    const codeChunks = await retrieveCode({ repoId, query })

    const prompt = buildPrompt({ query, codeChunks})

    const response =await generateResponse( prompt )

    console.log ( response )
    return response
}