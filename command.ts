import DiscordJS from "discord.js";

abstract class Command {
    static NAME: string;

    public static commandObject(): void {}
};

class PlayCommand implements Command {
    static NAME: string = "play";
    static OPTION_NAME: string = "input";

    public static commandObject() {
        return {
            name: this.NAME,
            description: "Plays a song given a valid option",
            options: [
                {
                    name: this.OPTION_NAME,
                    description: "mp3 link | youtube link | youtube video name to search for",
                    required: true,
                    type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
                }
            ]
        }
    }
}

class StopCommand implements Command {
    static NAME: string = "stop";

    public static commandObject() {
        return {
            name: this.NAME,
            description: "Stops the current playing song",
        }
    }
}

class NextCommand implements Command {
    static NAME: string = "next";

    public static commandObject() {
        return {
            name: this.NAME,
            description: "Plays to the next song, if any is playing",
        }
    }
}

class PrevCommand implements Command {
    static NAME: string = "prev";

    public static commandObject() {
        return {
            name: this.NAME,
            description: "Plays to the previous song, if any is playing",
        }
    }
}

const AllCommandObjects = [
    PlayCommand.commandObject(),
    NextCommand.commandObject(),
    PrevCommand.commandObject(),
    StopCommand.commandObject()
];

export {
    PlayCommand,
    NextCommand,
    StopCommand,
    AllCommandObjects
}