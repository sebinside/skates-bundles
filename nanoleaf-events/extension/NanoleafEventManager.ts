import { ServiceClientWrapper } from "nodecg-io-core/extension/serviceClientWrapper";
import { Color, NanoleafServiceClient } from "nodecg-io-nanoleaf";
import { TwitchApiServiceClient } from "nodecg-io-twitch-api";
import { TwitchPubSubServiceClient } from "nodecg-io-twitch-pubsub";
import { NanoleafUtils } from "nodecg-io-nanoleaf/extension/nanoleafUtils";
import { NodeCG } from "nodecg/types/server";

export class NanoleafEventManager {
    constructor(
        private nanoleafClient: ServiceClientWrapper<NanoleafServiceClient>,
        private twitchClient: ServiceClientWrapper<TwitchApiServiceClient>,
        private pubsubClient: ServiceClientWrapper<TwitchPubSubServiceClient>,
        private nodecg: NodeCG
    ) { }

    private panels: number[] = []
    private hypeTrainLevel = 0;


    async initNanoleafs(): Promise<void> {
        this.panels = await this.nanoleafClient.getClient()?.getAllPanelIDs(true) || [];
        await this.nanoleafClient.getClient()?.setState(true);
        await this.nanoleafClient.getClient()?.setBrightness(25);
        await this.glitter();
    }

    async initTwitch(): Promise<void> {
        const channel = await this.twitchClient.getClient()?.helix.users.getMe();
        if (channel !== undefined) {
            setInterval(() => this.testForHypeTrain(channel.id), 10 * 1000);
        }
    }

    async initPubSub(): Promise<void> {
        this.pubsubClient.getClient()?.onSubscription((message) => {
            this.nodecg.log.info(`${message.userDisplayName} just subscribed (${message.cumulativeMonths} months)`);
            this.subEvent(message.cumulativeMonths);
        });

        this.pubsubClient.getClient()?.onRedemption((message) => {
            this.nodecg.log.info(`${message.userDisplayName} redeemed ${message.rewardName}`);

            if (message.rewardName === "Ein paar Kacheln einfärben") {
                if (!isNaN(parseInt(message.message))) {
                    const number = parseInt(message.message);
                    if (number >= 0 && number < 360) {
                        this.nodecg.log.info(`Received valid number: ${number}`)
                        if (this.nanoleafClient?.getClient()?.getQueue().isEffectActive()) {
                            this.nodecg.log.info("Unable to override current temporary effect.");
                        } else if (this.hypeTrainLevel > 0) {
                            this.nodecg.log.info("Unable to override hype train effect!");
                        } else {
                            this.sendColor(number);
                            this.sendColor(number);
                            this.sendColor(number);
                        }
                    }
                }
            } else if (message.rewardName === "Alle Kacheln zufällig färben") {
                if (this.nanoleafClient?.getClient()?.getQueue().isEffectActive()) {
                    this.nodecg.log.info("Unable to override current temporary effect.")
                } else if (this.hypeTrainLevel > 0) {
                    this.nodecg.log.info("Unable to override hype train effect!");
                } else {
                    this.glitter();
                }
            } else if (message.rewardName === "DEBUG") {
                this.doHypeTrain(1);
            }
        });
    }


    private shuffleArray(input: Array<number>) {
        const array = [...input];
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private subColors: Color[] = [
        { red: 255, green: 123, blue: 0 }, // 0 - 2
        { red: 98, green: 98, blue: 98 }, // 3 - 5
        { red: 255, green: 222, blue: 0 }, // 6 - 11
        { red: 0, green: 255, blue: 228 }, // 12+
        { red: 0, green: 255, blue: 90 },
        { red: 0, green: 120, blue: 255 },
        { red: 99, green: 255, blue: 0 },
        { red: 56, green: 56, blue: 56 },
        { red: 247, green: 247, blue: 247 },
        { red: 255, green: 98, blue: 0 },
        { red: 0, green: 238, blue: 255 }
    ]

    private retrieveSubIconColor(months: number): Color {
        return this.subColors[this.retrieveSubColorIndex(months)];
    }

    private isSubMilestone(months: number): boolean {
        return months === 3 || months === 6 || months % 12 === 0;
    }

    private retrieveSubColorIndex(months: number): number {
        if (months < 3) {
            return 0;
        } else if (months < 6) {
            return 1;
        } else if (months < 12) {
            return 2;
        } else {
            return Math.min(Math.floor(months / 12) + 2, this.subColors.length - 1);
        }
    }

    private retrievePreviousSubIconColor(months: number): Color {
        return this.subColors[Math.max(this.retrieveSubColorIndex(months) - 1, 0)];
    }

    private subEvent(months: number) {
        let effectDuration = 7;
        const transitionTime = 1;
        const extraDelay = 2;

        const color = this.isSubMilestone(months) ? this.retrievePreviousSubIconColor(months) : this.retrieveSubIconColor(months);
        const shuffledPanels = this.shuffleArray(this.panels);

        const panelData = shuffledPanels.map((panelId: number, index: number) => ({
            panelId: panelId,
            frames: [{ color: this.nanoleafClient.getClient()?.getPanelColor(panelId) || { red: 0, blue: 0, green: 0 }, transitionTime: index * transitionTime },
            { color: color, transitionTime: transitionTime }, { color: color, transitionTime: (this.panels.length - index) * transitionTime + this.panels.length / 2 }]
        }))

        if (this.isSubMilestone(months)) {
            this.nodecg.log.info(`Sub Milestone! ${months / 12} years!`);
            const nextColor = this.retrieveSubIconColor(months);

            this.panels.forEach((pandelId: number, index: number) => {
                panelData.find((entry) => entry.panelId === pandelId)?.frames.push({ color: color, transitionTime: transitionTime * index }, { color: nextColor, transitionTime: transitionTime }, { color: nextColor, transitionTime: (this.panels.length - index) * transitionTime + this.panels.length })
            })

            effectDuration = 10;
        } else {
            panelData.forEach((entry) => entry.frames.push({ color: color, transitionTime: this.panels.length }))
        }

        panelData.forEach((entry, index) => entry.frames.push(
            { color: this.nanoleafClient.getClient()?.getPanelColor(entry.panelId) || { red: 0, blue: 0, green: 0 }, transitionTime: index * transitionTime }))

        this.nanoleafClient.getClient()?.getQueue().queueEvent(() => this.nanoleafClient.getClient()?.writeRawEffect("displayTemp", "custom", false, panelData, effectDuration), effectDuration + extraDelay)
    }

    private generateRandomFullySaturatedColor() {
        return NanoleafUtils.convertHSVtoRGB(
            { hue: Math.random(), saturation: 1, value: 1 });
    }

    private async glitter() {
        const data = this.panels.map(entry => ({
            panelId: entry,
            color: this.generateRandomFullySaturatedColor()
        }))

        await this.nanoleafClient.getClient()?.setPanelColors(data);
    }

    private async sendColor(value: number) {
        await this.nanoleafClient.getClient()?.setPanelColor(this.panels[Math.floor(Math.random() * this.panels.length)],
            NanoleafUtils.convertHSVtoRGB(
                { hue: value / 360, saturation: 1, value: 1 }
            )
        )
    }

    private async doHypeTrain(level: number) {

        const panelsByX = await this.nanoleafClient.getClient()?.getAllPanelIDs(false) || [];
        const transitionTime = 6 - level;
        const rainbowColors = [0, 1, 2, 3, 4, 5, 6, 7]

        const panelData = panelsByX.map((panelId: number, index: number) => ({
            panelId: panelId,
            frames: rainbowColors.map((entry) => ({ color: NanoleafUtils.convertHSVtoRGB({ hue: ((entry * (360 / rainbowColors.length) + index * 3) % 360) / 360, saturation: 1, value: 1 }), transitionTime: transitionTime }))
        }))

        this.nanoleafClient.getClient()?.writeRawEffect("display", "custom", true, panelData)
    }

    private async getHypeTrain(userId: string) {
        const event = await this.twitchClient.getClient()?.helix.hypeTrain.getHypeTrainEventsForBroadcaster(userId);

        if (event === undefined || event.data.length === 0) {
            return { level: 0, active: false }
        } else {
            const level = event.data[0].level;
            const expireDate = new Date(event.data[0].expiryDate);
            const active = expireDate.getTime() - (new Date()).getTime() > 0;
            return { level, active };
        }
    }

    private async testForHypeTrain(userId: string) {
        const data = await this.getHypeTrain(userId);

        if (data.active) {
            this.nanoleafClient.getClient()?.getQueue().pauseQueue();
            if (this.hypeTrainLevel != data.level) {
                this.hypeTrainLevel = data.level;
                this.nodecg.log.info(`Starting hype train with level ${this.hypeTrainLevel}.`)
                this.doHypeTrain(this.hypeTrainLevel);
            }
        } else {
            if (this.hypeTrainLevel !== 0) {
                this.hypeTrainLevel = 0;
                this.glitter();
            }
            this.nanoleafClient.getClient()?.getQueue().resumeQueue();
        }
    }
}