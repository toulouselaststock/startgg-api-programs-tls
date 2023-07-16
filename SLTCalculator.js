import {client} from './lib/common.js'
import {readSchema, readJSONAsync} from './lib/lib.js'
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

let playersDBPromise = readJSONAsync("SLT-Players.json");

let results = await Promise.all(events.map( eventSlug => {
    return pullEventResult(client, eventSlug);
}));
let players = await playersDBPromise;

console.log(results);

let placementPoints = {
    999999 : 0,
    65: 5,
    49: 7,
    33: 9,
    25: 11,
    17: 13,
    13: 15,
    9: 16,
    7: 17,
    5: 18,
    4: 19,
    3: 20,
    2: 21,
    1: 22
}

function getSPRPoints(predicted, real){
    let oneSPRValue = 2;
    let SPRPts = -1;
    for (let p in placementPoints){
        if (p == 9){
            oneSPRValue = 3;
        }

        if (p - 1 >= predicted) {
            return SPRPts == 0 ? 1 : (SPRPts < 0 ? 0 : SPRPts);
        }
        if (SPRPts >= 0){
            SPRPts += oneSPRValue;
        }
        if (p == real) {
            SPRPts = 0; 
        }
    }
}

function processEntrant(entrant){
    console.log(entrant.participants[0].player.gamerTag);
    console.log(entrant.standing.placement, entrant.initialSeedNum);
    let placementScore = placementPoints[entrant.standing.placement];
    let SPRScore = getSPRPoints(entrant.initialSeedNum, entrant.standing.placement);
    console.log(placementScore, SPRScore);
    return placementScore + SPRScore;
}

for (let event of results){
    if (!event) {
        console.log("WARNING : null event");
    }
    for (let entrant of event.event.entrants.nodes){
        let participant = entrant.participants[0];
        let userID = participant.user.discriminator;

        console.log(userID);

        let playerEntry = players[userID];
        if (playerEntry){
            //we in the slt
            if (!playerEntry.performances) playerEntry.performances = [];
            playerEntry.performances.push(processEntrant(entrant));
        }
    }
}

console.log(players);

let teams = {}
for (let player of Object.values(players)){
    console.log("Processing player", player.name);
    let results = player.performances
    if (!results){
        console.log("No perfs yet");
        continue;
    }
    
    results.sort((a, b) => b - a);
    results = results.slice(0, 3);
    console.log("Best performances are", results);

    player.score = results.reduce( (sum, r) => sum + r, 0);
    player.avg = player.score / results.length;

    console.log("Score :", player.score, ", average :", player.avg);

    let team = teams[player.team];
    if (team) {
        team.score += player.score;
        team.avg += player.avg;
    } else {
        teams[player.team] = {
            score: player.score,
            avg: player.avg
        }
    }
}

console.log(teams);