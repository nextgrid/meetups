var repo = require("../data_access/googleRepository");

exports.send_model_post = async function(req, res) {
    const modelName = `${Date.now()}-${req.body.modelName}`;
    const zipFile = req.files['model'][0];

    jsonPath = await repo.add_model_zip(zipFile, modelName)
        .catch(err => res.status(500).send(`Could not add model. ${err}`));

    repo.add_last_model_desc(
        parseInt(req.body.accountId), 
        parseInt(req.body.taskId), 
        jsonPath
    );

    res.status(200).send("Model succesfully added.");
}