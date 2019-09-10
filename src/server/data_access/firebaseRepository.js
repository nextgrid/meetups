const firebase = require('firebase');
require('firebase/firestore');
require('dotenv').config();

firebase.initializeApp({
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DB_URL,
    projectId: "valid-ship-252510"
});

var db = firebase.firestore();

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