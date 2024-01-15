import {client} from './base/include/lib/common.js'
import {readJSONAsync} from './base/include/lib/lib.js'
import fs from 'fs';

import {processEvents, calcTeamScores} from './SLT Scores/processSLTData.js'
import {pullEventResult} from './SLT Scores/pullData.js'

let events = fs.readFileSync("./events.txt").toString('utf-8').replaceAll('\r', '').split('\n');

let playersDBPromise = readJSONAsync("./SLT Data/SLT-Players.json");
let results = await Promise.all(events.map( eventSlug => {
    return pullEventResult(client, eventSlug);
}));
let players = await playersDBPromise;

console.log(results);

processEvents(results, players);
console.log(players);

let teams = calcTeamScores(players);
console.log(teams);

fs.writeFile('./SLT Scores/SLT-Players-Performance.json', JSON.stringify(players, null, 4), () => {});
fs.writeFile('./SLT Scores/SLT-Teams-Performance.json', JSON.stringify(teams, null, 4), () => {});