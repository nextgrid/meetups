const { TfAgent } = require('./tfAgent');
const { Image } = require('image-js');

const fs = require('fs');
const tf = require('@tensorflow/tfjs-node');
const repo = require('../data_access/googleRepository');

class JudgingManager {
    constructor() {
        this.agents = [];
        this.testInputs = [];
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

        const descriptions = await repo
            .get_last_models_desc_by_task(taskId)
            .catch(err => {
                console.error("Error while fetching models metadata.", err);
            });

        for (var desc of descriptions) {
            const acc = await repo.get_account(desc.accountId)
                .catch(err => {
                    console.error("Error while fetching user.", err);
                });

            const agent = new TfAgent({
                accountId: acc.accountId || -1, 
                accountName: acc.name || ""
            }, desc.modelName);

            await agent.loadModel(repo.get_file_url(desc.modelName), 'keras')
                .catch(err => {
                    console.error(`Error while loading '${desc.modelName}'.`, err);
                });

            this.agents.push(agent);
        }
    }

    /**
     * Currently loads only images.
     * @param {int} taskId 
     */
    async _fetchTests(taskId) {
        const localPath = `public/tests/task${taskId}/input/`;
        const remotePath = `static/tests/task${taskId}/input/`;
        const width = 64;
        const height = 64;

        this.testInputs = await this._createInputData(localPath, remotePath, width, height);
    }

    async _createInputData(localPath, remotePath, destWidth, destHeight) {
        return await Promise.all(
            fs.readdirSync(localPath)
                .map(async (fileName) => ({
                    data: this._createTensorFromImage(
                        await this._loadImage(`${localPath}/${fileName}`, destWidth, destHeight)
                    ),
                    url: `${remotePath}/${fileName}`
                }))
        );
    }

    async _loadImage(filePath, destWidth, destHeight) {
        const initImg = (await Image.load(filePath))
            .resize({ 
                width: destWidth, 
                height: destHeight 
            });

        return Image.createFrom(initImg, { alpha: 0 })
            .setChannel(0, initImg.getChannel(0, { keepAlpha: false }))
            .setChannel(1, initImg.getChannel(1, { keepAlpha: false }))
            .setChannel(2, initImg.getChannel(2, { keepAlpha: false }));
    }

    _createTensorFromImage(img) {
        return tf.tensor(img.data, [
            1,
            img.width,
            img.height,
            img.channels, 
        ])
            .asType('float32')
            .div(255);
    }

    /** 
     * Produces results for each of the models per round.
     */
    judge() {
        return this.testInputs.map((test) => ({
            testUrl: test.url,
            res: this.agents.map((agent) => ({
                ...agent.author,
                ...agent.predict(test.data)
            }))
        }));
    }
}

module.exports = { JudgingManager }