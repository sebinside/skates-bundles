import { NodeCG } from "nodecg-types/types/server";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { requireService } from "nodecg-io-core";
import { StreamInfoManager } from "./StreamInfoManager";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";

module.exports = function (nodecg: NodeCG) {
    const chatClient = requireService<TwitchChatServiceClient>(nodecg, "twitch-chat");

    // Required scopes: none
    const twitchApi = requireService<TwitchApiServiceClient>(nodecg, "twitch-api");

    new StreamInfoManager(chatClient, twitchApi, nodecg);
};
