const tf = require('@tensorflow/tfjs-node');

/**
 *   Wraps tfjs model loading and prediction.
 */
class TfAgent {
    constructor(modelAuthorId, modelName) {
        this.modelAuthorId = modelAuthorId;
        this.modelName = modelName || "unk_name";
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
        const errRet = { status: "err", res: {} };
        const modelName = this.modelName || "";

        if (this.model == null) {
            return errRet;
        }

        try {
            const res = this.model.predict(example).dataSync();
            return { status: "ok", res }
        }
        catch (err) {
            console.error(`Error while prediction on ${modelName}.`, err);
            return errRet;
        }
    }
}

module.exports = { TfAgent }