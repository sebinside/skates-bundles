import { ServiceProvider } from "nodecg-io-core";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { NodeCG } from "nodecg/types/server";
import { Manager } from "skates-utils";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";
import { MessageController } from "./MessageController";
import { SQLCLient } from "nodecg-io-sql";
import { DBController } from "./DBController";

export class WasCommandManager extends Manager {
    constructor(
        private chatClient: ServiceProvider<TwitchChatServiceClient> | undefined,
        private twitchApiClient: ServiceProvider<TwitchApiServiceClient> | undefined,
        private sqlClient: ServiceProvider<SQLCLient> | undefined,
        protected nodecg: NodeCG
    ) {
        super("!was Command", nodecg);
        this.register(this.chatClient, "Twitch chat client", () => this.initChat());
        this.register(this.twitchApiClient, "Twitch api client", async () => { this.initApiClient() });
        this.register(this.sqlClient, "SQL client", () => this.initDB());
        this.initReadyListener(this.chatClient);
    }

    public static readonly CHANNEL = "#skate702"
    public static readonly COMMAND = /^!was(\s.*|$)/
    public static readonly TIMEOUT_IN_SECONDS = 10
    public static readonly DB_REFRESH_INTERVAL = 10

    private lastMessage = Date.now();

    private messageController = new MessageController(this.nodecg);

    async initChat(): Promise<void> {
        this.addListener(WasCommandManager.CHANNEL);
    }

    async initApiClient(): Promise<void> {
        this.nodecg.listenFor("retrieveCurrentGame", async (_, ack) => {
            if (ack && !ack.handled) {
                const game = await this.retrieveCurrentGame() || "";
                ack(null, game);
            }
        })
    }

    async initDB(): Promise<void> {
        const dbController = new DBController(MessageController.REPLICANT_MESSAGES, this.sqlClient, this.nodecg);

        const game = await this.retrieveCurrentGame() || "";
        dbController.startListening(game);

        setInterval(async () => {
            const game = await this.retrieveCurrentGame() || "";
            dbController.setCurrentGameAndUpdate(game);
        }, WasCommandManager.DB_REFRESH_INTERVAL * 1000);
    }

    private addListener(channel: string) {
        this.chatClient?.getClient()
            ?.join(channel)
            .then(() => {
                this.nodecg.log.info(`Connected !was-manager to twitch channel "${channel}"`);

                this.chatClient?.getClient()?.onMessage((chan, _, message, _msg) => {
                    if (chan === channel.toLowerCase() && message.match(WasCommandManager.COMMAND)) {
                        this.postMessage();
                    }
                });
            })
            .catch((reason) => {
                this.nodecg.log.error(`Couldn't connect to twitch: ${reason}.`);
            });
    }

    private async postMessage() {
        if (Date.now() - this.lastMessage > WasCommandManager.TIMEOUT_IN_SECONDS * 1000) {
            this.lastMessage = Date.now();

            const game = await this.retrieveCurrentGame() || "";

            if (this.messageController.hasMessage(game)) {
                this.chatClient?.getClient()?.say(WasCommandManager.CHANNEL, this.messageController.getMessage(game)?.toString() || "");
            } else {
                this.nodecg.log.info(`Unable to find !was output for game: ${game}`);
            }
        }
    }

    private async retrieveCurrentGame() {
        const user = await this.twitchApiClient?.getClient()?.helix.users.getMe();
        const stream = await user?.getStream();
        const game = await stream?.getGame();
        return game?.name;
    }
}
