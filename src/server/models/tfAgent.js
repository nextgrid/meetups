const tf = require('@tensorflow/tfjs-node')

class TfAgent {
    async loadModel(url) {
        this.model = await tf.loadLayerModel(url);
    }

    predict(example) {
        return this.model.predict(example);
    }
}