var repo = require("../data_access/firebaseRepository");
var TfAgent = require('../models/tfAgent');

exports.judge_task_compound_get = function(res, req) {
    var taskId = res.params.taskId;

    // #TODO: Load models, test data and use TfAgent to judge results.
    // -- and move this logic to service.

    // Mock data
    req.status(200).json({
        teams: 3,
        results: [
            {
                accountId: 2,
                res: true,
            },
            {
                accountId: 3,
                res: true,
            },
            {
                accountId: 4,
                res: false,
            },
        ]
    });
}
