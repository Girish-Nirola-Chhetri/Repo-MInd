import type { ModelMessage } from "ai"
import { buildPrompt } from "./build-prompt"
import { generateResponse } from "./generate-response"
import { retrieveCode } from "./retrieve"
import { reWriteQuery } from "./rewrite-query"



export type ChatHistoryMessage = {
    role: "user" | "assistant"
    content: string | null
}

type ChatRepoProps = {
    repoId: string
    query: string
    history: ChatHistoryMessage[]
}

export async function ChatRepo(
    { repoId, query, history }: ChatRepoProps
) {
    if( !query.trim() ) throw new Error("Query cannot be empty")

    // rewrite query
    const retrevealQuery = await reWriteQuery({ query, history});

    // retrieve repo code
    const codeChunks = await retrieveCode({ repoId, query: retrevealQuery })

    // build prompt 
    const prompt = buildPrompt({ query, codeChunks })

    // role based message
    const messages: ModelMessage[] = [
        ...history.map((message): ModelMessage => {
            const content = message.content ?? ""

            if (message.role === "user") {
                return {
                    role: "user",
                    content,
                }
            }

            return {
                role: "assistant",
                content,
            }
        }),

        {
            role: "user",
            content: prompt.userMessage,
        },
    ]

    const response = await generateResponse({
        systemMessage: prompt.systemMessage,
        messages,
    })

    return response

}