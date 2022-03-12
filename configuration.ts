import fs from "fs";

interface BotData {
    permissionInteger: number,
    token: string,
    inviteLink: string,
    guildIds: Array<string>
}

interface OAUTH2Data {
    clientId: string,
    clientSecret: string
}

interface ApplicationData {
    appId: string,
    publicKey: string,
    oauth2: OAUTH2Data
}

interface BotAndAppData {
    bot: BotData,
    application: ApplicationData
};

declare let appRoot: string;
const loadBotAndAppData = (botConfigFilename: string, appConfigFilename: string, configDir: string = "./configurations"): BotAndAppData => {
    const loadJsonData = (path: string): any => JSON.parse(fs.readFileSync(path, "utf8"));

    return {
        bot: loadJsonData(configDir + "/" + botConfigFilename),
        application: loadJsonData(configDir + "/" + appConfigFilename)
    };
}

export {
    BotAndAppData,
    BotData,
    OAUTH2Data,
    ApplicationData,
    loadBotAndAppData
}
