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

    async loadFromFile(filename){
        filename = "./data/" + filename
        this.names = await fs.access(filename)
            .then(() => fs.readFile(filename))
            .then(buf => JSON.parse(buf))
            .catch(() => ({}))

    }

    saveToFile(filename){
        return fs.writeFile("./data/" + filename, JSON.stringify(this.names));    
    }

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
}