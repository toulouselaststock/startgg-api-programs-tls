import { readSchema, readLines, readJSONAsync } from "../../lib/lib.js";
import { client } from "../../lib/client.js";
import * as fs from 'fs';

const schema = readSchema(import.meta.url, "../GQLSchemas/PlayerName.txt");

export async function getPlayerName(client, slug){
    try {
        let res = await client.request(schema, {
            slug: slug
        });
        console.log(res);
        return res.user ? res : slug;
    } catch (e) {
        console.log(`/!\\ Request failed for slug ${slug}. Retrying.`);
        return getPlayerName(client, slug);
    }
    
}

export async function getPlayersNames(client, slugs){
    let players = []
    await Promise.all(slugs.map( (slug) => getPlayerName(client, slug)))
        .then(values => players = values);
    return players;
}

if (process.argv.length < 3 ){
    console.log("Usage : " + process.argv[0] + " " + process.argv[1] + " IDsListFilename");
    process.exit()
}

var IDs = readLines(process.argv[2]);

let playerNamesPromise = Promise.all( IDs.map( async id => {
    let res = await getPlayerName(client, id) 
    return {
        id: id,
        name: res ? res.user.player.gamerTag : null
    }
}))

let teams = await readJSONAsync('./Equipes.json');
let playerInfo = await playerNamesPromise;

let result = {}
for (let p of playerInfo){
    if (!p.name) {
        console.log(`WARNING : Couldn't retrieve name for ID ${p.id}`);
    }
    let team = teams[p.name];
    if (!team){
        console.log(`WARNING : Player ${p.name} does not seem to have a team in Equipes.json`);
    }
    result[p.id] = {
        name: p.name,
        team: team
    }
}

console.log(result);
console.log(Object.keys(result).length);

fs.writeFileSync('./SLT-Players.json', JSON.stringify(result));