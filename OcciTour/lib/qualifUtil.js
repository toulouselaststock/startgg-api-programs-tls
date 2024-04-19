import { regions } from "./common.js";
import { Player } from "./processScores.js";

const MIN_DIFF_REGIONS = 2;

/**
 * @param {{[slug: string]: string}} regionsMap 
 * @returns {( player: Player & {slug: string} ) => number} 
 */
export function makeQualifCalculator(regionsMap){
    let regionalBestTaken = {};
    let MEQualifs = 0;

    let regional2ndTaken = {};
    let PIQualifs = 0;

    
    return player => {
        if (Object.keys(player.results.regions).length < MIN_DIFF_REGIONS){
            return 5;
        }

        let region = regionsMap[player.slug];
        if (!regionalBestTaken[region] && regions[region]){
            console.log("REGIONAL BEST WAS NOT TAKEN")
            regionalBestTaken[region] = true;
            return 1;
        }

        let isRegional2nd = false;
        if (!regional2ndTaken[region] && regions[region]){
            console.log("REGIONAL 2ND WAS NOT TAKEN")
            regional2ndTaken[region] = true;
            isRegional2nd = true;
        }

        if (MEQualifs < 8){
            console.log("THERE WAS A SPOT IN MAIN EVENT", MEQualifs);
            MEQualifs++;
            return 2;
        }

        if (isRegional2nd){
            console.log("QUALIFIED TO PLAY IN BECAUSE REGIONAL 2ND")
            PIQualifs++;
            return 3;
        }

        if (PIQualifs < 4 + Object.values(regional2ndTaken).length){
            console.log("THERE WAS A SPOT IN QUALIFS")
            PIQualifs++;
            return 4;
        }

        return 0;
    }

}