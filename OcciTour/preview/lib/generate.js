import {playersListToMap} from "./util.js"

export const regions = {
    "HG": "Mercure",
    "TA": "Tantale",
    "HO": "Helium",
    "AU": "Or"
}

/**
 * @param {number} placement 
 * @returns {string}
 */
function getPlacementString(placement){
    return ""+placement+
        ((placement < 20 && placement > 10) ? "th" : 
        (placement % 10 == 1) ? "st" : 
        (placement % 10 == 2) ? "nd" :
        (placement % 10 == 3) ? "rd" :
        "th");
}

function resultText(result){
    return `${getPlacementString(result.placement)} → ${result.score} pts`
}

function tournamentHTML(result, data){
    return `<span class = "inline-score">(${resultText(result)})</span> <span>` + data.tournaments[result.tournamentName] + "</span>"
}

/**
 * 
 * @param {{regions: {[x: string]: {score: number, tournamentName: string}}, wildcard: {score: number, tournamentName: string}[]}} results 
 */
function resultsHTMl(results, data){
    let res = "Meilleurs tournois : <ul>"
    for (let k in regions){
        res += `<li><div class = "tournament">Zone ${regions[k]} : ${results.regions[k] ? tournamentHTML(results.regions[k], data) : "Aucun"}</li>`
    }
    res += "</ul>Autres tournois (5 meilleurs) : <ul>";
    for (let result of results.wildcard.reverse()){
        res += "<li>" + tournamentHTML(result, data) + "</li>"
    }
    return res;
}

function movementHTML(currentRank, slug, previousRanksMap){
    let previousRank = previousRanksMap[slug];
    let diff = previousRank != undefined ? previousRank - currentRank : null;

    let [cssClass, text] = 
        diff === null ? ["white", "NEW"] : 
        diff === 0 ? ["white", "+0"] : 
        diff < 0 ? ["red", diff] :
        ["green", "+"+diff];

    return `<div class = "${cssClass}">(${text})</div>`
}

export function generateTable(data){
    if (!data){
        console.error("Data not found !");
    } else {
        let result = ""
        let scores = data.scores;
        let previousRanksMap = playersListToMap(data.previousScores);

        for (let i = 0; i < scores.length; i++){
            let player = scores[i];
            if (player.score < 1) break;
            result += `
                <tr class = "player small_row">
                    <td class = "movement-cell">${previousRanksMap ? movementHTML(i, player.slug, previousRanksMap) : ""}</td>
                    <td class = "rank-cell">${i + 1}</td>
                    <td class = "player_name_cell">
                        <div class = "dropdown_button_container"><div class = "dropdown_button">►</div></div>
                        <div class = "player_name">${player.name}</div>
                    </td>
                    <td>${player.score}</td>
                    <td>${player.tournamentNumber}</td>
                </tr>
                <tr class = "player view_row">
                    <td colspan = "5" class = "player_view_cell">
                        <div class = "player_view">
                            Score total : ${player.score}<br>
                            ${resultsHTMl(player.results, data)}
                        </div>
                    </td>
                </tr>
            `
        }
    
        return result;
    }
}

