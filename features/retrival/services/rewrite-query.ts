import { generateText } from "ai"
import { model } from "@/lib/llm"
import type { ChatHistoryMessage } from "./chat"


type RewriteQueryProps = {
    query: string
    history: ChatHistoryMessage[]
}

export async function reWriteQuery(
    { query, history }: RewriteQueryProps 
): Promise<string> {

    const conversation = history
        .map( (message) => `${message.role}: ${ message.content }`)
        .join('\n')

    const { text } = await generateText({
        model,
        system: `
            You are a search query rewriting assistant.

            Your task is to rewrite the user's latest message into a
            standalone query suitable for searching a software repository.

            Rules:
            - Use conversation history to resolve references.
            - Preserve the user's original intent.
            - Do not answer the question.
            - Do not invent repository details.
            - If the query is already standalone, keep it unchanged.
            - Return only the rewritten query.
        `,
        prompt: `
            Conversation history:
            ${conversation}

            Latest user message:
            ${query}
        `,
    })

    return text.trim()

}