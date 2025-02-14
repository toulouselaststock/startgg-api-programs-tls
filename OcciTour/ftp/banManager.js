import {Client} from 'basic-ftp'
import { connect } from './lib.js';
import fs from "fs/promises"
import readline from "readline/promises"

// ----------- CONFIG -----------------------

const local_filename = "data/OcciTour/meta/bannis.json"
const remote_filename = "htdocs/OcciTour/meta/bannis.json"

// ------------------------------------------

let client = new Client();

console.log("Updating the banlist from server ...");

await connect(client);
await client.downloadTo(local_filename, remote_filename);

console.log("Successfully updated the local ban database from server.");

let bannis = await fs.access(local_filename)
    .then(() => fs.readFile(local_filename))
    .then(buf => JSON.parse(buf))
    .catch(() => ({}));


let operation = process.argv[2];

function list(){
    for (let player of bannis){
        console.log(player.name, player.slug);
    }
}

if (operation == "list"){
    console.log("Bannis : ")
    console.log("(Nom) (slug)");
    list();
} else if (operation == "add"){
    let slug = process.argv[3];
    let name = process.argv[4];

    if (!slug){
        console.log("Current ban list : ");
        console.log("(Nom) (slug)");
        list();
        let rl = readline.createInterface(process.stdin, process.stdout);
        name = await rl.question("Entrez le nom/pseudo du joueur à bannir : ")
        slug = await rl.question("Entrez le slug start.gg du joueur à bannir : ")
        rl.close();
    }

    bannis.push({slug, name});

    await fs.writeFile(local_filename, JSON.stringify(bannis));

    console.log("Uplaoding the updated database to server ...");

    await client.uploadFrom(local_filename, remote_filename);

    console.log("Successfully uploaded.");
}

client.close();