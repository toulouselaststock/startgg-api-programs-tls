/**
 * Converts an ordered players list to a map associating each slug with the rank
 * @param {{slug: string}[]} playersList 
 * @returns {{ [slug: string]: number } | null}
 */
export function playersListToMap(playersList){
    if (!playersList) return null;

    let previousRank = {};

    for (let i = 0; i < playersList.length; i++){
        let p = playersList[i];
        if (!p.slug){
            console.error("Tried to process with previous ranking, but the data doesn't contain slugs. Please provide the players slug in both the previous ranking data and the current ranking data.");
            process.exit(1);
        }

        previousRank[p.slug] = i;
    }

    return previousRank;
}