var repo = require("../data_access/googleRepository");

exports.send_model_post = async function(req, res) {
    const modelName = `${Date.now()}-${req.body.modelName}`;
    const zipFile = req.files['model'][0];
    const authCode = req.body.authCode;
    const taskId = req.body.taskId;

    if (!modelName) {
        res.status(400).send("Model name is required.");
        return;
    }
    if (!zipFile) {
        res.status(400).send("Zip file is required.");
        return;
    }
    if (!authCode) {
        res.status(400).send("Auth code is required.");
        return;
    }
    if (!taskId) {
        res.status(400).send("Task ID is required.");
        return;
    }

    const accountId = await repo.get_account_id_from_auth_code(authCode);

    if (!accountId) {
        res.status(403).send("Could not upload model - invalid auth code.");
        return;
    }

    jsonPath = await repo.add_model_zip(zipFile, modelName)
        .catch(err => res.status(500).send(`Could not add model. ${err}`));

    await repo.add_last_model_desc(
        parseInt(accountId), 
        parseInt(taskId), 
        jsonPath
    );

    res.status(200).send("Model succesfully added.");
}