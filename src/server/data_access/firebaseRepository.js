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

exports.add_model_bin = async function(fileName, binModel, onFinish, onError) {
    const bucketName = process.env.CLOUD_BUCKET;
    const bucket = storage.bucket(bucketName);
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

exports.add_model = function(accountId, taskId, model) {
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

exports.get_models_by_account_and_task = function(accountId, taskId) {
    return db.collection("models")
        .where("accountId", "==", accountId)
        .where("taskId", "==", taskId)
        .get()
        .then(collectEntries)
        .catch(function(error) {
            console.error("Error getting models: ", error);
        });
}

exports.get_all_models = function() {
    return db.collection("models")
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