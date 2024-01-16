import { getEventResults } from "../base/include/getEventResults.js";
import { readLines } from "../base/include/lib/lib.js";
import { usageMessage } from "@twilcynder/goombalib-js";
import { client } from "../base/include/lib/common.js";

if (process.argv.length < 3 ){
    console.error(usageMessage("iDsFilename"));
    process.exit()
}

var events = readLines(process.argv[2])
    .filter(s => !!s)
    .map( line => {
        let split = line.split(" ");
        return {slug: split[0], region: split[1]};
    });

var results = await Promise.all(events.map(event => getEventResults(client, event.slug).catch(err => {console.error("Slug " + event.slug + " kaput : ", err)})));

console.log(events);
console.log(results);