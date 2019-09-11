const firebase = require('firebase');
const unzipper = require('unzipper');
const etl = require('etl');
const streamifier = require('streamifier');
const { Storage } = require("@google-cloud/storage");
require('firebase/firestore');
require('dotenv').config();

firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: process.env.GCLOUD_PROJECT
});

var db = firebase.firestore();
const storage = new Storage({
    projectId: process.env.GCLOUD_PROJECT
});

const bucketName = process.env.CLOUD_MODELS_BUCKET;
const bucket = storage.bucket(bucketName);

/** Unpacks binModel (it has to be in .zip format)
 * and uploads it to GCS.
 */
exports.add_model_bin = async function(fileName, binModel, onFinish, onError) {
    const folderName = `${Date.now()}-${fileName}`;
    var jsonPath = '';

    await streamifier.createReadStream(binModel.buffer)
        .pipe(unzipper.Parse())
        .on("entry", async (entry) => {
            const fileName = entry.path;
            const fileContent = await entry.buffer();
            
            const gcsFileName = `${folderName}/${fileName}`;

            if (gcsFileName.endsWith("json"))
                jsonPath = gcsFileName;
            
            const file = bucket.file(gcsFileName);
            const stream = file.createWriteStream({
                metadata: {
                    contentType: gcsFileName.endsWith("json") 
                        ? "application/json"
                        : "application/octet-stream"
                }
            });
        
            stream.on('error', (err) => console.error(`Could not upload file ${gcsFileName}`, err));
            stream.on('finish', async () => {
                await bucket.file(gcsFileName).makePublic();
                console.log(`Uploaded file ${gcsFileName}`)
            });
            stream.end(fileContent);
        })
        .promise()
        .then(() => onFinish(jsonPath), onError);
}

exports.add_model_desc = function(accountId, taskId, model) {
    db.collection("models").add({
        accountId,
        taskId,
        model,
        date: Date.now()
    })
        .then(function(docRef) {
            console.log("Document written with ID: " + docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
}

exports.get_model_bin = async function(modelName) {
    const file = bucket.file(modelName);

    return await file.get()
        .then(function(data) {
            return {
                model: data[0],
                apiResponse: data[1],
            }
        });
}

exports.get_model_bin_url = function(modelName) {
    return `https://storage.googleapis.com/${bucketName}/${modelName}`;
}

exports.get_model_bin_signed_url = async function(modelName) {
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    const [url] = await bucket
        .file(modelName)
        .getSignedUrl(options);

    return url;
}

exports.get_last_models_desc_by_task = async function(taskId) {
    // TODO: Get last models per accoundId by task
    return await db.collection("models")
        .where("taskId", "==", taskId)
        .get()
        .then(collectEntries)
        .catch(function(error) {
            console.error("Error geting models: ", error);
        });
}

exports.get_models_desc_by_account_and_task = async function(accountId, taskId) {
    return await db.collection("models")
        .where("accountId", "==", accountId)
        .where("taskId", "==", taskId)
        .get()
        .then(collectEntries)
        .catch(function(error) {
            console.error("Error getting models: ", error);
        });
}

exports.get_all_models_desc = async function() {
    return await db.collection("models")
        .get()
        .then(collectEntries)
        .catch(function(error) {
            console.error("Error getting models: ", error);
        });
}

collectEntries = function(snapshot) {
    var docs = [];
    snapshot.forEach(doc => docs.push(doc.data()));
    return docs;
}