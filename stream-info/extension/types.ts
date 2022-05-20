export type MessageType = "what" | "where" | "who"

export type DisplayMessage = {
    type: MessageType
    title: string
    content: string
}

export type StreamInfoConfig = {
    category: string
    active: boolean
    description?: string
    url?: string
    messageIds: string[]
}