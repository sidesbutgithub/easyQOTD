import { Collection, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, RESTPostAPIChatInputApplicationCommandsJSONBody} from "discord.js";
import { SlashCommand } from "../models/slashCommandExtention.js";

async function getCommands(commandsCollection: Collection<String, SlashCommand>) {
    const commands: (RESTPostAPIChatInputApplicationCommandsJSONBody)[] = [];
    
    commandsCollection.forEach((value, key, map)=>{
        commands.push(value.data.toJSON());
    });
    return commands;
}

export {getCommands}