import fs from 'fs/promises'

function readFromStdin(){
    return new Promise((resolve, reject) => {
        process.stdin.once("data", (data) => {
            resolve(data.toString());
            process.stdin.pause();
        })
    })
}

/**
 * Loads the input data as JSON text either from the given file or the standdard input
 * @param {string} inputFile 
 */
export async function loadInput(inputFile){
    let rawText;
    if (inputFile){
        rawText = await fs.readFile(inputFile).then(buf => buf.toString());
    } else {
        rawText = await readFromStdin();
    }
    return rawText;
}