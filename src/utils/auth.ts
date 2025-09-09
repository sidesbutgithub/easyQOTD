import { CacheType, ChatInputCommandInteraction } from "discord.js";

//I dont use this
async function isTextChannel(interaction: ChatInputCommandInteraction<CacheType>){
    if (interaction.guild == null){
        //await interaction.reply({ content: 'This command is only available in server text channels!', flags: MessageFlags.Ephemeral });
        return 1;
    }
    return 0;
}

//1: not in text channel, 2: not admin
async function isAdmin(interaction: ChatInputCommandInteraction<CacheType>){
    const perms = interaction.memberPermissions;
    if (perms == null){
        return false
    }
    if (perms.has("0x0000000000000008")){
        //await interaction.reply({ content: 'Whoops! Looks like you dont have the permission to use this command!', flags: MessageFlags.Ephemeral });
        return false;
    }
    return true;
}


export {isTextChannel, isAdmin}