import { generateText, type ModelMessage } from "ai"
import { model } from "@/lib/llm";

type GenerateResponseProps = {
    systemMessage: string
    messages: ModelMessage[]
}

export async function generateResponse(
    { systemMessage, messages }: GenerateResponseProps
) {
    const {text} = await generateText({
        model: model,
        system: systemMessage,
        messages
        
    })

    return text
}