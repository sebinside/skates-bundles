import { NodeCG } from "nodecg/types/server";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { requireService } from "nodecg-io-core";
import { WasCommandManager } from "./WasCommandManager";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";

module.exports = function (nodecg: NodeCG) {   
    const chatClient = requireService<TwitchChatServiceClient>(nodecg, "twitch-chat");

    // Required scopes: none
    const twitchApi = requireService<TwitchApiServiceClient>(nodecg, "twitch-api");

    new WasCommandManager(chatClient, twitchApi, nodecg);
};
