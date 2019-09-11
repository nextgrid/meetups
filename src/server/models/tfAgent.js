const tf = require('@tensorflow/tfjs-node');

/*
*   Wraps tfjs model loading and prediction.
*/
class TfAgent {
    constructor(modelAuthorId) {
        this.modelAuthorId = modelAuthorId;
    }

    async loadModel(url) {
        const handler = tf.io.browserHTTPRequest(url);
        this.model = await tf.loadLayersModel(handler);
    }

    predict(example) {
        return this.model.predict(example);
    }
}

module.exports = { TfAgent }