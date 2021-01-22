import { NodeCG } from "nodecg/types/server";
import { PubSubServiceClient } from "nodecg-io-twitch-pubsub/extension";
import { requireService } from "nodecg-io-core/extension/serviceClientWrapper";
import fetch from 'node-fetch';
import { Color, NanoleafClient } from "./NanoleafClient";

let panels: number[] = []
let nanoleaf: NanoleafClient;

module.exports = function (nodecg: NodeCG) {
    nodecg.log.info("Nanoleaf testing bundle started!");
    nanoleaf = new NanoleafClient("192.168.178.105", "vT7KxVZhRHAwCzONzugdU8E7MNA6C9XO", nodecg);
    nanoleaf.getAllPanelIDs(true).then(iDs => panels = iDs);
    nanoleaf.setState(true);
    nanoleaf.setBrightness(25);
    glitter();

    const pubsub = requireService<PubSubServiceClient>(nodecg, "twitch-pubsub");

    pubsub?.onAvailable((client) => {
        nodecg.log.info("PubSub client has been updated, adding handlers for messages.");
        client.onSubscription((message) => {
            nodecg.log.info(`${message.userDisplayName} just subscribed (${message.cumulativeMonths} months)`);

            subEvent(message.cumulativeMonths);
        });
        client.onRedemption((message) => {
            nodecg.log.info(`${message.userDisplayName} redeemed ${message.rewardName}`);
            if (message.rewardName === "Eine Kachel einfärben") {
                if (!isNaN(parseInt(message.message))) {
                    const number = parseInt(message.message);
                    if (number >= 0 && number < 360) {
                        nodecg.log.info(`Received valid number: ${number}`)
                        if (nanoleaf.isEffectActive()) {
                            nodecg.log.info("Unable to override current temporary effect.")
                        } else {
                            sendColor(number);
                        }
                    }
                }
            } else if (message.rewardName === "Alle Kacheln zufällig färben") {
                if (nanoleaf.isEffectActive()) {
                    nodecg.log.info("Unable to override current temporary effect.")
                } else {
                    glitter();
                }
            } else if (message.rewardName === "DEBUG") {
                let randomNumber = Math.round(Math.random() * 30);
                nodecg.log.info("Sub event for " + randomNumber);
                subEvent(randomNumber);
            }
        });
    });

    pubsub?.onUnavailable(() => nodecg.log.info("PubSub client has been unset."));
};

function shuffleArray(input: Array<number>) {
    const array = [...input];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

const subColors: Color[] = [
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

function retrieveSubIconColor(months: number): Color {
    return subColors[retrieveSubColorIndex(months)];
}

function isSubMilestone(months: number): boolean {
    return months === 3 || months === 6 || months % 12 === 0;
}

function retrieveSubColorIndex(months: number): number {
    if (months < 3) {
        return 0;
    } else if (months < 6) {
        return 1;
    } else if (months < 12) {
        return 2;
    } else {
        return Math.min(Math.floor(months / 12) + 2, subColors.length - 1);
    }
}

function retrievePreviousSubIconColor(months: number): Color {
    return subColors[Math.max(retrieveSubColorIndex(months) - 1, 0)];
}

function subEvent(months: number) {
    let effectDuration = 7;
    const transitionTime = 1;
    const extraDelay = 2;

    const color = isSubMilestone(months) ? retrievePreviousSubIconColor(months) : retrieveSubIconColor(months);
    const shuffledPanels = shuffleArray(panels);

    let panelData = shuffledPanels.map((panelId: number, index: number) => ({
        panelId: panelId,
        frames: [{ color: nanoleaf.getPanelColor(panelId), transitionTime: index * transitionTime },
        { color: color, transitionTime: transitionTime }, { color: color, transitionTime: (panels.length - index) * transitionTime + panels.length / 2 }]
    }))

    if (isSubMilestone(months)) {
        console.log(`Sub Milestone! ${months / 12} years!`);
        const nextColor = retrieveSubIconColor(months);

        panels.forEach((pandelId: number, index: number) => {
            panelData.find((entry) => entry.panelId === pandelId)?.frames.push({ color: color, transitionTime: transitionTime * index }, { color: nextColor, transitionTime: transitionTime }, { color: nextColor, transitionTime: (panels.length - index) * transitionTime + panels.length })
        })

        effectDuration = 10;
    } else {
        panelData.forEach((entry) => entry.frames.push({ color: color, transitionTime: panels.length }))
    }

    panelData.forEach((entry, index) => entry.frames.push(
        { color: nanoleaf.getPanelColor(entry.panelId), transitionTime: index * transitionTime }))

    nanoleaf.queueEvent(() => nanoleaf.writeRawEffect("displayTemp", "custom", false, panelData, effectDuration), effectDuration + extraDelay)
}

function generateRandomFullySaturatedColor() {
    return NanoleafClient.convertHSVtoRGB(
        { hue: Math.random(), saturation: 1, value: 1 });
}

function glitter() {
    const data = panels.map(entry => ({
        panelId: entry,
        color: generateRandomFullySaturatedColor()
    }))

    nanoleaf.setPanelColors(data);
}

function sendColor(value: number) {
    nanoleaf.setPanelColor(panels[Math.floor(Math.random() * panels.length)],
        NanoleafClient.convertHSVtoRGB(
            { hue: value / 360, saturation: 1, value: 1 }
        )
    )
}