import { initBot, processList, sendMessage } from './lib/functions.js';
import { PropertiesParser, SingleOptionParser, parseArguments } from "@twilcynder/goombalib-js";
import { loadInput } from "./lib/loadInput.js";

let [inputFile, props] = parseArguments(process.argv.slice(2),
    new SingleOptionParser("-f"),
    new PropertiesParser()
)

let [data, client] = await Promise.all([loadInput(inputFile), initBot()])

let text = (processList(data));

await sendMessage(client, "1204905113815351316", text);

client.destroy();