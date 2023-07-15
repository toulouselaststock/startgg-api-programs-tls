import {client} from './lib/common.js'
import {readSchema} from './lib/lib.js'
import fs from 'fs';

const schema = readSchema(import.meta.url, "./GQLSchemas/EventStandings.txt");

let events = fs.readFileSync("./events.txt").toString('utf-8').replaceAll('\r', '').split('\n');

async function pullEventResult(client, event){
    console.log("Getting results from event", event);

    try {
        return await client.request(schema, {
            slug: event
        })
    } catch (e) {
        console.log("/!\\ Request failed, retrying.", "Message : ", e);
        return pullEventResult(client, event);
    }
}

let p = Promise.all(events.map( eventSlug => {
    return pullEventResult(client, eventSlug);
}))

console.log(p);

let results = await p;

console.log(results);