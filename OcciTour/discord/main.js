import { initBot, sendMessage } from './functions.js';

let client = await initBot();

sendMessage(client, "403186389673443328", "Test");

console.log(client);

client.destroy();