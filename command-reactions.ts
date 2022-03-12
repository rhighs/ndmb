import { CommandInteraction } from "discord.js";

type Reaction = (interaction: CommandInteraction) => void;

interface CommandReaction {
    [key: string]: Reaction[]
}

class CommandReactions {
    private commandReactions: CommandReaction;

    constructor() {
        this.commandReactions = {};
    }

    addReaction(commandName: string, reaction: Reaction): void {
        let reactions = this.commandReactions[commandName] ?? [];
        this.commandReactions[commandName] = [...reactions, reaction];
    }

    trigger(interaction: CommandInteraction): void{
        let reactions = this.commandReactions[interaction.commandName];

        if (reactions) {
            reactions.forEach(reaction => reaction(interaction));
        }
    }
}

export {
    CommandReactions,
    CommandReaction,
    Reaction
}
