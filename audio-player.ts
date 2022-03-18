import { VoiceChannel } from "discord.js";

import {
    AudioPlayer,
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    StreamType,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    DiscordGatewayAdapterCreator,
    PlayerSubscription
} from '@discordjs/voice';

const channelConnection = async (channel: VoiceChannel, adapterCreator: DiscordGatewayAdapterCreator) => {
    const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: adapterCreator,
	});
    
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

const playAudioInVoiceChannel = async (stream: string | Blob | Int32Array,
    voiceChannel: VoiceChannel,
    voiceAdapterCreator: DiscordGatewayAdapterCreator,
    audioPlayer : AudioPlayer | null = null
) => {
    if (!audioPlayer) {
        audioPlayer = createAudioPlayer();
    }

    const playSong = async (resourceUrl: string): Promise<AudioPlayer> => {
        const resource = createAudioResource(resourceUrl, {
            inputType: StreamType.Arbitrary,
        });

        audioPlayer!.play(resource);

        return entersState(audioPlayer!, AudioPlayerStatus.Playing, 5e3);
    }

    let player = await playSong(stream as string);

    let connection = await channelConnection(voiceChannel, voiceAdapterCreator);
    connection.subscribe(audioPlayer!);

    return player;
}

export {
    playAudioInVoiceChannel
}
