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
    
    if (currChannel.scheduledNext > Date.now()){
        console.log(`${channelId} invalid next message timing`);
        currChannel.scheduledNext = -1;
        currChannel.active = false;
        await currChannel.save();
        return;
    }

    //start the timer asynchornously
    (async () => {
        while (true){
            await setTimeout(Date.now()-currChannel.scheduledNext);
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
                    currChannel.save();
                }
                return
            }
            (sendChannel as TextChannel).send(question);

            currChannel.scheduledNext += currChannel.scheduleInterval;
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