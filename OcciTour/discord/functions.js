import { Client } from "discord.js";
import { join } from "path"

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

function loadToken(path){
    path = path ?? import.meta.url;
    let token;
    try {
        let res = fs.readFileSync(join(path, "secrets.json"));
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
}

async function initBot(secretsPath){
    let token = loadToken(secretsPath);
    let client = new Client({intents :  ["Guilds", "GuildMessages", "MessageContent", "GuildMessageReactions"]})
    await client.login(token);
    return client;
}