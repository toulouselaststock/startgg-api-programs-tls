import {parse as parseCSV} from 'csv-parse';
import {createReadStream} from 'fs';
import {relurl} from '../base/include/lib/dirname.js  ';

const regions = ["HG", "TA", "HO", "AU"];
const wildcard_results = 3;

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

function Result(score, tournamentName){
    return {score, tournamentName};
}

class Player {
    constructor(){
        this.results = {
            regions: {}, 
            wildcard: []
        }
    }

    #addToWildCard(result){
        this.results.wildcard.push(result);
        this.results.wildcard.sort((a, b) => a.score - b.score);
        if (this.results.wildcard.length > wildcard_results){
            this.results.wildcard.pop();
        }
    }

    addResult(score, region, tournamentName){
        let regionResult = this.results.regions[region];
        if (!regionResult){
            this.results.regions[region] = Result(score, tournamentName);
        } else if ( score > regionResult.score){
            this.results.regions[region] = Result(score, tournamentName);
            this.#addToWildCard(regionResult);
        } else {
            this.#addToWildCard(Result(score, tournamentName));
        }
    }

    display(){
        console.log("Regions : ")
        for (let reg of regions){
            let rResult = this.results.regions[reg];
            if (rResult) console.log(" - Best result in", reg, " : ", rResult.score, "at", rResult.tournamentName);
        }
        console.log("Wildcards : ")
        for (let result of this.results.wildcard){
            console.log("- ", result.score, "at", result.tournamentName)
        }
    }

    /**
     * Computes the actual score for this player, following the point calculation rules of OcciTour
     * @returns {number} the total number of points
     */
    totalScore(){
        let total = 0;

        for (let reg of regions){
            let rResult = this.results.regions[reg];
            if (rResult) total += rResult.score;
        }
        for (let result of this.results.wildcard){
            total += result.score;
        }

        return total
    }
}

/**
 * Returns the player for a given slug, creating it if it doesn't exist
 * @param {Player} players 
 * @param {string} slug 
 * @returns {Player}
 */
function getPlayer(players, slug){
    let p = players[slug];
    if (!p) {
        p = new Player();
        players[slug] = p;
    }
    return p;
}

/**
 * Calculates the scores for all entrants of a list of events
 * @param {any[]} events 
 * @returns {Player[]} players
 */
export function processResults(events){
    if (!tiers.loaded) {
        console.error("Tiers are not loaded yet. Call initializeTiersData() before this function.");
    }

    let players = {};

    for (let ev of events){
        let eventData = ev.data;
        console.log("Processing tournament " + eventData.tournament.name);
        let tier = getTier(eventData.numEntrants);
        console.log(`${eventData.numEntrants} entrants (${tier.name} tier)`);
        for (let standing of eventData.standings.nodes){
            let user = standing.entrant.participants[0].user;
            if (!user || !user.slug){
                console.warn("Entrant", standing.entrant.id, `(${standing.entrant.name})`, "at event", ev.slug, "doesn't have a user account associated.");
                continue;
            }
            let slug = (standing.entrant.participants[0].user.slug).split('/')[1];
            let player = getPlayer(players, slug);
            let score = getScore(tier.points, standing.placement);
            
            player.addResult(score, ev.region, eventData.tournament.name);
        }
    }

    return players;
}