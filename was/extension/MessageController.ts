import { NodeCG, ReplicantServer } from "nodecg/types/server";
import { Message, PresetCollection } from "./types";

export class MessageController {
    private static readonly defaultMessages: Record<string, Message> = {
        "Science & Technology":
        {
            content: "Sebastian programmiert einen !was chat bot",
            details: "Sebastian programmiert einen !was chat bot",
            hyperlink: "702.yt/was",
            project: "nodecg.io",
            language: "typescript",
            editor: "vscode",
            theme: "monokai"
        },
        "Watch Dogs: Legion": {
            content: "Sebastian spielt Uhren-Hunde. Wau wau!",
            details: "Sebastian spielt Uhren-Hunde. Wau wau!",
            hyperlink: "702.yt/was"
        },
        "Minecraft": {
            content: "Sebastian baut ein neues Minecraft Skyblock Modpack",
            details: "Sebastian baut ein neues Minecraft Skyblock Modpack",
            hyperlink: "702.yt/was",
            project: "Skyblock-Nachfolger",
            language: "zenscript",
            editor: "vscode",
            theme: "monokai"
        }
    };

    private static readonly defaultValues: PresetCollection = {
        projects: ["", "nodecg.io", "PremiereCEP", "Skyblock-Nachfolger", "HotkeylessAHK"],
        languages: ["", "typescript", "scala", "java", "zenscript"],
        editors: ["", "vscode", "intellij", "eclipse"],
        themes: ["", "monokai"]
    }

    private messages: ReplicantServer<Record<string, Message>>;

    constructor(private nodecg: NodeCG) {
        this.nodecg.Replicant('was.values', { defaultValue: MessageController.defaultValues })
        this.messages = this.nodecg.Replicant('was.messages', { defaultValue: MessageController.defaultMessages })
    }

    public getMessage(game: string): string {
        if (this.hasMessage(game)) {
            const message = this.messages.value[game];

            // I'm very sorry... They took OOP from me by force.
            if (this.isGamingMessage(message)) {
                return `${message?.content} | Alle Infos: ${message?.hyperlink}`;
            } else {
                return `${message?.content} | Projekt: ${message?.project} | Sprache: ${message?.language} | Editor: ${message?.editor} | Theme: ${message?.theme} | Alle Infos: ${message?.hyperlink}`
            }
        }
        return "";
    }

    public hasMessage(game: string): boolean {
        return this.messages?.value[game] !== undefined || false;
    }

    // Convention (because of the lack of OOP): empty project == gaming message
    private isGamingMessage(message: Message | undefined): boolean | undefined {
        return message?.project === undefined || message.project === ""
    }
}