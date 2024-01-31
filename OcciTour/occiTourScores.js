import { getEventResults } from "../base/include/getEventResults.js";
import { getPlayerName } from "../base/include/getPlayerName.js"
import { readLines } from "../base/include/lib/lib.js";
import { usageMessage, SingleArgumentParser, parseArguments, OutputModeParser, SingleOptionParser, SingleSwitchParser } from "@twilcynder/goombalib-js";
import { client } from "../base/include/lib/common.js";
import { initializeTiersData, processResults } from "./processScores.js";
import { StartGGDelayQueryLimiter } from "../base/include/lib/queryLimiter.js"
import fs from 'fs'

if (process.argv.length < 3 ){
    console.error(usageMessage("iDsFilename"));
    process.exit()
}

let [outputMode, verbose, eventListFilename] = parseArguments(process.argv.slice(2), 
    new OutputModeParser("string", "occitourScores.csv"),
    new SingleSwitchParser("-v"),
    new SingleArgumentParser(),
)

var eventSlugs = readLines(eventListFilename)
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

/**
 * @param {{regions: {}; wildcard: []}} results 
 */
function countResults(results){
    return Object.keys(results.regions).length + results.wildcard.length;
}

for (let player of players){
    if (verbose){
        resultString += player.name + "\t" + player.score + "\t" + countResults(player.results) + '\n';
    } else {
        resultString += player.name + "\t" + player.score + '\n';
    }
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