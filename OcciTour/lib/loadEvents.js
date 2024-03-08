import { getEventResults } from "../../base/include/getEventResults.js";
import { readLinesAsync } from "../../base/include/lib/lib.js";

/**
 * 
 * @param {string} filename 
 */
async function loadFileEvent(filename){
    let lines = await readLinesAsync(filename);
    
    let tournament_name = lines[0];
    let startAt = new Date(lines[1]).getTime() / 1000 + 3600;
    let numEntrants = lines.length - 2;

    let standings = []
    for (let i = 2; i < lines.length; i++){
        let slug = lines[i];
        if (!slug || (slug == "undefined")) continue; 
        standings.push({
            placement: i,
            entrant: {
                participants: [
                    {
                        user: {
                            slug: "/" + slug
                        }
                    }
                ]
            }
        })
    }

    return {
        tournament : {
            name: tournament_name
        },
        startAt,
        numEntrants,
        standings: {
            nodes: standings
        }
    }
}

/**
 * @param {string} slug 
 */
export async function loadEvent(client, slug, limiter){

    if (slug.startsWith(":")){
        return await loadFileEvent(slug.slice(1));
    } else {
        return await getEventResults(client, slug, undefined, limiter)
            .catch(err => {console.error("Slug " + slug + " kaput : ", err)});
    }
}