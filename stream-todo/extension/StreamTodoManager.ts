import { ServiceProvider } from "nodecg-io-core";
import { NodeCG, ReplicantServer } from "nodecg-types/types/server";
import { Manager } from "skates-utils";
import { TwitchPubSubServiceClient } from "nodecg-io-twitch-pubsub";


export class StreamTodoManager extends Manager {

    static readonly REPLICANT_COLOR: string = "streamTODOs.color";
    private todoColorReplicant: ReplicantServer<number>;

    constructor(
        private pubsubClient: ServiceProvider<TwitchPubSubServiceClient> | undefined,
        protected nodecg: NodeCG,
    ) {
        super("stream-todo", nodecg);

        this.todoColorReplicant = this.nodecg.Replicant(StreamTodoManager.REPLICANT_COLOR, {
            defaultValue: 0
        });

        this.register(this.pubsubClient, "TwitchPubSubClient", async () => this.initPubSubClient());
        this.initReadyListener(this.pubsubClient);
    }

    private initPubSubClient(): void {
        this.pubsubClient?.getClient()?.onRedemption((message) => {

            if(message.rewardTitle === "TODO Häkchen einfärben") {
                this.nodecg.log.info(`${message.userDisplayName} redeemed ${message.rewardTitle}`);

                let newColorValue = 78;

                if (!isNaN(parseInt(message?.message))) {
                    const number = parseInt(message?.message);
                    if (number >= 0 && number < 360) {
                        this.nodecg.log.info(`Received valid number: ${number}`);
                        newColorValue = number;
                    }
                }

                this.todoColorReplicant.value = newColorValue;
            }
        });
    }
}
