import { DisplayMessage, StreamInfoConfig } from "./types";

export class DefaultMessages {

    static readonly REPLICANT_DEFAULT_ALL_MESSAGES: Record<string, DisplayMessage> =
        {
            "where_github":
            {
                type: "where",
                title: '{!wo} findet man den Code?',
                content: 'Alles was ich programmiere ist Open-Source und auf GitHub zu finden. Für den Link einfach {!wo} in den Chat schreiben.'
            },
            "who":
            {
                type: "who",
                title: '{!wer} bin ich eigentlich?',
                content: 'Ich bin Sebastian, Doktorand und wissenschaftlicher Mitarbeiter am KIT in Karlsruhe. In meiner Freizeit streame ich Coding-Projekte und probiere neue Technologien aus.'
            }
        }

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
    static readonly REPLICANT_DEFAULT_CURRENT_MESSAGES = DefaultMessages.REPLICANT_DEFAULT_ALL_MESSAGES;
}