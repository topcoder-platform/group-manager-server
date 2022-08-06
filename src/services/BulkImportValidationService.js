const fs = require("fs");
const config = require("config");
const readline = require("readline");
const _ = require('lodash');
const errors = require('../common/errors');

/**
 * Validate the file name is as per our expectation
 * It should be a csv file with headers Group Name Action Email in order
 * Read 10 lines to ensure Group Name, Action and Email look good
 */
async function validateImportFile(authUser, file) {
    if (!authUser) {
        throw new errors.BadRequestError("Current User is not available");
    }
    if (!file) {
        throw new errors.BadRequestError("File is not uploaded");
    }

    //Number of lines to validate. Validating the whole file will take a lot of time
    //Hence we validate few rows only
    const numberofLines = config.BULK_VALIDATE_LINES || 10;

    let lines = await getFirstNLines(file, numberofLines);
    if (!lines || lines.length == 0) {
        throw new errors.BadRequestError("Invalid csv file. Please ensure its a valid csv file");
    }
    const firstLine = lines.slice(0, 1)[0];
    console.log(firstLine);

    if (firstLine.indexOf(",") == -1) {
        throw new errors.BadRequestError("No comma found on header file. Please ensure its a valid csv file");
    }
    const headers = firstLine.split(",")
    if (headers.length != 3) {
        throw new errors.BadRequestError(`Invalid file.File should have 3 headers Group Name, Action, and Email in order.Found ${firstLine}`);
    }
    if(!headers[0].toLowerCase().includes("group")) {
        throw new errors.BadRequestError("First column should be a group name");
    }
    if(!headers[1].toLowerCase().includes("action")) {
        throw new errors.BadRequestError("Second column should be action");
    }
    if(!headers[2].toLowerCase().includes("mail")) {
        throw new errors.BadRequestError("Third column should be user email");
    }

    lines = lines.slice(1);
    for(let i = 0; i < lines.length;i++) {
        if (!lines[i]) {
            continue; //Ignore blank non header lines
        }
        const currentLine = lines[i].split(",");
       
        if (currentLine.length != 3) {
            throw new errors.BadRequestError(`Line ${i + 2} is invalid. It should have 3 values separated by comma. Found ${lines[i]}`);
        }
        if (currentLine[0].length == 0) {
            throw new errors.BadRequestError(`Line ${i + 2} is invalid. Group Name is blank`);
        }
        if (currentLine[2].length == 0) {
            throw new errors.BadRequestError(`Line ${i + 2} is invalid. Email is blank`);
        }        
    }
}

async function getFirstNLines(path, countLines) {
    let idx = 0;
    const lineArr = [];

    const readable = fs.createReadStream(path);
    const reader = readline.createInterface({ input: readable });
    await new Promise((resolve) => {

        reader.on('line', (line) => {
            ++idx;
            if (idx > countLines) {
                reader.close();
                reader.removeAllListeners()
                resolve();
            }
            else {
                lineArr.push(line);
            }
        });
        reader.on('close', () => {
            resolve();
        });
    });
    readable.close();
    return lineArr;
}


module.exports = {
    validateImportFile
}