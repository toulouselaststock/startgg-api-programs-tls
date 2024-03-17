import fs from 'fs/promises'
import {generateTable} from './lib/generate.js';

if (process.argv.length < 3){
    console.error("Usage : node main.js <ranking_json> [<outputFile>]");
    process.exit(1);
}

let [template, data] = await Promise.all([
    fs.readFile(new URL("./template/index.html", import.meta.url))
        .then(buf => buf.toString())
        .catch(err => {console.error("Couldn't open template :", err) ; process.exit(2)}),
    fs.readFile(process.argv[2])
        .then(buf => JSON.parse(buf.toString()))
        .catch(err => {console.error("Couldn't open data :", err) ; process.exit(2)}),
])

let content = generateTable(data);

let result = template.replace("<!--TEMPLATE-->", content);

let outputFilename = process.argv[3] ?? new URL("./page/index.html", import.meta.url);
fs.writeFile(outputFilename, result);

console.log(" ====== GENERATED RANKING PREVIEW IN", outputFilename instanceof URL ? outputFilename.pathname : outputFilename, "========")