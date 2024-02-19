import { initBot, clearChannel } from './lib/functions.js';

let channel = "1204905113815351316";

let client = await initBot();

await clearChannel(client, channel);
console.log("Successfully cleared", channel);
client.destroy();