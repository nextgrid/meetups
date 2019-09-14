const { JudgingManager } = require('../models/judgingManager');

const judge = new JudgingManager();

exports.judge_task_get = async function(res, req) {
    await judge.fetchData(parseInt(res.query.taskId));
    req.json(await judge.judge());
}
