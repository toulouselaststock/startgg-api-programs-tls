import { readJSONAsync } from "../../base/include/lib/lib.js";
import readline from "readline/promises"
import {writeFile} from 'fs/promises'

if (process.argv.length < 4) {
    console.error("Usage : node main.js rankingFilename outputFilename [regionMapFilename [-s]]");
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let data = await readJSONAsync(process.argv[2]);
let regionMap = process.argv[4] ? await readJSONAsync(process.argv[3]) : {}
let skipAlreadyKnown = process.argv[5] == "-s"

for (let player of data){
    let currentReg = regionMap[player.slug];
    if (currentReg && skipAlreadyKnown) continue;
    let reg = await rl.question(player.name + " ? " + (currentReg ? `(actuel : ${currentReg}) ` : ""));

    if (!reg) continue;
    if (reg == "exit") break;

    regionMap[player.slug] = reg;
}

rl.close();

writeFile(process.argv[3], JSON.stringify(regionMap, null, 4));