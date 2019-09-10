var repo = require("../data_access/firebaseRepository");

exports.send_model_post = function(req, res) {
    repo.add_model(req.body.accountId, req.body.taskId, req.body.model);
    res.status(200).send("Model succesfully added.");
}

exports.latest_model_get = function(req, res) {
    res.status(404).send("Not implemented.");
}

exports.models_by_account_and_task_get = function(req, res) {
    repo.get_models_by_account_and_task(
        parseInt(req.query.accountId), 
        parseInt(req.query.taskId)
    )
        .then(data => res.json(data)); 
}

exports.all_models_get = function(req, res) {
    repo.get_all_models()
        .then(data => res.json(data));
}