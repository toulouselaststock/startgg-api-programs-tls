import { initBot, processList, sendMessage } from './lib/functions.js';
import { PropertiesParser, SingleOptionParser, parseArguments } from "@twilcynder/goombalib-js";
import { loadInput } from "./lib/loadInput.js";
import fs from 'fs/promises'

let channel = "1204905113815351316";

let [inputFile, messageFilename, props] = parseArguments(process.argv.slice(2),
    new SingleOptionParser("-f"),
    new SingleOptionParser("-m"),
    new PropertiesParser()
)

let [data, client] = await Promise.all([loadInput(inputFile), initBot()])

let text = "";

if (messageFilename){
    let message = await fs.readFile(messageFilename).then(buf => buf.toString());
    console.log(`----- Message (read from ${messageFilename}------`);
    console.log(message);

    text = message + "\n";
}

text += (processList(data));

await sendMessage(client, channel, text);

await client.destroy();