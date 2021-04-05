import { NodeCG } from "nodecg/types/server";
import { TwitchPubSubServiceClient } from "nodecg-io-twitch-pubsub";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";
import { NanoleafServiceClient } from "nodecg-io-nanoleaf";
import { requireService } from "nodecg-io-core";
import { NanoleafEventManager } from "./NanoleafEventManager";

module.exports = function (nodecg: NodeCG) {   
    const nanoleafClient = requireService<NanoleafServiceClient>(nodecg, "nanoleaf");

    // Required scopes: channel:read:hype_train
    const twitchApi = requireService<TwitchApiServiceClient>(nodecg, "twitch-api");

    // Required scopes: ??? =>
    const pubsub = requireService<TwitchPubSubServiceClient>(nodecg, "twitch-pubsub");
    
    new NanoleafEventManager(nanoleafClient, twitchApi, pubsub, nodecg);
};
