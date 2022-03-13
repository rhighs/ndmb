import { create as createYoutubeDl } from "youtube-dl-exec";
const youtubedl = createYoutubeDl("./bin/youtube-dl.exe");

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
    public url: string;
    public name: string;

    public constructor(youtubeUrl: string) {
        this.url = youtubeUrlAsAudioStream(youtubeUrl)[0];
    }

    public static youtubeSearch(songName: string): YoutubeSong {
        let someUrl: string = "a fetched url";
        {
            // Somehow fetch a url first youtube result... play-dl? 
        } 
        return new YoutubeSong(someUrl);
    }
}

export {
    youtubeUrlAsAudioStream
}