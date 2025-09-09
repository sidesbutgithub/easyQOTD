import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const pingCommand = new SlashCommandBuilder()
.setName('ping')
.setDescription('Replies with pong! (useful for checking if the bot is alive)')

async function pingFunc(interaction: ChatInputCommandInteraction<CacheType>) {
		await interaction.reply('Pong!');
        return
	}

export {pingCommand, pingFunc}