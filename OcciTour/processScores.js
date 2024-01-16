

const regions = ["HG", "TA", "HO", "AU"];

const tiers = [
    {name: "S", minimum: 113},
    {name: "A", minimum: 81},
    {name: "B", minimum: 57},
    {name: "C", minimum: 0}
]

function getTier(numEntrants){
    for (let t of tiers){
        if (numEntrants >= t.minimum) return t;
    }
}

class Player {
    constructor(id){
        this.id = id;
        this.results = {
            regions: {},
            wildcard: []
        }
    }
}

export function processResults(events){
    let players = {};

    for (let ev of events){
        console.log("Processing tournament " + ev.tournament.name);
        
    }
}