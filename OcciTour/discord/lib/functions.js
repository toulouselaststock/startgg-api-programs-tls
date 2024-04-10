import { Client } from "discord.js";
import { relurl } from '../../../base/include/lib/dirname.js'
import { sendSeparateMessages } from "@twilcynder/discord-util"
import fs from 'fs';

/**
 * Converts an ordered players list to a map associating each slug with the rank
 * @param {{slug: string}[]} playersList 
 * @returns {{ [slug: string]: number }}
 */
function playersListToMap(playersList){
    let previousRank = {};

    for (let i = 0; i < playersList.length; i++){
        let p = playersList[i];
        if (!p.slug){
            console.error("Tried to process with previous ranking, but the data doesn't contain slugs. Please provide the players slug in both the previous ranking data and the current ranking data.");
            process.exit(1);
        }

        previousRank[p.slug] = i;
    }

    return previousRank;
}

function getRankingMovementEmoji(newRank, oldRank){
    return oldRank == undefined ? "🆕 (--)" : oldRank == newRank ? "⏺️ (+0)" : oldRank > newRank ? `⬆️ (+${oldRank - newRank})` : `⬇️ (${oldRank - newRank})`
}

/**
 * 
 * @param {any[]} playersList 
 * @param {any[]} previousPlayerList
 */
function processListComp(playersList, previousPlayerList){
    let previousRanks = playersListToMap(previousPlayerList);

    let result = "";

    for (let i = 0; i < playersList.length; i++){
        let {name, score, tournamentNumber, slug} = playersList[i];

        if (score < 1) break;

        let prevRank = previousRanks[slug];
        console.log(name, i, prevRank);

        result += `${i + 1}. ${getRankingMovementEmoji(i, prevRank)} **${name}** : ${score} (${tournamentNumber} tournoi${tournamentNumber > 1 ? "s" : ""})\n`;
    }
    return result;
}

/**
 * 
 * @param {any[]} playersList 
 * @param {any[]} previousPlayerList
 */
export function processList(playersList, previousPlayerList, banList){

    let result = "";

    if (previousPlayerList){
        return processListComp(playersList, previousPlayerList);
    }

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