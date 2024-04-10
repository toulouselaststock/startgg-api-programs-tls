import {Client} from 'basic-ftp'
import { connect } from './lib.js';
import fs from "fs/promises"

// ----------- CONFIG -----------------------

const local_filename = "out/Occitour/bannis.json"
const remote_filename = "data/bannis.json"

// ------------------------------------------

if (process.argv.length < 3){
    console.warn("Usage: node banManager.js {list | add <slug> <name>}");
    process.exit(1);
}

let client = new Client();

await connect(client);

await client.downloadTo(local_filename, remote_filename);

console.log("Successfully updated the local ban database from server.")

let bannis = await fs.access(local_filename)
    .then(() => fs.readFile(local_filename))
    .then(buf => JSON.parse(buf))
    .catch(() => ({}));


let operation = process.argv[2];

if (operation == "list"){
    console.log("Bannis : ")
    for (let player of bannis){
        console.log(player.name, player.slug);
    }
} else if (operation == "add"){
    let slug = process.argv[3];
    let name = process.argv[4];

    bannis.push({slug, name});

    await fs.writeFile(local_filename, JSON.stringify(bannis));

    console.log("Uplaoding the updated database to server ...");

    await client.uploadFrom(local_filename, remote_filename);

    console.log("Successfully uploaded.");
}

client.close();