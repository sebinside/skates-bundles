export type MessageType = "what" | "where" | "who" | "misc" | "language" | "editor" | "theme" | "project" | "how"

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