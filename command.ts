import DiscordJS from "discord.js";

class PlayCommand {
    static NAME: string = "play";
    static OPTION_NAME: string = "input";

    public static commandObject() {
        return {
            name: this.NAME,
            description: "Should play the url you have provided",
            options: [
                {
                    name: this.OPTION_NAME,
                    description: "Viable source of media (An mp3 or any direct stream)",
                    required: true,
                    type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
                }
            ]
        }
    }
}

class NextCommand {
    static NAME: string = "next";

    public static commandObject() {
        return {
            name: this.NAME,
            description: "Plays to the next song, if any is playing",
        }
    }
}

class PrevCommand {
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
    PrevCommand.commandObject()
];

export {
    PlayCommand,
    AllCommandObjects
}