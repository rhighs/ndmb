import path from "path";

import DiscordJS, { VoiceChannel } from "discord.js";
import { Client, Intents } from "discord.js";
import { REST }  from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

import { CommandReactions } from "./command-reactions";
import { loadBotAndAppData } from "./configuration";

import { playAudioInVoiceChannel } from "./audio-player";

(() => {
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

    client.on("ready", () => {
        console.log(`Logged in as ${client.user?.tag}!`);

        data.bot.guildIds.forEach((guildId: string) => {
            //const guild = client.guilds.cache.get(guildId);

            let commands = [{
                name: "play",
                description: "Should play the url you have provided",
                options: [
                    {
                        name: "mediaurl",
                        description: "Viable source of media (An mp3 or any direct stream)",
                        required: true,
                        type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
                    }
                ]
            }];

            const rest = new REST({ version: "9" }).setToken(data.bot.token);

            rest.put(Routes.applicationGuildCommands(data.application.oauth2.clientId, guildId), { body: commands })
                .then(() => console.log("Successfully registered application commands."))
                .catch(console.error);
        })
    });

    let cr = new CommandReactions();

    cr.addReaction("play", async (interaction) => {
        const guild = client.guilds?.cache.get(interaction.guildId!);
        const member = guild?.members?.cache.get(interaction.member?.user.id!);
        const userVoiceChannel = member?.voice?.channel as VoiceChannel;

        let mediaUrl = interaction.options.getString("mediaurl")!;

        if (userVoiceChannel.joinable) {
            try {
                playAudioInVoiceChannel(mediaUrl, userVoiceChannel, interaction.guild?.voiceAdapterCreator!);
                interaction.reply({
                    content: `Playing music at voice channel ${userVoiceChannel.id}`,
                    ephemeral: true
                });
            } catch (error) {
                interaction.reply({
                    content: `That doesn"t seem to be a valid audio stream, sorry ${member?.user.username}.`,
                    ephemeral: true
                });
                console.error(error);
            }
        } else {
            interaction.reply({
                content: `Couldn"t join so sorry :(`,
                ephemeral: true
            });
        }
    });

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) {
            return;
        }

        cr.trigger(interaction);
    });

    client.login(data.bot.token);
})();
