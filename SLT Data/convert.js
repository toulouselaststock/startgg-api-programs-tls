import fs from 'fs'

let teamsJSONRaw = await fs.promises.readFile('./EquipesRaw.json').then(res => JSON.parse(res));

let res = {}

let i = 0;
for (let obj of teamsJSONRaw){
    for (let p in obj){
        res[obj[p]] = p;
        i++;
    }
}

fs.writeFileSync('./Equipes.json', JSON.stringify(res));

console.log("Success ! " + i +  " players");