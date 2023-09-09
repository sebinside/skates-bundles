import { Manager } from "skates-utils";
import { StreamElementsServiceClient } from "nodecg-io-streamelements";
import { SQLClient } from "nodecg-io-sql";
import { ServiceProvider } from "nodecg-io-core";
import { NodeCG } from "nodecg-types/types/server";

export class StreamSubsManager extends Manager {

    private readonly table = "public";

    constructor(
        private streamelementsClient: ServiceProvider<StreamElementsServiceClient> | undefined,
        private sqlClient: ServiceProvider<SQLClient> | undefined,
        protected nodecg: NodeCG,
    ) {
        super("stream-subs", nodecg);
        this.register(this.sqlClient, "SQL client", () => {});
        this.register(this.streamelementsClient, "StreamelementsClient", () => this.initStreamelementsClient());
    }

    initStreamelementsClient(): void {
        this.streamelementsClient?.getClient()?.onSubscriber(async data => {
            const name = data.data.displayName;
            const length = data.data.amount;
            const lastseen = new Date();
            const count = 0;

            const entry = {
                name,
                length,
                lastseen,
                count
            };

            const sql = this.sqlClient?.getClient();

            if(sql) {
                const dbEntry = await sql(this.table).select().where('name', name).first()

                if(dbEntry !== undefined) {
                    entry.count = dbEntry.count + 1
                    
                    if(dbEntry.length < length) {
                        entry.length = length
                        entry.lastseen = lastseen
                    }
    
                    await sql(this.table).where('name', name).update(entry)
                    this.nodecg.log.info(`DB: Updated ${name}`)
                } else {
                    await sql(this.table).insert(entry);
                    this.nodecg.log.info(`DB: Inserted ${name}`)
                }
            } else {
                this.nodecg.log.warn("SQL client not available");
            }
        });
    }
}
