import {parse as parseCSV} from 'csv-parse';
import {createReadStream} from 'fs';
import {relurl} from '../../base/include/lib/dirname.js  ';
import { generateUniqueID } from '../../base/include/lib/jsUtil.js';

const regions = ["HG", "TA", "HO", "AU"];
const wildcard_results = 5;

const tierPointsFilename = "../tierPoints.csv";

/**
 * @typedef {{name: string, minimum: number, points: number[]}} Tier
 * @type {Tier[]}
 */
const tiers = [
    {name: "S+", minimum: 145},
    {name: "S",  minimum: 113},
    {name: "A",  minimum: 81},
    {name: "B",  minimum: 57},
    {name: "C",  minimum: 0}
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

export class Player {
    constructor(){
        this.results = {
            regions: {}, 
            wildcard: []
        }
    }

    #addToWildCard(result){
        this.results.wildcard.push(result);
        this.results.wildcard.sort((a, b) => b.score - a.score);

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
 * @typedef {{[slug: string]: Player}} PlayerMap
 */ 

/**
 * @typedef {{
 *  tournaments : {[slug: string]: string},
 *  scores : T,
 *  previousScores?  :  T
 * }} Result<T>
 * @template  T
 */ 

function processStanding(scores, slug, event, placement, tier){
    let player = getPlayer(scores, slug);
    player.addResult(event.region, event.data.tournament.id, placement, tier);
}

/**
 * Calculates the scores for all entrants of a list of events
 * @param {any[]} events 
 * @param {{name: string, slug: string}[]} banList 
 * @param {boolean} exclude_last_week 
 * @returns {Result<PlayerMap>} players
 */
export function processResults(events, banList, exclude_last_week = false, export_event_info = false){
    console.log("BAN LIST", banList)

    if (!tiers.loaded) {
        console.error("Tiers are not loaded yet. Call initializeTiersData() before this function.");
        return {}
    }

    let result = {
        tournaments: {},
        scores: {},
        previousScores: {}
    }

    events = events.reverse();

    let lastMonday;
    let current_monday = previousMonday(new Date());

    for (let ev of events){
        let eventData = ev.data;

        if (!eventData){
            console.warn(`No data for event ${ev.name}`);
            continue;
        }

        eventData.tournament.id = eventData.tournament.id ?? generateUniqueID();
        result.tournaments[eventData.tournament.id] = eventData.tournament.name;

        if (export_event_info) {
            ev.name = eventData.tournament.name;
            ev.id = eventData.tournament.id;
        }

        let date = new Date(eventData.startAt ? eventData.startAt * 1000 : ev.date);

        console.log("Processing tournament " + eventData.tournament.name, "on date", date);
        
        let count_in_previous;
        if (exclude_last_week){
            let monday = previousMonday(date);

            if (getPseudoDayOfYear(monday) >= getPseudoDayOfYear(current_monday)){
                console.log("Not counting in previous ranking because future event");
                count_in_previous = false;
            } else {
                if (!lastMonday) lastMonday = monday;

                if (compareDates(monday, lastMonday)){
                    console.log("Not counting in previous because excluding last week");
                    count_in_previous = false;

                    if (export_event_info) ev.new = true;
                } else {
                    count_in_previous = true;
                }
            }
        }

        let tier = getTier(eventData.numEntrants);
        console.log(`${eventData.numEntrants} entrants (${tier.name} tier)`);

        if (eventData.standings.nodes.length < 1){
            console.log("---> No results yet");
            continue;
        }

        ev.tier = tier.name;

        for (let standing of eventData.standings.nodes){

            let user = standing.entrant.participants[0].user;
            if (!user || !user.slug){
                console.warn("Entrant", standing.entrant.id, `(${standing.entrant.name})`, "at event", ev.slug, "doesn't have a user account associated.");
                continue;
            }
            let slug = (standing.entrant.participants[0].user.slug).split('/')[1];

            let banned = false;
            for (let player of banList){
                if (player.slug == slug){
                    console.log("ITSA MATCH")
                    banned = true;
                }
            }
            if (banned){
                console.log("PLAYER WAS BANNED ABORT NOW")
                continue;
            }

            processStanding(result.scores, slug, ev, standing.placement, tier);
            if (count_in_previous){
                processStanding(result.previousScores, slug, ev, standing.placement, tier);
            }
        }
    }

    return result;
}