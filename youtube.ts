import { create as createYoutubeDl } from "youtube-dl-exec";

const youtubedl = createYoutubeDl("./bin/youtube-dl.exe");
import yts, { SearchResult } from "yt-search";

const ytEndpointPrefixes: string[] = [
    "https://www.youtu.be",
    "https://m.youtu.be",
    "https://youtu.be",
    "http://www.youtu.be",
    "http://m.youtu.be",
    "http://youtu.be",
    "https://www.yotube",
    "https://m.youtube",
    "https://youtube",
    "http://www.yotube",
    "http://m.youtube",
    "http://youtube"
]

const testPrefixes = (maybeYtUrl: string): boolean => {
    return ytEndpointPrefixes
        .filter(prefix => maybeYtUrl.substring(0, prefix.length) === prefix)
        .length > 0
}

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

const maybeYoutube = async (userInput: string): Promise<string> => {
    let mediaUrl = "";

    if (testPrefixes(userInput) === true) {
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

export {
    youtubeUrlAsAudioStream,
    YoutubeSong,
    maybeYoutube
}