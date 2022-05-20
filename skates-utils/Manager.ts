import { ServiceProvider } from "nodecg-io-core";
import { NodeCG } from "nodecg-types/types/server";

/**
 * The Manager offers common functionality for all bundles.
 */
export class Manager {
    private registeredProviders: ServiceProvider<unknown>[] = [];

    private static PREFIX = "[SB-M]";

    /**
     * Creates a new Manager with a given name and nodecg instance.
     * @param bundleName the name of the skate's bundle
     * @param nodecg the current nodecg instance
     */
    constructor(private bundleName: string, protected nodecg: NodeCG) {
        this.nodecg.log.info(`${Manager.PREFIX} skate's bundle started: "${this.bundleName}"`);
    }

    // Might not be valid at every time, but helps for estimation while registering
    private availableServiceCount = 0;

    /**
     * Registers a new service provider and listens for availability.
     * @param serviceProvider the service provider instance (might be undefined)
     * @param providerName the name of the provider used for logging purposes only
     * @param initFunction a callback function to call when the providers becomes available
     * @returns true, if the provider has been registered (this does so nothing about availability!)
     */
    protected register(
        serviceProvider: ServiceProvider<unknown> | undefined,
        providerName: string,
        initFunction: () => unknown,
    ): boolean {
        if (serviceProvider !== undefined) {
            this.registeredProviders.push(serviceProvider);

            serviceProvider.onAvailable(() => {
                this.availableServiceCount++;
                this.nodecg.log.info(`${Manager.PREFIX} Service available ${this.getAvailableServiceInfo()}: "${providerName}"`);
                this.testForCompleteness();
                initFunction();
            });
            serviceProvider.onUnavailable(() => {
                this.availableServiceCount = Math.max(0, this.availableServiceCount - 1);
                this.nodecg.log.info(`${Manager.PREFIX} Service unavailable ${this.getAvailableServiceInfo()}: "${providerName}"`);
            });
            return true;
        } else {
            this.nodecg.log.warn(`${Manager.PREFIX} Some of the required services are undefined. This indicates a framework problem.`);
            return false;
        }
    }

    private getAvailableServiceInfo() {
        return `(${this.availableServiceCount} / ${this.registeredProviders.length})`;
    }

    /**
     * This initializes a listener that can be asked if the bundle is running (e.g., by the UI).
     * @param definitelyAvailableProvider a provider that is always required in this bundle, used to test availability
     */
    protected initReadyListener(definitelyAvailableProvider: ServiceProvider<unknown> | undefined) {
        this.nodecg.listenFor("isReady", async (_, ack) => {
            if (ack && !ack.handled) {
                if (definitelyAvailableProvider && definitelyAvailableProvider.getClient()) {
                    ack(null, true);
                } else {
                    ack(null, false);
                }
            }
        });
    }

    private testForCompleteness(): void {
        if (this.registeredProviders.every((provider) => provider.getClient())) {
            this.nodecg.log.info(`${Manager.PREFIX} All required services are available.`);
        }
    }
}
