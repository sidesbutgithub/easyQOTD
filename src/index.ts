import { Client, Events, GatewayIntentBits, REST, Routes, ChannelManager, Channel, TextChannel } from 'discord.js';
import dotenv from "dotenv";

dotenv.config()

const TOKEN = process.env.DISCORD_TOKEN;

if (TOKEN == undefined) {
    console.log("Discord Token not found in env");
    process.exit(1);
}


const CLIENT_ID = process.env.APPLICATION_ID;

if (CLIENT_ID == undefined) {
    console.log("Client ID not found in env");
    process.exit(1);
}

const CHANNEL_ID = process.env.CHANNEL_ID;

if (CHANNEL_ID == undefined) {
    console.log("Channel ID not found in env");
    process.exit(1);
}

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: "test",
    description: 'ping alternative',
  },
];

const rest = new REST({ version: '10' }).setToken(TOKEN);

try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    
    await interaction.reply('Pong!');
  }
  if (interaction.commandName === 'test') {
    await interaction.reply('ok');
    client.channels.cache.get(CHANNEL_ID).send('Hello world!')
  }
});

await client.login(TOKEN);