import { Client, Events, GatewayIntentBits, Collection, REST, Routes, MessageFlags, TextChannel, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder} from 'discord.js';
import { TOKEN, CLIENT_ID, CHANNEL_ID, MONGO_URI } from "./utils/globals.js";
import mongoose from 'mongoose';
import { pingCommand, pingFunc } from './controllers/pingController.js';
import { addCommand, addQOTD, initialCommand, initializeCommand, listChannels, listCommand, listInitial, listRemaining, registerChannel, registerCommand, remainingCommand, setChannelInitial, setIntervalCommand, setQuestionInterval, startCommand, startQOTD } from './controllers/channelController.js';
import { SlashCommand } from './models/slashCommandExtention.js';
import { getCommands } from './utils/getCommands.js';
import { RegisteredChannel } from './models/channelModel.js';
import { startClock } from './messageTiming/nextMessageTime.js';

//if unable to load any of the envs, cant start bot
if (TOKEN == undefined || CLIENT_ID == undefined || CHANNEL_ID == undefined){
  console.log("Failed to load required environment variables");
  process.exit(1);
}

mongoose
  //@ts-ignore
    .connect(MONGO_URI)
    .then(() => console.log("database connection successful"))
    .catch((e) => {console.log(e); process.exit(1)});


const COMMANDS = new Collection<String, SlashCommand>();

COMMANDS.set("ping", {
  data: pingCommand,
  func: pingFunc
})

COMMANDS.set("register", {
  data: registerCommand,
  func: registerChannel
})

COMMANDS.set("initialize", {
  data: initializeCommand,
  func: setChannelInitial
})

COMMANDS.set("interval", {
  data: setIntervalCommand,
  func: setQuestionInterval
})

COMMANDS.set("start", {
  data: startCommand,
  func: startQOTD
})

COMMANDS.set("add", {
  data: addCommand,
  func: addQOTD
})

COMMANDS.set("initial", {
  data: initialCommand,
  func: listInitial
})

COMMANDS.set("remaining", {
  data: remainingCommand,
  func: listRemaining
})

COMMANDS.set("list", {
  data: listCommand,
  func: listChannels
})

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${COMMANDS.size} application (/) commands.`);
    const commands = await getCommands(COMMANDS);

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );

		console.log(`Successfully reloaded ${COMMANDS.size} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();

//start discord bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, async readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}!`);

  
  console.log(`Restarting clocks`);
  await (async () => {
    const activeChannels = await RegisteredChannel.find({active: true}).exec();
    console.log(activeChannels);
    for (var i of activeChannels){
      startClock(i._id, client);
    }
  })();
  console.log(`Successfully restarted message clocks`);
});



client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const currCommand = COMMANDS.get(interaction.commandName);
  if (!currCommand){
    return
  }

  currCommand.func(interaction)
  return
})



await client.login(TOKEN);
