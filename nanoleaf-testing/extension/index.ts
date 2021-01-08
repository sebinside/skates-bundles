import { NodeCG } from "nodecg/types/server";
import { PubSubServiceClient } from "nodecg-io-twitch-pubsub/extension";
import { requireService } from "nodecg-io-core/extension/serviceClientWrapper";
import fetch from 'node-fetch';
import { NanoleafClient } from "./NanoleafClient";

let panels: number[] = []
let nanoleaf: NanoleafClient;

module.exports = function (nodecg: NodeCG) {
    nodecg.log.info("Nanoleaf testing bundle started!");
    nanoleaf = new NanoleafClient("192.168.178.105", "vT7KxVZhRHAwCzONzugdU8E7MNA6C9XO", nodecg);
    nanoleaf.getAllPanelIDs().then(iDs => panels = iDs);
    nanoleaf.setState(true);
    nanoleaf.setBrightness(25);

    const pubsub = requireService<PubSubServiceClient>(nodecg, "twitch-pubsub");

    pubsub?.onAvailable((client) => {
        nodecg.log.info("PubSub client has been updated, adding handlers for messages.");
        client.onSubscription((message) => {
            console.log(`${message.userDisplayName} just subscribed (${message.cumulativeMonths} months)`);
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
            }
        });
    });

    pubsub?.onUnavailable(() => nodecg.log.info("PubSub client has been unset."));
};

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