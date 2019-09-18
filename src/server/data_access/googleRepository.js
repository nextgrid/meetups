const firebase = require('firebase');
const unzipper = require('unzipper');
const shell = require('shelljs')
const streamifier = require('streamifier');
const { Storage } = require("@google-cloud/storage");

require('firebase/firestore');
require('dotenv').config();

const dbConfig = { projectId: process.env.GCLOUD_PROJECT };

firebase.initializeApp(dbConfig);

const storage = new Storage(dbConfig);
const db = firebase.firestore();
const bucket = storage.bucket(process.env.CLOUD_MODELS_BUCKET);

/**
 * Extracts and uploads compressed model to GCS.
 * @param {file} zipFile Compressed file with Keras/TF model.
 * @param {string} modelName Name of the zip file.
 */
exports.add_model_zip = async function(zipFile, modelName) {
    var jsonPath = '';

    return await streamifier.createReadStream(zipFile.buffer)
        .pipe(unzipper.Parse())
        .on("entry", async (entry) => {
            const destFileName = `${modelName}/${entry.path}`;

            if (entry.path.endsWith("json")) {
                jsonPath = destFileName;
            }

            await exports.add_file(entry, destFileName);            
        })
        .promise()
        .then(() => jsonPath);
}

/**
 * Uploads single file to GCS.
 * @param {file} file File to upload.
 * @param {string} destFileName Destination file name (with path).
 */
exports.add_file = async function(file, destFileName) {
    bucket.file(destFileName)
        .createWriteStream({
            metadata: {
                contentType: destFileName.endsWith("json") 
                    ? "application/json"
                    : "application/octet-stream"
            }
        })
        .on('error', (err) => console.error(`Could not upload file ${destFileName}`, err))
        .on('finish', async () => {
            await bucket.file(destFileName).makePublic();
            console.log(`Uploaded file ${destFileName}`)
        })
        .end(await file.buffer());
}

exports.add_last_model_desc = async function(accountId, taskId, modelName) {
    const docName = `acc${accountId}-task${taskId}`;

    await db.collection("last_models")
        .doc(docName)
        .set({
            accountId,
            taskId,
            modelName,
            date: Date.now()
        })
        .then(function() {
            console.log(`Edited/created document ${docName}`);
        })
        .catch(function(error) {
            console.error("Error while editing document. ", error);
        });
}

exports.get_last_models_desc_by_task = async function(taskId) {
    return await db.collection("last_models")
        .where("taskId", "==", taskId)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()))
        .catch(function(error) {
            console.error("Error getting models: ", error);
        });
}

exports.get_account_id_from_auth_code = async function(code) {
    return await db.collection("accounts")
        .where("code", "==", code)
        .limit(1)
        .get()
        .then(snapshot => {
            const ids = snapshot.docs.map(doc => doc.data().accountId);

            if (ids.length == 0) {
                return null;
            }
            return ids[0];
        })
        .catch(function(error) {
            console.log("Error while getting accountId from auth code")
        })
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
    for (var file of files) {
        if (file.name.search(path) != -1 && !file.name.endsWith('/')) {
            if (!await download_file(file.name)) {
                console.error(`Error while downloading file ${file.name}`);
                res = false;
            }
        }
    }

    return res;
}