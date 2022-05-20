import { NodeCG } from "nodecg-types/types/server";
import { ServiceProvider } from "nodecg-io-core";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { ChatBot } from "skates-utils";
import { MessageController } from "./MessageController";

export class StreamInfoChatBot {

    constructor(
        private messageController: MessageController,
        private chatClient: ServiceProvider<TwitchChatServiceClient> | undefined,
        private nodecg: NodeCG) {
        this.nodecg.log.info("Created stream info chat bot.");
    }

    initChatBot() {
        this.initCommandWhat();
    }

    private initCommandWhat() {
        ChatBot.getInstance().registerCommand("was", false, this.chatClient, this.nodecg,
            async (_: string, __: string, msg) => {
                const infoMessage = this.messageController.getCurrentInfoMessage();
                this.chatClient?.getClient()?.say(ChatBot.CHANNEL, infoMessage, { replyTo: msg });
            });
    }
}