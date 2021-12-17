import { NodeCG } from "nodecg-types/types/server";
import { requireService } from "nodecg-io-core";
import { SpotifyServiceClient } from "nodecg-io-spotify";
import { StreamElementsServiceClient } from "nodecg-io-streamelements";
import { StreamBarManager } from "./StreamBarManager";

module.exports = function (nodecg: NodeCG) {
    const spotifyService = requireService<SpotifyServiceClient>(nodecg, "spotify");
    const streamElementsService = requireService<StreamElementsServiceClient>(nodecg, "streamelements");

    new StreamBarManager(spotifyService, streamElementsService, nodecg);
};
