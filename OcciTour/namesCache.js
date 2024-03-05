import { GraphQLClient } from "graphql-request";
import { getPlayerName } from "../base/include/getPlayerName.js";
import fs from "fs/promises"

export class NamesCache {
    constructor(){
        /**
         * @type {{[x: string]: string}}
         */
        this.names = {}
    }

    /**
     * @param {string} filename 
     */
    async loadFromFile(filename){

        this.names = await fs.access(filename)
            .then(() => fs.readFile(filename))
            .then(buf => JSON.parse(buf))
            .catch(() => ({}));

    }

    /**
     * @param {fs.PathLike} filename 
     * @returns 
     */
    saveToFile(filename){
        return fs.writeFile(filename, JSON.stringify(this.names));    
    }

    /**
     * @param {GraphQLClient} client 
     * @param {string} slug 
     * @param {any} limiter 
     * @returns 
     */
    async getName(client, slug, limiter){
        return this.names[slug] ?? await this.loadNameFromStartGG(client, slug, limiter);
    }


    /**
     * @param {GraphQLClient} client 
     * @param {string} slug 
     */
    async loadNameFromStartGG(client, slug, limiter){
        let name = await getPlayerName(client, slug, limiter, true);
        this.names[slug] = name;
        return name;
    }

    /**
     * @param {string[]} slugs 
     */
    lookupNames(slugs){
        let res = new Array(slugs.length);
        for (let cachedSlug in this.names){
            let cachedName = this.names[cachedSlug];
            for (let i = 0; i < slugs.length; i++){
                if (cachedName == slugs[i]){
                    res[i] = cachedSlug;
                }
            }
        }

        return res;
    }
}