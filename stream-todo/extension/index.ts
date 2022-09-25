import { NodeCG } from "nodecg-types/types/server";
import { requireService } from "nodecg-io-core";
import { StreamTodoManager } from "./StreamTodoManager";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";

module.exports = function (nodecg: NodeCG) {

    // Required scopes: channel:read:redemptions
    const twitchApi = requireService<TwitchApiServiceClient>(nodecg, "twitch-api");

    new StreamTodoManager(twitchApi, nodecg);
};
