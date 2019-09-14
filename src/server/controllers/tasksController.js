var repo = require("../data_access/googleRepository");

exports.send_model_post = function(req, res) {
    console.log(req.body);
    repo.add_model_bin(
        req.body.modelName, 
        req.files['model'][0], 
        onFinish = (genFileName) => {
            repo.add_model_desc(
                parseInt(req.body.accountId), 
                parseInt(req.body.taskId), 
                genFileName
            );
            
            res.status(200).send("Model succesfully added.");
        },
        onError = (err) => {
            res.status(500).send(`Could not add model. ${err}`);
        }
    );
}

exports.models_by_account_and_task_get = function(req, res) {
    repo.get_models_desc_by_account_and_task(
        parseInt(req.query.accountId), 
        parseInt(req.query.taskId)
    )
        .then(data => res.json(data)); 
}

exports.all_models_get = function(req, res) {
    repo.get_all_models_desc()
        .then(data => res.json(data));
}