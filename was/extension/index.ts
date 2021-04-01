import { NodeCG } from "nodecg/types/server";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { requireService } from "nodecg-io-core";
import { WasCommandManager } from "./WasCommandManager";

module.exports = function (nodecg: NodeCG) {
    nodecg.log.info("!was command bundle started!");
    
    const chatClient = requireService<TwitchChatServiceClient>(nodecg, "twitch-chat");

    if (chatClient !== undefined) {
        const manager = new WasCommandManager(chatClient, nodecg);
        
        // Nanoleaf service
        chatClient?.onAvailable(() => {
            nodecg.log.info("Twitch chat client is available.");
            manager.initChat();
        });
        chatClient?.onUnavailable(() => nodecg.log.info("Twitch chat client is unavailable."));
    } else {
        nodecg.log.warn("Some of the required services are unavailable!");
    }
};
