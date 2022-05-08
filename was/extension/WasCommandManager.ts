import { ServiceProvider } from "nodecg-io-core";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { NodeCG } from "nodecg-types/types/server";
import { ChatBot, Manager } from "skates-utils";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";
import { MessageController } from "./MessageController";
import { SQLClient } from "nodecg-io-sql";
import { DBController } from "./DBController";

export class WasCommandManager extends Manager {
    constructor(
        private chatClient: ServiceProvider<TwitchChatServiceClient> | undefined,
        private twitchApiClient: ServiceProvider<TwitchApiServiceClient> | undefined,
        private sqlClient: ServiceProvider<SQLClient> | undefined,
        protected nodecg: NodeCG,
    ) {
        super("!was Command", nodecg);
        this.register(this.chatClient, "Twitch chat client", () => this.initChat());
        this.register(this.twitchApiClient, "Twitch api client", async () => {
            this.initApiClient();
        });
        this.register(this.sqlClient, "SQL client", () => this.initDB());
        this.initReadyListener(this.chatClient);
        this.initUI();
    }

    public static readonly REFRESH_INTERVAL = 10;

    private messageController = new MessageController(this.nodecg);

    async initChat(): Promise<void> {
        ChatBot.getInstance().registerCommand("was", false, this.chatClient, this.nodecg,
            async (_: string, __: string, msg) => {
                const game = (await this.retrieveCurrentGame()) || "";

                if (this.messageController.hasMessage(game)) {
                    this.chatClient?.getClient()?.say(ChatBot.CHANNEL, this.messageController.getMessage(game)?.toString() || "", { replyTo: msg });
                } else {
                    this.nodecg.log.info(`Unable to find !was output for game: ${game}`);
                }
            });
    }

    async initApiClient(): Promise<void> {
        this.nodecg.listenFor("retrieveCurrentGame", async (_, ack) => {
            if (ack && !ack.handled) {
                const game = (await this.retrieveCurrentGame()) || "";
                ack(null, game);
            }
        });
    }

    async initDB(): Promise<void> {
        const dbController = new DBController(MessageController.REPLICANT_MESSAGES, this.sqlClient, this.nodecg);

        const game = (await this.retrieveCurrentGame()) || "";
        dbController.startListening(game);

        setInterval(async () => {
            const game = (await this.retrieveCurrentGame()) || "";
            dbController.setCurrentGameAndUpdate(game);
        }, WasCommandManager.REFRESH_INTERVAL * 1000);
    }

    private async retrieveCurrentGame() {
        const user = await this.twitchApiClient?.getClient()?.helix.users.getMe();
        const stream = await user?.getStream();
        const game = await stream?.getGame();
        return game?.name;
    }

    private async initUI(): Promise<void> {
        setInterval(async () => {
            const game = await this.retrieveCurrentGame();
            if (game) {
                this.messageController.setCurrentGame(game);
            }
        }, WasCommandManager.REFRESH_INTERVAL * 1000);
    }
}
