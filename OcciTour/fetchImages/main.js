import fs from 'fs';
import { getTournamentLogo } from '../../base/include/getTournamentImage.js';
import { client } from '../../base/include/lib/client.js';
import { StartGGDelayQueryLimiter } from '../../base/include/lib/queryLimiter.js';
import { extractSlug, getTournamentSlugFromEventSlug } from '../../base/include/lib/tournamentUtil.js';
import {extension} from 'mime-types'

if (process.argv.length < 3){
    console.error("Usage : node main.js <eventsFile> [<outDir>]")
    process.exit(1)
}

let outDir = process.argv[3] ?? "occitour-logos/"

/**@type {any[]} */
let data = JSON.parse(fs.readFileSync(process.argv[2]).toString());

let limiter = new StartGGDelayQueryLimiter();

let imgInfos = await Promise.all(data.map( async event => {
    /** @type {string} */
    let slug = extractSlug(event.slug);

    if (!slug || slug.startsWith(":")) return null;
    try {
        return Object.assign(await getTournamentLogo(client, getTournamentSlugFromEventSlug(slug), limiter), {slug, id: event.id});
    } catch (err){
        console.error("Couldn't fetch for slug", slug, ":", err);
        return null;
    }
}))

limiter.stop();

let typeMap = {}
await Promise.all(imgInfos.map(async event => {
    if (!event) return;
    console.log("Downloading logo for event", event.slug)
    let blob = await fetch(event.url)
        .then(res => res.blob())

    let ext = extension(blob.type);
    typeMap[event.id] = ext

    let filename = "./out/" + outDir + "/" + event.id + "." + ext;
    fs.writeFileSync(filename, Buffer.from(await blob.arrayBuffer()));
}))

fs.writeFileSync("./out/" + outDir + "/" + "imageTypes.json", JSON.stringify(typeMap));