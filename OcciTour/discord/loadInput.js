import fs from 'fs/promises'

function readFromStdin(){
    let data = "";
    let callback = (data_) => {
        data += data_.toString();
    }
    return new Promise((resolve, reject) => {
        process.stdin.once("end", () => {
            resolve(data);
            process.stdin.removeListener("data", callback);
            process.stdin.pause();
        })
        process.stdin.addListener("data", callback) 
    })
}

/**
 * Loads the input data as JSON text either from the given file or the standdard input
 * @param {string} inputFile
 */
async function loadInputText(inputFile){
    let rawText;
    if (inputFile){
        rawText = await fs.readFile(inputFile).then(buf => buf.toString());
    } else {
        rawText = await readFromStdin();
    }
    return rawText;
}

export async function loadInput(inputFile){
    let text = await loadInputText(inputFile);
    console.log(text);
    return JSON.parse(text);
}