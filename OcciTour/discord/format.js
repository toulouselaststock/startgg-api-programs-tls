import { PropertiesParser, SingleOptionParser, parseArguments } from "@twilcynder/goombalib-js";
import { processList } from "./lib/functions.js";
import fs from 'fs/promises';
import { loadInput } from "./lib/loadInput.js";

let [inputFile, outputFile, messageFilename, regionsFilename, props] = parseArguments(process.argv.slice(2),
    new SingleOptionParser("-f"),
    new SingleOptionParser("-o"),
    new SingleOptionParser("-m"),
    new SingleOptionParser("-r"),
    new PropertiesParser()
)

let text = "";

if (messageFilename){
    let message = await fs.readFile(messageFilename).then(buf => buf.toString());
    console.log(`----- Message (read from ${messageFilename}------`);
    console.log(message);

    text = message + "\n";
}

let regions = undefined;
if (regionsFilename){
    regions = await fs.readFile(regionsFilename).then(buf => buf.toString()).then(json => JSON.parse(json));
}

console.log(regions);

console.log("Waiting for result ...")
let data = await loadInput(inputFile);

let scores = data.scores;
let previousData = data.previousScores;

text += processList(scores, previousData, regions);

if (outputFile){
    fs.writeFile("./out/" + outputFile, text);
} else {
    console.log(text);
}
