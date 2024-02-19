import { initBot, processList, sendMessage } from './lib/functions.js';
import { PropertiesParser, SingleOptionParser, parseArguments } from "@twilcynder/goombalib-js";
import { loadInput } from "./lib/loadInput.js";
import fs from 'fs/promises'

let channel = "1204905113815351316";

let [inputFile, messageFilename, previousDataFilename, props] = parseArguments(process.argv.slice(2),
    new SingleOptionParser("-f"),
    new SingleOptionParser("-m"),
    new SingleOptionParser("-p"),
    new PropertiesParser()
)

let text = "";

if (messageFilename){
    let message = await fs.readFile(messageFilename).then(buf => buf.toString());
    console.log(`----- Message (read from ${messageFilename}------`);
    console.log(message);

    text = message + "\n";
}

let [data, client] = await Promise.all([loadInput(inputFile), initBot()])

let previousData;
if (previousDataFilename){
    previousData = await fs.readFile(previousDataFilename).then(buf => buf.toString()).then(JSON.parse);
}
text += (processList(data, previousData));

await sendMessage(client, channel, text);

await client.destroy();