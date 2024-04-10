import readline from 'readline';
import fs from 'fs';
import path from 'path';

export function hiddenQuestion(query) {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const stdin = process.openStdin();
        function handler(char) {
            char = char + '';
            switch (char) {
                case '\n':
                case '\r':
                case '\u0004':
                    stdin.pause();
                    break;
                default:
                    process.stdout.clearLine();
                    readline.cursorTo(process.stdout, 0);
                    process.stdout.write(query + Array(rl.line.length + 1).join('*'));
                    break;
            }
        };
        process.stdin.on('data', handler);
        rl.question(query, value => {
            rl.history = rl.history.slice(1);
            rl.close();
            process.stdin.off('data', handler)
            resolve(value);
        });
    });
} 

export function countFiles(dir){
let count = 0;
    fs.readdirSync(dir).forEach(filename => {
        let absolute = path.join(dir, filename);
        if (fs.statSync(absolute).isDirectory()){
            count += countFiles(absolute);  
        } else {
            count++;
        }
    })

    return count;
}

/**
 * If you have multiple files with the same filename it wont work properly. Fuck it.
 * @param {number} totalfiles 
 * @returns {import('basic-ftp/dist/ProgressTracker').ProgressHandler}
 */
export function uploadTracker(totalfiles){
    let currentFile = 0;
    let previousFile;
    return info => {
        if (previousFile != info.name){
            currentFile++;
            previousFile = info.name;
        }
        console.log(`${currentFile}/${totalfiles} (${ Math.floor((currentFile - 1) / totalfiles * 100)}%) : Uploading`, info.name, `(${info.bytesOverall} bytes uploaded)`);
    };
}

export async function connect(client){
    let password = await hiddenQuestion("Mot de passe cloud : "); 

    try {
        return await client.access({
            host: "files.000webhost.com",
            port: 21,
            user: "twilcyndertest",
            password
        })
    } catch (err){
        console.error("Could not conect to the FTP server. Reason :", err);
        process.exit(1);
    }
}