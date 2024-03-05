import { ArgumentsManager } from "@twilcynder/arguments-parser";
import { NamesCache } from "../namesCache.js";
import { readLines } from "../../base/include/lib/lib.js";

let names_cache = new NamesCache();

let argsManager = new ArgumentsManager()
    .addParameter("cache_filename", {})
    .addParameter("names_filename", {})

let {cache_filename, names_filename} = argsManager.parseArguments(process.argv.slice(2));

await names_cache.loadFromFile(cache_filename);

var eventSlugs = readLines(names_filename)
    .filter(s => !!s)

console.log(cache_filename);
console.log(names_cache);
console.log(names_cache.lookupNames(eventSlugs));