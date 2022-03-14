import fs from "fs";

interface BotData {
    permissionInteger: number,
    token: string,
    inviteLink: string,
    guildIds: Array<string>
};

interface OAUTH2Data {
    clientId: string,
    clientSecret: string
}

interface ApplicationData {
    appId: string,
    publicKey: string,
    oauth2: OAUTH2Data
};

interface BotAndAppData {
    bot: BotData,
    application: ApplicationData
};

interface YoutubeData {
    apiKey: string
};

const loadJsonData = (path: string): any => JSON.parse(fs.readFileSync(path, "utf8"));

const loadBotAndAppData = (botConfigFilename: string,
    appConfigFilename: string,
    configDir: string = "./configurations"
): BotAndAppData => ({
    bot: loadJsonData(configDir + "/" + botConfigFilename),
    application: loadJsonData(configDir + "/" + appConfigFilename)
});

const loadYoutubeData = (filename: string,
    configDir: string = "./configurations"
): YoutubeData => ({
    apiKey: loadJsonData(configDir + "/" + filename)
});

export {
    BotAndAppData,
    BotData,
    OAUTH2Data,
    ApplicationData,
    loadBotAndAppData,
    loadYoutubeData
}
