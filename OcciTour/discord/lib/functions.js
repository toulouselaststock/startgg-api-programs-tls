import { Client } from "discord.js";
import { relurl } from '../../../base/include/lib/dirname.js'
import { sendSeparateMessages } from "@twilcynder/discord-util"
import fs from 'fs';

/**
 * 
 * @param {any[]} playersList 
 */
export function processList(playersList){
    let result = "";
    console.log(playersList);
    for (let i = 0; i < playersList.length; i++){
        let {name, score, tournamentNumber} = playersList[i];
        result += `${i + 1}. **${name}** : ${score} (${tournamentNumber} tournoi${tournamentNumber > 1 ? "s" : ""})\n`;
    }
    return result;
}

function loadToken(path){
    path = path ?? relurl(import.meta.url, "..");
    let token;
    try {
        let res = fs.readFileSync(relurl(path, "secrets.json"));
        res = JSON.parse(res);
        if (!res && !res.token) throw "Could not find a token property in secrets.json";
        token = res.token;
    } catch (err) {
        if (err instanceof SyntaxError){
            console.error("secrets.json coudn't be parsed, its syntax is incorrect : ", err);
        } else if (typeof err == "string") {
            console.error("Error reading token in secrets.json :", err);
        } else {
            console.error("Cannot read secrets.json. If it doesn't exist, please create a secrets.json file containing  {\"token\" : BOT_TOKEN} ");
        }
        process.exit(1);
    }
    return token;
}

export async function initBot(secretsPath){
    let token = loadToken(secretsPath);
    console.log(token)
    let client = new Client({intents :  ["Guilds", "GuildMessages", "MessageContent", "GuildMessageReactions"]})
    await client.login(token);
    return client;
}   

/**
 * 
 * @param {Client} client 
 * @param {string} channelID 
 * @param {string} message 
 */
export async function sendMessage(client, channelID, message){
    
    let channel = await client.channels.fetch(channelID);
    await sendSeparateMessages(channel, message, 1900);
}

/**
 * 
 * @param {Client} client 
 * @param {string} channelID 
 */
export async function clearChannel(client, channelID){
    let channel = await client.channels.fetch(channelID);
    await channel.messages.fetch().then( messages => messages.map(message => {
        message.delete();
    }))
}