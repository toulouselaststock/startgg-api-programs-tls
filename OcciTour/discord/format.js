import { SingleOptionParser, parseArguments } from "@twilcynder/goombalib-js";
import { processList } from "./functions.js";
import fs from 'fs';

let [inputFile, outputFile] = parseArguments(process.argv.slice(2),
    new SingleOptionParser("-f"),
    new SingleOptionParser("-o")
)

let rawText = fs.readFileSync(inputFile).toString();

let formattedText = processList(rawText);

if (outputFile){
    fs.writeFileSync("./out/" + outputFile, formattedText);
} else {
    console.log(formattedText);
}