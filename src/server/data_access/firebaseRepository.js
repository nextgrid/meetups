const firebase = require('firebase');
require('firebase/firestore');

firebase.initializeApp({
    apiKey: 'AIzaSyDluzjvUCu1OChPdX4kRQGWQHea7YTYoPY',
    authDomain: 'valid-ship-252510.firebaseapp.com',
    databaseURL: "https://wdlltst.firebaseio.com",
    projectId: 'valid-ship-252510'
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