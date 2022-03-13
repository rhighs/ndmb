import path from "path";

// Discordjs imports
import DiscordJS, { VoiceChannel } from "discord.js";
import { Client, Intents } from "discord.js";
import { REST }  from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

// Custom imports
import { CommandReactions } from "./command-reactions";
import { loadBotAndAppData } from "./configuration";
import { playAudioInVoiceChannel } from "./audio-player";
import { PlayCommand, AllCommandObjects } from "./command";
import { youtubeUrlAsAudioStream } from "./youtube";

let data = loadBotAndAppData(
    "bot-data.json",
    "application-data.json",
    path.resolve(__dirname) + "/configurations"
);

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

const initBotAndUpdateCommands = () => {
    console.log(`Logged in as ${client.user?.tag}!`);

    data.bot.guildIds.forEach((guildId: string) => {
        const rest = new REST({ version: "9" }).setToken(data.bot.token);

        let restResponse = rest.put(
            Routes.applicationGuildCommands(data.application.oauth2.clientId, guildId),
            { body: AllCommandObjects }
        );

        restResponse
            .then(() => console.log("Successfully registered application commands."))
            .catch(console.error);
    });
}

let cr = new CommandReactions();

cr.addReaction(PlayCommand.NAME, async (interaction) => {
    const guild = client.guilds?.cache.get(interaction.guildId!);
    const member = guild?.members?.cache.get(interaction.member?.user.id!);
    const userVoiceChannel = member?.voice?.channel as VoiceChannel;

    let mediaUrl = interaction.options.getString(PlayCommand.OPTION_NAME)!;

    if (userVoiceChannel.joinable) {
        try {
            if (mediaUrl.includes("youtube") === true) {
                let urls = await youtubeUrlAsAudioStream(mediaUrl);
                console.log(urls);
                mediaUrl = urls[0];
            }

            playAudioInVoiceChannel(mediaUrl, userVoiceChannel, interaction.guild?.voiceAdapterCreator!);
            interaction.reply({
                content: `Playing music at voice channel ${userVoiceChannel.id}`
            });
        } catch (error) {
            interaction.reply({
                content: `That doesn"t seem to be a valid audio stream, sorry ${member?.user.username}.`
            });
            console.error(error);
        }
    } else {
        interaction.reply({
            content: `Couldn"t join so sorry :(`
        });
    }
});

(() => {
    client.on("ready", initBotAndUpdateCommands);
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) {
            return;
        }

        cr.trigger(interaction);
    });

    client.login(data.bot.token);
})();
