import path from "path";

// Discordjs imports
import { CommandInteraction, VoiceChannel } from "discord.js";
import { Client, Intents } from "discord.js";
import { REST }  from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

// Custom imports
import { CommandReactions } from "./command-reactions";
import { loadBotAndAppData } from "./configuration";
import { playAudioInVoiceChannel } from "./audio-player";
import { PlayCommand, AllCommandObjects, StopCommand, NextCommand } from "./command";
import { maybeYoutube } from "./youtube";
import { UserQueueByGuildId, UrlQueue } from "./user-queue";

import {
    AudioPlayerIdleState,
    AudioPlayerBufferingState,
    AudioPlayerPausedState,
    AudioPlayerPlayingState,
    AudioPlayerState,
    AudioPlayerStatus
} from "@discordjs/voice";

let userQueue: UserQueueByGuildId = {};

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

        userQueue[guildId] = {
            player: null,
            queue: new UrlQueue()
        }

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

cr.addReaction(StopCommand.NAME, async (interaction: CommandInteraction) => {
    const guild = client.guilds?.cache.get(interaction.guildId!);
    const member = guild?.members?.cache.get(interaction.member?.user.id!);
    const userVoiceChannel = member?.voice?.channel as VoiceChannel;

    let player = userQueue[guild!.id].player;
    if (player !== null) {
        await interaction.reply({
            content: `Stopped music at voice channel ${userVoiceChannel.id}`
        });
        player.stop();
    }
});

cr.addReaction(NextCommand.NAME, async (interaction: CommandInteraction) => {
    const guild = client.guilds?.cache.get(interaction.guildId!);
    const member = guild?.members?.cache.get(interaction.member?.user.id!);
    const userVoiceChannel = member?.voice?.channel as VoiceChannel;

    let player = userQueue[guild!.id].player;
    if (player !== null) {
        let url = userQueue[guild!.id].queue.next();

        if (!url) {
            await interaction.reply({
                content: `There is no other song to be played, perhaps you might want to use /stop now`
            });

            return;
        }

        playAudioInVoiceChannel(url!, userVoiceChannel, interaction.guild?.voiceAdapterCreator!)
            .then(player => {
                userQueue[guild!.id].player = player
            });
    }
});

cr.addReaction(PlayCommand.NAME, async (interaction: CommandInteraction) => {
    const guild = client.guilds?.cache.get(interaction.guildId!);
    const member = guild?.members?.cache.get(interaction.member?.user.id!);
    const userVoiceChannel = member?.voice?.channel as VoiceChannel;

    let userInput = interaction.options.getString(PlayCommand.OPTION_NAME)!;
    let url = await maybeYoutube(userInput);

    if (userVoiceChannel.joinable) {
        try {
            let currentPlayer = userQueue[guild!.id].player;

            if (currentPlayer && (currentPlayer.state.status === AudioPlayerStatus.Playing
                || currentPlayer.state.status === AudioPlayerStatus.Paused
                || currentPlayer.state.status === AudioPlayerStatus.AutoPaused)) {
                interaction.reply({
                    content: `Added to queue at voice channel ${userVoiceChannel.id}`
                });

                userQueue[guild!.id].queue.push(url);
            } else {
                interaction.reply({
                    content: `Playing music at voice channel ${userVoiceChannel.id}`
                });

                playAudioInVoiceChannel(url, userVoiceChannel, interaction.guild?.voiceAdapterCreator!)
                    .then(player => {
                        userQueue[guild!.id].player = player
                    });
            }

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
