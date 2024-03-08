import { SingleArgumentParser, parseArguments } from '@twilcynder/arguments-parser';
import { initBot, clearChannel } from './lib/functions.js';

let defaultChannel = "1202647423533449297";

let [channel] = parseArguments(process.argv.slice(2), new SingleArgumentParser());

channel = channel ?? defaultChannel;

let client = await initBot();

await clearChannel(client, channel);
console.log("Successfully cleared", channel);
client.destroy();