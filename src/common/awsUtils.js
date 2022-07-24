const fs = require("fs");

const AWS = require('aws-sdk');
const config = require("config");
const helper = require("./helper");

/**
 * 
 * @param {*} fileName the file Name received from the user, that needs to uploaded
 * @param {*} filePath the file Path that needs to be uploaded
 * @returns response received from AWS post upload
 */
async function uploadToS3(fileName, filePath) {

    const timestamp = helper.getCurrentTimestamp();
    const fileArray =  fileName.split(".");
    const fileNameWithoutExtension = fileArray[0];

    const s3 = new AWS.S3({
        accessKeyId: config.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_S3_SECRET_ACCESS_KEY,
    })
    const blob = fs.readFileSync(filePath);
    let extension = ".csv";

    if (fileArray.length > 1) {
        extension = "." + fileArray[1];
    } 
    const s3FileName = fileNameWithoutExtension + timestamp + extension;

    const uploadedImage = await s3.upload({
        Bucket: config.AWS_S3_BUCKET_NAME,
        Key: s3FileName,
        Body: blob,
    }).promise()

    //on successful upload remove the file
    fs.unlinkSync(filePath);
    return uploadedImage;
}

module.exports = {
    uploadToS3
}