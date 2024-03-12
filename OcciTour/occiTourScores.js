import { getEventResults } from "../base/include/getEventResults.js";
import { getPlayerName } from "../base/include/getPlayerName.js"
import { readLines } from "../base/include/lib/lib.js";
import { ArgumentsManager} from "@twilcynder/arguments-parser";
import { client } from "../base/include/lib/common.js";
import { initializeTiersData, processResults } from "./lib/processScores.js";
import { StartGGDelayQueryLimiter } from "../base/include/lib/queryLimiter.js"
import fs from 'fs'
import { NamesCache } from "./lib/namesCache.js";
import { loadEvent } from "./lib/loadEvents.js";

// =================================================================== //
// Parser Config


let parser = new ArgumentsManager()
    .enableHelpParameter()
    .addOption("--format", {
        dest: "outputFormat",
        description: "The output format. Either json (default) or csv"
    })
    .addOption(["-o", "--output_file"],{
        dest: "outputfile",
        description: "A file to save the output to. If not specified, the output will be sent to the std output."
    })
    .addOption(["-d", "--data"], {
        dest: "dataOptions",
        description: "Set of switches describing the content of the output. The value given can contain : \n\
            n : output will include the tournaments number for each player\n\
            d : output will include the detail of each result that counted \n\
            s : output will include the slug instead of the name for each player (makes the program dramatically faster) \n\
            u : output will include both the slug and the name of each player \
        "
    })
    .addOption(["--save-names-cache"], {
        description: "Specifies a file to save player names to"
    })
    .addOption(["--load-names-cache"], {
        description: "Specifies a file to load player names from"
    })
    .addOption(["--names-cache"], {
        description: "Specifies a file to save to and load player names from"
    })
    .addSwitch(["-s", "--silent"], {
        description: "If present, nothing will be printed except for the actual output"
    })
    .addSwitch(["-p", "--printData"], {
        description: "If present, the output will be printed to stdout even if an output file was specified"
    })
    .addSwitch(["-e", "--exclude_last_week"], {
        description: "Excludes the latest week from the ranking (useful to make ranking diffs)"
    })
    .addParameter("eventListFilename", {
        description: "Path to a file containing a list of event slugs"
    }, false)
    .setAbstract("Calculates the score for every entrant in the Occi'Tour, given a list of included events")

/*
let [outputFormat, outputfile, dataOptions, silent, printData, eventListFilename] = parseArguments(process.argv.slice(2), 
    new SingleOptionParser("--format", "json"),
    new SingleOptionParser("-o"),
    new SingleOptionParser("-d"),
    new SingleSwitchParser("-s"),
    new SingleSwitchParser("-p"),
    new SingleArgumentParser(),
);
*/

// =================================================================== //
// Parsing arguments

let args = parser.parseArguments(process.argv.slice(2));
let {outputFormat, outputfile, dataOptions, silent, printData, eventListFilename, exclude_last_week} = args;

const cacheMode = {
    save: args["save-names-cache"] ?? args["names-cache"],
    load: args["load-names-cache"] ?? args["names-cache"]
}
const useCache = cacheMode.load || cacheMode.save;

printData = printData || !outputfile;

let outputContent = dataOptions ? {
    "tournamentNumber": dataOptions.includes("n"),
    "resultsDetail": dataOptions.includes("d"),
    "slugOnly": dataOptions.includes("s"),
    "slug": dataOptions.includes("u")
} : {};


let write = process.stdout.write;
if (silent) {
    process.stdout.write = ()=>{};
}

// =================================================================== //
// Loading events

var eventSlugs = readLines(eventListFilename)
    .filter(s => !!s)
    .map( line => {
        let split = line.split("\t");
        return {slug: split[1], region: split[0]};
    });

// ========================================================================== //
// Loading names cache

let names_cache = new NamesCache();
let names_cache_promise;
if (cacheMode.load){
    names_cache_promise = names_cache.loadFromFile(cacheMode.load);
}

// ========================================================================== //
// Loading events and pts point Tiers

let limiter = new StartGGDelayQueryLimiter();

let initPromise = initializeTiersData();
console.log(eventSlugs);
var events = await Promise.all(eventSlugs.map(async event => ({
    slug: event.slug, region: event.region, 
    data: await loadEvent(client, event.slug, limiter)
})));
await initPromise;
await names_cache_promise;

// ========================================================================== //
// Calculating scores

let players = processResults(events, exclude_last_week);

// ========================================================================== //
// Processing results into sorted player data

function getName(slug){
    return useCache ? names_cache.getName(client, slug, limiter) : getPlayerName(client, slug, limiter, true);
}

let current_count = 0;
let entries = Object.entries(players);
players = await Promise.all(entries.map( async ([slug, player]) => {

    let score = player.totalScore();
    let name;
    if (outputContent.slugOnly){
        name = slug;
    } else {
        name = score > 0 ? await getName(slug) : "noname";
        current_count ++;
        console.log("Fetched name for player " + slug + ` (${current_count}/${entries.length})`);
    }

    player.results.wildcard.reverse();

    return {
        slug, 
        name, 
        score,
        results: player.results
    }
}))
limiter.stop();

players.sort((a, b) => b.score - a.score);

// ========================================================================== //
// Producing output

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
    resultString = JSON.stringify(players.map(player => ({
        slug: outputContent.slug ? player.slug : undefined,
        name: player.name,
        score: player.score,
        tournamentNumber: outputContent.tournamentNumber ? countResults(player.results) : undefined,
        results: outputContent.resultsDetail ? player.results : undefined
    })), null, outputFormat == "prettyjson" ? 4 : undefined);
}

// ========================================================================== //
// Saving names cache
if (cacheMode.save){
    names_cache.saveToFile(cacheMode.save);
}

// ========================================================================== //
// Putting the output somewhere

if (outputfile){
    let filename = "./out/" + outputfile;
    let file = fs.createWriteStream(filename, {encoding: "utf-8"});

    file.write(resultString);
}

process.stdout.write = write;

if (printData) console.log(resultString);

//node OcciTour/occiTourScores.js -d n OcciTour/events.txt -s | node .\OcciTour\discord\post.js

//node OcciTour/occiTourScores.js OcciTour/events.txt -d dnu -o OcciTour/current.json --names-cache "data/occitourNamesCache$(date +%F).json"
