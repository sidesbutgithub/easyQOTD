import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js";

interface SlashCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder,
  func: Function
}

export {SlashCommand}