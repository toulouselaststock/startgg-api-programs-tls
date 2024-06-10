import { initBot, processList, sendMessage } from './lib/functions.js';
import { PropertiesParser, SingleOptionParser, parseArguments } from "@twilcynder/arguments-parser";
import { loadInput } from "../../base/include/lib/loadInput.js";
import fs from 'fs/promises'

let defaultChannel = "1202647423533449297";

let [inputFile, messageFilename, previousDataFilename, channel, props] = parseArguments(process.argv.slice(2),
    new SingleOptionParser("-f"),
    new SingleOptionParser("-m"),
    new SingleOptionParser("-p"),
    new SingleOptionParser("-c", defaultChannel),
    new PropertiesParser()
)

console.log("Channel : ", channel);

let text = "";

if (messageFilename){
    let message = await fs.readFile(messageFilename).then(buf => buf.toString());
    console.log(`----- Message (read from ${messageFilename}------`);
    console.log(message);

    text = message + "\n";
}

let [data, client] = await Promise.all([loadInput(inputFile), initBot()])

let scores = data.scores;
let previousData = data.previousScores;


text += (processList(scores, previousData));

await sendMessage(client, channel, text);

await client.destroy();