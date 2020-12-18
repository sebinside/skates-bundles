import { NodeCG } from "nodecg/types/server";
import fetch from 'node-fetch';

export class NanoleafClient {
 
    private static defaultPort = 16021

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
        const response = await fetch(`http://${ipAddress}:${this.defaultPort}/api/v1/${authToken}`,
                { method: 'GET' })
        return response.status === 200
    }

    constructor(private ipAddress: string, private authToken: string, nodecg: NodeCG) {
        NanoleafClient.verifyConnection(ipAddress,authToken).then(response => {
            if(response) {
                nodecg.log.info("Connected to Nanoleafs successfully!")
            } else {
                nodecg.log.error("Unable to connect to Nanoleafs. Please check your credentials.")
            }
        })
    }

    getAllPanelInfo() {

    }

}