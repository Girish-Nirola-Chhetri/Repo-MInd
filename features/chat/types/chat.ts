export type ChatMessageType = {
    id: string
    role: "user" | "assistant"
    content: string
}

export type ConversationType = {
    id: string
    title: string
}