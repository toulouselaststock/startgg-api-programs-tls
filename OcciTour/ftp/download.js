import {Client} from 'basic-ftp'
import { connect, countFiles, uploadTracker } from './lib.js';

let client = new Client();
client.trackProgress(uploadTracker(countFiles("out/Occitour")))

await connect(client);

console.log("Connected !");

await client.downloadToDir("out/Occitour", "data/");

console.log("Finished uploading");

client.close();