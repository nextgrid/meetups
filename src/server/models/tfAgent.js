const tf = require('@tensorflow/tfjs-node');

/**
 *   Wraps tfjs model loading and prediction.
 */
class TfAgent {
    constructor(modelAuthorId) {
        this.modelAuthorId = modelAuthorId;
        this.model = null;
    }

    /**
     * Loads Tensorflow/Keras model.
     * @param {*} url Absolute path to JSON file.
     * @param {*} modelType Might be 'keras' or 'tf'
     */
    async loadModel(url, modelType) {
        if (modelType == 'keras') {
            this.model = await tf.loadLayersModel(url);  
        } else if (modelType == 'tf') {
            this.model = await tf.loadGraphModel(url);
        } else {
            throw new Error("Unsupported modelType. Should be 'keras' or 'tf'.");
        }
    }

    predict(example) {
        if (this.model == null)
            throw new Error("Model is null. Please use 'loadModel' for initializing model.");

        return this.model.predict(example);
    }
}

module.exports = { TfAgent }