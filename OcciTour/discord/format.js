import { PropertiesParser, SingleOptionParser, parseArguments } from "@twilcynder/goombalib-js";
import { processList } from "./lib/functions.js";
import fs from 'fs/promises';
import { loadInput } from "./lib/loadInput.js";

let [inputFile, outputFile, messageFilename, previousDataFilename, props] = parseArguments(process.argv.slice(2),
    new SingleOptionParser("-f"),
    new SingleOptionParser("-o"),
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

console.log("Waiting for result ...")
let data = await loadInput(inputFile);

let previousData;
if (previousDataFilename){
    previousData = await fs.readFile(previousDataFilename).then(buf => buf.toString()).then(JSON.parse);
}

text += processList(data, previousData);

if (outputFile){
    fs.writeFile("./out/" + outputFile, text);
} else {
    console.log(text);
}
