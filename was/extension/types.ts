export interface PresetCollection {
    projects: string[];
    languages: string[];
    editors: string[];
    themes: string[];
    technologies: string[];
}

export interface Message {
    readonly content: string;
    readonly details: string;
    readonly hyperlink: string;
    readonly project?: string;
    readonly language?: string;
    readonly technology?: string;
    readonly editor?: string;
    readonly theme?: string;
}

export interface DisplayMessage {
    title: string;
    content: string;
    id: string;
}