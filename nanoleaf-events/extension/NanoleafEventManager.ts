import { ServiceProvider } from "nodecg-io-core";
import { NanoleafServiceClient } from "nodecg-io-nanoleaf";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";
import { TwitchPubSubServiceClient } from "nodecg-io-twitch-pubsub";
import { NanoleafUtils } from "nodecg-io-nanoleaf/extension/nanoleafUtils";
import { NodeCG } from "nodecg-types/types/server";
import { PubSubRedemptionMessage } from "@twurple/pubsub";
import { SubEventUtils } from "./SubEventUtils";
import { Manager } from "skates-utils";

interface Redemption {
    name: string;
    redeem: (message: PubSubRedemptionMessage) => void;
}

export class NanoleafEventManager extends Manager {
    constructor(
        private nanoleafClient: ServiceProvider<NanoleafServiceClient> | undefined,
        private twitchClient: ServiceProvider<TwitchApiServiceClient> | undefined,
        private pubsubClient: ServiceProvider<TwitchPubSubServiceClient> | undefined,
        protected nodecg: NodeCG,
    ) {
        super("Nanoleaf Events", nodecg);
        this.register(this.nanoleafClient, "NanoleafClient", () => this.initNanoleafs());
        this.register(this.twitchClient, "TwitchApiClient", () => this.initTwitch());
        this.register(this.pubsubClient, "TwitchPubSubClient", () => this.initPubSub());
    }

    private panels: number[] = [];
    private hypeTrainLevel = 0;

    async initNanoleafs(): Promise<void> {
        this.panels = (await this.nanoleafClient?.getClient()?.getAllPanelIDs(true)) || [];
        await this.nanoleafClient?.getClient()?.setState(true);
        await this.nanoleafClient?.getClient()?.setBrightness(25);
        await this.glitter();
    }

    async initTwitch(): Promise<void> {
        const channel = await this.twitchClient?.getClient()?.helix.users.getMe();
        if (channel !== undefined) {
            setInterval(() => this.testForHypeTrain(channel.id), 10 * 1000);
        }
    }

    async initPubSub(): Promise<void> {
        this.pubsubClient?.getClient()?.onSubscription((message) => {
            this.nodecg.log.info(`${message.userDisplayName} just subscribed (${message.cumulativeMonths} months)`);
            this.subEvent(message.cumulativeMonths);
        });

        this.pubsubClient?.getClient()?.onRedemption((message) => {
            this.nodecg.log.info(`${message.userDisplayName} redeemed ${message.rewardTitle}`);
            this.redemptions.find((value) => value.name === message.rewardTitle)?.redeem(message);
        });
    }

    private redemptions: Redemption[] = [
        {
            name: "DEBUG",
            redeem: () => {
                this.doHypeTrain(5);
            },
        },
        {
            name: "Ein paar Kacheln einfärben",
            redeem: (message) => {
                if (!isNaN(parseInt(message?.message))) {
                    const number = parseInt(message?.message);
                    if (number >= 0 && number < 360) {
                        this.nodecg.log.info(`Received valid number: ${number}`);
                        this.executeEffectIfPossible(() => {
                            this.sendColor(number);
                            this.sendColor(number);
                            this.sendColor(number);
                        });
                    }
                }
            },
        },
        {
            name: "Alle Kacheln zufällig färben",
            redeem: () => {
                this.executeEffectIfPossible(() => {
                    this.glitter();
                });
            },
        },
    ];

    private executeEffectIfPossible(effect: () => void) {
        if (this.nanoleafClient?.getClient()?.getQueue().isEffectActive()) {
            this.nodecg.log.info("Unable to override current temporary effect.");
        } else if (this.hypeTrainLevel > 0) {
            this.nodecg.log.info("Unable to override hype train effect!");
        } else {
            effect();
        }
    }

    private subEvent(months: number) {
        let effectDuration = 7;
        const transitionTime = 1;
        const extraDelay = 2;

        const color = SubEventUtils.isSubMilestone(months)
            ? SubEventUtils.retrievePreviousSubIconColor(months)
            : SubEventUtils.retrieveSubIconColor(months);
        const shuffledPanels = SubEventUtils.shuffleArray(this.panels);

        const panelData = shuffledPanels.map((panelId: number, index: number) => ({
            panelId: panelId,
            frames: [
                {
                    color: this.nanoleafClient?.getClient()?.getPanelColor(panelId) || { red: 0, blue: 0, green: 0 },
                    transitionTime: index * transitionTime,
                },
                { color: color, transitionTime: transitionTime },
                {
                    color: color,
                    transitionTime: (this.panels.length - index) * transitionTime + this.panels.length / 2,
                },
            ],
        }));

        if (SubEventUtils.isSubMilestone(months)) {
            this.nodecg.log.info(`Sub Milestone! ${months / 12} years!`);
            const nextColor = SubEventUtils.retrieveSubIconColor(months);

            this.panels.forEach((pandelId: number, index: number) => {
                panelData
                    .find((entry) => entry.panelId === pandelId)
                    ?.frames.push(
                        { color: color, transitionTime: transitionTime * index },
                        { color: nextColor, transitionTime: transitionTime },
                        {
                            color: nextColor,
                            transitionTime: (this.panels.length - index) * transitionTime + this.panels.length,
                        },
                    );
            });

            effectDuration = 10;
        } else {
            panelData.forEach((entry) => entry.frames.push({ color: color, transitionTime: this.panels.length }));
        }

        panelData.forEach((entry, index) =>
            entry.frames.push({
                color: this.nanoleafClient?.getClient()?.getPanelColor(entry.panelId) || { red: 0, blue: 0, green: 0 },
                transitionTime: index * transitionTime,
            }),
        );

        this.nanoleafClient
            ?.getClient()
            ?.getQueue()
            .queueEvent(
                () =>
                    this.nanoleafClient
                        ?.getClient()
                        ?.writeRawEffect("displayTemp", "custom", false, panelData, effectDuration),
                effectDuration + extraDelay,
            );
    }

    private async glitter() {
        const data = this.panels.map((entry) => ({
            panelId: entry,
            color: this.generateRandomFullySaturatedColor(),
        }));

        await this.nanoleafClient?.getClient()?.setPanelColors(data);
    }

    private async sendColor(value: number) {
        await this.nanoleafClient
            ?.getClient()
            ?.setPanelColor(
                this.panels[Math.floor(Math.random() * this.panels.length)] || -1,
                NanoleafUtils.convertHSVtoRGB({ hue: value / 360, saturation: 1, value: 1 }),
            );
    }

    private generateRandomFullySaturatedColor() {
        return NanoleafUtils.convertHSVtoRGB({ hue: Math.random(), saturation: 1, value: 1 });
    }

    private async doHypeTrain(level: number) {
        const panelsByX = (await this.nanoleafClient?.getClient()?.getAllPanelIDs(false)) || [];
        const transitionTime = 6 - level;
        const rainbowColors = [0, 1, 2, 3, 4, 5, 6, 7];

        const panelData = panelsByX.map((panelId: number, index: number) => ({
            panelId: panelId,
            frames: rainbowColors.map((entry) => ({
                color: NanoleafUtils.convertHSVtoRGB({
                    hue: ((entry * (360 / rainbowColors.length) + index * 3) % 360) / 360,
                    saturation: 1,
                    value: 1,
                }),
                transitionTime: transitionTime,
            })),
        }));

        this.nanoleafClient?.getClient()?.writeRawEffect("display", "custom", true, panelData);
    }

    private async getHypeTrain(userId: string) {
        const event = await this.twitchClient?.getClient()?.helix.hypeTrain.getHypeTrainEventsForBroadcaster(userId);

        if (event === undefined || event.data.length === 0) {
            return { level: 0, active: false };
        } else {
            const level = event.data[0]?.level || 0;
            const expireDate = new Date(event.data[0]?.expiryDate || "1994-02-07T00:00:00");
            const active = expireDate.getTime() - new Date().getTime() > 0;
            return { level, active };
        }
    }

    private async testForHypeTrain(userId: string) {
        const data = await this.getHypeTrain(userId);

        if (data.active) {
            this.nanoleafClient?.getClient()?.getQueue().pauseQueue();
            if (this.hypeTrainLevel !== data.level) {
                this.hypeTrainLevel = data.level;
                this.nodecg.log.info(`Starting hype train with level ${this.hypeTrainLevel}.`);
                this.doHypeTrain(this.hypeTrainLevel);
            }
        } else {
            if (this.hypeTrainLevel !== 0) {
                this.hypeTrainLevel = 0;
                this.glitter();
            }
            this.nanoleafClient?.getClient()?.getQueue().resumeQueue();
        }
    }
}
