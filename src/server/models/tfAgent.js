const tf = require('@tensorflow/tfjs-node');

/*
*   Wraps tfjs model loading and prediction.
*/
class TfAgent {
    constructor(modelAuthorId) {
        this.modelAuthorId = modelAuthorId;
    }

    async loadModel(url) {
        this.model = await tf.loadLayersModel(url);
    }

    predict(example) {
        return this.model.predict(example);
    }
}

module.exports = { TfAgent }