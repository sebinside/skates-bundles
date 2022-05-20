import { ServiceProvider } from "nodecg-io-core";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { NodeCG } from "nodecg-types/types/server";
import { Manager } from "skates-utils";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";
import { MessageController } from "./MessageController";
import { StreamInfoChatBot } from "./StreamInfoChatBot";

export class StreamInfoManager extends Manager {
    constructor(
        private chatClient: ServiceProvider<TwitchChatServiceClient> | undefined,
        private twitchApiClient: ServiceProvider<TwitchApiServiceClient> | undefined,
        protected nodecg: NodeCG,
    ) {
        super("stream-info", nodecg);
        this.register(this.chatClient, "Twitch chat client", () => this.initChatClient());
        this.register(this.twitchApiClient, "Twitch api client", async () => this.initApiClient());
        this.initReadyListener(this.twitchApiClient);
    }

    public static readonly REFRESH_INTERVAL_IN_MS = 10 * 1000;
    private messageController = new MessageController(this.nodecg);
    private streamInfoChatBot = new StreamInfoChatBot(this.messageController, this.chatClient, this.nodecg);

    private initChatClient(): void {
        this.streamInfoChatBot.initChatBot();
    }

    private initApiClient(): void {
        setInterval(async () => {
            const category = await this.requestCurrentCategory();
            if (category) {
                this.messageController.setCurrentCategory(category);
            }
        }, StreamInfoManager.REFRESH_INTERVAL_IN_MS);
    }

    private async requestCurrentCategory() {
        const user = await this.twitchApiClient?.getClient()?.helix.users.getMe();
        const stream = await user?.getStream();
        const category = await stream?.getGame();
        return category?.name;
    }
}
