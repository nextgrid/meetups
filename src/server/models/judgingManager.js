const { TfAgent } = require('./tfAgent');
const { Image } = require('image-js');

const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const repo = require('../data_access/googleRepository');


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
     * @param {int} taskId  
     */
    async fetchData(taskId) {
        await this._fetchModels(taskId);
        await this._fetchTests(taskId);
    }

    /**
     * Donwloads models, loads them to TfAgents and stores them in this.agents.
     * @param {int} taskId 
     */
    async _fetchModels(taskId) {
        this.agents = [];

        const descriptions = await repo.get_last_models_desc_by_task(taskId)
            .then(descriptions => descriptions);

        for (var i = 0; i < descriptions.length; ++i) {
            const desc = descriptions[i];
            const agent = new TfAgent(desc.accountId);
            const model_path = desc.model.substring(0, desc.model.lastIndexOf("/"));

            await repo.download_folder(model_path);
            await agent.loadModel(`file://${desc.model}`, 'keras')
                .then(() => {
                    this.agents.push(agent);
                })
                .catch(err => {
                    console.error(`Error while loading model named '${desc.model}'`, err);
                });
        }
    }

    /**
     * Currently loads only images.
     * @param {int} taskId 
     */
    async _fetchTests(taskId) {
        this.testInputs = [];

        const remotePath = `tests/task${taskId}/input/`;
        const localPath = `${remotePath}`;

        await repo.download_folder(remotePath);

        const fileNames = fs.readdirSync(localPath);
        for (var i = 0; i < fileNames.length; ++i) {
            const filePath = `${localPath}${fileNames[i]}`;

            // 128/128 size is used for first task
            const width = 64;
            const height = 64;

            const initImg = (await Image.load(filePath))
                .resize({ width, height });

            const img = Image.createFrom(initImg, { 
                alpha: 0
            })
                .setChannel(0, initImg.getChannel(0, { keepAlpha: false }))
                .setChannel(1, initImg.getChannel(1, { keepAlpha: false }))
                .setChannel(2, initImg.getChannel(2, { keepAlpha: false }));
            
            const tensor = tf.tensor(img.data, [
                1,
                img.width,
                img.height,
                img.channels, 
            ])
                .asType('float32')
                .div(255);

            this.testInputs.push(tensor);
        }
    }

    /** Produces array of shape (n, m), where
     * n - number of rounds
     * m - number of models
     * which holds the following structure
     * {
     *   accountId - id of participants' group
     *   predRes - array with predictions
     * }
     */
    async judge(rounds) {
        var res = [];

        for (var i = 0; i < this.testInputs.length; ++i) {
            var roundRes = [];
            const inputData = this.testInputs[i];

            const buf = await inputData.buffer();
            console.log(buf);

            for (var j = 0; j < this.agents.length; ++j) {
                const agent = this.agents[j];
                
                var predRes = agent.predict(inputData).dataSync();
                console.log(predRes);

                roundRes.push({
                    accountId: agent.modelAuthorId,
                    predRes,
                });
            }

            res.push(roundRes);
        }

        return res;
    }
}

module.exports = { JudgingManager }