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
exports.add_model_zip = function(zipFile, modelName) {
    var jsonPath = '';

    return new Promise((resolve, reject) => {
        streamifier.createReadStream(zipFile.buffer)
            .pipe(unzipper.Parse())
            .on("entry", async (entry) => {
                const destFileName = `${modelName}/${entry.path}`;

                if (entry.path.endsWith("json")) {
                    jsonPath = destFileName;
                }

                await exports.add_file(entry, destFileName)
                    .catch((err) => console.error(`Could not upload file ${destFileName}`, err));

                await bucket.file(destFileName).makePublic();
                console.log(`Uploaded file ${destFileName}`);
            })
            .on('finish', () => resolve(jsonPath))
            .on('error', reject)
    });
}

/**
 * Uploads single file to GCS.
 * @param {file} file File to upload.
 * @param {string} destFileName Destination file name (with path).
 */
exports.add_file = async function(file, destFileName) {
    const buffer = await file.buffer();

    return new Promise((resolve, reject) => {
        bucket.file(destFileName)
            .createWriteStream({
                metadata: {
                    contentType: destFileName.endsWith("json") 
                        ? "application/json"
                        : "application/octet-stream"
                }
            })
            .on('finish', resolve)
            .on('error', reject)
            .end(buffer);
    });
}

exports.add_last_model_desc = async function(accountId, taskId, modelName) {
    const docName = `acc${accountId}-task${taskId}`;

    return db.collection("last_models")
        .doc(docName)
        .set({
            accountId,
            taskId,
            modelName,
            date: Date.now()
        });
}

exports.get_last_models_desc_by_task = async function(taskId) {
    return await db.collection("last_models")
        .where("taskId", "==", taskId)
        .get()
        .then(snapshot => snapshot.docs.map(doc => doc.data()));
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
    return `https://storage.googleapis.com/${process.env.CLOUD_MODELS_BUCKET}/${fileName}`;
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
    var download_file = (name) => {
        var index = name.lastIndexOf('/');
        var pref_path = name.slice(0, index);

        shell.mkdir('-p', `./${destination}/${pref_path}`);

        return bucket
            .file(name)
            .download({ destination: `${destination}/${name}` });
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