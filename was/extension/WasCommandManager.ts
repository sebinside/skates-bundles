import { ServiceProvider } from "nodecg-io-core";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { NodeCG } from "nodecg/types/server";


export class WasCommandManager {
    constructor(
        private chatClient: ServiceProvider<TwitchChatServiceClient>,
        private nodecg: NodeCG
    ) { }

    public static readonly CHANNEL = "#skate702"
    public static readonly COMMAND = "!was"
    public static readonly TIMEOUT_IN_SECONDS = 10

    private lastMessage = Date.now();

    async initChat(): Promise<void> {
        this.testForCompleteness();
        this.addListener(WasCommandManager.CHANNEL);
    }

    private testForCompleteness() {
        if(this.chatClient.getClient()) {
            this.nodecg.log.info("All required services are available.");
        }
    }

    private addListener(channel: string) {
        this.chatClient.getClient()
            ?.join(channel)
            .then(() => {
                this.nodecg.log.info(`Connected !was-manager to twitch channel "${channel}"`);
    
                this.chatClient.getClient()?.onMessage((chan, _, message, _msg) => {
                    if (chan === channel.toLowerCase() && message === WasCommandManager.COMMAND) {
                        this.postMessage();
                    }
                });
            })
            .catch((reason) => {
                this.nodecg.log.error(`Couldn't connect to twitch: ${reason}.`);
            });
    }

    private postMessage() {
        if(Date.now() - this.lastMessage > WasCommandManager.TIMEOUT_IN_SECONDS * 1000) {
            this.lastMessage = Date.now();
            this.chatClient.getClient()?.say(WasCommandManager.CHANNEL, this.hardCodedMessage());
        }
    }

    /**
     * VERY HARDCODED! skateIEH
     * @returns a very cute but also very hard coded message OMEGALUL
     */
    private hardCodedMessage(): string {
        return "Sebastian programmiert einen !was chat bot (der besser als wie niklaß ist) | Projekt: nodecg.io | Sprache: typescript | Editor: vscode | Theme: monokai | Alle Infos: 702.yt/was"
    }
}