import { create as createYoutubeDl } from "youtube-dl-exec";

const youtubedl = createYoutubeDl("./bin/youtube-dl.exe");
import yts, { SearchResult } from "yt-search";

const youtubeUrlAsAudioStream = async (youtubeUrl: string, audioExts: string[] = ["m4a", "mp3"]): Promise<string[]> => {
    return await youtubedl(youtubeUrl, {
        dumpSingleJson: true,
        noWarnings: true,
        callHome: true,
        noCheckCertificate: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
        referer: youtubeUrl
    }).then(output => {
        return output.formats
            .filter(format => audioExts.includes(format.ext))
            .map(format => format.url);
    });
}

class YoutubeSong {
    public name: string;
    public youtubeUrl: string;
    public rawMediaUrl: string = "";

    public constructor(youtubeUrl: string, name: string = "") {
        this.name = name;
        this.youtubeUrl = youtubeUrl;
    }

    public static async searchYoutubeSong(songName: string): Promise<YoutubeSong> {
        return yts(songName)
            .then(async (results: SearchResult): Promise<YoutubeSong> => {
                if (results.videos.length === 0) {
                    throw Error("Couldn't find nay video given that name");
                }

                let video = results.videos[0];
                let ytSong = new YoutubeSong(video.url, video.title);
                await ytSong.process();

                return ytSong;
            });
    }

    public async process() {
        await youtubeUrlAsAudioStream(this.youtubeUrl)
            .then(results => this.rawMediaUrl = results[0]);
    }
}

export {
    youtubeUrlAsAudioStream,
    YoutubeSong
}