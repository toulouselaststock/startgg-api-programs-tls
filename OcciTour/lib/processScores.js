import {parse as parseCSV} from 'csv-parse';
import {createReadStream} from 'fs';
import {relurl} from '../../base/include/lib/dirname.js  ';

const regions = ["HG", "TA", "HO", "AU"];
const wildcard_results = 5;

const tierPointsFilename = "../tierPoints.csv";

/**
 * @typedef {{name: string, minimum: number, points: number[]}} Tier
 * @type {Tier[]}
 */
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

/**
 * 
 * @param {string} tournamentName 
 * @param {number} placement 
 * @param {Tier} tier 
 * @returns 
 */
function Result(tournamentName, placement, score){
    return {tournamentName, placement, score};
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

    /**
     * 
     * @param {string} region 
     * @param {string} tournamentName 
     * @param {number} placement 
     * @param {Tier} tier 
     */
    addResult(region, tournamentName, placement, tier){
        let score = getScore(tier.points, placement);
        let regionResult = this.results.regions[region];
        if (!regionResult){
            this.results.regions[region] = Result(tournamentName, placement, score);
        } else if ( score > regionResult.score){
            this.results.regions[region] = Result(tournamentName, placement, score);
            this.#addToWildCard(regionResult);
        } else {
            this.#addToWildCard(Result(tournamentName, placement, score));
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

function previousMonday(date){
    let prevMonday = date ? new Date(date) : new Date();
    prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() + 6) % 7);
    return prevMonday;
}

/**
 * @param {Date} date 
 * @returns {number}
 */
function getPseudoDayOfYear(date){
    return date.getMonth() * 31 + date.getDate();
}

/**
 * @param {Date} d1 
 * @param {Date} d2 
 */
function compareDates(d1, d2){
    return getPseudoDayOfYear(d1) == getPseudoDayOfYear(d2);
}


/**
 * Calculates the scores for all entrants of a list of events
 * @param {any[]} events 
 * @param {boolean} exclude_last_week 
 * @returns {Object<string, Player>} players
 */
export function processResults(events, exclude_last_week = false){
    if (!tiers.loaded) {
        console.error("Tiers are not loaded yet. Call initializeTiersData() before this function.");
        return {}
    }

    events = events.reverse();

    let players = {};

    let lastMonday;
    let current_monday = previousMonday(new Date());

    for (let ev of events){
        let eventData = ev.data;

        let date = new Date(eventData.startAt * 1000);

        console.log("Processing tournament " + eventData.tournament.name, "on date", date);
        
        if (exclude_last_week){
            let monday = previousMonday(date);

            if (getPseudoDayOfYear(monday) >= getPseudoDayOfYear(current_monday)){
                console.log("Skipping because future event");
                continue;
            }

            if (!lastMonday) lastMonday = monday;

            if (compareDates(monday, lastMonday)){
                console.log("Skipping because excluding last week");
                continue;
            }
        }

        let tier = getTier(eventData.numEntrants);
        console.log(`${eventData.numEntrants} entrants (${tier.name} tier)`);

        if (eventData.standings.nodes.length < 1){
            console.log("---> No results yet");
        }
        for (let standing of eventData.standings.nodes){

            let user = standing.entrant.participants[0].user;
            if (!user || !user.slug){
                console.warn("Entrant", standing.entrant.id, `(${standing.entrant.name})`, "at event", ev.slug, "doesn't have a user account associated.");
                continue;
            }
            let slug = (standing.entrant.participants[0].user.slug).split('/')[1];
            let player = getPlayer(players, slug);
            
            player.addResult(ev.region, eventData.tournament.name, standing.placement, tier);
        }
    }

    return players;
}