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
    nanoleaf.getAllPanelIDs().then(iDs => panels = iDs);
    nanoleaf.setState(true);
    nanoleaf.setBrightness(25);
    glitter();

    const pubsub = requireService<PubSubServiceClient>(nodecg, "twitch-pubsub");

    pubsub?.onAvailable((client) => {
        nodecg.log.info("PubSub client has been updated, adding handlers for messages.");
        client.onSubscription((message) => {
            console.log(`${message.userDisplayName} just subscribed (${message.cumulativeMonths} months)`);

            const color = retrieveSubIconColor(message.cumulativeMonths);

            const shuffledPanels = shuffleArray(panels);
            const transitionTime = 1;

            const panelData = shuffledPanels.map((panelId: number, index: number) => ({
                panelId: panelId,
                frames: [{ color: nanoleaf.getPanelColor(panelId)!, transitionTime: index * transitionTime },
                { color: color, transitionTime: transitionTime }]
            }))

            nanoleaf.writeRawEffect("displayTemp", "custom", false, panelData, 7)
        });
        client.onRedemption((message) => {
            console.log(`${message.userDisplayName} redeemed ${message.rewardName}`);
            if (message.rewardName === "Eine Kachel einfärben") {
                if (!isNaN(parseInt(message.message))) {
                    const number = parseInt(message.message);
                    if (number >= 0 && number < 360) {
                        nodecg.log.info(`Received valid number: ${number}`)
                        sendColor(number);
                    }
                }
            } else if (message.rewardName === "Alle Kacheln zufällig färben") {
                glitter();
            } else if (message.rewardName === "DEBUG") {

                const legacy = [
                    {
                        panelId: 57840,
                        frames: [{ color: { red: 255, green: 0, blue: 0 }, transitionTime: 1 },
                        { color: { red: 0, green: 0, blue: 255 }, transitionTime: 3 }]
                    },
                    {
                        panelId: 47607,
                        frames: [{ color: { red: 255, green: 0, blue: 0 }, transitionTime: 3 },
                        { color: { red: 0, green: 0, blue: 255 }, transitionTime: 3 }]
                    },
                    {
                        panelId: 15036,
                        frames: [{ color: { red: 255, green: 0, blue: 0 }, transitionTime: 6 },
                        { color: { red: 0, green: 0, blue: 255 }, transitionTime: 3 }]
                    },
                    {
                        panelId: 59193,
                        frames: [{ color: { red: 255, green: 0, blue: 0 }, transitionTime: 9 },
                        { color: { red: 0, green: 0, blue: 255 }, transitionTime: 3 }]
                    }
                ];

                const shuffledPanels = shuffleArray(panels);
                const transitionTime = 1;
                const color: Color = { red: 255, blue: 0, green: 0 }

                const panelData = shuffledPanels.map((panelId: number, index: number) => ({
                    panelId: panelId,
                    frames: [{ color: nanoleaf.getPanelColor(panelId)!, transitionTime: index * transitionTime },
                    { color: color, transitionTime: transitionTime }]
                }))

                nanoleaf.writeRawEffect("displayTemp", "custom", false, panelData, 10)
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

function retrieveSubIconColor(months: number): Color {
    if (months < 3) {
        return { red: 255, green: 123, blue: 0 };
    } else if (months < 6) {
        return { red: 98, green: 98, blue: 98 };
    } else if (months < 12) {
        return { red: 255, green: 222, blue: 0 };
    } else if (months < 24) {
        return { red: 0, green: 255, blue: 228 };
    } else if (months < 36) {
        return { red: 0, green: 255, blue: 90 };
    } else if (months < 48) {
        return { red: 0, green: 120, blue: 255 };
    } else if (months < 60) {
        return { red: 99, green: 255, blue: 0 };
    } else if (months < 72) {
        return { red: 56, green: 56, blue: 56 };
    } else if (months < 84) {
        return { red: 247, green: 247, blue: 247 };
    } else if (months < 96) {
        return { red: 255, green: 98, blue: 0 };
    } else {
        return { red: 0, green: 238, blue: 255 };
    }
}

function glitter() {
    const data = panels.map(entry => ({
        panelId: entry,
        color: NanoleafClient.convertHSVtoRGB(
            { hue: Math.random(), saturation: 1, value: 1 })
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