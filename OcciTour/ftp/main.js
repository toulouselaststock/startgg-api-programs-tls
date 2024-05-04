import {Client} from 'basic-ftp'
import { connect, countFiles, uploadTracker } from './lib.js';
import { ArgumentsManager } from '@twilcynder/arguments-parser';

const DEFAULT_TRIES = 1;

let {operation, localpath, remotepath, password, tries} = new ArgumentsManager()
    .addParameter("operation", {description: "download | upload"})
    .addOption(["-l", "--localpath"], {description: "Path of the folder to dl to/ul from.", default:"./data/Occitour"}, true)
    .addOption(["-r", "--remotepath"], {description: "Path of the folder to dl from/ul to.", default:"./data/Occitour"}, true)
    .addOption(["-p", "--password"], {description: "Password to use for the FTP server. MEANS TYPING IT IN CLEAR. SHOULD NOT BE USED UNLESS YOU ARE GITHUB ACTIONS."}, true)
    .addOption(["-t", "--tries"], {description: "How many retries", type: "number"})
    .parseProcessArguments()

if (operation != "upload"){
    operation = "download";
}

if (!tries || tries == NaN){
    tries = DEFAULT_TRIES;
}

let client = new Client();

console.log("Connecting to the server ...");
await connect(client, password);
console.log("Connected !");

let upload = operation == "upload";
let remote_dir = remotepath;
let local_dir  = localpath

async function async_retry(f, retries = 1){
    let tries = 0;
    while (true){
        try {
            await f();
            break;
        } catch (err){
            console.error("Failed to download : ", err);
            tries++;
            if (tries >= retries){
                console.log("MAX NUMBER OF TRIES REACHED.");
                break;
            }
            console.log("--------- RETRYING --------")
        }
    }
}

console.log("Tries", tries)

if (upload){
    client.trackProgress(uploadTracker(countFiles(local_dir)));
    await async_retry(()=>{
        return client.uploadFromDir(local_dir, remote_dir);
    }, tries);
} else {
    await async_retry(()=>{
        return client.downloadToDir(local_dir, remote_dir);
    }, tries);
}

console.log(`Finished ${operation}ing`);

client.close();