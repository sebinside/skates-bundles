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
        this.initMainCommand();
        this.initURLCommands();
        this.initSimpleCommands();
    }

    private initMainCommand() {
        ChatBot.getInstance().registerCommand("was", false, this.chatClient, this.nodecg,
            (_: string, __: string, msg) => {
                const reply = this.messageController.getCurrentInfoMessage();
                this.chatClient?.getClient()?.say(ChatBot.CHANNEL, reply, { replyTo: msg });
            });
    }

    private initURLCommands() {
        ChatBot.getInstance().registerCommand("wo", false, this.chatClient, this.nodecg, 
        (_: string, __: string, msg) => {
            const url = this.messageController.getCurrentURL();
            if(url) {
                const reply = `Den Code findest du hier: ${url}`;
                this.chatClient?.getClient()?.say(ChatBot.CHANNEL, reply, { replyTo: msg });
            } 
        }); 

        ChatBot.getInstance().registerCommand("code", false, this.chatClient, this.nodecg, 
        (_: string, __: string, msg) => {
            const url = this.messageController.getCurrentURL();
            if(url && url.startsWith("https://github.com/")) {
                const reply = `Zur interaktiven Code-Ansicht: ${url.replace("https://github.com/", "https://github.dev/")}`;
                this.chatClient?.getClient()?.say(ChatBot.CHANNEL, reply, { replyTo: msg });
            } 
        }); 
    }
    
    private initSimpleCommands() {
        const commandsAndCategories = new Map<string, string>([
            ["wer", "who"],
            ["wie", "how"],
            ["projekt", "project"],
            ["editor", "editor"],
            ["sprache", "language"],
            ["theme", "editor"]
        ]);

        for(const [command, category] of commandsAndCategories) {
            ChatBot.getInstance().registerCommand(command, false, this.chatClient, this.nodecg,
            (_: string, __: string, msg) => {
                const currentMessage = this.messageController.getFirstCurrentMessageForCategory(category);
                if(currentMessage) {
                    this.chatClient?.getClient()?.say(ChatBot.CHANNEL, currentMessage, { replyTo: msg });
                }
            });
        }
    }
}