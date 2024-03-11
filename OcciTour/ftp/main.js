import {Client} from 'basic-ftp'
import { hiddenQuestion } from './lib.js';

let client = new Client();

let password = process.argv[2] ?? await hiddenQuestion("Mot de passe cloud : ");

try {
    await client.access({
        host: "files.000webhost.com",
        port: 21,
        user: "twilcyndertest",
        password
    })
} catch (err){
    console.error("Could not conect to the FTP server. Reason : ");
    process.exit(1);
}

console.log("Connected !");

await client.uploadFromDir("out/Occitour", "data/")

console.log("Finished uploading");

client.close();