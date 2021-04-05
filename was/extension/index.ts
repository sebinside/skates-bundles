import { NodeCG } from "nodecg/types/server";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { requireService } from "nodecg-io-core";
import { WasCommandManager } from "./WasCommandManager";

module.exports = function (nodecg: NodeCG) {   
    const chatClient = requireService<TwitchChatServiceClient>(nodecg, "twitch-chat");

    new WasCommandManager(chatClient, nodecg);
};
