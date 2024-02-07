import { PropertiesParser, SingleOptionParser, parseArguments } from "@twilcynder/goombalib-js";
import { processList } from "./functions.js";
import fs from 'fs';
import { loadInput } from "./loadInput.js";

let [inputFile, outputFile, props] = parseArguments(process.argv.slice(2),
    new SingleOptionParser("-f"),
    new SingleOptionParser("-o"),
    new PropertiesParser()
)

console.log("Waiting for result ...")
let rawText = await loadInput(inputFile);

console.log("Got something !");
console.log(rawText)

/*
let formattedText = processList(rawText);

if (outputFile){
    fs.writeFileSync("./out/" + outputFile, formattedText);
} else {
    console.log(formattedText);
}
*/