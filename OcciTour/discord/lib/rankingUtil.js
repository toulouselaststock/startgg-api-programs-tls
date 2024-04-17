import { regions } from "../../lib/common.js";

export function qualifEmoji(qualifLevel){
    switch(qualifLevel){
        case 1:
        case 2:
            return "✅"
        case 3:
        case 4:
            return "☑️"
        default:
            return "";
    }
}


/**
 * @param {{[slug: string]: string}} regionsMap 
 * @returns {(player: {slug: string}) => number} 0 non qualif, 1 main event, 2 play-in
 */
export function makeQualifCalculator(regionsMap){
    let regionalBestTaken = {};
    let MEQualifs = 0;

    let regional2ndTaken = {};
    let PIQualifs = 0;

    return player => {
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
    }

}