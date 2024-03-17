import { readJSONAsync } from "../../base/include/lib/lib.js";
import readline from "readline/promises"
import fs from "fs/promises";

if (process.argv.length < 3) {
    console.error("Usage : node main.js rankingFilename outputFilename [-s]");
    process.exit(1)
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let data = (await readJSONAsync(process.argv[2])).scores;
let regionMap = (process.argv[3] && await fs.stat(process.argv[3]).then(stats => stats.isFile()).catch(err => {})) ? await readJSONAsync(process.argv[3]) : {}

let skipAlreadyKnown = process.argv[4] == "-s"

for (let player of data){
    let currentReg = regionMap[player.slug];
    if (currentReg && skipAlreadyKnown) continue;
    let reg = await rl.question(player.name + " ? " + (currentReg ? `(actuel : ${currentReg}) ` : ""));

    if (!reg) continue;
    if (reg == "exit") break;

    regionMap[player.slug] = reg;
}

rl.close();

fs.writeFile(process.argv[3], JSON.stringify(regionMap, null, 2));