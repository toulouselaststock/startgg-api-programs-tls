import {Client} from 'basic-ftp'
import { connect, countFiles, uploadTracker } from './lib.js';
import { ArgumentsManager } from '@twilcynder/arguments-parser';

let {operation, path, password} = new ArgumentsManager()
    .addParameter("operation", {description: "download | upload"})
    .addOption(["-p", "--path"], {description: "Path of the folder to dl/ul, relative to both out/Occitour/ locally and data/ remotely.", default:""}, true)
    .addOption(["-P", "--password"], {description: "Password to use for the FTP server. MEANS TYPING IT IN CLEAR. SHOULD NOT BE USED UNLESS YOU ARE GITHUB ACTIONS."}, true)
    .parseProcessArguments()

if (operation != "upload"){
    operation = "download";
}

let client = new Client();

await connect(client, password);

console.log("Connected !");

let upload = operation == "upload";
let remote_dir = "data/" + path;
let local_dir  = "out/Occitour/" + path

client.trackProgress(uploadTracker(countFiles(local_dir)))

if (upload){
    await client.uploadFromDir(local_dir, remote_dir);
} else {
    await client.downloadToDir(local_dir, remote_dir);
}

console.log(`Finished ${operation}ing`);

client.close();