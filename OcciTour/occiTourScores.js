import { getEventResults } from "../base/include/getEventResults.js";
import { readLines } from "../base/include/lib/lib.js";
import { usageMessage } from "@twilcynder/goombalib-js";
import { client } from "../base/include/lib/common.js";
import { initializeTiersData, processResults } from "./processScores.js";
import { StartGGDelayQueryLimiter } from "../base/include/lib/queryLimiter.js"

if (process.argv.length < 3 ){
    console.error(usageMessage("iDsFilename"));
    process.exit()
}

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

limiter.stop();