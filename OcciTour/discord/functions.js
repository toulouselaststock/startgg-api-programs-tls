import { Client } from "discord.js";

/**
 * 
 * @param {string} listText 
 */
export function processList(listText){
    let arr = listText.split(/\r?\n/);
    let result = "";
    for (let i = 0; i < arr.length; i++){
        let [name, score, tournamentsNumber] = arr[i].split("\t");
        result += `${i + 1}. **${name}** : ${score} (${tournamentsNumber} tournois)\n`;
    }
    console.log(result);
}

/**
 * 
 * @param {Client} client 
 * @param {string} channelID 
 * @param {string} list 
 */
export async function sendMessage(client, channelID, message){
    let channel = await client.channels.fetch(channelID);
    channel.send(message);
}