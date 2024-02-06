import { getEventResults } from "../base/include/getEventResults.js";
import { getPlayerName } from "../base/include/getPlayerName.js"
import { readLines } from "../base/include/lib/lib.js";
import { usageMessage, SingleArgumentParser, parseArguments, SingleOptionParser, SingleSwitchParser, Parser, PropertiesParser} from "@twilcynder/goombalib-js";
import { client } from "../base/include/lib/common.js";
import { initializeTiersData, processResults } from "./processScores.js";
import { StartGGDelayQueryLimiter } from "../base/include/lib/queryLimiter.js"
import fs from 'fs'

if (process.argv.length < 3 ){
    console.error(usageMessage("iDsFilename"));
    process.exit()
}

let [properties, outputfile, dataOptions, silent, printData, eventListFilename] = parseArguments(process.argv.slice(2), 
    new PropertiesParser(),
    new SingleOptionParser("-f"),
    new SingleOptionParser("-d"),
    new SingleSwitchParser("-s"),
    new SingleSwitchParser("-p"),
    new SingleArgumentParser(),
);

printData = printData || !outputfile;
let outputFormat = properties.format ?? "json";

let outputContent = dataOptions ? {
    "tournamentNumber": dataOptions.includes("n"),
    "resultsDetail": dataOptions.includes("d")
} : {};


let write = process.stdout.write;

if (silent)
    process.stdout.write = ()=>{};

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
    let name = await getPlayerName(client, slug, limiter);
    //console.log("======", name, "======")
    //player.display();
    return {
        slug, 
        name: name, 
        score: player.totalScore(),
        results: player.results
    }
}))

limiter.stop();

players.sort((a, b) => b.score - a.score);

/**
 * @param {{regions: {}; wildcard: []}} results 
 */
function countResults(results){
    return Object.keys(results.regions).length + results.wildcard.length;
}

let resultString;

if (outputFormat == "csv"){
    resultString = "";
    for (let player of players){
        if (outputContent.tournamentNumber){
            resultString += player.name + "\t" + player.score + "\t" + countResults(player.results) + '\n';
        } else {
            resultString += player.name + "\t" + player.score + '\n';
        }
    }
} else {
    resultString = JSON.stringify(outputContent.resultsDetail ? players : players.map(player => ({
        name: player.name,
        score: player.score,
        tournamentNumber: outputContent.tournamentNumber ? countResults(player.results) : undefined
    })));
}


if (outputfile){
    let filename = "./out/" + outputfile;
    let file = fs.createWriteStream(filename, {encoding: "utf-8"});

    file.write(resultString);
}

process.stdout.write = write;

if (printData) console.log(resultString);

//NOTES POUR LOUTPUT : 
//deux paramètres de format (json/csv) et contenu de la data, un paramètre de choix de fichier de sortie pour la data, un toggle pour afficher des logs et un pour afficher la data sur stdout
//pour le bot on voudra : format json, contenu basique, pas de fichier de sortie, pas de logs mais la data sur stdout  