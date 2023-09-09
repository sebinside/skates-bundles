import { NodeCG } from "nodecg-types/types/server";
import { requireService } from "nodecg-io-core";
import { StreamElementsServiceClient } from "nodecg-io-streamelements";
import { SQLClient } from "nodecg-io-sql";
import { StreamSubsManager } from "./StreamSubsManager";

module.exports = function (nodecg: NodeCG) {
    const streamElementsService = requireService<StreamElementsServiceClient>(nodecg, "streamelements");
    const sqlClient = requireService<SQLClient>(nodecg, "sql");

    new StreamSubsManager(streamElementsService, sqlClient, nodecg)
};
