import { DisplayMessage, StreamInfoConfig } from "./types";

export class DefaultMessages {

    static readonly REPLICANT_DEFAULT_CONFIGS: Array<StreamInfoConfig> =
        [
            {
                active: true,
                category: "Just chatting",
                messageIds: ["who"],
                description: "Please wait while stream-info is loading..."
            }
        ]
    static readonly REPLICANT_DEFAULT_CURRENT_CATEGORY: string = "Just chatting";


    static readonly REPLICANT_DEFAULT_ALL_MESSAGES: Record<string, DisplayMessage> =
        {
            "source_github": {
                "type": "where",
                "title": "{!wo} findet man den Code?",
                "content": "Alles was ich programmiere ist Open-Source und auf GitHub zu finden. Für den Link {!wo} in den Chat schreiben - oder {!code} für eine Code-Ansicht."
            },
            "who": {
                "type": "who",
                "title": "{!wer} bin ich eigentlich?",
                "content": "Ich bin Sebastian, Doktorand und wissenschaftlicher Mitarbeiter am KIT in Karlsruhe. In meiner Freizeit streame ich Coding-Projekte und probiere neue Technologien aus."
            },
            "why_not_x": {
                "type": "misc",
                "title": "{!wieso} nicht {X}?",
                "content": "Entweder, weil mich {Y} gerade mehr interessiert, {Y} im Chat empfohlen wurde, ich {Y} schon immer mal ausprobieren wollte, oder grade kein Bock auf {X} hatte."
            },
            "next_goal": {
                "type": "misc",
                "title": "{!welches} nächste Ziel?",
                "content": "Die {aktuellen Aufgaben} findest du hierunter. Für einen besseren Überblick, schau auf Github vorbei! Einfach {!wo} in den Chat!"
            },
            "language_typescript": {
                "type": "language",
                "title": "{!welche} Sprache?",
                "content": "Das ist {TypeScript}, eine von Microsoft entwickelte, typisierte Version von JavaScript und meine Sprache der Wahl für Web-Anwendungen."
            },
            "how_learned": {
                "type": "how",
                "title": "{!wie} hast du das gelernt?",
                "content": "Ich habe {allgemeine Informatik} am KIT in Karlsruhe studiert. Das Meiste an Programmierung habe ich mir aber - mehr schlecht, als recht - selbst beigebracht."
            },
            "project_nodecgio": {
                "type": "project",
                "title": "{!wie} heißt das Projekt?",
                "content": "{nodecg-io} ist ein NodeCG-basiertes Framework für interaktive Livestream-Anwendungen. Meine eigenen Services findest du in den {skate's bundles}."
            },
            "editor_vscode": {
                "type": "editor",
                "title": "{!welcher} Editor ist das?",
                "content": "Das ist {Visual Studio Code}, ein minimaler Editor von Microsoft. Ich nutze das {Monokai} Farbschema in meinen Streams."
            }
        }

    static readonly REPLICANT_DEFAULT_CURRENT_MESSAGES = DefaultMessages.REPLICANT_DEFAULT_ALL_MESSAGES;

}