const firebase = require('firebase');
const unzipper = require('unzipper');
const shell = require('shelljs')
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
 * TODO Refactor it - take out unzipping logic; make it add_file
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

exports.get_file = async function(fileName) {
    const file = bucket.file(fileName);

    return await file.get()
        .then(function(data) {
            return {
                model: data[0],
                apiResponse: data[1],
            }
        });
}

exports.get_file_url = function(fileName) {
    return `https://storage.googleapis.com/${bucketName}/${fileName}`;
}

exports.get_file_signed_url = async function(fileName) {
    const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    const [url] = await bucket
        .file(fileName)
        .getSignedUrl(options);

    return url;
}

/**
 * TODO: Refactor it to get_folder_stream or make it downloading files to indexeddb
 */
exports.download_folder = async function(path, destination) {
    var download_file = async (name) => {
        var index = name.lastIndexOf('/');
        var pref_path = name.slice(0, index);

        shell.mkdir('-p', `./${destination}/${pref_path}`);

        return await bucket
            .file(name)
            .download({ destination: `${destination}/${name}` })
            .then(() => true)
            .catch(err => {
                console.error(`Error while downloading file ${name}. `, err);
                return false;
            });
    }

    var files = await bucket 
        .getFiles();

    if (files.length == 0) {
        console.error(`Error while accessing bucket data. Files list is empty.`);
        return false;
    }

    files = files[0];

    res = true;
    for (var i = 0; i < files.length; ++i) {
        const file = files[i];
        if (file.name.search(path) != -1 && !file.name.endsWith('/')) {
            if (!await download_file(file.name)) {
                console.error(`Error while downloading file ${file.name}`);
                res = false;
            }
        }
    }

    return res;
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