import { NodeCG } from "nodecg/types/server";
import { TwitchPubSubServiceClient } from "nodecg-io-twitch-pubsub";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";
import { NanoleafServiceClient } from "nodecg-io-nanoleaf";
import { requireService } from "nodecg-io-core";
import { NanoleafEventManager } from "./NanoleafEventManager";

module.exports = function (nodecg: NodeCG) {
    nodecg.log.info("Nanoleaf event bundle started!");
    
    const nanoleafClient = requireService<NanoleafServiceClient>(nodecg, "nanoleaf");
    const pubsub = requireService<TwitchPubSubServiceClient>(nodecg, "twitch-pubsub");
    const twitchApi = requireService<TwitchApiServiceClient>(nodecg, "twitch-api");

    if (nanoleafClient !== undefined && pubsub !== undefined && twitchApi !== undefined) {
        const manager = new NanoleafEventManager(nanoleafClient, twitchApi, pubsub, nodecg);
        
        // Nanoleaf service
        nanoleafClient?.onAvailable(() => {
            nodecg.log.info("NanoleafClient is available.");
            manager.initNanoleafs();
        });
        nanoleafClient?.onUnavailable(() => nodecg.log.info("NanoleafClient is unavailable."));

        // Twitch api service
        twitchApi?.onAvailable(() => {
            nodecg.log.info("TwitchApiClient is available.");
            manager.initTwitch();
        });
        twitchApi?.onUnavailable(() => nodecg.log.info("TwitchApiClient is unavailable."));

        // Twitch pubsub service
        pubsub?.onAvailable(() => {
            nodecg.log.info("TwitchPubSubClient is available.");
            manager.initPubSub();
        });
        pubsub?.onUnavailable(() => nodecg.log.info("TwitchPubSubClient is unavailable."));
    } else {
        nodecg.log.warn("Some of the required services are unavailable!");
    }
};
