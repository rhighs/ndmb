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
import { YoutubeSong } from "./youtube";

import { SongQueue } from "./user-queue"

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

const maybeYoutube = async (userInput: string): Promise<string> => {
    let mediaUrl = "";

    if (userInput.includes("youtube") === true) {
        let ytSong = new YoutubeSong(userInput);
        await ytSong.process();
        mediaUrl = ytSong.rawMediaUrl;
    } else if (userInput.substring(0, 4) !== "http") {
        let ytSong = await YoutubeSong.searchYoutubeSong(userInput);
        mediaUrl = ytSong.rawMediaUrl;
    }

    if (mediaUrl == "") {
        mediaUrl = userInput;
    }

    return mediaUrl;
}

cr.addReaction(PlayCommand.NAME, async (interaction) => {
    const guild = client.guilds?.cache.get(interaction.guildId!);
    const member = guild?.members?.cache.get(interaction.member?.user.id!);
    const userVoiceChannel = member?.voice?.channel as VoiceChannel;

    let userInput = interaction.options.getString(PlayCommand.OPTION_NAME)!;

    if (userVoiceChannel.joinable) {
        try {
            await interaction.reply({
                content: `Playing music at voice channel ${userVoiceChannel.id}`
            });
            playAudioInVoiceChannel(await maybeYoutube(userInput), userVoiceChannel, interaction.guild?.voiceAdapterCreator!);
        } catch (error) {
            await interaction.reply({
                content: `That doesn't seem to be a valid audio stream, so sorry ${member?.user.username}`
            });
            console.error(error);
        }
    } else {
        await interaction.reply({
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
