import { Client, TextChannel } from "discord.js";
import { setTimeout, setInterval } from 'node:timers/promises';
import { RegisteredChannel } from "../models/channelModel.js";
import { remainingQuestions } from "../redis/redisSetup.js";

async function startClock(channelId:string, discordClient: Client) {
    var currChannel = await RegisteredChannel.findById(channelId);
    if (currChannel == null){
        console.log(`${channelId} not found while clock starting`);
        return;
    }
    const nextMsg = currChannel.scheduledNext
    
    if (nextMsg < Date.now()){//5 minute grace period
        //if we're less than 3 hours late, just send it dont say anything
        if (Date.now()-nextMsg < 3*60*60*1000){
            const sendChannel = discordClient.channels.cache.get(channelId);
            if (sendChannel == undefined){
                console.log(`${channelId} not found while clock starting`);
                return;
            }
            const question = await remainingQuestions.SPOP(channelId);
            if (question == null){
                console.log(`No Questions Left for ${channelId}`);
                return
            }
            (sendChannel as TextChannel).send(question);
        }
        else{
            const sendChannel = discordClient.channels.cache.get(channelId);
            if (sendChannel == undefined){
                console.log(`${channelId} not found while clock starting`);
                return;
            }
            const question = await remainingQuestions.SPOP(channelId);
            if (question == null){
                console.log(`No Questions Left for ${channelId}`);
                return
            }
            (sendChannel as TextChannel).send("Sorry for being late! Here's the question of the day!");
            (sendChannel as TextChannel).send(question);
        }
    }
    else{
        //if theres still time before the scheduled time, need to wait
        await setTimeout(nextMsg-Date.now());
        const sendChannel = discordClient.channels.cache.get(channelId);
        if (sendChannel == undefined){
            console.log(`${channelId} not found while clock starting`);
            return;
        }
        const question = await remainingQuestions.SPOP(channelId);
        if (question == null){
            console.log(`No Questions Left for ${channelId}`);
            currChannel = await RegisteredChannel.findById(channelId);
            if (currChannel == null){
                console.log(`${channelId} not found while clock completing`);
            }
            else{
                currChannel.scheduledNext = -1;
                currChannel.active = false;
                currChannel.save()
            }
            return
        }
        (sendChannel as TextChannel).send(question);
    }

    currChannel = await RegisteredChannel.findById(channelId);
    if (currChannel == null){
        console.log(`${channelId} not found while clock starting`);
        return;
    }
    const currInterval = currChannel.scheduleInterval;

    currChannel.scheduledNext = nextMsg+currInterval;

    await currChannel.save();

    //start the timer asynchornously
    (async () => {
        for await (const msgTime of setInterval(currInterval, Date.now())){
            const sendChannel = discordClient.channels.cache.get(channelId);
            if (sendChannel == undefined){
                console.log(`${channelId} not found while clock running`);
                return;
            }
            const question = await remainingQuestions.SPOP(channelId);
            if (question == null){
                console.log(`No Questions Left for ${channelId}`);
                currChannel = await RegisteredChannel.findById(channelId);
                if (currChannel == null){
                    console.log(`${channelId} not found while clock completing`);
                }
                else{
                    currChannel.scheduledNext = -1;
                    currChannel.active = false;
                    currChannel.save()
                }
                return
            }
            (sendChannel as TextChannel).send(question);

            currChannel.scheduledNext = nextMsg+currInterval;

            await currChannel.save();
        }
    })()
}

/*
async function registerServer(serverid: string, startTime: string) {
    //add serverid to set of registered servers & set the first message sending timing
    if (await serversDB.SISMEMBER("registeredServers", serverid) == 1){
        console.log("Already Registered");
        return
    }
    serversDB.SADD("registeredServers", serverid);
    await setMessageTiming(serverid, startTime);
    startClock(serverid);
    return;
}

async function onRestart(){
    for (var serverid in serversDB.SMEMBERS("registeredServers")){
        startClock(serverid)
    }
}*/

export { startClock }