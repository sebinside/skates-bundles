export abstract class Message {
    constructor(
        public readonly content: string,
        public readonly hyperlink: string) { }

    abstract toString(): string
}

export class GamingMessage extends Message {
    constructor(
        public readonly content: string,
        public readonly hyperlink: string) {
        super(content, hyperlink);
    }

    toString(): string {
        return `${this.content} | Alle Infos: ${this.hyperlink}`;
    }
}

export class CodingMessage extends Message {
    constructor(
        public readonly content: string,
        public readonly hyperlink: string,
        public readonly project: string,
        public readonly language: string,
        public readonly editor: string,
        public readonly theme: string
    ) {
        super(content, hyperlink);
    }

    toString(): string {
        return `${this.content} | Projekt: ${this.project} | Sprache: ${this.language} | Editor: ${this.editor} | Theme: ${this.theme} | Alle Infos: ${this.hyperlink}`
    }
}