import { getEventResults } from "../base/include/getEventResults.js";
import { getPlayerName } from "../base/include/getPlayerName.js"
import { readLines } from "../base/include/lib/lib.js";
import { usageMessage, SingleArgumentParser, parseArguments, OutputModeParser } from "@twilcynder/goombalib-js";
import { client } from "../base/include/lib/common.js";
import { initializeTiersData, processResults } from "./processScores.js";
import { StartGGDelayQueryLimiter } from "../base/include/lib/queryLimiter.js"
import fs from 'fs'

if (process.argv.length < 3 ){
    console.error(usageMessage("iDsFilename"));
    process.exit()
}

let [outputMode, eventListFilename] = parseArguments(process.argv.slice(2), 
    new OutputModeParser("log", "occitourScores.csv"),
    new SingleArgumentParser()    
)

var eventSlugs = readLines(process.argv[2])
    .filter(s => !!s)
    .map( line => {
        let split = line.split(" ");
        return {slug: split[0], region: split[1]};
    });

let limiter = new StartGGDelayQueryLimiter();

let initPromise = initializeTiersData();
var events = await Promise.all(eventSlugs.map(async event => ({slug: event.slug, region: event.region, data: await getEventResults(client, event.slug, undefined, limiter).catch(err => {console.error("Slug " + event.slug + " kaput : ", err)})})));
await initPromise;

let players = processResults(events);

players = await Promise.all(Object.entries(players).map( async ([slug, player] ) => {
    return {
        slug, 
        name: await getPlayerName(client, slug, limiter),
        score: player.totalScore(),
        results: player.results
    }
}))

limiter.stop();

players.sort((a, b) => b.score - a.score);

let resultString = ""

for (let player of players){
    resultString += player.name + "\t" + player.score + '\n';
}

if (outputMode.file){
    let filename = "./out/" + outputMode.file;
    let file = fs.createWriteStream(filename, {encoding: "utf-8"});

    file.write(resultString);
}

if (outputMode.stdout == "log"){
    for (let player of players){
        console.log(player.name + "\t" + player.score)
    }
} else if (outputMode.stdout == "string"){
    console.log(resultString);  
}