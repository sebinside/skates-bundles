import { NodeCG } from "nodecg/types/server";
import { PubSubServiceClient } from "nodecg-io-twitch-pubsub/extension";
import { requireService } from "nodecg-io-core/extension/serviceClientWrapper";
import fetch from 'node-fetch';

module.exports = function (nodecg: NodeCG) {
    nodecg.log.info("Nanoleaf testing bundle started!");

    const pubsub = requireService<PubSubServiceClient>(nodecg, "twitch-pubsub");

    pubsub?.onAvailable((client) => {
        nodecg.log.info("PubSub client has been updated, adding handlers for messages.");
        client.onSubscription((message) => {
            console.log(`${message.userDisplayName} just subscribed (${message.cumulativeMonths} months)`);
        });
        client.onBits((message) => {
            console.log(`${message.userName} cheered ${message.bits} Bits`);
        });
        client.onBitsBadgeUnlock((message) => {
            console.log(`${message.userName} just unlocked the ${message.badgeTier} Badge`);
        });
        client.onRedemption((message) => {
            console.log(`${message.userDisplayName} redeemed ${message.rewardName} (${message.message})`);
            if(message.rewardName === "Eine Kachel einfärben") {
                if (!isNaN(parseInt(message.message))) {
                    const number = parseInt(message.message);
                    if (number >= 0 && number < 360) {
                        nodecg.log.info(`Received valid number: ${number}`)
                        sendColor(number);
                    }
                }
            }
        });
    });

    pubsub?.onUnavailable(() => nodecg.log.info("PubSub client has been unset."));
};

const panels = [54980, 23519, 12046, 60646, 28364, 59193, 15036, 47607, 14719, 40556, 63125, 42995, 52965, 23759, 11691, 57354, 60595, 23985, 63554, 4541, 61367, 4525, 57840]

// Includes the not-so-secret oauth ;)
const address = "http://192.168.178.105:16021/api/v1/vT7KxVZhRHAwCzONzugdU8E7MNA6C9XO/effects"

function glitter() {
    let animeData = `${panels.length}`

    for (let i = 0; i < panels.length; i++) {
        const rgb = HSVtoRGB(Math.random(), 1, 1)
        animeData += ` ${panels[i]} 1 ${rgb.r} ${rgb.g} ${rgb.b} 0 1`
    }

    const json = {
        "write":
        {
            "command": "display",
            "animType": "static",
            "animData": animeData,
            "loop": false,
            "palette": []
        }
    }

    fetch(address, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(json),
    })

}

function sendColor(value: number) {



    const rgb = HSVtoRGB(value / 360, 1, 1)

    const json = {
        "write":
        {
            "command": "display",
            "animType": "static",
            "animData": `1 ${panels[Math.floor(Math.random() * panels.length)]} 1 ${rgb.r} ${rgb.g} ${rgb.b} 0 1`,
            // "animData": `3 ${panels[Math.floor(Math.random() * panels.length)]} 1 ${rgb.r} ${rgb.g} ${rgb.b} 0 1 ${panels[Math.floor(Math.random() * panels.length)]} 1 ${rgb.r} ${rgb.g} ${rgb.b} 0 1 ${panels[Math.floor(Math.random() * panels.length)]} 1 ${rgb.r} ${rgb.g} ${rgb.b} 0 1`,
            "loop": false,
            "palette": []
        }
    }

    fetch(address, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(json),
    })

}

function HSVtoRGB(h: any, s: any, v: any) {
    let r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}