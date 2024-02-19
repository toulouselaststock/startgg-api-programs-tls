import { PropertiesParser, SingleOptionParser, parseArguments } from "@twilcynder/goombalib-js";
import { processList } from "./lib/functions.js";
import fs from 'fs';
import { loadInput } from "./lib/loadInput.js";

let [inputFile, outputFile, props] = parseArguments(process.argv.slice(2),
    new SingleOptionParser("-f"),
    new SingleOptionParser("-o"),
    new PropertiesParser()
)

console.log("Waiting for result ...")
let data = await loadInput(inputFile);

let formattedText = processList(data);

if (outputFile){
    fs.writeFileSync("./out/" + outputFile, formattedText);
} else {
    console.log(formattedText);
}
