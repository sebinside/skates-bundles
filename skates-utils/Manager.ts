import { ServiceProvider } from "nodecg-io-core";
import { NodeCG } from "nodecg/types/server";

export class Manager {

    private registeredProviders: ServiceProvider<unknown>[] = [];

    constructor(private bundleName: string, protected nodecg: NodeCG) {
        this.nodecg.log.info(`skate's bundle started: "${this.bundleName}"`);
    }

    protected register(serviceProvider: ServiceProvider<unknown> | undefined,
        providerName: string, initFunction: () => unknown): boolean {

        if (serviceProvider !== undefined) {
            this.registeredProviders.push(serviceProvider);

            serviceProvider.onAvailable(() => {
                this.nodecg.log.info(`Service available: "${providerName}"`);
                this.testForCompleteness();
                initFunction()
            })
            serviceProvider.onUnavailable(() => {
                this.nodecg.log.info(`Service unavailable: "${providerName}"`);
            })
            return true;
        } else {
            this.nodecg.log.warn("Some of the required services are undefined. This indicates a framework problem.");
            return false;
        }
    }

    protected initReadyListener(definitelyAvailableProvider: ServiceProvider<unknown> | undefined) {
        this.nodecg.listenFor("isReady", async (_, ack) => {
            if(ack && !ack.handled) {
                if(definitelyAvailableProvider && definitelyAvailableProvider.getClient()) {
                    ack(null, true);
                } else {
                    ack(null, false);
                } 
            }
        })
    }

    private testForCompleteness(): void {
        if (this.registeredProviders.every(provider => provider.getClient())) {
            this.nodecg.log.info("All required services are available.");
        }
    }

}