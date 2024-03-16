import {Client} from 'basic-ftp'
import { countFiles, hiddenQuestion, uploadTracker } from './lib.js';

let client = new Client();
client.trackProgress(uploadTracker(countFiles("out/Occitour")))

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