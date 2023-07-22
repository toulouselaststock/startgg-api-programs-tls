import fs from 'fs/promises';
import path from 'path'
import { exit } from 'process';
import {makeRelurl} from '../lib/dirname.js'

const relurl = makeRelurl(import.meta.url)

const teamsFilename = 'SLT-Teams-Performance.json';
const playersFilename = 'SLT-Players-Performance.json';

if (process.argv.length < 3){
    console.log("Please specify which week we are making a backup for");
    exit(1);
}

await Promise.all([
    fs.access(relurl('SLT-Players-Performance.json')),
    fs.access(relurl('SLT-Teams-Performance.json')),
]).catch(err => {
    console.error("Can't access Teams/Players performance");
    exit(2);
})

let currentBackupName = "Week " + process.argv[2];

async function getDirectories(source){
    return (await fs.readdir(source, { withFileTypes: true }))
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
}

await fs.mkdir(relurl('./backup')).catch( err => {} );

let subdirs = await getDirectories(relurl('./backup'));

await Promise.all([
    fs.rm(relurl(path.join('backup', currentBackupName))).catch( err => {} ),
    fs.rm(relurl('backup/latest')).catch( err => {} ),
]);


await fs.mkdir(relurl('backup/latest')).catch(err => {});
await Promise.all([
    fs.copyFile(relurl(teamsFilename), relurl('backup/latest/' + teamsFilename)),
    fs.copyFile(relurl(playersFilename), relurl('backup/latest/' + playersFilename)),
    fs.mkdir(relurl(path.join('backup', currentBackupName))).catch( err => {} )
]);
await Promise.all([
    fs.copyFile(relurl(teamsFilename), relurl(path.join('backup', currentBackupName, teamsFilename))),
    fs.copyFile(relurl(playersFilename), relurl(path.join('backup', currentBackupName, playersFilename)))
]);