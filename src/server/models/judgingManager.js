var { TfAgent } = require('./tfAgent');
var repo = require('../data_access/firebaseRepository');

class JudgingManager {
    constructor() {
        this.agents = [];
        this.testInputs = [];
        this.testOutputs = [];
    }

    /** Loads data needed for judging; returns promise.
     * - last submitted model for task per particpating group
     * - test inputs
     * - test outputs
     * @params taskId  
     */
    async fetchData(taskId) {
        const descriptions = await repo.get_last_models_desc_by_task(taskId)
            .then(descriptions => descriptions);

        for (var i = 0; i < descriptions.length; ++i) {
            const desc = descriptions[i];
            const agent = new TfAgent(desc.accountId);

            const modelUrl = await repo.get_model_bin_url(desc.model);
            
            await agent.loadModel(modelUrl)
                .then(() => {
                    this.agents.push(agent);
                })
                .catch(err => {
                    console.error(`Error while loading model named '${desc.model}'`, err);
                });
        }

        // #TODO: fetch test data
    }

    /** Produces array of shape (n, m), where
     * n - number of rounds
     * m - number of models
     * which holds the following structure
     * {
     *   accountId,
     *   res
     * }
     */
    judge(rounds) {
        var res = [];

        for (var i = 0; i < rounds; ++i) {
            var roundRes = [];

            this.agents.forEach(agent => {
                const inputData = this.testInputs[i];
                var predRes = agent.predict(inputData);

                roundRes.push({
                    accountId: agent.modelAuthorId,
                    res: predRes,
                });
            });

            res.push(roundRes);
        }

        return res;
    }
}

module.exports = { JudgingManager }