import { ServiceProvider } from "nodecg-io-core";
import { NodeCG } from "nodecg-types/types/server";
import { Manager } from "skates-utils";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";

export class StreamTodoManager extends Manager {
    constructor(
        private twitchApiClient: ServiceProvider<TwitchApiServiceClient> | undefined,
        protected nodecg: NodeCG,
    ) {
        super("stream-todo", nodecg);
        this.register(this.twitchApiClient, "Twitch api client", async () => this.initApiClient());
        this.initReadyListener(this.twitchApiClient);
    }

    private initApiClient(): void {
       this.nodecg.log.info("Init API client yo!")
    }
}
