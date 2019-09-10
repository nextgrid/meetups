var redis = require("redis");
var client = redis.createClient();

exports.add_model = function(accountId, taskId, model) {
    client.hmset('models', {
        accountId: model
    });
}

exports.get_latest_model = function(accountId, taskId) {
    return client.hmget('models', accountId);
}

exports.get_all_models = function() {
    return client.hgetall('models', function(err, obj) {
        console.log(obj);
        return obj;
    });
}