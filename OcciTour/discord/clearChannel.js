import { initBot, clearChannel } from './lib/functions.js';

let channel = "1202647423533449297";

let client = await initBot();

await clearChannel(client, channel);
console.log("Successfully cleared", channel);
client.destroy();