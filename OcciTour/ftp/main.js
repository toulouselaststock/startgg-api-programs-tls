import {Client} from 'basic-ftp'

if (process.argv.length < 3){
    console.error("Usage : node", process.argv[1], "password")
    process.exit(2)
}

let client = new Client();

try {
    await client.access({
        host: "files.000webhost.com",
        port: 21,
        user: "twilcyndertest",
        password: process.argv[2]
    })
} catch (err){
    console.error("Could not conect to the FTP server. Reason : ");
    process.exit(1);
}

console.log("Connected !");

await client.uploadFromDir("out/Occitour", "data/")

client.close();