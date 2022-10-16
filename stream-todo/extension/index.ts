import { NodeCG } from "nodecg-types/types/server";
import { requireService } from "nodecg-io-core";
import { StreamTodoManager } from "./StreamTodoManager";
import { TwitchPubSubServiceClient } from "nodecg-io-twitch-pubsub";

module.exports = function (nodecg: NodeCG) {

    // Required scopes: channel:read:redemptions
    const twitchPubSub = requireService<TwitchPubSubServiceClient>(nodecg, "twitch-pubsub");

    new StreamTodoManager(twitchPubSub, nodecg);
};
