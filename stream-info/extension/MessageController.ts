import { NodeCG, ReplicantServer } from "nodecg-types/types/server";
import { DefaultMessages } from "./DefaultMessages";
import { DisplayMessage, StreamInfoConfig } from "./types";

export class MessageController {
        private static readonly REPLICANT_ID_CURRENT_CATEGORY: string = "streaminfo.currentcategory";
    private static readonly REPLICANT_ID_ALL_MESSAGES: string = "streaminfo.allmessages";
    private static readonly REPLICANT_ID_CURRENT_MESSAGES: string = "streaminfo.currentmessages";
    private static readonly REPLICANT_ID_CONFIGS: string = "streaminfo.config";

    private static readonly DEFAULT_INFO_MESSAGE: string = "Ich bin live!";

    private currentCategoryReplicant: ReplicantServer<string>;
    private allMessagesReplicant: ReplicantServer<Record<string, DisplayMessage>>;
    private currentMessagesReplicant: ReplicantServer<Record<string, DisplayMessage>>;
    private configsReplicant: ReplicantServer<Array<StreamInfoConfig>>;

    constructor(private nodecg: NodeCG) {
        this.currentCategoryReplicant = this.initReplicant(MessageController.REPLICANT_ID_CURRENT_CATEGORY, DefaultMessages.REPLICANT_DEFAULT_CURRENT_CATEGORY);

        this.currentMessagesReplicant = this.initReplicant(MessageController.REPLICANT_ID_CURRENT_MESSAGES, DefaultMessages.REPLICANT_DEFAULT_CURRENT_MESSAGES);

        this.allMessagesReplicant = this.initReplicant(MessageController.REPLICANT_ID_ALL_MESSAGES, DefaultMessages.REPLICANT_DEFAULT_ALL_MESSAGES);

        this.configsReplicant = this.initReplicant(MessageController.REPLICANT_ID_CONFIGS, DefaultMessages.REPLICANT_DEFAULT_CONFIGS);
    }

    private initReplicant<T>(id: string, defaultValue: T) {
        return this.nodecg.Replicant<T>(id, { defaultValue: defaultValue });
    }

    public getInfoMessage(category: string): string {
        const config = this.getActiveConfigForCategory(category);

        let message = MessageController.DEFAULT_INFO_MESSAGE;

        if (config) {
            message = config.description ? config.description : message;
            message = config.url ? `${message} | Mehr Infos: ${config.url}` : message;
        }

        return message.replaceAll("{", "").replaceAll("}", "");
    }

    public getCurrentInfoMessage(): string {
        return this.getInfoMessage(this.getCurrentCategory());
    }

    private getActiveConfigForCategory(category: string): StreamInfoConfig | undefined {
        return this.configsReplicant.value.find(it => it.category === category && it.active)
    }

    public setCurrentCategory(category: string): void {
        if(this.currentCategoryReplicant.value !== category) {
            this.currentCategoryReplicant.value = category;
            this.nodecg.log.info(`Updated category to ${category}.`)
        }
    }

    public getCurrentCategory(): string {
        return this.currentCategoryReplicant.value;
    }

    public getCurrentURL(): string | undefined {
        const category = this.currentCategoryReplicant.value;
        return this.getActiveConfigForCategory(category)?.url;
    }

    public updateCurrentMessages() {
        const category = this.currentCategoryReplicant.value;
        const config = this.getActiveConfigForCategory(category);
        
        const whatMessage : DisplayMessage = {
            title: "{!was} mache ich gerade?",
            content: config?.description || "",
            type: "what"
        }

        const allMessages: Record<string, DisplayMessage> = {};
        config?.messageIds.forEach(id => {
            const message = this.allMessagesReplicant.value[id];

            if(message) {
                allMessages[id] = message;
            } else {
                this.nodecg.log.warn(`Unable to find message with ID ${id}.`);
            }
        });

        allMessages["what"] = whatMessage;
        this.currentMessagesReplicant.value = allMessages;
    }
}
