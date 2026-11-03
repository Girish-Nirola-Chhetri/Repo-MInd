import { generateText } from "ai"
import { model } from "@/lib/llm";

type GenerateResponseProps = {
    systemMessage: string
    userMessage: string
}

export async function generateResponse(
    { systemMessage, userMessage }: GenerateResponseProps
) {
    const {text} = await generateText({
        model: model,
        system: systemMessage,
        prompt: userMessage
        
    })

    return text
}