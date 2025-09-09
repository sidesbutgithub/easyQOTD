import dotenv from "dotenv";

dotenv.config()

const TOKEN = process.env.DISCORD_TOKEN;
if (TOKEN == undefined) {
    console.log("Discord Token not found in env");
}

const CLIENT_ID = process.env.APPLICATION_ID;
if (CLIENT_ID == undefined) {
    console.log("Client ID not found in env");
}

const CHANNEL_ID = process.env.CHANNEL_ID;
if (CHANNEL_ID == undefined) {
    console.log("Channel ID not found in env");
}

const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI == undefined) {
    console.log("mongoDB URI not found in env");
}


export {TOKEN, CLIENT_ID, CHANNEL_ID, MONGO_URI}