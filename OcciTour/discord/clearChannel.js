import { initBot, clearChannel } from './lib/functions.js';

let client = await initBot();
console.log(client.token);

await clearChannel(client, "1204905113815351316");

client.destroy();