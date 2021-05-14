export interface PresetCollection {
    projects: string[],
    languages: string[],
    editors: string[],
    themes: string[]
}

export interface Message {
    readonly content: string,
    readonly details: string,
    readonly hyperlink: string,
    readonly project?: string,
    readonly language?: string,
    readonly editor?: string,
    readonly theme?: string
}