import { NodeCG, ReplicantServer } from "nodecg-types/types/server";
import { Message } from "./types";
import { SQLClient } from "nodecg-io-sql";
import { ServiceProvider } from "nodecg-io-core";

interface CurrentItem {
    game: string,
    details: string,
    project: string,
    technology: string,
    language: string,
    editor: string,
    theme: string
}

export class DBController {

    private messageReplicant: ReplicantServer<Record<string, Message>>;
    private currentGame = "";
    private messages: Record<string, Message> | undefined = undefined;

    constructor(messageReplicantId: string, private sql: ServiceProvider<SQLClient> | undefined, private nodecg: NodeCG) {
        this.messageReplicant = this.nodecg.Replicant(messageReplicantId);
    }

    startListening(currentGame: string): void {
        this.currentGame = currentGame;

        this.messageReplicant.on('change', async (newValue: Record<string, Message>, _) => {
            this.messages = newValue;
            this.nodecg.log.info("Received updated message. Updating database...")
            await this.updateDB();
        });
    }

    async setCurrentGameAndUpdate(currentGame: string): Promise<void> {
        if (this.currentGame != currentGame) {
            this.currentGame = currentGame;
            await this.updateDB();
        }
    }

    private async updateDB() {
        // Check for validity of inputs
        if (this.currentGame !== "" && this.messages !== undefined && this.messages[this.currentGame]) {

            const currentMessage = this.messages[this.currentGame];

            const currentItem: CurrentItem = {
                game: this.currentGame,
                details: currentMessage?.details || "",
                project: currentMessage?.project || "",
                technology: currentMessage?.technology || "",
                language: currentMessage?.language || "",
                editor: currentMessage?.editor || "",
                theme: currentMessage?.theme || ""
            }

            try {
                // With knex, clear the tables content and add only one item
                const sql = this.sql?.getClient();
                if (sql) {
                    await sql("Current").delete();
                    await sql<CurrentItem>("Current").insert(currentItem);
                    this.nodecg.log.info("Successfully updated !was database.");
                }
            } catch {
                this.nodecg.log.error("Unable to update !was database.")
            }

        } else {
            this.nodecg.log.warn("Invalid input (current game and/or message) for !was database update.");
        }
    }
}