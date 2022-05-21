/// <reference types="@types/spotify-api" />
import { ChatBot, Manager } from "skates-utils";
import { SpotifyServiceClient } from "nodecg-io-spotify";
import { StreamElementsServiceClient } from "nodecg-io-streamelements";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { ServiceProvider } from "nodecg-io-core";
import { NodeCG, ReplicantServer } from "nodecg-types/types/server";
import { StreamBarInfo } from "./StreamBarInfo";

export class StreamBarManager extends Manager {

    static readonly REPLICANT_STREAMBAR: string = "streambar.info";

    private streamBarInfo: ReplicantServer<StreamBarInfo>;
    private lastGift = "";

    constructor(
        private spotifyClient: ServiceProvider<SpotifyServiceClient> | undefined,
        private streamelementsClient: ServiceProvider<StreamElementsServiceClient> | undefined,
        private twitchClient: ServiceProvider<TwitchChatServiceClient> | undefined,
        protected nodecg: NodeCG,
    ) {
        super("StreamBar", nodecg);
        this.streamBarInfo = this.nodecg.Replicant(StreamBarManager.REPLICANT_STREAMBAR, {
            defaultValue: {
                artistName: "", lastBomb: "", lastCheer: "", lastSubscriber: "", lastTip: "", songName: ""
            }
        });
        this.register(this.spotifyClient, "SpotifyClient", () => this.initSpotifyClient());
        this.register(this.streamelementsClient, "StreamelementsClient", () => this.initStreamelementsClient());
        this.register(this.twitchClient, "TwitchClient", () => this.initTwitchClient());
    }

    async initTwitchClient(): Promise<void> {
        ChatBot.getInstance().registerCommand("song", true, this.twitchClient, this.nodecg,
            async (_: string, __: string, msg) => {
                await this.retrieveCurrentSong();
                this.twitchClient?.getClient()?.say(ChatBot.CHANNEL, `Der aktuelle Song ist "${this.streamBarInfo.value.songName}" von ${this.streamBarInfo.value.artistName}`, { replyTo: msg });
            });
    }

    initStreamelementsClient(): void {
        this.streamelementsClient?.getClient()?.onSubscriber(data => {
            // Sub bomb handling
            if (data.data.gifted === true) {
                if (this.lastGift === data.data.sender) {
                    const lastBomb = data.data.sender;
                    this.streamBarInfo.value.lastBomb = lastBomb;
                    this.nodecg.log.info(`Retrieved sub bomb: ${lastBomb}`);
                }
                this.lastGift = data.data.sender ?? "";
            } else {
                this.lastGift = "";
            }

            // Default last sub handling
            const lastSubscriber = data.data.displayName;
            this.streamBarInfo.value.lastSubscriber = lastSubscriber;
            this.nodecg.log.info(`Retrieved subscriber: ${lastSubscriber}`);
        });

        this.streamelementsClient?.getClient()?.onTip(data => {
            const lastTip = data.data.username;
            this.streamBarInfo.value.lastTip = lastTip;
            this.nodecg.log.info(`Retrieved tip: ${lastTip}`);
        })

        this.streamelementsClient?.getClient()?.onCheer(data => {
            const lastCheer = data.data.displayName;
            this.streamBarInfo.value.lastCheer = lastCheer;
            this.nodecg.log.info(`Retrieved cheer: ${lastCheer}`);
        })
    }

    async initSpotifyClient(): Promise<void> {
        setInterval(() => this.retrieveCurrentSong(), 5000);
    }

    async retrieveCurrentSong(): Promise<void> {
        const currentTrack = await this.spotifyClient?.getClient()?.getMyCurrentPlayingTrack({});
        const songName = currentTrack?.body.item?.name;
        if (currentTrack?.body.currently_playing_type === "track") {
            const currentSong = currentTrack.body.item as SpotifyApi.TrackObjectFull;
            const artistName = currentSong.artists[0]?.name;
            if ((this.streamBarInfo.value.songName ?? "") !== songName) {
                this.streamBarInfo.value.songName = songName;
                this.streamBarInfo.value.artistName = artistName;
            }
        }
    }
}
