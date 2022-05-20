import type { TwitchPrivateMessage } from "@twurple/chat/lib/commands/TwitchPrivateMessage";
import { ServiceProvider } from "nodecg-io-core";
import { NodeCG } from "nodecg-types/types/server";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";

/**
 * This ChatBot assumes that all commands are listened to from a single bot instance on a single channel.
 */
export class ChatBot {
    public static readonly CHANNEL = "#skate702";
    public static readonly COMMAND_SYMBOL = "!";

    private static chatBot: ChatBot = new ChatBot();

    /**
     * Return the chat bot instance (singleton pattern).
     * @returns a chat bot instance
     */
    public static getInstance(): ChatBot {
        return ChatBot.chatBot;
    }

    private commandTimeouts: Map<string, number> = new Map<string, number>();

    private constructor() {
        // private constructor following the singleton pattern
    }

    /**
     * Registers a new command and event handling to the chat bot.
     * @param command the command that should be listened to
     * @param exactMatch if set to true, the action is only triggered iff the message only contains the command
     * @param twitchClient the twitch chat client that shall be used to parse messages
     * @param nodecg the current nodecg instance
     * @param action the event handling that is triggered if a command is detected
     * @param timeoutInSeconds sleep time in seconds until the command can be triggered again
     * @returns true if the command was not previously registered and no error happened
     */
    public async registerCommand(command: string,
        exactMatch: boolean,
        twitchClient: ServiceProvider<TwitchChatServiceClient> | undefined,
        nodecg: NodeCG,
        action: (user: string, message: string, msg: TwitchPrivateMessage) => void,
        timeoutInSeconds = 10): Promise<boolean> {

        // Internally register command
        const normalizedCommand = this.normalizeCommand(command);
        if (this.isCommandRegistered(normalizedCommand)) {
            return false;
        }
        this.commandTimeouts.set(normalizedCommand, Date.now());

        // Join channel and register event
        return twitchClient?.getClient()?.join(ChatBot.CHANNEL)
            .then(() => {
                nodecg.log.info(`Added chat command "${ChatBot.COMMAND_SYMBOL}${normalizedCommand}" to channel ${ChatBot.CHANNEL}.`);

                twitchClient?.getClient()?.onMessage((channel, user, message, msg) => {
                    if (channel.toLowerCase() === ChatBot.CHANNEL.toLowerCase()) {
                        if (
                            (exactMatch && message.toLowerCase() === `${ChatBot.COMMAND_SYMBOL}${normalizedCommand}`)
                            || (!exactMatch && message.toLowerCase().startsWith(`${ChatBot.COMMAND_SYMBOL}${normalizedCommand}`))) {

                            // Handle timeouts
                            if (Date.now() - (this.commandTimeouts.get(normalizedCommand) ?? Date.now()) > timeoutInSeconds * 1000) {
                                this.commandTimeouts.set(normalizedCommand, Date.now());

                                // Trigger client specified event handling (finally!)
                                action(user, message, msg);
                            }
                        }
                    }
                });

                return true;
            })
            .catch((reason) => {
                nodecg.log.error(`Couldn't add chat command "${ChatBot.COMMAND_SYMBOL}${normalizedCommand}" to channel ${ChatBot.CHANNEL} because of: ${reason}.`);

                return false;
            }) ?? false;
    }

    /**
     * Returns a list of registered commands.
     * @returns a list of command keywords
     */
    public getRegisteredCommands(): string[] {
        return [...this.commandTimeouts.keys()];
    }

    /**
     * Returns if the specified command has already been registered
     * @param command the (not normalized) command to test
     * @returns true, if the command has already been registered
     */
    public isCommandRegistered(command: string): boolean {
        return this.getRegisteredCommands().indexOf(this.normalizeCommand(command)) !== -1;
    }

    private normalizeCommand(command: string) {
        return command.toLowerCase().replace(ChatBot.COMMAND_SYMBOL, "");
    }
}