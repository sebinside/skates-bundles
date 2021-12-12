/// <reference types="@types/spotify-api" />
import { Manager } from "skates-utils";
import { SpotifyServiceClient } from "nodecg-io-spotify";
import { StreamElementsServiceClient } from "nodecg-io-streamelements";
import { ServiceProvider } from "nodecg-io-core";
import { NodeCG } from "nodecg-types/types/server";

export class StreamBarManager extends Manager {
    constructor(
        private spotifyClient: ServiceProvider<SpotifyServiceClient> | undefined,
        private streamelementsClient: ServiceProvider<StreamElementsServiceClient> | undefined,
        protected nodecg: NodeCG,
    ) {
        super("StreamBar", nodecg);
        this.register(this.spotifyClient, "SpotifyClient", () => this.initSpotifyClient());
        this.register(this.streamelementsClient, "StreamelementsClient", () => this.initStreamelementsClient());
    }

    private readonly testReplicant = this.nodecg.Replicant('testValue'); 

    initStreamelementsClient(): void {
        this.streamelementsClient
            ?.getClient()
            ?.onSubscriber((subInfo) => this.nodecg.log.info(subInfo.data.displayName));
    }

    async initSpotifyClient(): Promise<void> {
        const currentTrack = await this.spotifyClient?.getClient()?.getMyCurrentPlayingTrack({});
        const songName = currentTrack?.body.item?.name;
        if (currentTrack?.body.currently_playing_type === "track") {
            const currentSong = currentTrack.body.item as SpotifyApi.TrackObjectFull;
            const artistName = currentSong.artists[0]?.name;
            this.nodecg.log.info(`TRACK INFO: ${songName} by ${artistName}`);
            this.testReplicant.value = songName;
        } else {
            this.nodecg.log.info("Currently no track playing!");
        }
    }
}
