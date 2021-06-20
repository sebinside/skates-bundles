import { NodeCG, ReplicantServer } from "nodecg/types/server";
import { Message } from "./types";
import { SQLCLient } from "nodecg-io-sql";
import { ServiceProvider } from "nodecg-io-core";

 // TODO SH: Setup database
export class DBController {

    private messages: ReplicantServer<Record<string, Message>>;
    private currentGame = "";

    constructor(messageReplicantId: string, private sql: ServiceProvider<SQLCLient> | undefined, private nodecg: NodeCG) {
        this.messages = this.nodecg.Replicant(messageReplicantId);
    }

    startListening(currentGame: string): void {
        this.currentGame = currentGame;

        // TODO SH: Implement replicant listening and sending updates to the DB
        this.messages.on('change', (newValue: Record<string, Message>, _) => {
            this.nodecg.log.info(`Updating with keys: ${Object.keys(newValue)}`);
            this.nodecg.log.info(`Current game: ${currentGame}`);

            this.updateDB();
        });
    }

    setCurrentGameAndUpdate(currentGame: string): void {
        if(this.currentGame != currentGame) {
            this.currentGame = currentGame;
            this.updateDB();
        }
    }

    private updateDB() {
        // TODO SH: Use this one
        this.sql?.getClient();
    }
}