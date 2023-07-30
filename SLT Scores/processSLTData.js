import {getSPRPoints, getPlacementPoints} from './pointCalculations-limitbreak.js'

export function processEntrant(entrant){
    console.log(entrant.participants[0].player.gamerTag);
    console.log(entrant.standing.placement, entrant.initialSeedNum);
    let placementScore = getPlacementPoints(entrant.standing.placement);
    let SPRScore = getSPRPoints(entrant.initialSeedNum, entrant.standing.placement);
    console.log(placementScore, SPRScore);
    return placementScore + SPRScore;
}

export function processEvents(eventResults, players) {
    for (let event of eventResults){
        if (!event) {
            console.log("WARNING : null event");
            continue;
        }

        console.log("Processing event", event.event.slug);
        let count = 0;

        for (let entrant of event.event.entrants.nodes){
            let participant = entrant.participants[0];
            let userID = participant.user.discriminator;
    
            let playerEntry = players[userID];
            if (playerEntry){
                //we in the slt
                count++;
                if (!playerEntry.performances) playerEntry.performances = [];
                playerEntry.performances.push(processEntrant(entrant));
            }
        }
        console.log(count, "SLT participants entered this event");
    }
}

export function calcTeamScores(players){
    let teams = {}
    let count = 0;
    for (let player of Object.values(players)){
        console.log("Processing player", player.name);
        let results = player.performances
        if (!results){
            console.log("No perfs yet");
            continue;
        }
        
        count ++;

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
            team.activePlayers++;
        } else {
            teams[player.team] = {
                score: player.score,
                avg: player.avg,
                activePlayers: 1
            }
        }
    }

    console.log(count, " SLT participants have at least one registered tournament.");

    return teams;
}