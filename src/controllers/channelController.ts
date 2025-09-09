import { ChatInputCommandInteraction, CacheType, MessageFlags, SlashCommandBuilder } from "discord.js";
import { RegisteredChannel } from "../models/channelModel.js";
import { isAdmin } from "../utils/auth.js";
import { startClock } from "../messageTiming/nextMessageTime.js";
import { initialQuestions, remainingQuestions } from "../redis/redisSetup.js";

const registerCommand = new SlashCommandBuilder()
.setName('register')
.setDescription('Registers the current channel for questions of the day')

async function registerChannel(interaction: ChatInputCommandInteraction<CacheType>){
    if (await isAdmin(interaction)){
        await interaction.reply({ content: 'Whoops! Looks like you dont have the permission to use this command here! You can only use this command in a server text channel where you have admin permissions', flags: MessageFlags.Ephemeral });
        return
    }

    if (await RegisteredChannel.findById(interaction.channelId) != null){
        await interaction.reply({ content: 'This channel is already registered to post questions', flags: MessageFlags.Ephemeral })
        return;
    }

    const currChannel = new RegisteredChannel({
        _id: interaction.channelId,
        serverId: interaction.guildId
    })

    await currChannel.save();

    await interaction.reply({ content: 'This channel is now registered to post Questions Of The Day!', flags: MessageFlags.Ephemeral })
    return;
}

const initializeCommand = new SlashCommandBuilder()
.setName('initialize')
.setDescription('Schedules when the first question of the day will be sent in the current')
.addStringOption(option =>
		option.setName('initialdatetime')
			.setDescription('The initial UNIX timestamp for the first question of the day')
            .setRequired(true));

async function setChannelInitial(interaction: ChatInputCommandInteraction<CacheType>){
    if (await isAdmin(interaction)){
        await interaction.reply({ content: 'Whoops! Looks like you dont have the permission to use this command here! You can only use this command in a server text channel where you have admin permissions', flags: MessageFlags.Ephemeral });
        return
    }
    const currChannel = await RegisteredChannel.findById(interaction.channelId)
    if (currChannel == null){
        await interaction.reply({ content: 'This channel is not yet registered to post questions', flags: MessageFlags.Ephemeral })
        return;
    }
    if (currChannel.scheduledNext != -1){
        await interaction.reply({ content: 'This channel already has a scheduled question', flags: MessageFlags.Ephemeral })
        return;
    }
    const initialDateTime = interaction.options.getString('initialdatetime');
    if (initialDateTime == null){
        console.log("no initialdatetime");
        return;
    }
    currChannel.scheduledNext = parseInt(initialDateTime);
    await currChannel.save();
    
    await interaction.reply({ content: `This channel will post its first Question Of The Day on ${initialDateTime}!`, flags: MessageFlags.Ephemeral })
    return;
}



const setIntervalCommand = new SlashCommandBuilder()
.setName('interval')
.setDescription('Sets the interval between questions in milliseconds')
.addStringOption(option =>
		option.setName('intervaltime')
			.setDescription('The number of milliseconds in-between each question')
            .setRequired(true));

async function setQuestionInterval(interaction: ChatInputCommandInteraction<CacheType>){
    if (await isAdmin(interaction)){
        await interaction.reply({ content: 'Whoops! Looks like you dont have the permission to use this command here! You can only use this command in a server text channel where you have admin permissions', flags: MessageFlags.Ephemeral });
        return
    }
    const currChannel = await RegisteredChannel.findById(interaction.channelId)
    if (currChannel == null){
        await interaction.reply({ content: 'This channel is not yet registered to post questions', flags: MessageFlags.Ephemeral })
        return;
    }
    if (currChannel.scheduleInterval != -1){
        await interaction.reply({ content: 'This channel already has a set interval for questions', flags: MessageFlags.Ephemeral })
        return;
    }
    const intervalTime = interaction.options.getString('intervaltime');
    if (intervalTime == null){
        console.log("no intervaltime");
        return;
    }

    currChannel.scheduleInterval = parseInt(intervalTime);
    await currChannel.save();
    
    await interaction.reply({ content: `This channel will post questions every ${intervalTime}ms!`, flags: MessageFlags.Ephemeral })
    return;
}

const startCommand = new SlashCommandBuilder()
.setName('start')
.setDescription('Starts sending Questions Of The Day!')


async function startQOTD(interaction: ChatInputCommandInteraction<CacheType>){
    if (await isAdmin(interaction)){
        await interaction.reply({ content: 'Whoops! Looks like you dont have the permission to use this command here! You can only use this command in a server text channel where you have admin permissions', flags: MessageFlags.Ephemeral });
        return
    }
    const currChannel = await RegisteredChannel.findById(interaction.channelId)
    if (currChannel == null){
        await interaction.reply({ content: 'This channel is not yet registered to post questions', flags: MessageFlags.Ephemeral })
        return;
    }
    if (currChannel.scheduleInterval == -1){
        await interaction.reply({ content: 'This channel does not have an interval set', flags: MessageFlags.Ephemeral })
        return;
    }
    if (currChannel.scheduledNext == -1){
        await interaction.reply({ content: 'This channel does not have an initial message timing set', flags: MessageFlags.Ephemeral })
        return;
    }
    if (currChannel.active){
        await interaction.reply({ content: 'This channel is already active', flags: MessageFlags.Ephemeral })
        return;
    }

    currChannel.active = true;
    await currChannel.save();
    
    startClock(currChannel._id, interaction.client);

    await interaction.reply({ content: 'QOTD Started!', flags: MessageFlags.Ephemeral })
    return;
}


const addCommand = new SlashCommandBuilder()
.setName('add')
.setDescription('Adds the question to the list of questions of the day for the current channel')
.addStringOption(option =>
		option.setName('question')
			.setDescription('The question to be added')
            .setRequired(true));

async function addQOTD(interaction: ChatInputCommandInteraction<CacheType>){
    if (await isAdmin(interaction)){
        await interaction.reply({ content: 'Whoops! Looks like you dont have the permission to use this command here! You can only use this command in a server text channel where you have admin permissions', flags: MessageFlags.Ephemeral });
        return
    }
    const currChannel = await RegisteredChannel.findById(interaction.channelId)
    if (currChannel == null){
        await interaction.reply({ content: 'This channel is not yet registered to post questions', flags: MessageFlags.Ephemeral })
        return;
    }

    const question = interaction.options.getString('question');
    if (question == null){
        console.log("no question");
        return;
    }
    await initialQuestions.SADD(currChannel._id, question);
    await remainingQuestions.SADD(currChannel._id, question);
    await interaction.reply({ content: `Question: "${question}" successfully added!`, flags: MessageFlags.Ephemeral })
    return;
}

const initialCommand = new SlashCommandBuilder()
.setName('initial')
.setDescription('List the initial questions for the current channel')
async function listInitial(interaction: ChatInputCommandInteraction<CacheType>){
    if (await isAdmin(interaction)){
        await interaction.reply({ content: 'Whoops! Looks like you dont have the permission to use this command here! You can only use this command in a server text channel where you have admin permissions', flags: MessageFlags.Ephemeral });
        return
    }
    const currChannel = await RegisteredChannel.findById(interaction.channelId)
    if (currChannel == null){
        await interaction.reply({ content: 'This channel is not yet registered to post questions', flags: MessageFlags.Ephemeral })
        return;
    }

    //get all members of initial set and join with newline
    await interaction.reply({content: (await initialQuestions.SMEMBERS(interaction.channelId)).join('\n') || "No questions Found (An Error Occured)", flags: MessageFlags.Ephemeral})
    return;
}

const remainingCommand = new SlashCommandBuilder()
.setName('remaining')
.setDescription('List the remaining questions for the current channel')
async function listRemaining(interaction: ChatInputCommandInteraction<CacheType>){
    if (await isAdmin(interaction)){
        await interaction.reply({ content: 'Whoops! Looks like you dont have the permission to use this command here! You can only use this command in a server text channel where you have admin permissions', flags: MessageFlags.Ephemeral });
        return
    }
    const currChannel = await RegisteredChannel.findById(interaction.channelId)
    if (currChannel == null){
        await interaction.reply({ content: 'This channel is not yet registered to post questions', flags: MessageFlags.Ephemeral })
        return;
    }

    //get all members of initial set and join with newline
    await interaction.reply({content: (await remainingQuestions.SMEMBERS(interaction.channelId)).join('\n') || "No questions Found (An Error Occured)", flags: MessageFlags.Ephemeral})
    return;
}

const listCommand = new SlashCommandBuilder()
.setName('list')
.setDescription('Lists the registered channels')


async function listChannels(interaction: ChatInputCommandInteraction<CacheType>){
    if (await isAdmin(interaction)){
        await interaction.reply({ content: 'Whoops! Looks like you dont have the permission to use this command here! You can only use this command in a server text channel where you have admin permissions', flags: MessageFlags.Ephemeral });
        return
    }
    console.log(await RegisteredChannel.find());

    await interaction.reply("listed all")
    return;
}


export {registerCommand, registerChannel, initializeCommand, setChannelInitial, setIntervalCommand, setQuestionInterval, listCommand, listChannels,
    startCommand,
    startQOTD,
    addCommand, 
    addQOTD,
    initialCommand,
    listInitial,
    remainingCommand,
    listRemaining
}