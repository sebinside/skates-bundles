import { NodeCG } from "nodecg/types/server";
import fetch from 'node-fetch';
import { response } from "express";

export interface Color { red: number, green: number, blue: number }
export interface ColoredPanel { panelId: number, color: Color }

export class NanoleafClient {

    private static defaultPort = 16021

    private static buildBaseRequestAddress(ipAddress: string, authToken: string) {
        return `http://${ipAddress}:${NanoleafClient.defaultPort}/api/v1/${authToken}`
    }

    static async printAuthKey(ipAddress: string, nodecg: NodeCG) {

        const errorMessage = "Received error while requesting nanoleaf auth token. Make sure to press the 'on' button for 5 seconds before executing this command."

        try {
            const response = await fetch(`http://${ipAddress}:${this.defaultPort}/api/v1/new`,
                { method: 'POST' })

            const json = await response.json()
            if (json.auth_token) {
                const authToken = json.auth_token
                nodecg.log.info(`Your Auth Token is: '${authToken}'.`)
            }
        } catch (error) {
            nodecg.log.warn(errorMessage)
        }
    }

    static async verifyConnection(ipAddress: string, authToken: string) {
        const response = await fetch(NanoleafClient.buildBaseRequestAddress(ipAddress, authToken),
            { method: 'GET' })
        return response.status === 200
    }

    static convertHSVtoRGB(color: { hue: number, saturation: number, value: number }): Color {
        // based on: https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
        let h = color.hue;
        let s = color.saturation;
        let v = color.value;
        let r, g, b, i, f, p, q, t;
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
            default: r = 0, g = 0, b = 0; break;
        }
        return {
            red: Math.round(r * 255),
            green: Math.round(g * 255),
            blue: Math.round(b * 255)
        };
    }

    // Important: Does only remember colors which were directly set through setPanelColor(s)
    private colors: Map<number, Color> = new Map<number, Color>();

    constructor(private ipAddress: string, private authToken: string, nodecg: NodeCG) {
        NanoleafClient.verifyConnection(ipAddress, authToken).then(response => {
            if (response) {
                nodecg.log.info("Connected to Nanoleafs successfully!")
            } else {
                nodecg.log.error("Unable to connect to Nanoleafs. Please check your credentials.")
            }
        })
    }

    private async callGET(relativePath: String) {
        return fetch(NanoleafClient.buildBaseRequestAddress(this.ipAddress, this.authToken) + relativePath,
            { method: 'GET' })
    }

    private async callPUT(relativePath: String, body: any) {
        return fetch(NanoleafClient.buildBaseRequestAddress(this.ipAddress, this.authToken) + relativePath,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })
    }

    async getAllPanelInfo() {
        return this.callGET("")
    }

    async getAllPanelIDs(): Promise<Array<number>> {
        const response = await this.getAllPanelInfo()

        if (response.status !== 200) {
            return []
        }

        const json = await response.json();
        const panelIDs = json.panelLayout?.layout?.positionData
            ?.map((entry: any) => entry.panelId)
            .filter((entry: number) => entry !== 0);

        return panelIDs;
    }

    async setPanelColor(panelId: number, color: Color) {
        this.setPanelColors([{ panelId: panelId, color: color }]);
    }

    async setPanelColors(data: ColoredPanel[]) {
        data.forEach(panel => this.colors.set(panel.panelId, panel.color));

        if (data.length >= 1) {
            const animData = `${data.length}` +
                data
                    .map((entry) => ` ${entry.panelId} 1 ${entry.color.red} ${entry.color.green} ${entry.color.blue} 0 1`)
                    .join("")

            const json = {
                "write":
                {
                    "command": "display",
                    "animType": "static",
                    "animData": animData,
                    "loop": false,
                    "palette": []
                }
            }

            this.callPUT("/effects", json)
        }
    }

    getPanelColor(panelId: number) {
        return this.colors.get(panelId);
    }

    getAllPanelColors() {
        return this.colors;
    }

    async setBrightness(level: number) {
        const data = { brightness: { value: level } };
        this.callPUT("/state", data);
    }

    async setState(on: boolean) {
        const data = { on: { value: on } }
        this.callPUT("/state", data);
    }

    async setHue(hue: number) {
        const data = { hue: { value: hue } }
        this.callPUT("/state", data);
    }

    async setSaturation(sat: number) {
        const data = { sat: { value: sat } }
        this.callPUT("/state", data);
    }

    async setColorTemperature(temperature: number) {
        const data = { ct: { value: temperature } }
        this.callPUT("/state", data);
    }

    // TODO: animatePanelColors(values, type: RANDOM, BOTTOMUP)
    // TODO: Puffer all other channel point actions while sub action!
}