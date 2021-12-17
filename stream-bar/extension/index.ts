import { NodeCG } from "nodecg-types/types/server";
import { requireService } from "nodecg-io-core";
import { SpotifyServiceClient } from "nodecg-io-spotify";
import { StreamElementsServiceClient } from "nodecg-io-streamelements";
import { TwitchChatServiceClient } from "nodecg-io-twitch-chat";
import { StreamBarManager } from "./StreamBarManager";

module.exports = function (nodecg: NodeCG) {
    const spotifyService = requireService<SpotifyServiceClient>(nodecg, "spotify");
    const streamElementsService = requireService<StreamElementsServiceClient>(nodecg, "streamelements");
    const twitchChatService = requireService<TwitchChatServiceClient>(nodecg, "twitch-chat");

    new StreamBarManager(spotifyService, streamElementsService, twitchChatService, nodecg);
};
