import {parse as parseCSV} from 'csv-parse';
import {createReadStream} from 'fs';
import { relurl } from '../base/include/lib/dirname.js  ';

const regions = ["HG", "TA", "HO", "AU"];

const tierPointsFilename = "tierPoints.csv";
const tiers = [
    {name: "S", minimum: 113},
    {name: "A", minimum: 81},
    {name: "B", minimum: 57},
    {name: "C", minimum: 0}
]

export async function initializeTiersData(){
    let result = await new Promise((resolve, reject) => {
        let parser = createReadStream(relurl(import.meta.url, tierPointsFilename))
        .pipe(parseCSV({delimiter: '\t', cast: true}, (err, data) => {
            resolve(data);
        }));
    })

    for (let t of tiers){
        t.points = [];
    }

    for (let row of result){
        for (let i = 0; i < row.length; i++){
            if (!row[i]) row[i] = 0;
            tiers[i].points.push(row[i]);
        }
    }

    console.log("Loaded tier data");

    tiers.loaded = true;
}

function getTier(numEntrants){
    for (let t of tiers){
        if (numEntrants >= t.minimum) return t;
    }
}

const placements = [1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256];
/**
 * Returns the score given by a performance, given a certain points repartition
 * @param {number[]} tierPts points repartition, i.e. how many points for each possible placement
 * @param {number} placement 
 * @returns {number} score
 */
function getScore(tierPts, placement){
    for (let i = 0; i < tierPts.length; i++){
        if (placement <= placements[i]) return tierPts[i];
    }
    return 0;
}

class Player {
    constructor(slug){
        this.slug = slug;
        this.results = {
            regions: {},
            wildcard: []
        }
    }
}

function getPlayer(players, slug){
    let p = players[slug];
    if (!p) {
        p = new Player();
        players[slug] = p;
    }
    return p;
}

export function processResults(events){
    if (!tiers.loaded) {
        console.error("Tiers are not loaded yet. Call initializeTiersData() before this function.");
    }

    let players = {};

    for (let ev of events){
        ev = ev.data;
        console.log("Processing tournament " + ev.tournament.name);
        let tier = getTier(ev.numEntrants);
        console.log(`${ev.numEntrants} entrants (${tier.name} tier)`);
        for (let standing of ev.standings.nodes){
            let slug = (standing.entrant.participants[0].user.slug).split('/')[1];
            let player = getPlayer(players, slug);
            let score = getScore(tier.points, standing.placement);
            console.log(score);
        }
    }
}