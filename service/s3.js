require("dotenv").config();
const {S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


const s3client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY
    }
});

async function getObjectURL(key){
    const command = new GetObjectCommand({
        Bucket: "blogify-static",
        Key: key,
    });

    const url = await getSignedUrl(s3client, command);
    return url;
};

async function putObjectURL(filename, contentType) {
    const command = new PutObjectCommand({
        Bucket: "blogify-static",
        Key: filename,
        ContentType: contentType,
    });

    const url = await getSignedUrl(s3client, command);
    return url;
}

// async function listObjects() {
//     const command = new ListObjectsV2Command({
//         Bucket: "blogify-static",
//         Key: "/",
//     });

//     const result = await s3client.send(command);
//     console.log(result);
// }
//async function init(){
    //listObjects();    //This is how we create the commands and do whatever we want to. This is what it is called "Everything is an API call".
    //console.log("URL for image", await getObjectURL('images/image-1751551610335.png'));
    //console.log("URL for uploading files", await putObjectURL(`image-${Date.now()}.png`, "image/png")); // though the name of the files could be different we can give the name here whatever we want.
//};

//init();
//This is how we can get the url for private bucket object
//We can also get the url for some specific time  {expiresIn: 20} by specifying like this (after coma);

module.exports = {
    getObjectURL,
    putObjectURL,
}