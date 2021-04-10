import { CodingMessage, GamingMessage, Message } from "./types";

export class Defaults {

    private constructor() {
        // empty
    }

    static readonly messages = new Map<string, Message>([
        ["Science & Technology", new CodingMessage("Sebastian programmiert einen !was chat bot", "702.yt/was", "nodecg.io", "typescript", "vscode", "monokai")],
        ["Watch Dogs: Legion", new GamingMessage("Sebastian spielt Uhren-Hunde. Wau wau!", "702.yt/was")],
        ["Minecraft", new CodingMessage("Sebastian baut ein neues Minecraft Skyblock Modpack", "702.yt/was", "Skyblock-Nachfolger", "zenscript", "vscode", "monokai")]
    ]);

    static readonly projects = ["nodecg.io", "PremiereCEP", "Skyblock-Nachfolger", "HotkeylessAHK"];

    static readonly languages = ["typescript", "scala", "java", "zenscript"]

    static readonly editors = ["vscode", "intellij", "eclipse"]

    static readonly themes = ["monokai"]
}