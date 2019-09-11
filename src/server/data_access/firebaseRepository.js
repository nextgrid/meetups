const firebase = require('firebase');
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

exports.add_model_bin = async function(fileName, binModel, onFinish, onError) {
    const gcsFileName = `${Date.now()}-${fileName}`;
    const file = bucket.file(gcsFileName);

    const stream = file.createWriteStream({
        metadata: {
            contentType: binModel.mimetype
        }
    });

    stream.on('error', onError);
    stream.on('finish', () => onFinish(gcsFileName));

    stream.end(binModel.buffer);
}

exports.add_model_desc = function(accountId, taskId, model) {
    db.collection("models").add({
        accountId,
        taskId,
        model
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