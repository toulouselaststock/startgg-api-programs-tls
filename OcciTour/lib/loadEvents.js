import { getEventResults } from "../../base/include/getEventResults.js";
import { readLinesAsync } from "../../base/include/lib/lib.js";

/**
 * 
 * @param {string} filename 
 */
async function loadFileEvent(filename){
    let lines = await readLinesAsync(filename);
    
    let tournament_name = lines[0];
    let numEntrants = lines.length - 1;

    let standings = []
    for (let i = 1; i < lines.length; i++){
        let slug = lines[i];
        console.log(slug);
        if (!slug || (slug == "undefined")) continue; 
        console.log("ouais")
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