import { ArgumentsManager } from "@twilcynder/arguments-parser";
import { NamesCache } from "../namesCache.js";
import { readLines } from "../../base/include/lib/lib.js";

let names_cache = new NamesCache();

let argsManager = new ArgumentsManager()
    .addParameter("cache_filename", {})
    .addParameter("names_filename", {})

let {cache_filename, names_filename} = argsManager.parseArguments(process.argv.slice(2));

await names_cache.loadFromFile(cache_filename);

var names = readLines(names_filename)
    .filter(s => !!s)

let slugs = names_cache.lookupNames(names);

for (let s of slugs){
    process.stdout.write(s + "\n");
}