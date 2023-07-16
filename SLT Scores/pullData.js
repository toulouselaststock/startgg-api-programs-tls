import {readSchema} from  '../lib/lib.js'

const schema = readSchema(import.meta.url, "../GQLSchemas/EventStandings.txt");

export async function pullEventResult(client, event){
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