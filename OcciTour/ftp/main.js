import {Client} from 'basic-ftp'
import { connect, countFiles, uploadTracker } from './lib.js';
import { ArgumentsManager } from '@twilcynder/arguments-parser';

let {operation, localpath, remotepath, password} = new ArgumentsManager()
    .addParameter("operation", {description: "download | upload"})
    .addOption(["-l", "--localpath"], {description: "Path of the folder to dl to/ul from.", default:"./data/Occitour"}, true)
    .addOption(["-r", "--remotepath"], {description: "Path of the folder to dl from/ul to.", default:"./data/Occitour"}, true)
    .addOption(["-p", "--password"], {description: "Password to use for the FTP server. MEANS TYPING IT IN CLEAR. SHOULD NOT BE USED UNLESS YOU ARE GITHUB ACTIONS."}, true)
    .parseProcessArguments()

if (operation != "upload"){
    operation = "download";
}

let client = new Client();

await connect(client, password);

console.log("Connected !");

let upload = operation == "upload";
let remote_dir = remotepath;
let local_dir  = localpath


if (upload){
    client.trackProgress(uploadTracker(countFiles(local_dir)))
    await client.uploadFromDir(local_dir, remote_dir);
} else {
    await client.downloadToDir(local_dir, remote_dir);
}

console.log(`Finished ${operation}ing`);

client.close();